import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCheckbox,
  IonButton,
  IonText,
  IonSpinner,
  IonBackButton,
  IonButtons,
  ToastController,
} from '@ionic/angular';
import { CamaraService } from '../../core/services/camara.service';
import { CatalogoService } from '../catalogo.service';

/**
 * ============================================================
 *  MÓDULO 2 - PUNTO 3: Alta de BEBIDA
 * ============================================================
 *
 * Igual que el alta de plato (Punto 2) pero para el CANTINERO.
 * Pide: nombre, descripción, precio, tiempo de preparación y 3 fotos.
 * Se mantiene el check "publicar en la carta" para ser consistentes con
 * los platos (misma tabla `productos` en la base).
 *
 * La lógica es un calco del alta de plato a propósito: son dos puntos
 * distintos de la consigna (roles distintos) y conviene tenerlos separados
 * para poder mostrarlos uno por uno.
 */
@Component({
  selector: 'app-alta-bebida',
  templateUrl: './alta-bebida.page.html',
  styleUrls: ['./alta-bebida.page.scss'],
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
    IonTextarea,
    IonCheckbox,
    IonButton,
    IonText,
    IonSpinner,
    IonBackButton,
    IonButtons,
  ],
})
export class AltaBebidaPage {
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

  /** POST /productos/bebidas */
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
        this.catalogoService.crearBebida({
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
      await this.mostrarToast('Bebida cargada en la carta.', 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      const mensaje = error?.error?.message;
      this.errorMensaje = Array.isArray(mensaje)
        ? mensaje.join(' ')
        : (mensaje ?? 'Ocurrió un error al cargar la bebida.');
    } finally {
      this.cargando = false;
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}
