import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CrearEmpleadoDto } from './dto/crear-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private readonly supabase: SupabaseService) {}

  async crear(dto: CrearEmpleadoDto) {
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
      email_confirm: true, // alta hecha por un admin, no necesita confirmar el mail
    });

    if (authError || !authData.user) {
      if (authError?.message.includes('already registered')) {
        throw new ConflictException('Ya existe un usuario con ese correo electrónico');
      }
      throw new InternalServerErrorException(authError?.message ?? 'No se pudo crear el usuario');
    }

    const userId = authData.user.id;

    try {
      const fotoUrl = await this.supabase.subirFotoPerfil(dto.fotoBase64, `empleados/${userId}.jpg`);

      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .insert({
          id: userId,
          nombre: dto.nombre,
          apellido: dto.apellido,
          dni: dto.dni,
          cuil: dto.cuil,
          rol: dto.rol,
          estado: 'aprobado',
          foto_url: fotoUrl,
        })
        .select()
        .single();

      if (profileError) throw new BadRequestException(profileError.message);

      return profile;
    } catch (err) {
      // Si falla algo después de crear el auth user, lo borramos para no dejar basura
      await admin.auth.admin.deleteUser(userId);
      throw err;
    }
  }
}