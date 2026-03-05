import { Component, HostListener, inject } from '@angular/core';
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
 * Handles responsive behavior by tracking the current
 * viewport size and updating the desktop state.
 */
export class Cockpit {
  authService = inject(AuthService);
  authLoading$ = this.authService.authLoading$;
  user$ = this.authService.user$;
  isDesktop: boolean = window.innerWidth >= 1025;

  /**
   * Handles window resize events.
   *
   * Updates the desktop state based on the current
   * viewport width to enable responsive behavior.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop = window.innerWidth >= 1025;
  }
}
