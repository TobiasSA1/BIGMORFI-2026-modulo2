import { Module } from '@nestjs/common';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';
import { StorageModule } from '../common/storage/storage.module';
import { QrModule } from '../qr/qr.module';

/**
 * Módulo de mesas (Punto 4).
 *  - StorageModule -> subir la foto y el PNG del QR.
 *  - QrModule      -> generar el PNG del QR.
 */
@Module({
  imports: [StorageModule, QrModule],
  controllers: [MesasController],
  providers: [MesasService],
})
export class MesasModule {}
