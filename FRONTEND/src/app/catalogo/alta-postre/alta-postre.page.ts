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
import { CamaraService } from '../../core/services/camara.service';
import { CatalogoService } from '../catalogo.service';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';

/**
 * ============================================================
 *  MÓDULO 2 - Alta de POSTRE
 * ============================================================
 *
 * Se agregó a pedido del equipo (lo avisó Nahue): el TP exige el tipo
 * "postre" además de plato y bebida. La base ya tenía el enum preparado
 * desde que se diseñó el esquema con el Módulo 3.
 *
 * Es un calco de "Alta de plato" (mismo formulario, mismas validaciones):
 * la carga hace el COCINERO, porque el postre sale por el sector cocina
 * (igual que se definió en el backend, ver productos.service.ts).
 */
@Component({
  selector: 'app-alta-postre',
  templateUrl: './alta-postre.page.html',
  styleUrls: ['./alta-postre.page.scss'],
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
export class AltaPostrePage {
  cargando = false;
  errorMensaje = '';

  fotos: (string | null)[] = [null, null, null];

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    descripcion: ['', [Validators.maxLength(300)]],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    tiempoElaboracion: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(240)],
    ],
    enCarta: [true],
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

  get f() {
    return this.form.controls;
  }

  /** Saca una foto y la guarda en el slot 0, 1 o 2. */
  async tomarFoto(indice: number) {
    try {
      const dataUrl = await this.camaraService.tomarFoto();
      this.fotos[indice] = dataUrl;

      const control = [this.f.foto1Base64, this.f.foto2Base64, this.f.foto3Base64][indice];
      control?.setValue(dataUrl);
      control?.markAsTouched();
    } catch {
      await this.mostrarToast('No se pudo acceder a la cámara.', 'danger');
    }
  }

  /** POST /productos/postres */
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
        this.catalogoService.crearPostre({
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
      await this.mostrarToast('Postre cargado en la carta.', 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      const mensaje = error?.error?.message;
      this.errorMensaje = Array.isArray(mensaje)
        ? mensaje.join(' ')
        : (mensaje ?? 'Ocurrió un error al cargar el postre.');
    } finally {
      this.cargando = false;
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}
