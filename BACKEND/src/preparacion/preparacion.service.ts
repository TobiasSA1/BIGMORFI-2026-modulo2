import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

// El área de trabajo (cocina/bar) coincide 1 a 1 con la columna `sector` de
// productos, así que no hace falta mapear nada: 'cocina' -> 'cocina'.
export type AreaPreparacion = 'cocina' | 'bar';

// Estados de ítem que todavía "cuentan" como trabajo para el área.
const ITEMS_ACTIVOS = ['pendiente', 'en_preparacion'];
// Estados de pedido que se muestran en cocina/bar.
const PEDIDOS_EN_JUEGO = ['confirmado', 'en_preparacion'];

/**
 * Lógica compartida de Cocina (Punto 16) y Bar (Punto 17).
 *
 * Cocina/Bar NO crean nada: leen los ítems de pedidos que ya confirmó el mozo
 * (Módulo 3) y los marcan como "listo" a medida que los terminan.
 *
 * Filtran por `productos.sector` (no por `tipo`): con el enum `tipo_producto`
 * ahora incluyendo 'postre', el sector es lo que realmente decide a qué
 * pantalla va cada ítem (un postre también puede ser sector 'cocina').
 */
@Injectable()
export class PreparacionService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * PUNTOS 16 y 17 - Listado de ítems pendientes, AGRUPADOS POR MESA.
   *
   * Devuelve algo así:
   * [
   *   {
   *     mesaId, mesaNumero, mesaTipo,
   *     items: [ { itemId, pedidoId, nombre, cantidad, tiempoElaboracion, estado, desde } ]
   *   }
   * ]
   */
  async getPendientes(area: AreaPreparacion) {
    const admin = this.supabase.getAdminClient();

    // "!inner" fuerza el JOIN y permite filtrar por columnas de las tablas
    // relacionadas (producto.sector, pedido.estado).
    const { data, error } = await admin
      .from('pedido_items')
      .select(
        `
        id, cantidad, estado, created_at,
        producto:productos!inner ( id, nombre, sector, tiempo_elaboracion_minutos ),
        pedido:pedidos!inner (
          id, estado, created_at,
          mesa:mesas!inner ( id, numero, tipo )
        )
      `,
      )
      .eq('producto.sector', area)
      .eq('producto.eliminado', false)
      .in('estado', ITEMS_ACTIVOS)
      .in('pedido.estado', PEDIDOS_EN_JUEGO)
      .order('created_at', { ascending: true }); // lo más viejo primero (FIFO)

    if (error) throw new InternalServerErrorException(error.message);

    // ---- Agrupo por mesa en memoria --------------------------------------
    // (Supabase no agrupa; traigo la lista plana y la acomodo acá.)
    const mesasMap = new Map<string, any>();

    // Supabase tipa las relaciones anidadas de forma rara (a veces como array),
    // así que trabajo las filas como `any` y armo yo la respuesta final.
    for (const item of (data ?? []) as any[]) {
      const pedido: any = item.pedido;
      const mesa: any = pedido.mesa;
      const producto: any = item.producto;

      if (!mesasMap.has(mesa.id)) {
        mesasMap.set(mesa.id, {
          mesaId: mesa.id,
          mesaNumero: mesa.numero,
          mesaTipo: mesa.tipo,
          items: [],
        });
      }

      mesasMap.get(mesa.id).items.push({
        itemId: item.id,
        pedidoId: pedido.id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        tiempoElaboracion: producto.tiempo_elaboracion_minutos,
        estado: item.estado,
        desde: item.created_at,
      });
    }

    // Ordeno las mesas por número para que la pantalla quede prolija.
    return [...mesasMap.values()].sort((a, b) => a.mesaNumero - b.mesaNumero);
  }

  /**
   * PUNTOS 16 y 17 - Marcar un ítem como "listo".
   *
   * Además, si con este ítem quedan TODOS los ítems del pedido en 'listo',
   * marca el pedido entero como 'listo' (eso lo va a usar el Módulo 3 para
   * avisarle al mozo y al cliente - Punto 18).
   *
   * @param area    'cocina' o 'bar'. Se valida que el ítem sea de esa área.
   * @param itemId  id de la fila de pedido_items.
   */
  async marcarItemListo(area: AreaPreparacion, itemId: string) {
    const admin = this.supabase.getAdminClient();

    // Traigo el ítem con el sector de su producto y el pedido al que pertenece.
    const { data: item, error: findError } = await admin
      .from('pedido_items')
      .select('id, estado, pedido_id, producto:productos!inner ( sector )')
      .eq('id', itemId)
      .maybeSingle();

    if (findError) throw new InternalServerErrorException(findError.message);
    if (!item) throw new NotFoundException('No se encontró el ítem del pedido');

    // Cocina no puede cerrar un ítem de bar ni viceversa.
    if ((item.producto as any).sector !== area) {
      throw new BadRequestException(
        `Ese ítem no corresponde a ${area}. Lo tiene que marcar la otra área.`,
      );
    }

    if (item.estado === 'listo' || item.estado === 'entregado') {
      throw new BadRequestException('Ese ítem ya estaba listo');
    }

    const { data: itemActualizado, error: updateError } = await admin
      .from('pedido_items')
      .update({ estado: 'listo' })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError)
      throw new InternalServerErrorException(updateError.message);

    // ---- ¿Quedó el pedido completo? ------------------------------------------
    const { data: hermanos, error: hermanosError } = await admin
      .from('pedido_items')
      .select('estado')
      .eq('pedido_id', item.pedido_id);

    if (hermanosError)
      throw new InternalServerErrorException(hermanosError.message);

    const pedidoCompleto = (hermanos ?? []).every(
      (h) => h.estado === 'listo' || h.estado === 'entregado',
    );

    if (pedidoCompleto) {
      await admin
        .from('pedidos')
        .update({ estado: 'listo' })
        .eq('id', item.pedido_id);
      // TODO Módulo 3: acá el pedido pasó a 'listo' -> disparar el push
      // "tu pedido está listo" al mozo y al cliente (Punto 18).
    }

    return { item: itemActualizado, pedidoCompleto };
  }
}
