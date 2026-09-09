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
  IonButton,
  IonText,
  IonSpinner,
  IonBackButton,
  IonButtons,
  ToastController,
} from '@ionic/angular';
import { CamaraService } from '../../core/services/camara.service';
import { EscanerQrService } from '../../core/services/escaner-qr.service';
import { ClientesService } from '../clientes.service';
import { AuthService } from '../../core/services/auth.service';
import { DNI_REGEX, PASSWORD_REGEX, SOLO_LETRAS_REGEX } from '../../core/validators/patterns';

@Component({
  selector: 'app-registro-cliente',
  templateUrl: './registro-cliente.page.html',
  styleUrls: ['./registro-cliente.page.scss'],
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
    IonButton,
    IonText,
    IonSpinner,
    IonBackButton,
    IonButtons,
  ],
})
export class RegistroClientePage {
  cargando = false;
  errorMensaje = '';
  fotoPreview: string | null = null;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(SOLO_LETRAS_REGEX)]],
    apellido: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(SOLO_LETRAS_REGEX)]],
    dni: ['', [Validators.required, Validators.pattern(DNI_REGEX)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_REGEX)]],
    fotoBase64: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly camaraService: CamaraService,
    private readonly escanerQrService: EscanerQrService,
    private readonly clientesService: ClientesService,
    private readonly authService: AuthService,
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
      this.form.controls.fotoBase64.setValue(dataUrl);
    } catch {
      await this.mostrarToast('No se pudo acceder a la cámara.', 'danger');
    }
  }

  async escanearDni() {
    try {
      const datos = await this.escanerQrService.escanearDni();
      this.form.patchValue({ nombre: datos.nombre, apellido: datos.apellido, dni: datos.dni });
      await this.mostrarToast('Datos del DNI cargados correctamente.', 'success');
    } catch (error: any) {
      await this.mostrarToast(error?.message ?? 'No se pudo leer el código QR.', 'danger');
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    try {
      await firstValueFrom(this.clientesService.registrar(this.form.getRawValue()));

      const yaHaySesion = await this.authService.estaLogueado();

      if (yaHaySesion) {
        await this.mostrarToast('Cliente registrado correctamente.', 'success');
        this.router.navigate(['/home']);
      } else {
        await this.mostrarToast('Registro enviado. Te avisaremos por correo cuando sea aprobado.', 'success');
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      const mensaje = error?.error?.message;
      this.errorMensaje = Array.isArray(mensaje) ? mensaje.join(' ') : (mensaje ?? 'Ocurrió un error al registrarte.');
    } finally {
      this.cargando = false;
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}