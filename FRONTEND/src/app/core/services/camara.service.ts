import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class CamaraService {
  async tomarFoto(): Promise<string> {
  const foto = await Camera.getPhoto({
    quality: 80,
    width: 800, // limita el ancho para que el base64 no sea gigante
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
  });

  if (!foto.dataUrl) {
    throw new Error('No se pudo obtener la foto');
  }
  return foto.dataUrl;
}
}