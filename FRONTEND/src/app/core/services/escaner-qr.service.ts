import { Injectable } from '@angular/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

export interface DatosDni {
  nombre: string;
  apellido: string;
  dni: string;
  cuil?: string;
}

@Injectable({ providedIn: 'root' })
export class EscanerQrService {
  async escanearDni(): Promise<DatosDni> {
    const { camera } = await BarcodeScanner.requestPermissions();
    if (camera !== 'granted' && camera !== 'limited') {
      throw new Error('Se necesita permiso de cámara para escanear el DNI');
    }

    const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });

    if (barcodes.length === 0) {
      throw new Error('No se detectó ningún código QR');
    }

    return this.parsear(barcodes[0].rawValue!);
  }

  private parsear(contenido: string): DatosDni {
    try {
      const datos = JSON.parse(contenido);
      if (!datos.nombre || !datos.apellido || !datos.dni) throw new Error();
      return { nombre: datos.nombre, apellido: datos.apellido, dni: datos.dni, cuil: datos.cuil };
    } catch {
      throw new Error('El código QR no tiene el formato esperado');
    }
  }
}