import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../../core/components/header-marca/header-marca.component';

@Component({
  selector: 'app-cuenta-no-habilitada',
  templateUrl: './cuenta-no-habilitada.page.html',
  styleUrls: ['./cuenta-no-habilitada.page.scss'],
  imports: [HeaderMarcaComponent, CommonModule, IonContent, IonIcon, IonButton],
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