import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [AuthModule, UsuariosModule, EmpleadosModule, ClientesModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
