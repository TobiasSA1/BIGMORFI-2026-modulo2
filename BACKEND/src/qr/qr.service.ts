import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

/**
 * Genera imágenes de códigos QR en el servidor.
 *
 * Se usa en el Punto 4 (alta de mesa): cuando se crea una mesa, el backend
 * arma el contenido del QR, genera el PNG acá y lo sube a Storage. El front
 * nunca genera QR, solo muestra la imagen final.
 *
 * (Queda reutilizable para el Módulo 4 - Punto 21, QR de propina.)
 */
@Injectable()
export class QrService {
  /**
   * Genera un PNG (como Buffer) a partir de un texto cualquiera.
   *
   * @param contenido Texto que queda codificado dentro del QR. Para las mesas
   *                  es un JSON string tipo:
   *                  {"tipo":"mesa","mesaId":"...","numero":5,"token":"..."}
   * @returns Buffer con la imagen PNG lista para subir a Storage.
   */
  async generarPng(contenido: string): Promise<Buffer> {
    return QRCode.toBuffer(contenido, {
      type: 'png',
      width: 512, // px de lado; suficiente para imprimir y pegar en la mesa
      margin: 2, // "quiet zone" para que los lectores lo agarren bien
      errorCorrectionLevel: 'M', // tolera ~15% de daño en la impresión
    });
  }
}
