import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonFooter } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { NavClienteComponent } from '../../core/components/nav-cliente/nav-cliente.component';

interface ItemConsumido {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 4 (Lauti Fernandez). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTO 21 — Pedido de la cuenta con QR de propina (5 niveles) estilo
 * Mercado Pago. Los ítems consumidos son de ejemplo; en real salen de
 * `pedido_items` del pedido ya entregado (Módulo 3).
 *
 * El QR de acá es una imagen de relleno (no genera un QR real): la lógica
 * de generarlo es la misma idea que ya usa el Módulo 2 para el QR de mesa
 * (ver BACKEND/src/qr/qr.service.ts) — se puede reutilizar tal cual desde
 * el backend cuando el Módulo 4 lo conecte.
 */
@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
  imports: [CommonModule, IonContent, IonFooter, HeaderMarcaComponent, NavClienteComponent],
})
export class CuentaPage {
  items: ItemConsumido[] = [
    { nombre: 'Hamburguesa Big Morfi Suprema', cantidad: 2, precioUnitario: 12500 },
    { nombre: 'Coca-Cola 500ml', cantidad: 2, precioUnitario: 2500 },
    { nombre: 'Flan casero', cantidad: 1, precioUnitario: 3500 },
  ];

  // Los 5 niveles de propina que pide la consigna, textual.
  nivelesPropina = [20, 15, 10, 5, 0];
  propinaSeleccionada: number | null = null;

  get subtotal(): number {
    return this.items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
  }

  get montoPropina(): number {
    if (this.propinaSeleccionada === null) return 0;
    return Math.round((this.subtotal * this.propinaSeleccionada) / 100);
  }

  get total(): number {
    return this.subtotal + this.montoPropina;
  }

  elegirPropina(porcentaje: number) {
    this.propinaSeleccionada = porcentaje;
  }
}
