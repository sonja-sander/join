import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
/**
 * Privacy component
 *
 * Represents the privacy policy page of the application.
 * Handles navigation back to the previous view or
 * redirects to the entry page with preserved state.
 */
export class Privacy {
  location = inject(Location);
  router = inject(Router);

  /**
   * Navigates back from the privacy page.
   *
   * Redirects to the main page when sign-up
   * should be reopened, otherwise returns
   * to the previous route in history.
   *
   * @returns void
   */
  back(): void {
    if (history.state?.openSignUp) {
      this.router.navigate([''], {
        state: { openSignUp: true, skipIntro: true }
      });
    } else {
      this.location.back();
    }
  }
}
