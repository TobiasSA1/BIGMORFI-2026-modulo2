import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto');
    }
    const token = authHeader.replace('Bearer ', '');

    // Valida el JWT contra Supabase Auth
    const { data, error } = await this.supabase.getAnonClient().auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Trae el perfil (con admin client porque el guard corre server-side, sin RLS de usuario)
    const { data: profile, error: profileError } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new UnauthorizedException('Perfil no encontrado');
    }

    // Punto 7/8 de la consigna: cliente pendiente o rechazado no puede operar
    if (profile.rol === 'cliente' && profile.estado !== 'aprobado') {
      throw new ForbiddenException({
        code: profile.estado === 'pendiente' ? 'REGISTRO_PENDIENTE' : 'REGISTRO_RECHAZADO',
        message:
          profile.estado === 'pendiente'
            ? 'Tu registro todavía está pendiente de aprobación.'
            : 'Tu registro fue rechazado. No podés acceder a la aplicación.',
      });
    }

    request.user = { authId: data.user.id, email: data.user.email, ...profile };
    return true;
  }
}