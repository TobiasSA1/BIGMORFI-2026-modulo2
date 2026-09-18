import { Module } from '@nestjs/common';
import { QrService } from './qr.service';

/**
 * Expone QrService para que lo use el módulo de mesas (Punto 4).
 */
@Module({
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
