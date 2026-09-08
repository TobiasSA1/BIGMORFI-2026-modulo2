import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (...rolesPermitidos: string[]): CanActivateFn => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const perfil = await authService.getPerfilActual();
    return perfil && rolesPermitidos.includes(perfil.rol) ? true : router.parseUrl('/login');
  };
};