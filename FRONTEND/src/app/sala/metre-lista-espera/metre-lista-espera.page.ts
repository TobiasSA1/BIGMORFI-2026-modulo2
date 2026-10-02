import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { CatalogoService, Mesa } from '../../catalogo/catalogo.service';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';

interface ClienteEnEspera {
  id: string;
  nombre: string;
  tipo: 'registrado' | 'anonimo';
  esperandoDesde: string;
}

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTO 10 — el metre ve la lista de espera y le asigna una mesa a cada
 * cliente.
 *
 * La lista de clientes esperando es MOCK (la tabla `lista_espera` es del
 * Módulo 3, todavía no hay endpoint para leerla desde el front). Las mesas
 * SÍ son reales: usan `CatalogoService.listarMesas()`, que ya existe
 * (Módulo 2, Punto 4) — se filtran las que están `disponibilidad: 'vacia'`.
 */
@Component({
  selector: 'app-metre-lista-espera',
  templateUrl: './metre-lista-espera.page.html',
  styleUrls: ['./metre-lista-espera.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonSpinner,
    HeaderMarcaComponent,
  ],
})
export class MetreListaEsperaPage implements OnInit {
  cargandoMesas = false;
  mesasLibres: Mesa[] = [];

  // ---- Datos de ejemplo (ver comentario de arriba) ----
  clientes: ClienteEnEspera[] = [
    { id: 'c1', nombre: 'Lionel Andrés Messi', tipo: 'registrado', esperandoDesde: '20:15' },
    { id: 'c2', nombre: 'Cliente Anónimo #482', tipo: 'anonimo', esperandoDesde: '20:22' },
    { id: 'c3', nombre: 'Sebastián Villa', tipo: 'registrado', esperandoDesde: '20:28' },
  ];

  mesaSeleccionada: Record<string, string> = {};

  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly toastController: ToastController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarMesas();
  }

  async cargarMesas() {
    this.cargandoMesas = true;
    try {
      const todas = await firstValueFrom(this.catalogoService.listarMesas());
      this.mesasLibres = todas.filter((m) => m.disponibilidad === 'vacia');
    } catch {
      await this.mostrarToast('No se pudieron cargar las mesas.', 'danger');
    } finally {
      this.cargandoMesas = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * MOCK: acá va el UPDATE real de `lista_espera` (estado='asignado',
   * mesa_id=...) que hace que Módulo 3 dispare el push al cliente.
   */
  async asignar(cliente: ClienteEnEspera) {
    const mesaId = this.mesaSeleccionada[cliente.id];
    if (!mesaId) {
      await this.mostrarToast('Elegí una mesa primero.', 'warning');
      return;
    }
    const mesa = this.mesasLibres.find((m) => m.id === mesaId);
    this.clientes = this.clientes.filter((c) => c.id !== cliente.id);
    await this.mostrarToast(`MOCK: se avisó a ${cliente.nombre} que tiene la mesa ${mesa?.numero}.`);
  }

  private async mostrarToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({ message, duration: 2200, color });
    await toast.present();
  }
}
