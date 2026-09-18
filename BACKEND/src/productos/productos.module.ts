import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { StorageModule } from '../common/storage/storage.module';

/**
 * Módulo de productos del catálogo (Puntos 2 y 3).
 * Importa StorageModule para poder subir las 3 fotos de cada producto.
 */
@Module({
  imports: [StorageModule],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
