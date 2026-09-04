import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { EmpleadosService } from './empleados.service';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Auth('dueño', 'supervisor')
  @Post()
  crear(@Body() dto: CrearEmpleadoDto) {
    return this.empleadosService.crear(dto);
  }
}