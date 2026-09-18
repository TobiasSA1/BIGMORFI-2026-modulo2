import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import { StorageService } from '../common/storage/storage.service';
import { CrearProductoDto } from './dto/crear-producto.dto';

// 'postre' existe en la base (columna `tipo`) porque así se definió el
// esquema junto con el Módulo 3, pero acá solo se implementa la carga de
// 'plato' y 'bebida' (Puntos 2 y 3 de la consigna).
export type TipoProducto = 'plato' | 'bebida';
export type SectorPreparacion = 'cocina' | 'bar';

// A qué sector va cada tipo cuando se pide (Puntos 16 y 17). Se guarda como
// columna propia en la base (no se recalcula ahí), pero acá es donde se
// decide para los tipos que carga este módulo.
const SECTOR_POR_TIPO: Record<TipoProducto, SectorPreparacion> = {
  plato: 'cocina',
  bebida: 'bar',
};

/**
 * Lógica del catálogo de productos (Puntos 2 y 3).
 *
 * Trabaja siempre con el "admin client" de Supabase (service role), igual que
 * el Módulo 1: el backend es el único que escribe estas tablas.
 */
@Injectable()
export class ProductosService {
  private readonly BUCKET = 'productos';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Alta de un plato (Punto 2) o una bebida (Punto 3).
   *
   * @param dto        Datos validados del formulario.
   * @param tipo       'plato' o 'bebida'. Lo fija el controller, NO el body.
   * @param creadoPor  id del profile del cocinero/cantinero que está cargando.
   */
  async crear(dto: CrearProductoDto, tipo: TipoProducto, creadoPor: string) {
    const admin = this.supabase.getAdminClient();

    // ---- "Verificación en carta": no se puede cargar dos veces lo mismo ----
    // ilike sin comodines = comparación exacta pero sin distinguir mayúsculas.
    // El índice único de la base también protege esto (por si dos altas
    // llegan al mismo tiempo), esta consulta es solo para dar un mensaje claro.
    const { data: existente } = await admin
      .from('productos')
      .select('id')
      .eq('tipo', tipo)
      .eq('eliminado', false)
      .ilike('nombre', dto.nombre)
      .maybeSingle();

    if (existente) {
      throw new ConflictException(
        `Ya hay ${tipo === 'plato' ? 'un plato' : 'una bebida'} con el nombre "${dto.nombre}" en la carta`,
      );
    }

    // Genero el id acá para poder guardar las fotos en una carpeta propia
    // (productos/<id>/1.jpg) antes de insertar la fila.
    const id = randomUUID();

    let fotosUrls: string[];
    try {
      // Subo las 3 fotos. Si alguna falla, revienta acá y no insertamos nada.
      fotosUrls = await Promise.all([
        this.storage.subirImagenBase64(
          this.BUCKET,
          `${id}/1.jpg`,
          dto.foto1Base64,
        ),
        this.storage.subirImagenBase64(
          this.BUCKET,
          `${id}/2.jpg`,
          dto.foto2Base64,
        ),
        this.storage.subirImagenBase64(
          this.BUCKET,
          `${id}/3.jpg`,
          dto.foto3Base64,
        ),
      ]);
    } catch (err) {
      throw new InternalServerErrorException(
        `No se pudieron subir las fotos del producto: ${(err as Error).message}`,
      );
    }

    const { data: producto, error } = await admin
      .from('productos')
      .insert({
        id,
        tipo,
        sector: SECTOR_POR_TIPO[tipo],
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? '',
        precio: dto.precio,
        tiempo_elaboracion_minutos: dto.tiempoElaboracion,
        // Si el front no manda el campo, por defecto SÍ entra en la carta.
        en_carta: dto.enCarta ?? true,
        fotos: fotosUrls,
        creado_por: creadoPor,
      })
      .select()
      .single();

    if (error) {
      // Limpieza: si falló el insert, borro las fotos que ya subí para no
      // dejar basura en Storage.
      await this.supabase
        .getAdminClient()
        .storage.from(this.BUCKET)
        .remove([`${id}/1.jpg`, `${id}/2.jpg`, `${id}/3.jpg`]);
      throw new BadRequestException(error.message);
    }

    return producto;
  }

  /**
   * Lista los productos de la carta. Lo usa el propio Módulo 2 para chequear
   * qué hay cargado y lo van a usar el mozo/cliente del Módulo 3 para ver la carta.
   *
   * @param tipo  Filtro opcional: 'plato' | 'bebida'. Sin filtro devuelve todo.
   * @param soloEnCarta  Si es true, devuelve solo los que están publicados.
   */
  async listar(tipo?: TipoProducto, soloEnCarta = false) {
    const admin = this.supabase.getAdminClient();

    let query = admin
      .from('productos')
      .select('*')
      .eq('eliminado', false)
      .order('tipo', { ascending: true })
      .order('nombre', { ascending: true });

    if (tipo) query = query.eq('tipo', tipo);
    if (soloEnCarta) query = query.eq('en_carta', true);

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
