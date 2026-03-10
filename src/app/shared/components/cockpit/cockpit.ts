import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-cockpit',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './cockpit.html',
  styleUrl: './cockpit.scss',
})
/**
 * Cockpit component
 *
 * Represents the main navigation and layout container
 * for the application cockpit area.
 */
export class Cockpit {
  authService = inject(AuthService);
  authLoading$ = this.authService.authLoading$;
  user$ = this.authService.user$;
}
