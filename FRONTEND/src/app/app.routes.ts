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
];
