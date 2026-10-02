import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonTextarea, IonIcon, ToastController } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';
import { CheckAnimadoComponent } from '../../core/components/check-animado/check-animado.component';

interface PreguntaEncuesta {
  clave: string;
  texto: string;
  puntaje: number; // 0 = sin responder, 1-5 estrellas
}

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 4 (Lauti Fernandez). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTO 20 — Encuesta de satisfacción con gráficos.
 *
 * Los gráficos son barras hechas con CSS puro (ancho proporcional al
 * porcentaje), no se agregó ninguna librería de gráficos nueva para no
 * imponerle una dependencia al Módulo 4 sin que la elija. Cuando conecten
 * datos reales, esto se puede reemplazar por Chart.js/ngx-charts si
 * prefieren algo más completo (barras, torta, línea como pide la consigna).
 */
@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.page.html',
  styleUrls: ['./encuesta.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonTextarea, IonIcon, HeaderMarcaComponent, CheckAnimadoComponent],
})
export class EncuestaPage {
  enviada = false;
  comentario = '';

  preguntas: PreguntaEncuesta[] = [
    { clave: 'atencion', texto: 'Atención del mozo', puntaje: 0 },
    { clave: 'comida', texto: 'Calidad de la comida', puntaje: 0 },
    { clave: 'tiempo', texto: 'Tiempo de espera', puntaje: 0 },
    { clave: 'ambiente', texto: 'Ambiente del local', puntaje: 0 },
  ];

  // Estadísticas de ejemplo para el gráfico de resultados (Punto 20 pide
  // ver gráficos de torta/barra/línea; acá va un resumen simple en barras).
  estadisticas = [
    { categoria: 'Excelente', porcentaje: 62 },
    { categoria: 'Buena', porcentaje: 28 },
    { categoria: 'Regular', porcentaje: 7 },
    { categoria: 'Mala', porcentaje: 3 },
  ];

  constructor(private readonly toastController: ToastController) {}

  puntuar(pregunta: PreguntaEncuesta, valor: number) {
    pregunta.puntaje = valor;
  }

  get puedeEnviar(): boolean {
    return this.preguntas.every((p) => p.puntaje > 0);
  }

  /** MOCK: acá va el INSERT real a la tabla de encuestas del Módulo 4. */
  async enviar() {
    if (!this.puedeEnviar) return;
    this.enviada = true;
    const toast = await this.toastController.create({
      message: '¡Gracias por tu opinión!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }
}
