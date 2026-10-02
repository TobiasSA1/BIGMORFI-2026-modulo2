import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular';

/**
 * ============================================================
 *  Header compartido de toda la app: "navbar" con identidad de marca.
 * ============================================================
 *
 * Logo dentro de un sello circular con anillo dorado + rótulo "BIG MORFI"
 * + título de la pantalla, centrados. Abajo, una línea de acento degradé
 * que se dibuja al entrar. El botón de "volver" aparece solo cuando la
 * pantalla lo necesita (pasando `backHref`).
 *
 * Uso:
 *   <app-header-marca titulo="Cocina" backHref="/home"></app-header-marca>
 *   <app-header-marca titulo="Big Morfi"></app-header-marca>  (sin volver, ej. home)
 */
@Component({
  selector: 'app-header-marca',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
  template: `
    <ion-header class="bm-header">
      <ion-toolbar>
        <ion-buttons slot="start" *ngIf="backHref">
          <ion-back-button class="bm-header__volver" [defaultHref]="backHref" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>
          <div class="bm-header-marca">
            <span class="bm-header-marca__sello">
              <img src="assets/LogoBigMorfi.png" class="bm-header-marca__logo" alt="Big Morfi" />
            </span>
            <span class="bm-header-marca__textos">
              <span class="bm-header-marca__rotulo" *ngIf="titulo !== 'Big Morfi'">Big Morfi</span>
              <span class="bm-header-marca__titulo">{{ titulo }}</span>
              <span class="bm-header-marca__subtitulo" *ngIf="subtitulo">{{ subtitulo }}</span>
            </span>
          </div>
        </ion-title>
        <!-- Espaciador del mismo ancho que el botón de volver: así el título
             queda centrado de verdad y no corrido hacia la derecha. -->
        <ion-buttons slot="end" *ngIf="backHref">
          <span class="bm-header-marca__espaciador"></span>
        </ion-buttons>
      </ion-toolbar>
      <div class="bm-header__acento"></div>
    </ion-header>
  `,
  styleUrls: ['./header-marca.component.scss'],
})
export class HeaderMarcaComponent {
  /** Texto del título (el nombre de la pantalla, ej. "Cocina", "Tu cuenta"). */
  @Input() titulo = 'Big Morfi';
  /** Segunda línea chica opcional (ej. "Sala de chat" debajo de "Mesa número 1"). */
  @Input() subtitulo?: string;
  /** Si se pasa, muestra el botón de "volver" hacia esa ruta. Si se omite, no hay botón. */
  @Input() backHref?: string;
}
