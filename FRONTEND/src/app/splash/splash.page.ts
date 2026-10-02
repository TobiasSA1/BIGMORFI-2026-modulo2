import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

/**
 * ============================================================
 *  Splash screen (identidad de marca)
 * ============================================================
 *
 * Primera pantalla que se ve al abrir la app: el arte de marca
 * (assets/fondos/splash.jpg, que ya incluye logo + slogan) entra con un
 * zoom suave, con destellos dorados flotando y una barra de carga. Después
 * de unos segundos navega sola al login.
 *
 * No pide nada al backend: es puramente de marca.
 */
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  imports: [IonContent],
})
export class SplashPage implements OnInit {
  saliendo = false;

  constructor(private readonly router: Router) {}

  ngOnInit() {
    // Antes de navegar, la pantalla se desvanece (clase de salida) para que
    // el paso al login no sea un corte seco.
    setTimeout(() => (this.saliendo = true), 2500);
    setTimeout(() => this.router.navigate(['/login'], { replaceUrl: true }), 2800);
  }
}
