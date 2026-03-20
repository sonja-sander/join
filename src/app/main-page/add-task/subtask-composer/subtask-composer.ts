import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { Subtask } from '../../../shared/interfaces/task';
import { SubtaskFormData } from '../../../shared/interfaces/task-form-data';
import { Icon } from '../../../shared/components/icon/icon';

/**
 * Handles subtask creation, inline editing and removal for the task form.
 */
@Component({
  selector: 'app-subtask-composer',
  imports: [Icon],
  templateUrl: './subtask-composer.html',
  styleUrl: './subtask-composer.scss',
})
export class SubtaskComposer implements OnChanges {
  private hostElement = inject(ElementRef<HTMLElement>);
  @Input() subtasks: Array<Subtask> = [];
  @Output() subtasksChange = new EventEmitter<Array<Subtask>>();

  readonly subtaskTitleMinLength = 3;
  readonly subtaskTitleMaxLength = 100;
  readonly subtaskTitleMinLetters = 3;
  showSubtaskDuplicateError = false;

  subtaskData: SubtaskFormData = {
    title: '',
    editingIndex: null,
  };

  /**
   * Resets form state when subtasks are cleared.
   *
   * @param changes Angular input changes
   * @returns void
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subtasks'] && this.subtasks.length === 0) {
      this.resetFormState();
    }
  }

  /**
   * Indicates whether input contains text.
   *
   * @returns boolean
   */
  get hasSubtaskInput(): boolean {
    return this.subtaskData.title.trim().length > 0;
  }

  /**
   * Shows validation error for invalid titles.
   *
   * @returns boolean
   */
  get showSubtaskPatternError(): boolean {
    const title = this.subtaskData.title.trim();
    return title.length > 0 && !this.isSubtaskTitleValid(title);
  }

  /**
   * Adds a new subtask or updates an existing one.
   *
   * @returns void
   */
  addSubtask(): void {
    const title = this.subtaskData.title.trim();

    if (!this.isValidNewTitle(title)) return;
    if (this.isDuplicate(title)) return;

    this.subtaskData.editingIndex !== null
      ? this.updateSubtask(title)
      : this.createSubtask(title);
  }

  /**
   * Handles enter key submit.
   *
   * @param event Keyboard event
   * @returns void
   */
  handleEnter(event: Event): void {
    if (!this.hasSubtaskInput) return;
    event.preventDefault();
    this.addSubtask();
  }

  /**
   * Clears input and edit mode.
   *
   * @returns void
   */
  clearSubtaskTitle(): void {
    this.resetFormState();
  }

  /**
   * Starts editing a subtask.
   *
   * @param index Index of subtask
   * @returns void
   */
  startEditSubtask(index: number): void {
    const subtask = this.subtasks[index];
    if (!subtask) return;

    this.subtaskData = {
      title: subtask.title,
      editingIndex: index,
    };

    this.showSubtaskDuplicateError = false;
  }

  /**
   * Updates input value.
   *
   * @param value Input value
   * @returns void
   */
  onSubtaskTitleInput(value: string): void {
    this.subtaskData.title = value;
    this.showSubtaskDuplicateError = false;
  }

  /**
   * Removes a subtask.
   *
   * @param index Index to remove
   * @returns void
   */
  removeSubtask(index: number): void {
    const updated = this.subtasks.filter((_, i) => i !== index);
    this.subtasksChange.emit(updated);

    this.adjustEditingIndex(index);
  }

  /**
   * Creates a new subtask.
   */
  private createSubtask(title: string): void {
    const updated = [...this.subtasks, { title, done: false }];
    this.subtasksChange.emit(updated);

    this.resetFormState();
    this.scrollToLatestSubtask();
  }

  /**
   * Updates an existing subtask.
   */
  private updateSubtask(title: string): void {
    const updated = this.subtasks.map((s, i) =>
      i === this.subtaskData.editingIndex ? { ...s, title } : s
    );

    this.subtasksChange.emit(updated);
    this.resetFormState();
  }

  /**
   * Validates new title input.
   */
  private isValidNewTitle(title: string): boolean {
    if (!title || !this.isSubtaskTitleValid(title)) {
      this.showSubtaskDuplicateError = false;
      return false;
    }
    return true;
  }

  /**
   * Checks for duplicate titles.
   */
  private isDuplicate(title: string): boolean {
    const duplicate = this.subtasks.some((s, i) => {
      if (this.subtaskData.editingIndex === i) return false;
      return s.title.trim().toLowerCase() === title.toLowerCase();
    });

    this.showSubtaskDuplicateError = duplicate;
    return duplicate;
  }

  /**
   * Adjusts editing index after deletion.
   */
  private adjustEditingIndex(removedIndex: number): void {
    const current = this.subtaskData.editingIndex;

    if (current === removedIndex) {
      this.resetFormState();
    } else if (current !== null && current > removedIndex) {
      this.subtaskData.editingIndex = current - 1;
    }
  }

  /**
   * Resets input state.
   */
  private resetFormState(): void {
    this.subtaskData = {
      title: '',
      editingIndex: null,
    };
    this.showSubtaskDuplicateError = false;
  }

  /**
   * Scrolls to newest subtask.
   */
  private scrollToLatestSubtask(): void {
    requestAnimationFrame(() => {
      const host = this.hostElement.nativeElement;
      const el = host.querySelector('.subtask-list__item:last-child');
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  /**
   * Validates subtask title.
   */
  private isSubtaskTitleValid(value: string): boolean {
    return (
      value.length >= this.subtaskTitleMinLength &&
      value.length <= this.subtaskTitleMaxLength &&
      this.hasMinimumLetters(value, this.subtaskTitleMinLetters)
    );
  }

  /**
   * Checks minimum letters.
   */
  private hasMinimumLetters(value: string, min: number): boolean {
    return (value.match(/[a-z]/gi)?.length ?? 0) >= min;
  }
}