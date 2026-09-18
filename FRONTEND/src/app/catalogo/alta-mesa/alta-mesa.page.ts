import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonSpinner,
  IonBackButton,
  IonButtons,
  IonList,
  IonListHeader,
  ToastController,
} from '@ionic/angular';
import { CamaraService } from '../../core/services/camara.service';
import { CatalogoService, Mesa } from '../catalogo.service';

/**
 * ============================================================
 *  MÓDULO 2 - PUNTO 4: Alta de MESA + generación automática de QR
 * ============================================================
 *
 * La hace el DUEÑO o el SUPERVISOR.
 * Pide: número de mesa, cantidad de comensales, tipo (VIP / estándar /
 * movilidad reducida) y una foto.
 *
 * El QR NO se genera acá: lo arma el backend al dar de alta y devuelve la URL
 * del PNG ya subido a Storage. Esta pantalla, después de crear la mesa, muestra
 * ese QR para poder imprimirlo, y abajo lista todas las mesas ya cargadas con
 * su QR (para reimprimir cuando haga falta).
 */
@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonSpinner,
    IonBackButton,
    IonButtons,
    IonList,
    IonListHeader,
  ],
})
export class AltaMesaPage implements OnInit {
  cargando = false;
  errorMensaje = '';

  fotoPreview: string | null = null;

  // Mesa recién creada: se usa para mostrar su QR arriba de todo.
  mesaCreada: Mesa | null = null;

  // Listado de mesas ya existentes (con su QR).
  mesas: Mesa[] = [];
  cargandoMesas = false;

  form = this.fb.nonNullable.group({
    numero: [null as number | null, [Validators.required, Validators.min(1), Validators.max(999)]],
    cantidadComensales: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(20)],
    ],
    // Los tres tipos que pide la consigna.
    tipo: ['estandar', [Validators.required]],
    fotoBase64: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly camaraService: CamaraService,
    private readonly catalogoService: CatalogoService,
    private readonly toastController: ToastController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarMesas();
  }

  get f() {
    return this.form.controls;
  }

  /** Trae las mesas existentes para mostrarlas con su QR. */
  async cargarMesas() {
    this.cargandoMesas = true;
    try {
      this.mesas = await firstValueFrom(this.catalogoService.listarMesas());
    } catch {
      await this.mostrarToast('No se pudo cargar el listado de mesas.', 'danger');
    } finally {
      this.cargandoMesas = false;
      this.cdr.detectChanges();
    }
  }

  /** Foto de la mesa (una sola). */
  async tomarFoto() {
    try {
      const dataUrl = await this.camaraService.tomarFoto();
      this.fotoPreview = dataUrl;
      this.f.fotoBase64.setValue(dataUrl);
      this.f.fotoBase64.markAsTouched();
    } catch {
      await this.mostrarToast('No se pudo acceder a la cámara.', 'danger');
    }
  }

  /** Texto lindo para el tipo de mesa. */
  etiquetaTipo(tipo: string): string {
    if (tipo === 'vip') return 'VIP';
    if (tipo === 'movilidad_reducida') return 'Movilidad reducida';
    return 'Estándar';
  }

  /** Texto lindo para el estado de ocupación (lo administra el Módulo 3). */
  etiquetaDisponibilidad(disponibilidad: string): string {
    if (disponibilidad === 'reservada') return 'Reservada';
    if (disponibilidad === 'ocupada') return 'Ocupada';
    return 'Vacía';
  }

  /** POST /mesas -> el backend genera el QR y lo devuelve en la respuesta. */
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    const v = this.form.getRawValue();

    try {
      const mesa = await firstValueFrom(
        this.catalogoService.crearMesa({
          numero: Number(v.numero),
          cantidadComensales: Number(v.cantidadComensales),
          tipo: v.tipo as Mesa['tipo'],
          fotoBase64: v.fotoBase64,
        }),
      );

      this.mesaCreada = mesa;
      await this.mostrarToast(`Mesa ${mesa.numero} creada. Ya tiene su QR.`, 'success');

      // Reset del formulario y refresco del listado.
      this.form.reset({ tipo: 'estandar' });
      this.fotoPreview = null;
      await this.cargarMesas();
    } catch (error: any) {
      const mensaje = error?.error?.message;
      this.errorMensaje = Array.isArray(mensaje)
        ? mensaje.join(' ')
        : (mensaje ?? 'Ocurrió un error al crear la mesa.');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}
