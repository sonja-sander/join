import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../shared/interfaces/contact';
import { Subtask, Task } from '../../shared/interfaces/task';
import { TaskCategoryOption, TaskService } from '../../shared/services/task-service';
import { DropdownAssignee } from './dropdown-assignee/dropdown-assignee';
import { DropdownCategory } from './dropdown-category/dropdown-category';
import { PrioritySelector } from './priority-selector/priority-selector';
import { SubtaskComposer } from './subtask-composer/subtask-composer';
import { TaskFormField } from './task-form-field/task-form-field';
import { Timestamp } from '@angular/fire/firestore';
import { getTodayDateString } from '../../shared/utilities/utils';
import { FirebaseService } from '../../shared/services/firebase-service';

/**
 * Manages task creation and editing, including form state, validation and persistence.
 */
@Component({
  selector: 'app-add-task',
  imports: [
    FormsModule,
    TaskFormField,
    PrioritySelector,
    DropdownAssignee,
    DropdownCategory,
    SubtaskComposer,
  ],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnChanges, OnDestroy {
  // #region Dependencies
  taskService = inject(TaskService);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  // #endregion

  // #region Inputs & Outputs
  /** Determines whether the form is rendered inside an overlay dialog. */
  @Input() isOverlay = false;
  /** Existing task to edit. If `null`, the component creates a new task. */
  @Input() taskToEdit: Task | null = null;
  /** Target status for newly created tasks. */
  @Input() initialStatus: Task['status'] = 'to-do';
  /** Requests closing the overlay once submit feedback has finished. */
  @Output() closeDialogRequested = new EventEmitter<void>();
  @Output() dirtyChange = new EventEmitter<boolean>();
  // #endregion

  // #region Constants
  minDueDate = getTodayDateString();
  readonly taskTitleMinLength = 3;
  readonly taskTitleMaxLength = 100;
  readonly taskTitleMinLetters = 3;
  showCloseConfirm: boolean = false;
  hasUserEdited: boolean = false;
  // #endregion

  // #region Form State
  taskTitle: Task['title'] = '';
  taskDescription: Task['description'] = '';
  taskDueDate = '';
  activePriority: Task['priority'] = 'medium';
  activeAssignees: Contact[] = [];
  activeCategory: TaskCategoryOption | null = null;
  activeSubtasks: Subtask[] = [];
  isTitleTouched = false;
  isDueDateTouched = false;
  isCategoryTouched = false;
  // #endregion

  // #region UI State
  toastVisible = false;
  private toastTimer?: number;
  // #endregion

  // #region Lifecycle
  /** Applies incoming task data to the form whenever edit input changes. */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['taskToEdit']) return;
    if (this.taskToEdit) this.populateFormForEdit(this.taskToEdit);
    else this.resetForm();
  }

  /** Clears running timers to avoid side effects after component teardown. */
  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
  // #endregion

  // #region Derived State
  /** Indicates whether the form currently edits an existing task. */
  get isEditMode(): boolean {
    return Boolean(this.taskToEdit?.id);
  }

  /** Returns the dynamic headline based on create or edit mode. */
  get formTitle(): string {
    return this.isEditMode ? 'Edit Task' : 'Add Task';
  }

  /** Returns the submit button label for the active form mode. */
  get submitButtonLabel(): string {
    return this.isEditMode ? 'Save' : 'Create Task';
  }

  /** Ensures the subtask list is valid for submit. */
  get hasValidSubtasks(): boolean {
    return this.activeSubtasks.length !== 1;
  }

  /** Shows helper text when exactly one subtask exists. */
  get showSubtaskHint(): boolean {
    return this.activeSubtasks.length === 1;
  }

  /** Aggregates all title-related validation states. */
  get showTitleError(): boolean {
    return this.showTitleRequiredError || this.showTitlePatternError;
  }

  /** True after title touch when the required value is empty. */
  get showTitleRequiredError(): boolean {
    return this.isTitleTouched && !this.taskTitle.trim();
  }

  /** True when title violates length or minimum-letter constraints. */
  get showTitlePatternError(): boolean {
    if (!this.isTitleTouched) return false;
    const title = this.taskTitle.trim();
    return title.length > 0 && !this.isTitleValid(title);
  }

  /** Human-readable title validation message for the UI. */
  get titleErrorMessage(): string {
    if (this.showTitleRequiredError) return 'This field is required';
    return `Use up to ${this.taskTitleMaxLength} chars with at least ${this.taskTitleMinLetters} letters (a-z)`;
  }

  /** True after due date touch when no date has been provided. */
  get showDueDateError(): boolean {
    return this.isDueDateTouched && !this.taskDueDate.trim();
  }

  /** True after category touch when no category is selected. */
  get showCategoryError(): boolean {
    return this.isCategoryTouched && !this.activeCategory;
  }

  /** Aggregate validity of all required form sections. */
  get isFormValid(): boolean {
    return (
      this.isTitleValid(this.taskTitle) &&
      this.taskDueDate.trim().length > 0 &&
      Boolean(this.activeCategory) &&
      this.hasValidSubtasks
    );
  }
  // #endregion

  // #region Public Actions
  /**
   * Validates and persists the current form as a new task or task update.
   * Shows a toast afterwards and either closes overlay mode or navigates to board.
   */
  async createTask(): Promise<void> {
    const title = this.taskTitle.trim();
    const description = this.taskDescription.trim();
    const dueDateValue = this.taskDueDate.trim();
    const validatedCategory = this.validateForm(
      title,
      dueDateValue,
      this.activeCategory?.value ?? null,
    );

    if (!validatedCategory) return;

    const dueDateDate = this.parseDueDate(dueDateValue);
    if (!dueDateDate) return;
    const dueDate = Timestamp.fromDate(dueDateDate);

    const assigneeIds = this.activeAssignees
      .map((contact) => contact.id)
      .filter((id): id is string => Boolean(id));
    const taskPayload = this.buildTaskPayload(
      title,
      description,
      dueDate,
      assigneeIds,
      validatedCategory,
    );

    if (this.isEditMode && this.taskToEdit?.id) {
      const updatedTask: Task = {
        ...this.taskToEdit,
        ...taskPayload,
      };
      await this.taskService.updateDocument(updatedTask, 'tasks');
    } else {
      const tasksInTargetColumn = this.taskService.tasks.filter(
        (task) => task.status === this.initialStatus,
      );
      const newOrder = tasksInTargetColumn.length;

      const task: Task = {
        status: this.initialStatus,
        order: newOrder,
        ...taskPayload,
      };

      await this.taskService.addDocument(task);
      this.resetForm();
    }

    this.showToast();
    this.resetDirtyState();
  }

  /** Resets all form fields and touch states to their defaults. */
  resetForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskDueDate = '';
    this.activePriority = 'medium';
    this.activeAssignees = [];
    this.activeCategory = null;
    this.activeSubtasks = [];
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
  }
  // #endregion

  // #region Private Helpers
  /**
   * Prefills the form with existing task data for edit mode.
   * @param task Task entity that should be edited.
   */
  private populateFormForEdit(task: Task): void {
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.taskDueDate = this.formatDateForInput(task.dueDate.toDate());
    this.activePriority = task.priority;
    this.activeAssignees = task.assignees
      .map((id) => this.firebaseService.contacts.find((contact) => contact.id === id))
      .filter((contact): contact is Contact => Boolean(contact));
    this.activeCategory =
      this.taskService.taskCategories.find((category) => category.value === task.category) ?? null;
    this.activeSubtasks = task.subtasks.map((subtask) => ({ ...subtask }));
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
    this.resetDirtyState();
  }

  /**
   * Converts a `Date` to the form input format `YYYY/MM/DD`.
   * @param date Source date object.
   * @returns Date string formatted for form controls.
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /**
   * Validates required form fields and updates touch state when invalid.
   * @param title Trimmed task title.
   * @param dueDateValue Raw due date input value.
   * @param category Selected category value.
   * @returns The validated category or `null` if validation failed.
   */
  private validateForm(
    title: Task['title'],
    dueDateValue: string,
    category: Task['category'] | null,
  ): Task['category'] | null {
    const isTitleValid = this.isTitleValid(title);

    if (!isTitleValid || !dueDateValue || !category || !this.hasValidSubtasks) {
      if (!isTitleValid) this.isTitleTouched = true;
      if (!dueDateValue) this.isDueDateTouched = true;
      if (!category) this.isCategoryTouched = true;
      return null;
    }

    return category;
  }

  /**
   * Creates the shared task payload for create and update workflows.
   * @param title Normalized task title.
   * @param description Normalized task description.
   * @param dueDate Due date timestamp.
   * @param assignees Contact IDs assigned to the task.
   * @param category Validated task category.
   * @returns Base payload used for both create and update operations.
   */
  private buildTaskPayload(
    title: Task['title'],
    description: Task['description'],
    dueDate: Timestamp,
    assignees: Array<string>,
    category: Task['category'],
  ): Omit<Task, 'id' | 'status' | 'order'> {
    return {
      title,
      description,
      dueDate,
      priority: this.activePriority,
      assignees,
      category,
      subtasks: [...this.activeSubtasks],
    };
  }

  /**
   * Parses a due date string from either `YYYY/MM/DD` or `YYYY-MM-DD`.
   * @param value Date string entered in the form.
   * @returns Parsed date or `null` when the value is invalid.
   */
  private parseDueDate(value: string): Date | null {
    const parts = value.split(/[\/-]/);
    if (parts.length !== 3) return null;
    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return null;

    return date;
  }

  /**
   * Validates the title against length and minimum-letter rules.
   * @param value Title candidate from the form.
   * @returns `true` if title is valid.
   */
  private isTitleValid(value: string): boolean {
    const title = value.trim();
    return (
      title.length >= this.taskTitleMinLength &&
      title.length <= this.taskTitleMaxLength &&
      this.hasMinimumLetters(title, this.taskTitleMinLetters)
    );
  }

  /**
   * Checks whether a value contains a minimum amount of latin letters.
   * @param value Candidate input string.
   * @param minLetters Minimum amount of letters required.
   * @returns `true` when the minimum is met.
   */
  private hasMinimumLetters(value: string, minLetters: number): boolean {
    const letterMatches = value.match(/[a-z]/gi);
    return (letterMatches?.length ?? 0) >= minLetters;
  }

  /** Shows a short toast and then exits add-task flow. */
  private showToast(): void {
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      if (this.isOverlay) {
        this.closeDialogRequested.emit();
        return;
      }
      this.router.navigateByUrl('/board');
    }, 2000);
  }
  // #endregion

  markAsEdited(): void {
    if (this.hasUserEdited) return;
    this.hasUserEdited = true;
    this.dirtyChange.emit(true);
  }

  resetDirtyState(): void {
    this.hasUserEdited = false;
    this.dirtyChange.emit(false);
  }

  onCloseAddTaskClick(): void {
    this.showCloseConfirm = true;
  }

  confirmClose() {
    this.showCloseConfirm = false;
  }

  cancelClose(): void {
    this.showCloseConfirm = false;
  }
}
