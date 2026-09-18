import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProductosService } from './productos.service';
// import type: TipoProducto es solo un tipo y se usa en una firma decorada
// (@Query). Con emitDecoratorMetadata hay que importarlo como type aparte.
import type { TipoProducto } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';

/**
 * API del catálogo de productos.
 *
 *  - POST /productos/platos    -> Punto 2 (alta de plato, la hace el cocinero)
 *  - POST /productos/bebidas   -> Punto 3 (alta de bebida, la hace el cantinero)
 *  - GET  /productos           -> ver la carta (cualquier usuario logueado)
 */
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /**
   * PUNTO 2 - Alta de plato.
   * Solo cocinero (o dueño/supervisor, que pueden todo). El `tipo` lo forzamos
   * a 'plato' acá, no se puede mandar por body.
   */
  @Auth('cocinero', 'dueño', 'supervisor')
  @Post('platos')
  crearPlato(@Body() dto: CrearProductoDto, @CurrentUser() user: any) {
    return this.productosService.crear(dto, 'plato', user.id);
  }

  /**
   * PUNTO 3 - Alta de bebida.
   * Solo cantinero (o dueño/supervisor). El `tipo` se fuerza a 'bebida'.
   */
  @Auth('cantinero', 'dueño', 'supervisor')
  @Post('bebidas')
  crearBebida(@Body() dto: CrearProductoDto, @CurrentUser() user: any) {
    return this.productosService.crear(dto, 'bebida', user.id);
  }

  /**
   * Listado de la carta. Filtros opcionales por query string:
   *   /productos?tipo=plato
   *   /productos?soloEnCarta=true
   */
  @Auth()
  @Get()
  listar(
    @Query('tipo') tipo?: TipoProducto,
    @Query('soloEnCarta') soloEnCarta?: string,
  ) {
    return this.productosService.listar(tipo, soloEnCarta === 'true');
  }
}
