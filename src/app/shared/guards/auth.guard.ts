import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth-service';

/**
 * Authentication route guard.
 *
 * Ensures that only authenticated users can access
 * protected routes. Redirects unauthenticated users
 * to the main page.
 *
 * @returns An observable resolving to true or a redirect URL
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/']))),
  );
};
