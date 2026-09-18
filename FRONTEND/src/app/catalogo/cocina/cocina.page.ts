import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonButtons,
  IonBackButton,
  IonBadge,
  ToastController,
} from '@ionic/angular';
import { CatalogoService, PreparacionMesa } from '../catalogo.service';

/**
 * ============================================================
 *  MÓDULO 2 - PUNTO 16: Sector COCINA
 * ============================================================
 *
 * El COCINERO ve acá los ítems (platos, y a futuro postres) pendientes de los
 * pedidos que ya confirmó el mozo (Módulo 3), agrupados por mesa. A medida que
 * termina uno, toca "Listo" y ese ítem desaparece de la lista.
 *
 * Cuando se marca el último ítem de un pedido, el backend deja el pedido entero
 * en estado "listo" y devuelve `pedidoCompleto: true` (eso después lo usa el
 * Módulo 3 para avisarle al mozo y al cliente - Punto 18).
 *
 * Se refresca tirando de la lista hacia abajo (pull to refresh). No hay
 * suscripción en tiempo real todavía para no acoplarnos al Módulo 3.
 */
@Component({
  selector: 'app-cocina',
  templateUrl: './cocina.page.html',
  styleUrls: ['./cocina.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonButtons,
    IonBackButton,
    IonBadge,
  ],
})
export class CocinaPage implements OnInit {
  mesas: PreparacionMesa[] = [];
  cargando = false;
  // ids de ítems que se están marcando (para deshabilitar el botón mientras tanto)
  procesando = new Set<string>();

  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly toastController: ToastController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargar();
  }

  /** GET /cocina/pendientes */
  async cargar(event?: CustomEvent) {
    this.cargando = true;
    try {
      this.mesas = await firstValueFrom(this.catalogoService.getCocinaPendientes());
    } catch {
      await this.mostrarToast('No se pudieron cargar los pedidos de cocina.', 'danger');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  }

  /** Total de ítems pendientes en una mesa (suma de cantidades). */
  totalItems(mesa: PreparacionMesa): number {
    return mesa.items.reduce((acc, i) => acc + i.cantidad, 0);
  }

  /**
   * PATCH /cocina/items/:id/listo
   * Saca el ítem de la lista y, si el pedido quedó completo, lo avisa.
   */
  async marcarListo(mesaId: string, itemId: string) {
    if (this.procesando.has(itemId)) return;
    this.procesando.add(itemId);

    try {
      const res = await firstValueFrom(this.catalogoService.marcarPlatoListo(itemId));

      // Saco el ítem de la mesa; si la mesa se queda sin ítems, la saco también.
      const mesa = this.mesas.find((m) => m.mesaId === mesaId);
      if (mesa) {
        mesa.items = mesa.items.filter((i) => i.itemId !== itemId);
        this.mesas = this.mesas.filter((m) => m.items.length > 0);
      }

      if (res.pedidoCompleto) {
        await this.mostrarToast('Pedido completo: ya está todo listo para servir.', 'success');
      } else {
        await this.mostrarToast('Ítem marcado como listo.', 'success');
      }
    } catch (error: any) {
      await this.mostrarToast(
        error?.error?.message ?? 'No se pudo marcar el ítem como listo.',
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
