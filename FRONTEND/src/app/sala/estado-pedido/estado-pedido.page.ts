import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonFooter, IonButton, IonIcon } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { NavClienteComponent } from '../../core/components/nav-cliente/nav-cliente.component';

type EstadoPedido =
  | 'pendiente_confirmacion'
  | 'rechazado'
  | 'confirmado'
  | 'listo'
  | 'entregado'
  | 'recibido';

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTOS 13, 14, 18 y 19 — seguimiento del pedido del lado del cliente:
 * el mozo lo rechaza o lo confirma (13/14), cocina/bar avisan que está
 * listo (18, eso ya lo dispara el Módulo 2 — ver preparacion.service.ts),
 * y el mozo lo entrega (19).
 *
 * Los estados posibles son EXACTAMENTE los del enum real de
 * `pedidos.estado` que definió Nahue (ver modulo3_definitivo.sql). En real,
 * esto se suscribe a Supabase Realtime sobre la fila de `pedidos`; acá hay
 * botones de "avanzar estado (mock)" para poder ver las 4 vistas sin
 * backend.
 */
@Component({
  selector: 'app-estado-pedido',
  templateUrl: './estado-pedido.page.html',
  styleUrls: ['./estado-pedido.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonFooter, IonButton, IonIcon, HeaderMarcaComponent, NavClienteComponent],
})
export class EstadoPedidoPage {
  // Orden real del flujo (sin contar 'rechazado', que es una rama aparte).
  private readonly pasos: EstadoPedido[] = [
    'pendiente_confirmacion',
    'confirmado',
    'listo',
    'entregado',
    'recibido',
  ];

  // OJO: acá iría un spinner real mientras se hace la primera lectura de la
  // fila de `pedidos` (antes de suscribirse a Realtime). Se dejó en `false`
  // a pedido de Tobi mientras se revisa el diseño pantalla por pantalla —
  // con `true` el spinner tapaba la navegación de las pruebas.
  cargando = false;

  estado: EstadoPedido = 'pendiente_confirmacion';
  motivoRechazo = 'No quedan medallones de carne para la Suprema.';

  readonly etiquetas: Record<EstadoPedido, string> = {
    pendiente_confirmacion: 'Enviado al mozo',
    rechazado: 'Rechazado',
    confirmado: 'Confirmado, yendo a cocina/bar',
    listo: 'Listo para servir',
    entregado: 'Entregado en tu mesa',
    recibido: 'Recibido — ¡buen provecho!',
  };

  readonly iconoPorEstado: Record<EstadoPedido, string> = {
    pendiente_confirmacion: 'time-outline',
    rechazado: 'close-circle',
    confirmado: 'restaurant-outline',
    listo: 'checkmark-circle',
    entregado: 'checkmark-done-outline',
    recibido: 'happy-outline',
  };

  pasoIndex(paso: EstadoPedido): number {
    return this.pasos.indexOf(paso);
  }

  get indiceActual(): number {
    return this.pasoIndex(this.estado);
  }

  esPasoCompletado(paso: EstadoPedido): boolean {
    return this.estado !== 'rechazado' && this.pasoIndex(paso) < this.indiceActual;
  }

  esPasoActual(paso: EstadoPedido): boolean {
    return this.estado === paso;
  }

  /** Botón de desarrollo: simula que llegó el siguiente evento por push/Realtime. */
  avanzarMock() {
    const idx = this.indiceActual;
    if (idx < this.pasos.length - 1) {
      this.estado = this.pasos[idx + 1];
    }
  }

  simularRechazoMock() {
    this.estado = 'rechazado';
  }

  /** PUNTO 19: el cliente confirma que recibió el pedido. */
  confirmarRecepcion() {
    this.estado = 'recibido';
  }
}
