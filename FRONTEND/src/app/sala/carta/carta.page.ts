import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonFooter, IonContent, IonButton, IonIcon, IonBackButton } from '@ionic/angular';
import { IndicadorDeslizanteDirective } from '../../core/motion/indicador-deslizante.directive';
import { volarAlCarrito } from '../../core/motion/motion';
import { NavClienteComponent } from '../../core/components/nav-cliente/nav-cliente.component';

type Categoria = 'todos' | 'comida' | 'bebida' | 'postre';

// Fotos de ejemplo reales (Wikimedia Commons, licencia libre) para que el
// mock se vea con comida de verdad en vez de carteles de texto.
const wiki = (archivo: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(archivo)}?width=800`;
const FOTO_HAMBURGUESA = wiki("Grilled Cheese Cheeseburger Double - Wendy's 2025-11-21.jpg");
const FOTO_MILANESA = wiki('Milanesa.jpg');
const FOTO_COCA = wiki('15-09-26-RalfR-WLC-0098 - Coca-Cola glass bottle (Germany).jpg');
const FOTO_FLAN = wiki('Homemade Flan.jpg');

interface ProductoCarta {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tiempoMinutos: number;
  categoria: Categoria;
  fotos: string[];
}

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTOS 11 y 12 — Carta del cliente + armado del pedido grupal.
 *
 * Los productos de acá son datos de EJEMPLO hardcodeados en este archivo.
 * Cuando Nahue conecte la lógica real, tiene que reemplazar `PRODUCTOS_MOCK`
 * por una llamada a `GET /productos?soloEnCarta=true` (ese endpoint YA
 * existe, es del Módulo 2 — ver CatalogoService en `catalogo/catalogo.service.ts`).
 *
 * El carrito (agregar/quitar cantidad, total, tiempo estimado) SÍ funciona
 * de verdad a nivel de pantalla (estado local del componente), para poder
 * mostrar la interacción completa aunque no pegue a ningún backend todavía.
 */
@Component({
  selector: 'app-carta',
  templateUrl: './carta.page.html',
  styleUrls: ['./carta.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonFooter,
    IonContent,
    IonButton,
    IonIcon,
    IonBackButton,
    IndicadorDeslizanteDirective,
    NavClienteComponent,
  ],
})
export class CartaPage {
  // Fondo de la carta: rota entre assets/fondos/menu1..menu5 y nunca repite
  // el de la visita anterior. Es estático para recordarlo entre entradas.
  private static ultimoFondo = -1;
  fondoMenu = CartaPage.elegirFondo();

  categoriaActiva: Categoria = 'todos';

  // ---- Filtro por texto (buscador fijo en la navbar) ----
  busqueda = '';

  /** Opciones del filtro por tipo (ícono + texto) y rótulo de cada tipo en la card. */
  readonly tipos: { valor: Categoria; icono: string; texto: string }[] = [
    { valor: 'todos', icono: '🍽️', texto: 'Todos' },
    { valor: 'comida', icono: '🍔', texto: 'Comidas' },
    { valor: 'bebida', icono: '🥤', texto: 'Bebidas' },
    { valor: 'postre', icono: '🍮', texto: 'Postres' },
  ];
  readonly rotuloTipo: Record<Categoria, string> = {
    todos: '',
    comida: 'Comida',
    bebida: 'Bebida',
    postre: 'Postre',
  };

  /** Botón "Revisar pedido": destino del vuelo al carrito. */
  @ViewChild('carrito', { read: ElementRef }) private carrito?: ElementRef<HTMLElement>;

  // Ionic reutiliza la página si se vuelve a ella desde el stack, así que
  // también se rota al reingresar (no solo al crearse el componente).
  ionViewWillEnter() {
    this.fondoMenu = CartaPage.elegirFondo();
  }

  private static elegirFondo(): string {
    let indice: number;
    do {
      indice = Math.floor(Math.random() * 5);
    } while (indice === CartaPage.ultimoFondo);
    CartaPage.ultimoFondo = indice;
    return `url('/assets/fondos/menu${indice + 1}.jpg')`;
  }

  // ---- Datos de ejemplo (ver comentario de arriba) ----
  productos: ProductoCarta[] = [
    {
      id: 'p1',
      nombre: 'Hamburguesa Big Morfi Suprema',
      descripcion:
        'Doble medallón de bife de chorizo (180g c/u), cheddar fundido, panceta ahumada crujiente, cebolla caramelizada y salsa Big Morfi exclusiva en pan brioche tostado.',
      precio: 12500,
      tiempoMinutos: 25,
      categoria: 'comida',
      // Fotos reales (Wikimedia Commons, licencia libre) para poder ver
      // cómo se ve la pantalla con contenido de verdad, no un cartel de
      // texto. Nahue las reemplaza por las que suba el cocinero (Punto 2).
      fotos: [FOTO_HAMBURGUESA, FOTO_HAMBURGUESA, FOTO_HAMBURGUESA],
    },
    {
      id: 'p2',
      nombre: 'Milanesa napolitana',
      descripcion: 'Con papas fritas caseras.',
      precio: 8500,
      tiempoMinutos: 20,
      categoria: 'comida',
      fotos: [FOTO_MILANESA, FOTO_MILANESA, FOTO_MILANESA],
    },
    {
      id: 'p3',
      nombre: 'Coca-Cola 500ml',
      descripcion: 'Bien fría.',
      precio: 2500,
      tiempoMinutos: 2,
      categoria: 'bebida',
      fotos: [FOTO_COCA, FOTO_COCA, FOTO_COCA],
    },
    {
      id: 'p4',
      nombre: 'Flan casero',
      descripcion: 'Con dulce de leche y crema.',
      precio: 3500,
      tiempoMinutos: 5,
      categoria: 'postre',
      fotos: [FOTO_FLAN, FOTO_FLAN, FOTO_FLAN],
    },
  ];

  /** Cantidad pedida de cada producto (id -> cantidad). */
  private pedido = new Map<string, number>();

  get productosFiltrados(): ProductoCarta[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.productos.filter(
      (p) =>
        (this.categoriaActiva === 'todos' || p.categoria === this.categoriaActiva) &&
        (!texto || p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto)),
    );
  }

  /** Agrega el producto (misma lógica de siempre) y dispara el vuelo al carrito. */
  agregarConVuelo(producto: ProductoCarta, evento: Event) {
    this.agregar(producto);
    volarAlCarrito(evento.currentTarget as Element, this.carrito?.nativeElement ?? null);
  }

  filtrar(categoria: Categoria) {
    this.categoriaActiva = categoria;
  }

  cantidadDe(producto: ProductoCarta): number {
    return this.pedido.get(producto.id) ?? 0;
  }

  agregar(producto: ProductoCarta) {
    this.pedido.set(producto.id, this.cantidadDe(producto) + 1);
  }

  quitar(producto: ProductoCarta) {
    const actual = this.cantidadDe(producto);
    if (actual <= 1) {
      this.pedido.delete(producto.id);
    } else {
      this.pedido.set(producto.id, actual - 1);
    }
  }

  get totalPedido(): number {
    let total = 0;
    for (const [id, cantidad] of this.pedido) {
      const producto = this.productos.find((p) => p.id === id);
      if (producto) total += producto.precio * cantidad;
    }
    return total;
  }

  /** Tiempo estimado del pedido: el MÁXIMO entre los ítems (así lo define el Módulo 3 real). */
  get tiempoEstimado(): number {
    let maximo = 0;
    for (const [id] of this.pedido) {
      const producto = this.productos.find((p) => p.id === id);
      if (producto) maximo = Math.max(maximo, producto.tiempoMinutos);
    }
    return maximo;
  }

  get cantidadTotalItems(): number {
    let total = 0;
    for (const cantidad of this.pedido.values()) total += cantidad;
    return total;
  }
}
