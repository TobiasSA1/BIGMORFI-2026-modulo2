import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonSpinner } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTO 9/10 — Pantalla de espera del cliente mientras el metre le asigna
 * una mesa. En real, esto se actualiza solo con Supabase Realtime cuando
 * `lista_espera.estado` pasa a 'asignado' (y ahí navegaría a
 * /sala/escaneo-qr con modo "mesa"). Acá es estático: no escucha nada.
 */
@Component({
  selector: 'app-lista-espera',
  templateUrl: './lista-espera.page.html',
  styleUrls: ['./lista-espera.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonButton, IonSpinner, HeaderMarcaComponent],
})
export class ListaEsperaPage {
  // Dato de ejemplo: en real vendría de contar cuántos van antes en
  // `lista_espera` con estado 'esperando'.
  posicionEnFila = 2;
}
