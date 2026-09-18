import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { PreparacionService } from './preparacion.service';

/**
 * PUNTO 16 - Sector COCINA.
 *
 *  - GET   /cocina/pendientes          -> ítems pendientes agrupados por mesa
 *  - PATCH /cocina/items/:id/listo     -> marcar un ítem como listo
 *
 * Acceso: cocinero (y dueño/supervisor).
 */
@Controller('cocina')
export class CocinaController {
  constructor(private readonly preparacion: PreparacionService) {}

  @Auth('cocinero', 'dueño', 'supervisor')
  @Get('pendientes')
  pendientes() {
    return this.preparacion.getPendientes('cocina');
  }

  @Auth('cocinero', 'dueño', 'supervisor')
  @Patch('items/:id/listo')
  marcarListo(@Param('id') id: string) {
    return this.preparacion.marcarItemListo('cocina', id);
  }
}
