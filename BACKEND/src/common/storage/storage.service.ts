import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Helper genérico para subir imágenes a cualquier bucket de Supabase Storage.
 *
 * El Módulo 1 ya tiene `SupabaseService.subirFotoPerfil`, pero está atado al
 * bucket 'fotos-perfil'. Para no tocar ese archivo (es de otro compañero),
 * el Módulo 2 usa este servicio propio, que hace lo mismo pero contra el
 * bucket que le pasemos ('productos', 'mesas', etc.).
 */
@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Sube una imagen que viene como Data URL base64 desde el front
   * (ej: "data:image/jpeg;base64,/9j/4AAQ...").
   *
   * @param bucket  Nombre del bucket de Storage (tiene que existir y ser público).
   * @param path    Ruta/nombre del archivo dentro del bucket (ej: "abc123/1.jpg").
   * @param dataUrl String base64 con el prefijo "data:image/...;base64,".
   * @returns       URL pública para usar directo en un <img src="...">.
   */
  async subirImagenBase64(
    bucket: string,
    path: string,
    dataUrl: string,
  ): Promise<string> {
    // Separo el tipo de contenido y los bytes reales del Data URL.
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    const contentType = match ? match[1] : 'image/jpeg';
    const base64 = match ? match[2] : dataUrl;
    const buffer = Buffer.from(base64, 'base64');

    return this.subirBuffer(bucket, path, buffer, contentType);
  }

  /**
   * Sube un buffer binario ya armado (lo usa el QrService, que genera el PNG
   * del QR en memoria y no lo recibe del front).
   *
   * @param bucket       Nombre del bucket.
   * @param path         Ruta/nombre del archivo dentro del bucket.
   * @param buffer       Contenido binario del archivo.
   * @param contentType  MIME type (ej: "image/png").
   * @returns            URL pública del archivo subido.
   */
  async subirBuffer(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const admin = this.supabase.getAdminClient();

    // upsert: true -> si vuelvo a subir el mismo path, lo pisa en vez de fallar.
    const { error } = await admin.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo subir la imagen a '${bucket}/${path}': ${error.message}`,
      );
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
