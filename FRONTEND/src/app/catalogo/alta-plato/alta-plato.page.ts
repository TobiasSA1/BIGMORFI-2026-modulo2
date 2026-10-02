import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCheckbox,
  IonButton,
  IonText,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { CamaraService } from '../../core/services/camara.service';
import { CatalogoService } from '../catalogo.service';

/**
 * ============================================================
 *  MÓDULO 2 - PUNTO 2: Alta de PLATO
 * ============================================================
 *
 * Pantalla para que el COCINERO cargue un plato en la carta.
 * Pide: nombre, descripción, precio, tiempo de elaboración, 3 fotos y si se
 * publica en la carta ("verificación en carta").
 *
 * Las 3 fotos se sacan con la cámara reutilizando `CamaraService` del Módulo 1.
 * El backend valida de nuevo todo y además rechaza nombres duplicados.
 */
@Component({
  selector: 'app-alta-plato',
  templateUrl: './alta-plato.page.html',
  styleUrls: ['./alta-plato.page.scss'],
  imports: [
    HeaderMarcaComponent,
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonCheckbox,
    IonButton,
    IonText,
    IonSpinner,
  ],
})
export class AltaPlatoPage {
  cargando = false;
  errorMensaje = '';

  // Vista previa de cada una de las 3 fotos (o null si todavía no se sacó).
  fotos: (string | null)[] = [null, null, null];

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    descripcion: ['', [Validators.maxLength(300)]],
    // precio y tiempo se validan como números > 0
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    tiempoElaboracion: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(240)],
    ],
    // "Verificación en carta": arranca tildado (se publica).
    enCarta: [true],
    // Las 3 fotos son obligatorias.
    foto1Base64: ['', [Validators.required]],
    foto2Base64: ['', [Validators.required]],
    foto3Base64: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly camaraService: CamaraService,
    private readonly catalogoService: CatalogoService,
    private readonly toastController: ToastController,
    private readonly router: Router,
  ) {}

  /** Atajo para el template: `f.nombre.errors`, etc. */
  get f() {
    return this.form.controls;
  }

  /**
   * Saca una foto con la cámara y la guarda en el slot indicado (0, 1 o 2).
   * Se llama tres veces, una por cada botón "Tomar foto".
   */
  async tomarFoto(indice: number) {
    try {
      const dataUrl = await this.camaraService.tomarFoto();
      this.fotos[indice] = dataUrl;

      // Escribe el base64 en el control de formulario que corresponde (0, 1 o 2).
      const control = [this.f.foto1Base64, this.f.foto2Base64, this.f.foto3Base64][indice];
      control?.setValue(dataUrl);
      control?.markAsTouched();
    } catch {
      await this.mostrarToast('No se pudo acceder a la cámara.', 'danger');
    }
  }

  /** Envía el formulario al backend (POST /productos/platos). */
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    const v = this.form.getRawValue();

    try {
      await firstValueFrom(
        this.catalogoService.crearPlato({
          nombre: v.nombre.trim(),
          descripcion: v.descripcion?.trim() || undefined,
          precio: Number(v.precio),
          tiempoElaboracion: Number(v.tiempoElaboracion),
          enCarta: v.enCarta,
          foto1Base64: v.foto1Base64,
          foto2Base64: v.foto2Base64,
          foto3Base64: v.foto3Base64,
        }),
      );
      await this.mostrarToast('Plato cargado en la carta.', 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      // El backend manda los errores de validación como array de strings.
      const mensaje = error?.error?.message;
      this.errorMensaje = Array.isArray(mensaje)
        ? mensaje.join(' ')
        : (mensaje ?? 'Ocurrió un error al cargar el plato.');
    } finally {
      this.cargando = false;
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}
