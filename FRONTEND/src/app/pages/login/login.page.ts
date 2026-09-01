import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [ ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton ]
})
export class LoginPage{
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  mensajeError = '';
  cargando = false;

  async iniciarSesion() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.mensajeError = '';
    this.cargando = true;
    this.cdr.detectChanges();

    const { email, password } = this.loginForm.getRawValue();

    try {

      const resultado = await this.authService.login(email, password);

      console.log('LOGIN EXITOSO:', resultado);

    } catch (error: any) {

      console.error('ERROR LOGIN:', error);

      if (error?.message === 'Invalid login credentials') {
        this.mensajeError = 'El correo electrónico o la contraseña son incorrectos.';
      } else {
        this.mensajeError = 'Ocurrió un error al iniciar sesión. Intentá nuevamente.';
      }
    } finally {

      this.cargando = false;
      this.cdr.detectChanges();

    }
  }
}
