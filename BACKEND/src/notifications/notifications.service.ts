import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FirebaseAdminService } from './firebase-admin/firebase-admin.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly firebase: FirebaseAdminService,
  ) {}

  async registrarToken(userId: string, token: string, platform?: string) {
    const admin = this.supabase.getAdminClient();
    const { error } = await admin
      .from('push_tokens')
      .upsert({ user_id: userId, token, platform }, { onConflict: 'token' });

    if (error) this.logger.error(`Error guardando push token: ${error.message}`);
  }

  async eliminarToken(token: string) {
    const admin = this.supabase.getAdminClient();
    await admin.from('push_tokens').delete().eq('token', token);
  }

  async notificarNuevoClientePendiente(cliente: { id: string; nombre: string; apellido: string }) {
    const admin = this.supabase.getAdminClient();

    const { data: destinatarios, error } = await admin
      .from('profiles')
      .select('id')
      .in('rol', ['dueño', 'supervisor']);

    if (error || !destinatarios?.length) return;

    const { data: tokens } = await admin
      .from('push_tokens')
      .select('token')
      .in('user_id', destinatarios.map((d) => d.id));

    const listaTokens = tokens?.map((t) => t.token) ?? [];
    if (listaTokens.length === 0) {
      this.logger.warn('No hay dispositivos registrados para notificar (todavía no hay front)');
      return;
    }

    const response = await this.firebase.getMessaging().sendEachForMulticast({
      tokens: listaTokens,
      notification: {
        title: 'Nuevo cliente pendiente',
        body: `${cliente.nombre} ${cliente.apellido} se registró y espera aprobación.`,
      },
      data: { tipo: 'CLIENTE_PENDIENTE', clienteId: cliente.id },
    });

    // Limpieza: si un token quedó inválido/desinstalado, lo borramos
    const tokensAEliminar = response.responses
      .map((r, i) => (!r.success && r.error?.code === 'messaging/registration-token-not-registered' ? listaTokens[i] : null))
      .filter((t): t is string => t !== null);

    if (tokensAEliminar.length > 0) {
      await admin.from('push_tokens').delete().in('token', tokensAEliminar);
    }
  }
}