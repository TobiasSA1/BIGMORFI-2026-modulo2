import { Module } from '@nestjs/common';
import { ProductosModule } from '../productos/productos.module';
import { MesasModule } from '../mesas/mesas.module';
import { PreparacionModule } from '../preparacion/preparacion.module';

/**
 * ============================================================
 *  MÓDULO 2 - Catálogo, Mesas y Sectores (Tobi)
 * ============================================================
 *
 * Módulo "paraguas": junta todo lo del Módulo 2 en un solo import.
 * Así en `app.module.ts` se agrega una sola línea y el resto de los
 * compañeros no tienen que tocar nada.
 *
 *  - ProductosModule   -> Punto 2 (plato) y Punto 3 (bebida)
 *  - MesasModule       -> Punto 4 (alta de mesa + QR)
 *  - PreparacionModule -> Punto 16 (Cocina) y Punto 17 (Bar)
 */
@Module({
  imports: [ProductosModule, MesasModule, PreparacionModule],
})
export class CatalogoModule {}
