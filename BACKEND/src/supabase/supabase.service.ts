import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly adminClient: SupabaseClient;
  private readonly anonClient: SupabaseClient;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL')!;

    // Bypasea RLS. Solo se usa server-side para altas, updates de estado, etc.
    this.adminClient = createClient(
      url,
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Respeta RLS. Se usa para validar el JWT que manda el front.
    this.anonClient = createClient(
      url,
      this.config.get<string>('SUPABASE_ANON_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  getAdminClient() {
    return this.adminClient;
  }

  getAnonClient() {
    return this.anonClient;
  }

  async subirFotoPerfil(base64: string, path: string): Promise<string> {
    const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
    const contentType = matches ? matches[1] : 'image/jpeg';
    const base64Data = matches ? matches[2] : base64;
    const buffer = Buffer.from(base64Data, 'base64');

    const { error } = await this.adminClient.storage
        .from('fotos-perfil')
        .upload(path, buffer, { contentType, upsert: true });

    if (error) throw new Error(`Error subiendo la foto: ${error.message}`);

    const { data } = this.adminClient.storage.from('fotos-perfil').getPublicUrl(path);
    return data.publicUrl;
    }
}