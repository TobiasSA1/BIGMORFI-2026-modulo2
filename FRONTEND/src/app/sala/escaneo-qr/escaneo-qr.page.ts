import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonButton, IonSpinner, ToastController } from '@ionic/angular';

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * Pantalla de escaneo de QR, reutilizada para dos casos de la consigna
 * (mismo diseño, cambia el texto):
 *   - Punto 9:  escanear el QR de INGRESO al local.
 *   - Punto 10: escanear el QR de la MESA que asignó el metre.
 * El modo se define por `route.data.modo` (ver app.routes.ts).
 *
 * El visor de cámara es una simulación con CSS (fondo negro + marco con
 * esquinas doradas): el escaneo real de QR ya existe como servicio
 * (`core/services/escaner-qr.service.ts`, hecho por el Módulo 1) y abre la
 * cámara nativa del dispositivo por su cuenta — no se puede "incrustar"
 * dentro de esta pantalla con su diseño. Cuando Nahue conecte la lógica
 * real, el botón de abajo es el que tiene que llamar a ese servicio.
 */
@Component({
  selector: 'app-escaneo-qr',
  templateUrl: './escaneo-qr.page.html',
  styleUrls: ['./escaneo-qr.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonIcon, IonButton],
})
export class EscaneoQrPage {
  titulo = 'Escanear código QR';
  subtitulo = 'Apuntá la cámara al código';
  ayuda = 'Mantené el código centrado y con buena iluminación.';
  destinoVolver = '/login';
  destinoExito = '/sala/bienvenida';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastController: ToastController,
  ) {
    const modo = this.route.snapshot.data['modo'];
    if (modo === 'mesa') {
      this.titulo = 'Escanear mesa';
      this.subtitulo = 'Escaneá el QR que te asignó el metre';
      this.destinoVolver = '/sala/lista-espera';
      this.destinoExito = '/sala/carta';
    }
  }

  /**
   * MOCK: acá va la llamada real a EscanerQrService (QR de ingreso o QR de
   * mesa) cuando el Módulo 3 conecte la lógica. Por ahora simula un escaneo
   * exitoso: QR de ingreso -> bienvenida, QR de mesa -> carta.
   */
  async simularEscaneo() {
    const toast = await this.toastController.create({
      message: 'MOCK: acá se abriría la cámara real a escanear.',
      duration: 1500,
      color: 'success',
    });
    await toast.present();
    this.router.navigate([this.destinoExito]);
  }
}
