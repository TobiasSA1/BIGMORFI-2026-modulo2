import { Body, Controller, Delete, Post } from '@nestjs/common';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { RegistrarTokenDto } from './dto/registrar-token.dto';

@Controller('notificaciones')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Auth() // sin roles → alcanza con estar logueado (dueño, supervisor, cocinero, etc.)
  @Post('token')
  registrar(@Body() dto: RegistrarTokenDto, @CurrentUser() user: any) {
    return this.notifications.registrarToken(user.id, dto.token, dto.platform);
  }

  @Auth()
  @Delete('token')
  eliminar(@Body() dto: RegistrarTokenDto) {
    return this.notifications.eliminarToken(dto.token);
  }
}