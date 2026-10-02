import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonTextarea, IonIcon, ToastController } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { IndicadorDeslizanteDirective } from '../../core/motion/indicador-deslizante.directive';

interface ItemPedido {
  nombre: string;
  cantidad: number;
}

interface PedidoMozo {
  id: string;
  mesaNumero: number;
  items: ItemPedido[];
  total: number;
  estado: 'pendiente_confirmacion' | 'listo';
  mostrandoRechazo?: boolean;
  motivoRechazo?: string;
}

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTOS 13, 14 y 19 — el mozo confirma o rechaza pedidos nuevos, y marca
 * como entregados los que cocina/bar dejaron "listos" (Punto 18, que ya
 * dispara el Módulo 2 automáticamente). Datos de ejemplo hardcodeados.
 */
@Component({
  selector: 'app-mozo-pedidos',
  templateUrl: './mozo-pedidos.page.html',
  styleUrls: ['./mozo-pedidos.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonTextarea,
    IonIcon,
    HeaderMarcaComponent,
    IndicadorDeslizanteDirective,
  ],
})
export class MozoPedidosPage {
  constructor(private readonly toastController: ToastController) {}

  /** Filtro visual de la pantalla: qué sección de pedidos se muestra. */
  filtro: 'todos' | 'confirmar' | 'entregar' = 'todos';

  pedidos: PedidoMozo[] = [
    {
      id: 'ped1',
      mesaNumero: 5,
      items: [
        { nombre: 'Hamburguesa Big Morfi Suprema', cantidad: 2 },
        { nombre: 'Coca-Cola 500ml', cantidad: 2 },
      ],
      total: 30000,
      estado: 'pendiente_confirmacion',
    },
    {
      id: 'ped2',
      mesaNumero: 12,
      items: [{ nombre: 'Milanesa napolitana', cantidad: 1 }],
      total: 8500,
      estado: 'listo',
    },
  ];

  get porConfirmar() {
    return this.pedidos.filter((p) => p.estado === 'pendiente_confirmacion');
  }

  get paraEntregar() {
    return this.pedidos.filter((p) => p.estado === 'listo');
  }

  /** PUNTO 14: confirma y "deriva" el pedido a cocina/bar. */
  async confirmar(pedido: PedidoMozo) {
    this.pedidos = this.pedidos.filter((p) => p.id !== pedido.id);
    await this.toast(`Pedido de la mesa ${pedido.mesaNumero} confirmado y enviado a cocina/bar.`);
  }

  mostrarRechazo(pedido: PedidoMozo) {
    pedido.mostrandoRechazo = true;
  }

  /** PUNTO 13: rechaza con un motivo (dispara push al cliente en real). */
  async rechazar(pedido: PedidoMozo) {
    if (!pedido.motivoRechazo?.trim()) return;
    this.pedidos = this.pedidos.filter((p) => p.id !== pedido.id);
    await this.toast(`Pedido de la mesa ${pedido.mesaNumero} rechazado.`, 'danger');
  }

  /** PUNTO 19: entrega el pedido en la mesa. */
  async marcarEntregado(pedido: PedidoMozo) {
    this.pedidos = this.pedidos.filter((p) => p.id !== pedido.id);
    await this.toast(`Pedido de la mesa ${pedido.mesaNumero} marcado como entregado.`);
  }

  private async toast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({ message, duration: 2200, color });
    await toast.present();
  }
}
