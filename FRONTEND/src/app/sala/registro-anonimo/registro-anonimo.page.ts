import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { CamaraService } from '../../core/services/camara.service';
import { SOLO_LETRAS_REGEX } from '../../core/validators/patterns';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTO 9 — "Cliente anónimo": registro rápido con foto y nombre, sin
 * contraseña ni mail (a diferencia del registro del Punto 5, que ya hizo el
 * Módulo 1). La foto SÍ se saca con la cámara real (reusa `CamaraService`
 * del Módulo 1), pero el envío es mock: no pega a ningún backend todavía,
 * solo navega a la lista de espera.
 */
@Component({
  selector: 'app-registro-anonimo',
  templateUrl: './registro-anonimo.page.html',
  styleUrls: ['./registro-anonimo.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    HeaderMarcaComponent,
  ],
})
export class RegistroAnonimoPage {
  cargando = false;
  fotoPreview: string | null = null;

  form = this.fb.nonNullable.group({
    nombreCompleto: ['', [Validators.required, Validators.pattern(SOLO_LETRAS_REGEX)]],
    fotoBase64: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly camaraService: CamaraService,
    private readonly toastController: ToastController,
    private readonly router: Router,
  ) {}

  get f() {
    return this.form.controls;
  }

  async tomarFoto() {
    try {
      const dataUrl = await this.camaraService.tomarFoto();
      this.fotoPreview = dataUrl;
      this.f.fotoBase64.setValue(dataUrl);
    } catch {
      await this.mostrarToast('No se pudo acceder a la cámara.');
    }
  }

  /** MOCK: acá va el POST real (usuario_anonimo_id + lista_espera) del Módulo 3. */
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;
    // OJO: la demora artificial se sacó a pedido de Tobi mientras se está
    // revisando el diseño pantalla por pantalla (el spinner tapaba la
    // navegación). Cuando haya backend real, `cargando` va a reflejar la
    // espera real del POST, no hace falta un setTimeout a mano.
    await this.mostrarToast('¡Listo! Te anotamos en la lista de espera.');
    this.router.navigate(['/sala/lista-espera']);
  }

  private async mostrarToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'success' });
    await toast.present();
  }
}
