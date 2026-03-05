import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-imprint',
  imports: [],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
/**
 * Imprint component
 *
 * Represents the legal imprint page of the application.
 * Provides navigation functionality to return to the
 * previous route.
 */
export class Imprint {
  location = inject(Location);

  /**
   * Navigates back to the previous page.
   *
   * Uses the Angular Location service to
   * return to the last route in history.
   *
   * @returns void
   */
  back(): void {
    this.location.back();
  }
}
