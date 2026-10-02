import { Component, Input } from '@angular/core';

/**
 * Check de éxito animado: el círculo se dibuja, después el tilde, y al final
 * todo hace un pop corto con una onda que se expande. Reutilizable en
 * cualquier confirmación positiva (encuesta enviada, mesa creada, etc.).
 *
 *   <app-check-animado></app-check-animado>
 *   <app-check-animado [tamano]="56"></app-check-animado>
 *
 * Estilos en src/styles/components/_check.scss.
 */
@Component({
  selector: 'app-check-animado',
  standalone: true,
  template: `
    <span class="bm-check" [style.--bm-check-tamano.px]="tamano" role="img" aria-label="Listo">
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle class="bm-check__circulo" cx="26" cy="26" r="23" />
        <path class="bm-check__tilde" d="M15 27 l7.5 7.5 L37 19" />
      </svg>
    </span>
  `,
})
export class CheckAnimadoComponent {
  /** Tamaño en píxeles. */
  @Input() tamano = 72;
}
