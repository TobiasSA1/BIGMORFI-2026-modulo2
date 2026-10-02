import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';

/**
 * Indicador activo que se DESLIZA entre opciones (categorías de la carta,
 * filtro de pedidos, barra de navegación inferior) en vez de "saltar".
 *
 * Uso: se pone en el contenedor y se le dice qué clase marca la opción
 * activa. La directiva crea una píldora detrás de las opciones y la mueve
 * (transform + ancho) hasta la activa cada vez que esa clase cambia.
 *
 *   <div class="bm-tabs" bmIndicador="bm-chip--active">
 *     <button class="bm-chip" [class.bm-chip--active]="...">...</button>
 *   </div>
 *
 * Es puramente visual: no maneja ningún estado de la pantalla.
 * El estilo de la píldora es .bm-indicador (styles/components/_tabs.scss).
 */
@Directive({
  selector: '[bmIndicador]',
  standalone: true,
})
export class IndicadorDeslizanteDirective implements AfterViewInit, OnDestroy {
  /** Clase CSS que tiene la opción activa. */
  @Input('bmIndicador') claseActiva = '';

  private pildora?: HTMLElement;
  private observadorClases?: MutationObserver;
  private observadorTamano?: ResizeObserver;
  private ubicado = false;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    const contenedor = this.host.nativeElement;
    this.renderer.addClass(contenedor, 'bm-con-indicador');
    this.pildora = this.renderer.createElement('span');
    this.renderer.addClass(this.pildora, 'bm-indicador');
    this.renderer.insertBefore(contenedor, this.pildora, contenedor.firstChild);

    // Se ignoran los cambios de la propia píldora (si no, se dispara a sí misma).
    this.observadorClases = new MutationObserver((cambios) => {
      if (cambios.some((c) => c.target !== this.pildora)) this.ubicar();
    });
    this.observadorClases.observe(contenedor, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
    this.observadorTamano = new ResizeObserver(() => this.ubicar(false));
    this.observadorTamano.observe(contenedor);

    // Espera a que las fuentes/íconos tengan su tamaño final.
    requestAnimationFrame(() => this.ubicar(false));
  }

  ngOnDestroy(): void {
    this.observadorClases?.disconnect();
    this.observadorTamano?.disconnect();
  }

  private ubicar(animar = true): void {
    if (!this.pildora) return;
    const activa = this.host.nativeElement.querySelector<HTMLElement>(`.${this.claseActiva}`);
    if (!activa) {
      this.pildora.style.opacity = '0';
      return;
    }
    // La primera vez (o al cambiar el tamaño) se ubica sin transición, para
    // que no "viaje" desde la izquierda al abrir la pantalla.
    const sinTransicion = !animar || !this.ubicado;
    if (sinTransicion) this.pildora.classList.add('bm-indicador--sin-transicion');
    this.pildora.style.opacity = '1';
    this.pildora.style.width = `${activa.offsetWidth}px`;
    this.pildora.style.height = `${activa.offsetHeight}px`;
    this.pildora.style.transform = `translate3d(${activa.offsetLeft}px, ${activa.offsetTop}px, 0)`;
    this.ubicado = true;
    if (sinTransicion) {
      const pildora = this.pildora;
      requestAnimationFrame(() => requestAnimationFrame(() => pildora.classList.remove('bm-indicador--sin-transicion')));
    }
  }
}
