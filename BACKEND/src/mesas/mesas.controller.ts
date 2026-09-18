import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MesasService } from './mesas.service';
import { CrearMesaDto } from './dto/crear-mesa.dto';

/**
 * API de mesas.
 *
 *  - POST /mesas   -> Punto 4 (alta de mesa + QR automático). Solo dueño/supervisor.
 *  - GET  /mesas   -> listado de mesas con su QR (cualquier usuario logueado).
 */
@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  /**
   * PUNTO 4 - Alta de mesa.
   * El QR se genera solo dentro del service; el front solo manda los datos.
   */
  @Auth('dueño', 'supervisor')
  @Post()
  crear(@Body() dto: CrearMesaDto, @CurrentUser() user: any) {
    return this.mesasService.crear(dto, user.id);
  }

  @Auth()
  @Get()
  listar() {
    return this.mesasService.listar();
  }
}
