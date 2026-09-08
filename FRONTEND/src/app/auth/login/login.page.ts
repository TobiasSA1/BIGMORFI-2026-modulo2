import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
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
  ],
})
export class LoginPage {
  cargando = false;
  errorMensaje = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.login(email, password);

      const perfil = await this.authService.getPerfilActual();

      if (!perfil) {
        this.errorMensaje = 'No se encontró tu perfil. Contactá al restaurante.';
        await this.authService.logout();
        return;
      }

      if (perfil.rol === 'cliente' && perfil.estado !== 'aprobado') {
        // Puntos 7/8: bloqueamos el acceso y cerramos la sesión que Supabase ya abrió
        await this.authService.logout();
        this.router.navigate(['/cuenta-no-habilitada'], { queryParams: { estado: perfil.estado } });
        return;
      }

      if (perfil.rol === 'dueño' || perfil.rol === 'supervisor') {
        this.router.navigate(['/clientes/pendientes']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      this.errorMensaje = this.traducirError(error?.message);
    } finally {
      this.cargando = false;
    }
  }

  private traducirError(mensaje?: string): string {
    if (mensaje?.includes('Invalid login credentials')) {
      return 'Correo o contraseña incorrectos.';
    }
    return 'Ocurrió un error al iniciar sesión. Intentá de nuevo.';
  }
}