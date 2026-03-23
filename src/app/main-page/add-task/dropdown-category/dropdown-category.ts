import {
  Component,
  HostListener,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { TaskCategoryOption, TaskService } from '../../../shared/services/task-service';
import { Icon } from '../../../shared/components/icon/icon';

/**
 * Single-select dropdown used for choosing a task category.
 */
@Component({
  selector: 'app-dropdown-category',
  imports: [Icon],
  templateUrl: './dropdown-category.html',
  styleUrl: './dropdown-category.scss',
})
export class DropdownCategory {
  elementRef = inject(ElementRef);
  taskService = inject(TaskService);

  hasError = input<boolean>(false);
  selectedCategory = input<TaskCategoryOption | null>(null);

  selectedCategoryChange = output<TaskCategoryOption | null>();
  fieldBlur = output<void>();

  isDropdownOpen: boolean = false;

  /** Human-readable label of the selected category. */
  get selectedCategoryLabel(): string {
    return this.selectedCategory()?.label ?? '';
  }

  /**
   * Toggles dropdown visibility and reports blur when closing.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.fieldBlur.emit();
    }
  }

  /**
   * Selects a category and closes the dropdown.
   * @param newCat Category selected by the user.
   * @param event Optional trigger event used to stop propagation.
   */
  selectCategory(newCat: TaskCategoryOption, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategoryChange.emit(newCat);
    this.isDropdownOpen = false;
    this.fieldBlur.emit();
  }

  /**
   * Closes the dropdown when interaction occurs outside the component.
   * @param event Pointer-down event from the document.
   */
  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsidePointerDown(event: Event): void {
    if (!this.isDropdownOpen) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen = false;
    this.fieldBlur.emit();
  }
}
