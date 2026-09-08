import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface RegistrarClientePayload {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fotoBase64: string;
}

export interface ClientePendiente {
  id: string;
  nombre: string;
  apellido: string;
  foto_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private readonly http: HttpClient) {}

  registrar(payload: RegistrarClientePayload) {
    return this.http.post(`${environment.apiUrl}/clientes/registro`, payload);
  }

  listarPendientes() {
    return this.http.get<ClientePendiente[]>(`${environment.apiUrl}/clientes/pendientes`);
  }

  aprobar(id: string) {
    return this.http.patch(`${environment.apiUrl}/clientes/${id}/aprobar`, {});
  }

  rechazar(id: string) {
    return this.http.patch(`${environment.apiUrl}/clientes/${id}/rechazar`, {});
  }
}