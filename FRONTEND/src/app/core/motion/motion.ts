import { Animation, AnimationBuilder, createAnimation } from '@ionic/angular';

/**
 * ============================================================
 *  Motion language — parte TypeScript
 * ============================================================
 *
 * Las animaciones que CSS no puede hacer solo (transición entre pantallas,
 * entrada/salida de modales, el "vuelo" al carrito). Leen los MISMOS
 * tokens que el CSS (--bm-duration-*, --bm-ease-*, definidos en
 * src/styles/abstracts/_variables.scss), así que la velocidad de toda la
 * app se sigue controlando desde un solo lugar.
 *
 * Se registran globalmente en main.ts (provideIonicAngular).
 */

/** Lee un token de duración (ej. "340ms") como número de milisegundos. */
function ms(token: string, porDefecto: number): number {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const numero = parseFloat(valor);
  if (Number.isNaN(numero)) return porDefecto;
  return valor.endsWith('ms') ? numero : numero * 1000;
}

/** Lee un token de curva (ej. "cubic-bezier(...)"). */
function curva(token: string, porDefecto: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || porDefecto;
}

/**
 * Transición entre pantallas.
 *  - Avanzar: la pantalla nueva sube 24px y aparece mientras la anterior
 *    se aleja apenas (escala 0.98) y se desvanece. Se siente "profundidad".
 *  - Volver: al revés, la pantalla anterior baja a su lugar.
 * Dura --bm-duration-page (340ms): se percibe, pero no hace esperar.
 */
export const bmTransicionPagina: AnimationBuilder = (_base: HTMLElement, opts: any): Animation => {
  const duracion = ms('--bm-duration-page', 340);
  const easing = curva('--bm-ease-out', 'cubic-bezier(0.22, 1, 0.36, 1)');
  const atras = opts.direction === 'back';

  const entrada = createAnimation()
    .addElement(opts.enteringEl)
    .beforeRemoveClass('ion-page-invisible')
    .fromTo('opacity', '0', '1')
    .fromTo(
      'transform',
      atras ? 'translate3d(0, -12px, 0) scale(0.98)' : 'translate3d(0, 24px, 0)',
      'translate3d(0, 0, 0) scale(1)',
    );

  const raiz = createAnimation().duration(duracion).easing(easing).addAnimation(entrada);

  if (opts.leavingEl) {
    raiz.addAnimation(
      createAnimation()
        .addElement(opts.leavingEl)
        .fromTo('opacity', '1', '0')
        .fromTo(
          'transform',
          'translate3d(0, 0, 0) scale(1)',
          atras ? 'translate3d(0, 24px, 0)' : 'translate3d(0, -8px, 0) scale(0.98)',
        ),
    );
  }

  return raiz;
};

/** Modal: el fondo oscurece y la tarjeta entra con escala + fade y un rebote mínimo. */
export const bmModalEntrada: AnimationBuilder = (base: HTMLElement): Animation => {
  const raiz = base.shadowRoot!;
  const fondo = createAnimation()
    .addElement(raiz.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0.01', 'var(--backdrop-opacity)')
    .beforeStyles({ 'pointer-events': 'none' })
    .afterClearStyles(['pointer-events']);

  const tarjeta = createAnimation()
    .addElement(raiz.querySelector('.modal-wrapper')!)
    .keyframes([
      { offset: 0, opacity: '0', transform: 'translate3d(0, 24px, 0) scale(0.94)' },
      { offset: 0.7, opacity: '1', transform: 'translate3d(0, -2px, 0) scale(1.005)' },
      { offset: 1, opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
    ]);

  return createAnimation()
    .addElement(base)
    .easing(curva('--bm-ease-out', 'cubic-bezier(0.22, 1, 0.36, 1)'))
    .duration(ms('--bm-duration-slow', 360))
    .addAnimation([fondo, tarjeta]);
};

/** Modal saliendo: lo inverso, más rápido (las salidas nunca hacen esperar). */
export const bmModalSalida: AnimationBuilder = (base: HTMLElement): Animation =>
  bmModalEntrada(base).duration(ms('--bm-duration-base', 220)).direction('reverse');

/**
 * "Vuelo" al carrito: un punto ámbar sale del botón tocado, hace un arco y
 * cae en el botón del pedido, que rebota al recibirlo. Es puramente visual
 * (la lógica del carrito no se entera) y no bloquea nada: el producto ya
 * se agregó antes de que arranque la animación.
 */
export function volarAlCarrito(origen: Element | null, destino: Element | null): void {
  if (!origen || !destino) return;
  const a = origen.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  const desdeX = a.left + a.width / 2;
  const desdeY = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - desdeX;
  const dy = b.top + b.height / 2 - desdeY;

  const punto = document.createElement('div');
  punto.className = 'bm-vuelo';
  punto.style.left = `${desdeX - 11}px`;
  punto.style.top = `${desdeY - 11}px`;
  document.body.appendChild(punto);

  const vuelo = punto.animate(
    [
      { transform: 'translate3d(0, 0, 0) scale(0.6)', opacity: 0 },
      { transform: 'translate3d(0, -10px, 0) scale(1.1)', opacity: 1, offset: 0.15 },
      { transform: `translate3d(${dx * 0.55}px, ${dy * 0.5 - 70}px, 0) scale(1)`, offset: 0.55 },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.35)`, opacity: 0.7 },
    ],
    { duration: 620, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
  );

  vuelo.onfinish = () => {
    punto.remove();
    destino.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
      { duration: ms('--bm-duration-slow', 360), easing: curva('--bm-ease-spring', 'ease-out') },
    );
  };
}
