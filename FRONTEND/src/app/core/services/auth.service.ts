import { inject, Service } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Service()
export class AuthService {
    private supabaseService = inject(SupabaseService);
  
    async register(
      email: string,
      password: string,
      datos: {
        nombre: string;
        apellido: string;
        dni: string;
        cuil?: string;
        perfil: string;
        foto_url?: string;
      }
    ) {
      const { data, error } = await this.supabaseService.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            cuil: datos.cuil,
            perfil: datos.perfil,
            foto_url: datos.foto_url
          }
        }
      });
  
      if (error) {
        throw error;
      }
  
      return data;
    }
  
    async login(email: string, password: string) {
      const { data, error } =
        await this.supabaseService.client.auth.signInWithPassword({
          email,
          password
        });
  
      if (error) {
        throw error;
      }
  
      return data;
    }
  
    async logout() {
      const { error } =
        await this.supabaseService.client.auth.signOut();
  
      if (error) {
        throw error;
      }
    }
  
    async obtenerSesion() {
      const { data, error } =
        await this.supabaseService.client.auth.getSession();
  
      if (error) {
        throw error;
      }
  
      return data.session;
    }
}


