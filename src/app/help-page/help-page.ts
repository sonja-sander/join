import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-help-page',
  imports: [],
  templateUrl: './help-page.html',
  styleUrl: './help-page.scss',
})
/**
 * HelpPage component
 *
 * Represents the help and support page of the application.
 * Provides navigation functionality to return to the
 * previous route.
 */
export class HelpPage {
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
