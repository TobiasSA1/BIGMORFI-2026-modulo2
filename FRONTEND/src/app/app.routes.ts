import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'cuenta-no-habilitada',
    loadComponent: () =>
      import('./shared/pages/cuenta-no-habilitada/cuenta-no-habilitada.page').then(
        (m) => m.CuentaNoHabilitadaPage,
      ),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'empleados/alta',
    loadComponent: () => import('./empleados/alta-empleado/alta-empleado.page').then( m => m.AltaEmpleadoPage)
  },
  {
    path: 'clientes/registro',
    loadComponent: () => import('./clientes/registro-cliente/registro-cliente.page').then( m => m.RegistroClientePage)
  },
  {
    path: 'clientes/pendientes',
    loadComponent: () => import('./clientes/clientes-pendientes/clientes-pendientes.page').then( m => m.ClientesPendientesPage)
  },

  // ===== Módulo 2 - Catálogo, Mesas y Sectores (Tobi) =====
  // El control de rol lo hace el backend con @Auth(); acá no se pone guard
  // para seguir el mismo criterio que las rutas del Módulo 1.
  {
    // Punto 2 - alta de plato (cocinero)
    path: 'catalogo/platos/alta',
    loadComponent: () => import('./catalogo/alta-plato/alta-plato.page').then((m) => m.AltaPlatoPage),
  },
  {
    // Punto 3 - alta de bebida (cantinero)
    path: 'catalogo/bebidas/alta',
    loadComponent: () => import('./catalogo/alta-bebida/alta-bebida.page').then((m) => m.AltaBebidaPage),
  },
  {
    // Punto 4 - alta de mesa + QR (dueño / supervisor)
    path: 'catalogo/mesas/alta',
    loadComponent: () => import('./catalogo/alta-mesa/alta-mesa.page').then((m) => m.AltaMesaPage),
  },
  {
    // Punto 16 - sector cocina (cocinero)
    path: 'catalogo/cocina',
    loadComponent: () => import('./catalogo/cocina/cocina.page').then((m) => m.CocinaPage),
  },
  {
    // Punto 17 - sector bar (cantinero)
    path: 'catalogo/bar',
    loadComponent: () => import('./catalogo/bar/bar.page').then((m) => m.BarPage),
  },
];
