import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import { StorageService } from '../common/storage/storage.service';
import { QrService } from '../qr/qr.service';
import { CrearMesaDto } from './dto/crear-mesa.dto';

/**
 * Lógica de mesas (Punto 4).
 *
 * Lo importante de este punto: al dar de alta una mesa, el backend genera
 * automáticamente su código QR (no lo hace el usuario). Ese QR después lo va a
 * escanear el cliente en el Módulo 3 para "sentarse" en la mesa.
 *
 * La mesa nace con `disponibilidad = 'vacia'` (default de la base). El estado
 * de ocupación (reservada/ocupada) lo maneja el Módulo 3, acá no se toca.
 */
@Injectable()
export class MesasService {
  // Un solo bucket para todo lo de la mesa: la foto y el PNG del QR.
  private readonly BUCKET = 'mesas';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly storage: StorageService,
    private readonly qr: QrService,
  ) {}

  /**
   * Alta de mesa + generación automática del QR.
   *
   * @param dto        Datos validados del formulario.
   * @param creadoPor  id del profile del dueño/supervisor que la crea.
   */
  async crear(dto: CrearMesaDto, creadoPor: string) {
    const admin = this.supabase.getAdminClient();

    // ---- El número de mesa no se puede repetir (entre las activas) ----
    const { data: existente } = await admin
      .from('mesas')
      .select('id')
      .eq('numero', dto.numero)
      .eq('eliminado', false)
      .maybeSingle();

    if (existente) {
      throw new ConflictException(`Ya existe la mesa número ${dto.numero}`);
    }

    // Genero los ids antes de tocar Storage, para armar rutas propias por mesa.
    const id = randomUUID();
    const qrToken = randomUUID();

    // ---- Contenido que va DENTRO del QR --------------------------------------
    // Es un JSON string. El Módulo 3 lo va a parsear cuando el cliente escanee.
    //   tipo   -> para distinguirlo de otros QR (DNI, propina, etc.)
    //   mesaId -> para saber a qué mesa se sentó
    //   numero -> práctico para mostrarlo sin ir a la base
    //   token  -> valor secreto/irrepetible, sirve para validar que el QR es legítimo
    const qrPayload = JSON.stringify({
      tipo: 'mesa',
      mesaId: id,
      numero: dto.numero,
      token: qrToken,
    });

    try {
      // Genero el PNG del QR en memoria y lo subo a Storage.
      const qrPng = await this.qr.generarPng(qrPayload);
      const qrUrl = await this.storage.subirBuffer(
        this.BUCKET,
        `${id}/qr.png`,
        qrPng,
        'image/png',
      );

      // Subo la foto de la mesa.
      const fotoUrl = await this.storage.subirImagenBase64(
        this.BUCKET,
        `${id}/foto.jpg`,
        dto.fotoBase64,
      );

      const { data: mesa, error } = await admin
        .from('mesas')
        .insert({
          id,
          numero: dto.numero,
          cantidad_comensales: dto.cantidadComensales,
          tipo: dto.tipo,
          // disponibilidad NO se manda: la base la pone en 'vacia' por default.
          foto_url: fotoUrl,
          qr_token: qrToken,
          qr_payload: qrPayload,
          qr_url: qrUrl,
          creado_por: creadoPor,
        })
        .select()
        .single();

      if (error) throw new BadRequestException(error.message);

      return mesa;
    } catch (err) {
      // Si algo falló después de subir archivos, limpio lo que haya quedado.
      await admin.storage
        .from(this.BUCKET)
        .remove([`${id}/qr.png`, `${id}/foto.jpg`]);
      throw err;
    }
  }

  /**
   * Lista todas las mesas activas con su QR. Sirve para reimprimir QRs y para
   * que el metre del Módulo 3 elija a qué mesa mandar un cliente.
   */
  async listar() {
    const admin = this.supabase.getAdminClient();
    const { data, error } = await admin
      .from('mesas')
      .select('*')
      .eq('eliminado', false)
      .order('numero', { ascending: true });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  /**
   * Trae una mesa puntual por id. Lo usa el Módulo 3 (Punto 10) cuando el
   * cliente escanea el QR: el QR trae el `mesaId` en su payload, así que con
   * esto pueden validar que la mesa existe y comparar el `qr_token` de la
   * respuesta contra el `token` que venía en el QR escaneado (para
   * detectar un QR falso o de una mesa vieja/borrada).
   */
  async buscarPorId(id: string) {
    const admin = this.supabase.getAdminClient();
    const { data, error } = await admin
      .from('mesas')
      .select('*')
      .eq('id', id)
      .eq('eliminado', false)
      .maybeSingle();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('No se encontró la mesa');
    return data;
  }
}
