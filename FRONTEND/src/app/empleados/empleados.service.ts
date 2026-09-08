import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CrearEmpleadoPayload {
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string;
  email: string;
  password: string;
  rol: 'dueño' | 'supervisor' | 'cocinero' | 'mozo' | 'cantinero' | 'metre';
  fotoBase64: string;
}

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  constructor(private readonly http: HttpClient) {}

  crear(payload: CrearEmpleadoPayload) {
    return this.http.post(`${environment.apiUrl}/empleados`, payload);
  }
}