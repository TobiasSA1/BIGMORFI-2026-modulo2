import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { IndicadorDeslizanteDirective } from '../../motion/indicador-deslizante.directive';

/**
 * ============================================================
 *  Navegación inferior del cliente sentado en la mesa.
 * ============================================================
 *
 * Une las pantallas que ya existen del cliente en mesa (carta, estado del
 * pedido, chat con el mozo y cuenta) para que pueda moverse entre ellas sin
 * depender del botón "volver". No agrega pantallas ni cambia rutas: solo
 * enlaza las existentes.
 *
 * La sección activa la marca routerLinkActive y la píldora ámbar se desliza
 * hasta ella (directiva [bmIndicador]). Va dentro de un <ion-footer>.
 */
@Component({
  selector: 'app-nav-cliente',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonIcon, IndicadorDeslizanteDirective],
  template: `
    <nav class="bm-nav" bmIndicador="bm-nav__item--activo" aria-label="Navegación de la mesa">
      @for (item of items; track item.ruta) {
        <a
          class="bm-nav__item"
          [routerLink]="item.ruta"
          routerLinkActive="bm-nav__item--activo"
          #activo="routerLinkActive"
          [attr.aria-current]="activo.isActive ? 'page' : null"
        >
          <ion-icon [name]="item.icono"></ion-icon>
          <span class="bm-nav__texto">{{ item.texto }}</span>
        </a>
      }
    </nav>
  `,
})
export class NavClienteComponent {
  readonly items = [
    { ruta: '/sala/carta', icono: 'restaurant-outline', texto: 'Carta' },
    { ruta: '/sala/estado-pedido', icono: 'receipt-outline', texto: 'Pedido' },
    { ruta: '/sala/chat', icono: 'chatbubble-outline', texto: 'Mozo' },
    { ruta: '/cierre/cuenta', icono: 'cash-outline', texto: 'Cuenta' },
  ];
}
