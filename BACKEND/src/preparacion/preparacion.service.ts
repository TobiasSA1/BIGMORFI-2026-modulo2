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

// Estados de pedido_items (definidos por el Módulo 3 en modulo3_definitivo.sql).
// OJO: a nivel ítem NO existe 'entregado' (la entrega es del pedido completo,
// Punto 19) — solo existe en el pedido.
const ITEMS_ACTIVOS = ['pendiente', 'en_preparacion'];

// Estados de pedidos.estado (enum real del Módulo 3): 'en_armado' |
// 'pendiente_confirmacion' | 'rechazado' | 'confirmado' | 'listo' |
// 'entregado' | 'recibido' | 'pagado' | 'cancelado'. Cocina/Bar solo
// trabajan pedidos ya confirmados por el mozo (Punto 14); NO existe un
// estado 'en_preparacion' para el pedido en sí (solo para sus ítems).
const PEDIDOS_EN_JUEGO = ['confirmado'];

/**
 * Lógica compartida de Cocina (Punto 16) y Bar (Punto 17).
 *
 * Cocina/Bar NO crean nada: leen los ítems de pedidos que ya confirmó el mozo
 * (Módulo 3) y los marcan como "listo" a medida que los terminan.
 *
 * Filtran por `productos.sector` (no por `tipo`): con el enum `tipo_producto`
 * ahora incluyendo 'postre', el sector es lo que realmente decide a qué
 * pantalla va cada ítem (un postre también puede ser sector 'cocina').
 *
 * El Módulo 3 (`modulo3_definitivo.sql`) agregó `pedido_items.eliminado`
 * (borrado lógico: el mozo/cliente puede quitar un ítem del pedido) y
 * `pedido_items.precio_unitario`. Acá solo nos importa `eliminado`: un ítem
 * quitado no tiene que aparecer nunca en Cocina/Bar ni contar para saber si
 * el pedido está completo.
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
      .eq('eliminado', false) // el mozo/cliente pudo haber quitado el ítem
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
   * El Módulo 3 tiene un trigger en la base (`trg_verificar_pedido_completo`)
   * que YA deja el pedido entero en 'listo' automáticamente en el mismo
   * update, cuando era el último ítem no-eliminado que faltaba (Punto 18).
   * Acá no recalculamos esa lógica: solo la leemos después de actualizar,
   * para no duplicar una regla de negocio que no es nuestra.
   *
   * @param area    'cocina' o 'bar'. Se valida que el ítem sea de esa área.
   * @param itemId  id de la fila de pedido_items.
   */
  async marcarItemListo(area: AreaPreparacion, itemId: string) {
    const admin = this.supabase.getAdminClient();

    // Traigo el ítem con el sector de su producto y el pedido al que pertenece.
    const { data: item, error: findError } = await admin
      .from('pedido_items')
      .select('id, estado, eliminado, pedido_id, producto:productos!inner ( sector )')
      .eq('id', itemId)
      .maybeSingle();

    if (findError) throw new InternalServerErrorException(findError.message);
    if (!item || item.eliminado) {
      throw new NotFoundException('No se encontró el ítem del pedido');
    }

    // Cocina no puede cerrar un ítem de bar ni viceversa.
    if ((item.producto as any).sector !== area) {
      throw new BadRequestException(
        `Ese ítem no corresponde a ${area}. Lo tiene que marcar la otra área.`,
      );
    }

    if (item.estado === 'listo') {
      throw new BadRequestException('Ese ítem ya estaba listo');
    }

    const { data: itemActualizado, error: updateError } = await admin
      .from('pedido_items')
      .update({ estado: 'listo' })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) throw new InternalServerErrorException(updateError.message);

    // El trigger del Módulo 3 ya corrió como parte del update de arriba
    // (misma transacción). Solo leemos en qué quedó el pedido.
    const { data: pedidoActual, error: pedidoError } = await admin
      .from('pedidos')
      .select('estado')
      .eq('id', item.pedido_id)
      .single();

    if (pedidoError) throw new InternalServerErrorException(pedidoError.message);

    return { item: itemActualizado, pedidoCompleto: pedidoActual.estado === 'listo' };
  }
}
