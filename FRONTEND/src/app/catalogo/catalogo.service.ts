import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * ============================================================
 *  MÓDULO 2 - Catálogo, Mesas y Sectores (Tobi)
 * ============================================================
 *
 * Único servicio HTTP del Módulo 2. Habla con la API NestJS (carpeta BACKEND/).
 * El token JWT lo agrega solo el `authInterceptor` del Módulo 1, así que acá
 * no hay que preocuparse por eso.
 */

// ---- Tipos que devuelve el backend (coinciden con las columnas de la base) ----

export type TipoProducto = 'plato' | 'bebida' | 'postre';
export type SectorPreparacion = 'cocina' | 'bar';
export type TipoMesa = 'vip' | 'estandar' | 'movilidad_reducida';
export type DisponibilidadMesa = 'vacia' | 'reservada' | 'ocupada';

export interface Producto {
  id: string;
  tipo: TipoProducto;
  sector: SectorPreparacion;
  nombre: string;
  descripcion: string;
  precio: number;
  tiempo_elaboracion_minutos: number;
  en_carta: boolean;
  fotos: string[]; // siempre 3, ya subidas a Storage
  created_at: string;
}

export interface Mesa {
  id: string;
  numero: number;
  cantidad_comensales: number;
  tipo: TipoMesa;
  // La ocupación (vacía/reservada/ocupada) la administra el Módulo 3; acá
  // solo se muestra, no se edita.
  disponibilidad: DisponibilidadMesa;
  foto_url: string;
  qr_token: string;
  qr_payload: string;
  qr_url: string; // PNG del QR listo para <img [src]>
  created_at: string;
}

/**
 * Un ítem pendiente en Cocina o Bar (Puntos 16 y 17).
 * A nivel ítem no existe 'entregado' (eso es un estado del pedido completo,
 * Punto 19, definido por el Módulo 3) — por eso no está en este union type.
 */
export interface PreparacionItem {
  itemId: string;
  pedidoId: string;
  nombre: string;
  cantidad: number;
  tiempoElaboracion: number;
  estado: 'pendiente' | 'en_preparacion' | 'listo';
  desde: string;
}

/** Los ítems pendientes de una mesa (agrupados como pide la consigna). */
export interface PreparacionMesa {
  mesaId: string;
  mesaNumero: number;
  mesaTipo: TipoMesa;
  items: PreparacionItem[];
}

export interface MarcarListoResult {
  item: unknown;
  pedidoCompleto: boolean;
}

// ---- Payloads que se mandan al backend ----

export interface CrearProductoPayload {
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempoElaboracion: number;
  enCarta: boolean;
  foto1Base64: string;
  foto2Base64: string;
  foto3Base64: string;
}

export interface CrearMesaPayload {
  numero: number;
  cantidadComensales: number;
  tipo: TipoMesa;
  fotoBase64: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // ===== PUNTO 2 - Alta de plato =====
  crearPlato(payload: CrearProductoPayload) {
    return this.http.post<Producto>(`${this.api}/productos/platos`, payload);
  }

  // ===== PUNTO 3 - Alta de bebida =====
  crearBebida(payload: CrearProductoPayload) {
    return this.http.post<Producto>(`${this.api}/productos/bebidas`, payload);
  }

  // ===== Alta de postre (agregado a pedido del equipo, lo exige el TP) =====
  crearPostre(payload: CrearProductoPayload) {
    return this.http.post<Producto>(`${this.api}/productos/postres`, payload);
  }

  /** Carta completa (o filtrada por tipo). Sirve para la "verificación en carta". */
  listarProductos(tipo?: TipoProducto) {
    const qs = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<Producto[]>(`${this.api}/productos${qs}`);
  }

  // ===== PUNTO 4 - Alta de mesa (el QR lo genera el backend) =====
  crearMesa(payload: CrearMesaPayload) {
    return this.http.post<Mesa>(`${this.api}/mesas`, payload);
  }

  listarMesas() {
    return this.http.get<Mesa[]>(`${this.api}/mesas`);
  }

  // ===== PUNTO 16 - Cocina =====
  getCocinaPendientes() {
    return this.http.get<PreparacionMesa[]>(`${this.api}/cocina/pendientes`);
  }

  marcarPlatoListo(itemId: string) {
    return this.http.patch<MarcarListoResult>(`${this.api}/cocina/items/${itemId}/listo`, {});
  }

  // ===== PUNTO 17 - Bar =====
  getBarPendientes() {
    return this.http.get<PreparacionMesa[]>(`${this.api}/bar/pendientes`);
  }

  marcarBebidaListo(itemId: string) {
    return this.http.patch<MarcarListoResult>(`${this.api}/bar/items/${itemId}/listo`, {});
  }
}
