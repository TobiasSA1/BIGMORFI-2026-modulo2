import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { ClientesService } from './clientes.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post('registro') // público: el cliente (o el metre asistiéndolo) todavía no tiene sesión
  registrar(@Body() dto: RegistrarClienteDto) {
    return this.clientesService.registrar(dto);
  }

  @Auth('dueño', 'supervisor')
  @Get('pendientes')
  listarPendientes() {
    return this.clientesService.listarPendientes();
  }

  @Auth('dueño', 'supervisor')
  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.clientesService.aprobar(id);
  }

  @Auth('dueño', 'supervisor')
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.clientesService.rechazar(id);
  }
}