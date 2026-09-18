import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { FirebaseAdminService } from './notifications/firebase-admin/firebase-admin.service';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationsService } from './notifications/notifications.service';
// Módulo 2 (Catálogo, Mesas y Sectores) - Tobi
import { CatalogoModule } from './catalogo/catalogo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    EmpleadosModule,
    ClientesModule,
    NotificationsModule,
    // Módulo 2 (Catálogo, Mesas y Sectores) - Tobi
    CatalogoModule,
  ],
  providers: [NotificationsService, FirebaseAdminService],
})
export class AppModule {}