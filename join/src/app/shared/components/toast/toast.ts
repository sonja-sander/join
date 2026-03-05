import { Component, Input } from '@angular/core';

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
  @Input() message: string = '';
  @Input() type: 'info' | 'error' = 'info';
  @Input() visible: boolean = false;
}