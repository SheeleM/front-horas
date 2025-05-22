import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../login/services/Login.service';

export const rolesGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as Array<string>;
  // Json varia vas usa el localStorage
  // tener la variable de sesion en el localStorage rol
  let data = JSON.parse(localStorage.getItem('users') || ({} as any));

  if (expectedRoles.includes(data.rol)) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
