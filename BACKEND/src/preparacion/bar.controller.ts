import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { PreparacionService } from './preparacion.service';

/**
 * PUNTO 17 - Sector BAR.
 *
 *  - GET   /bar/pendientes          -> ítems pendientes agrupados por mesa
 *  - PATCH /bar/items/:id/listo     -> marcar un ítem como listo
 *
 * Acceso: cantinero (y dueño/supervisor).
 */
@Controller('bar')
export class BarController {
  constructor(private readonly preparacion: PreparacionService) {}

  @Auth('cantinero', 'dueño', 'supervisor')
  @Get('pendientes')
  pendientes() {
    return this.preparacion.getPendientes('bar');
  }

  @Auth('cantinero', 'dueño', 'supervisor')
  @Patch('items/:id/listo')
  marcarListo(@Param('id') id: string) {
    return this.preparacion.marcarItemListo('bar', id);
  }
}
