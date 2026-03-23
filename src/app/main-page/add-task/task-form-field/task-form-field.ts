import { Component, input, output } from '@angular/core';
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
  value = input('');
  label = input('');
  isRequired = input(false);
  hasError = input(false);
  placeholder = input('');
  type = input('text');
  useFlatpickr = input(false);
  isTextarea = input(false);
  min = input<string | null>(null);
  iconSrc = input<string | null>(null);

  valueChange = output<string>();
  fieldBlur = output<void>();
}
