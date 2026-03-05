import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../shared/services/task-service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../shared/services/auth-service';
import { getGreeting } from '../../shared/utilities/utils';

@Component({
  selector: 'app-summary',
  imports: [RouterLink, DatePipe, AsyncPipe],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
/**
 * Summary component
 *
 * Represents the summary dashboard of the application.
 * Displays an overview of tasks and user-related information
 * and provides navigation to other sections.
 */
export class Summary {
  taskService = inject(TaskService);
  authService = inject(AuthService);
  user$ = this.authService.user$;

  /**
   * Returns a contextual greeting message.
   *
   * @returns The greeting string
   */
  get greeting(): string {
    return getGreeting();
  }

  getGreetingName(userEmail: string | null | undefined): string {
    const email = userEmail?.trim().toLowerCase();
    const contact = this.authService.contactService.contacts.find(
      (item) => item.email?.trim().toLowerCase() === email,
    );
    return contact?.name ?? '';
  }
}
