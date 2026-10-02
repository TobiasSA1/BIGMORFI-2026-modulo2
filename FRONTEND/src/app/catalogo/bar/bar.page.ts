import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  ToastController,
} from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { CatalogoService, PreparacionMesa } from '../catalogo.service';

/**
 * ============================================================
 *  MÓDULO 2 - PUNTO 17: Sector BAR
 * ============================================================
 *
 * Igual que Cocina (Punto 16) pero para el CANTINERO y con las bebidas.
 * Se deja como pantalla separada porque es un punto distinto de la consigna
 * y tiene su propio rol y su propio endpoint (/bar/...).
 */
@Component({
  selector: 'app-bar',
  templateUrl: './bar.page.html',
  styleUrls: ['./bar.page.scss'],
  imports: [
    HeaderMarcaComponent,
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
  ],
})
export class BarPage implements OnInit {
  mesas: PreparacionMesa[] = [];
  cargando = false;
  procesando = new Set<string>();

  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly toastController: ToastController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargar();
  }

  /** GET /bar/pendientes */
  async cargar(event?: CustomEvent) {
    this.cargando = true;
    try {
      this.mesas = await firstValueFrom(this.catalogoService.getBarPendientes());
    } catch {
      await this.mostrarToast('No se pudieron cargar los pedidos del bar.', 'danger');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  }

  /** Total de bebidas pendientes en una mesa (suma de cantidades). */
  totalItems(mesa: PreparacionMesa): number {
    return mesa.items.reduce((acc, i) => acc + i.cantidad, 0);
  }

  /** PATCH /bar/items/:id/listo */
  async marcarListo(mesaId: string, itemId: string) {
    if (this.procesando.has(itemId)) return;
    this.procesando.add(itemId);

    try {
      const res = await firstValueFrom(this.catalogoService.marcarBebidaListo(itemId));

      const mesa = this.mesas.find((m) => m.mesaId === mesaId);
      if (mesa) {
        mesa.items = mesa.items.filter((i) => i.itemId !== itemId);
        this.mesas = this.mesas.filter((m) => m.items.length > 0);
      }

      if (res.pedidoCompleto) {
        await this.mostrarToast('Pedido completo: ya está todo listo para servir.', 'success');
      } else {
        await this.mostrarToast('Bebida marcada como lista.', 'success');
      }
    } catch (error: any) {
      await this.mostrarToast(
        error?.error?.message ?? 'No se pudo marcar la bebida como lista.',
        'danger',
      );
    } finally {
      this.procesando.delete(itemId);
      this.cdr.detectChanges();
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}
