import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonBackButton, IonButton } from '@ionic/angular';

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * Pantalla de bienvenida que aparece después de escanear el QR de ingreso
 * (Punto 9). Solo navegación, no hay datos que cargar.
 */
@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonBackButton, IonButton],
})
export class BienvenidaPage {}
