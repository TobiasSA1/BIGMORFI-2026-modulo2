import { Injectable, Service } from '@angular/core';
import { SupabaseService } from './supabase.service';


export interface Perfil {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string | null;
  // 'cantinero' y 'mozo' agregados para el Módulo 2 (Cocina/Bar y botones del home).
  rol: 'dueño' | 'supervisor' | 'cocinero' | 'cantinero' | 'mozo' | 'cliente' | 'metre';
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  foto_url: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private readonly supabase: SupabaseService) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.client.auth.signOut();
  }

  async estaLogueado(): Promise<boolean> {
    return (await this.supabase.getSession()) !== null;
  }

  async getPerfilActual(): Promise<Perfil | null> {
    const session = await this.supabase.getSession();
    if (!session) return null;

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return error ? null : (data as Perfil);
  }
}
