import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

//   async login(email: string, password: string) {
//     const { data, error } =
//       await this.supabaseService
//         .getClient()
//         .auth.signInWithPassword({
//           email,
//           password,
//         });

//     if (error || !data.user || !data.session) {
//       throw new UnauthorizedException(
//         'Credenciales inválidas',
//       );
//     }

//     const user = data.user;

//     const { data: empleados, error: empleadosError } =
//     await this.supabaseService
//         .getClient()
//         .from('empleados')
//         .select('*');

//     console.log('EMPLEADOS:', empleados);
//     console.log('EMPLEADOS ERROR:', empleadosError);

//     // if (empleado) {
//     //   return {
//     //     token: data.session.access_token,
//     //     usuario: empleado,
//     //   };
//     // }

//     const { data: cliente } =
//       await this.supabaseService
//         .getClient()
//         .from('clientes')
//         .select('*')
//         .eq('id', user.id)
//         .maybeSingle();

//     if (cliente) {
//       return {
//         token: data.session.access_token,
//         usuario: cliente,
//       };
//     }

//     throw new UnauthorizedException(
//       'El usuario no tiene un perfil registrado',
//     );
//   }
}