import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { FirebaseAdminService } from './notifications/firebase-admin/firebase-admin.service';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    EmpleadosModule,
    ClientesModule,
    NotificationsModule
  ],
  providers: [NotificationsService, FirebaseAdminService],
})
export class AppModule {}