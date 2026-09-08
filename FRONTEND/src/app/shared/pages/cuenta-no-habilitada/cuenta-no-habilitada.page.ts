import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-cuenta-no-habilitada',
  templateUrl: './cuenta-no-habilitada.page.html',
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton],
})
export class CuentaNoHabilitadaPage implements OnInit {
  estado: 'pendiente' | 'rechazado' = 'pendiente';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    const estado = this.route.snapshot.queryParamMap.get('estado');
    if (estado === 'rechazado' || estado === 'pendiente') {
      this.estado = estado;
    }
  }

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
}