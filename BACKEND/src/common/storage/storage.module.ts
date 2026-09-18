import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

/**
 * Expone StorageService para que lo puedan inyectar los módulos del Módulo 2
 * (productos, mesas, qr). SupabaseService ya es global (Módulo 1), así que
 * acá no hace falta importar nada más.
 */
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
