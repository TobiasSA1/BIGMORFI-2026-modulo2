import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonInputPasswordToggle,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { CamaraService } from '../../core/services/camara.service';
import { EscanerQrService } from '../../core/services/escaner-qr.service';
import { EmpleadosService } from '../empleados.service';
import { CUIL_REGEX, DNI_REGEX, PASSWORD_REGEX, SOLO_LETRAS_REGEX } from '../../core/validators/patterns';

@Component({
  selector: 'app-alta-empleado',
  templateUrl: './alta-empleado.page.html',
  styleUrls: ['./alta-empleado.page.scss'],
  imports: [
    HeaderMarcaComponent,
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInputPasswordToggle,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonSpinner,
  ],
})
export class AltaEmpleadoPage {
  cargando = false;
  errorMensaje = '';
  fotoPreview: string | null = null;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(SOLO_LETRAS_REGEX)]],
    apellido: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(SOLO_LETRAS_REGEX)]],
    dni: ['', [Validators.required, Validators.pattern(DNI_REGEX)]],
    cuil: ['', [Validators.required, Validators.pattern(CUIL_REGEX)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_REGEX)]],
    rol: ['cocinero', [Validators.required]],
    fotoBase64: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly camaraService: CamaraService,
    private readonly escanerQrService: EscanerQrService,
    private readonly empleadosService: EmpleadosService,
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
      this.form.patchValue({
        nombre: datos.nombre,
        apellido: datos.apellido,
        dni: datos.dni,
        cuil: datos.cuil ?? '',
      });
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
      await firstValueFrom(this.empleadosService.crear(this.form.getRawValue() as any));
      await this.mostrarToast('Empleado creado correctamente.', 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      const mensaje = error?.error?.message;
      this.errorMensaje = Array.isArray(mensaje)
        ? mensaje.join(' ')
        : (mensaje ?? 'Ocurrió un error al crear el empleado.');
    } finally {
      this.cargando = false;
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}