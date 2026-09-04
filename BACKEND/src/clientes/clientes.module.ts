import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [MailModule, NotificationsModule],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}