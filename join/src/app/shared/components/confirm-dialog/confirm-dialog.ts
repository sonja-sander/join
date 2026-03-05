import { A11yModule } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [A11yModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
/**
 * ConfirmDialog component
 *
 * Displays a confirmation dialog used for critical user actions.
 * Emits events when the user confirms or cancels the action.
 */
export class ConfirmDialog {
  @Input() open: boolean = false;
  @Input() highlight: string = ''; 
  @Input() highlightObject: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  /**
   * Emits the confirm event.
   *
   * Triggered when the user confirms the action.
   *
   * @returns void
   */
  onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * Emits the cancel event.
   *
   * Triggered when the user cancels the dialog.
   *
   * @returns void
   */
  onCancel(): void {
    this.cancel.emit();
  }
}