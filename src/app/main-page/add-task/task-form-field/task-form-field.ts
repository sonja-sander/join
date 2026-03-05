import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlatpickrDirective } from '../../../shared/flatpickr.directive';

/**
 * Reusable input/textarea field wrapper used in the add-task form.
 */
@Component({
  selector: 'app-task-form-field',
  imports: [FormsModule, FlatpickrDirective],
  templateUrl: './task-form-field.html',
  styleUrl: './task-form-field.scss',
})
export class TaskFormField {
  /** Bound field value. */
  @Input() value = '';
  /** Emits value updates to the parent component. */
  @Output() valueChange = new EventEmitter<string>();
  /** Emits blur-like interaction events for touch-state handling. */
  @Output() fieldBlur = new EventEmitter<void>();

  /** Visible label text. */
  @Input() label = '';
  /** Marks the field as required in the UI. */
  @Input() isRequired = false;
  /** Activates error styling. */
  @Input() hasError = false;
  /** Placeholder shown when the field is empty. */
  @Input() placeholder = '';
  /** Input type for non-textarea mode. */
  @Input() type = 'text';
  /** Enables flatpickr behavior for date entry. */
  @Input() useFlatpickr = false;
  /** Switches rendering from input to textarea. */
  @Input() isTextarea = false;
  /** Minimum value constraint, mainly used for dates. */
  @Input() min: string | null = null;
  /** Optional icon path rendered inside the field. */
  @Input() iconSrc: string | null = null;
}
