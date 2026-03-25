import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
/**
 * Toast component
 *
 * Displays a temporary notification message to the user.
 * Supports informational and error message types.
 */
export class Toast {
  message = input<string>('');
  type = input<'info' | 'error'>('info');
  visible = input<boolean>(false);
}
