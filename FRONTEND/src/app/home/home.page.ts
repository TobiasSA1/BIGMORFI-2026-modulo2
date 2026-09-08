import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/angular';
import { AuthService, Perfil } from '../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, RouterLink],
})
export class HomePage implements OnInit {
  perfil: Perfil | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.perfil = await this.authService.getPerfilActual();
    this.cdr.detectChanges()
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}