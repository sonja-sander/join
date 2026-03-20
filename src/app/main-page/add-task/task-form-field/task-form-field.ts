import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlatpickrDirective } from '../../../shared/flatpickr.directive';
import { Icon } from '../../../shared/components/icon/icon';

/**
 * Reusable input/textarea field wrapper used in the add-task form.
 */
@Component({
  selector: 'app-task-form-field',
  imports: [FormsModule, FlatpickrDirective, Icon],
  templateUrl: './task-form-field.html',
  styleUrl: './task-form-field.scss',
})
export class TaskFormField {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() fieldBlur = new EventEmitter<void>();
  @Input() label = '';
  @Input() isRequired = false;
  @Input() hasError = false;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() useFlatpickr = false;
  @Input() isTextarea = false;
  @Input() min: string | null = null;
  @Input() iconSrc: string | null = null;
}
