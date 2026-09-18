import { Module } from '@nestjs/common';
import { CocinaController } from './cocina.controller';
import { BarController } from './bar.controller';
import { PreparacionService } from './preparacion.service';

/**
 * Módulo que agrupa los sectores Cocina (Punto 16) y Bar (Punto 17).
 * Los dos controllers comparten PreparacionService.
 */
@Module({
  controllers: [CocinaController, BarController],
  providers: [PreparacionService],
})
export class PreparacionModule {}
