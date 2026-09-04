import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { MailService } from 'src/mail/mail.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ClientesService {
  constructor(private readonly supabase: SupabaseService, private readonly mail: MailService, private readonly notifications: NotificationsService) {}

  async registrar(dto: RegistrarClienteDto) {
    const admin = this.supabase.getAdminClient();

    const { data: existente } = await admin
      .from('profiles')
      .select('id')
      .eq('dni', dto.dni)
      .maybeSingle();

    if (existente) {
      throw new ConflictException('Ya existe una persona registrada con ese DNI');
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      if (authError?.message.includes('already registered')) {
        throw new ConflictException('Ya existe un usuario con ese correo electrónico');
      }
      throw new InternalServerErrorException(authError?.message ?? 'No se pudo crear el usuario');
    }

    const userId = authData.user.id;

    try {
      const fotoUrl = await this.supabase.subirFotoPerfil(dto.fotoBase64, `clientes/${userId}.jpg`);

      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .insert({
          id: userId,
          nombre: dto.nombre,
          apellido: dto.apellido,
          dni: dto.dni,
          rol: 'cliente',      // forzado acá, nunca viene del body
          estado: 'pendiente',
          foto_url: fotoUrl,
        })
        .select()
        .single();

      if (profileError) throw new BadRequestException(profileError.message);

      await this.notifications.notificarNuevoClientePendiente(profile);

      return profile;
    } catch (err) {
      await admin.auth.admin.deleteUser(userId);
      throw err;
    }
  }

  async listarPendientes() {
    const admin = this.supabase.getAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('id, nombre, apellido, foto_url, created_at')
      .eq('rol', 'cliente')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  aprobar(id: string) {
    return this.cambiarEstado(id, 'aprobado');
  }

  rechazar(id: string) {
    return this.cambiarEstado(id, 'rechazado');
  }

  private async cambiarEstado(id: string, estado: 'aprobado' | 'rechazado') {
    const admin = this.supabase.getAdminClient();

    const { data: cliente, error: findError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('rol', 'cliente')
      .maybeSingle();

    if (findError) throw new InternalServerErrorException(findError.message);
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    if (cliente.estado !== 'pendiente') {
      throw new BadRequestException(`El cliente ya fue ${cliente.estado}`);
    }

    const { data: actualizado, error: updateError } = await admin
      .from('profiles')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new InternalServerErrorException(updateError.message);

    const { data: authUser } = await admin.auth.admin.getUserById(id);
    const email = authUser?.user?.email;

    if (email) {
      if (estado === 'aprobado') {
        await this.mail.enviarMailAprobacion(email, actualizado.nombre);
      } else {
        await this.mail.enviarMailRechazo(email, actualizado.nombre);
      }
    }
    return actualizado;
  }
}