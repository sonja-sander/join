import { Component, OnChanges, OnDestroy, SimpleChanges, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { Contact } from '../../shared/interfaces/contact';
import { Task } from '../../shared/interfaces/task';
import { TaskCategoryOption, TaskService } from '../../shared/services/task-service';
import { FirebaseService } from '../../shared/services/firebase-service';
import { formatDateForInput, getTodayDateString, parseDueDate } from '../../shared/utilities/utils';
import { DropdownAssignee } from './dropdown-assignee/dropdown-assignee';
import { DropdownCategory } from './dropdown-category/dropdown-category';
import { PrioritySelector } from './priority-selector/priority-selector';
import { SubtaskComposer } from './subtask-composer/subtask-composer';
import { TaskFormField } from './task-form-field/task-form-field';
import { Attachments } from './attachments/attachments';
import { Toast } from '../../shared/components/toast/toast';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Icon } from '../../shared/components/icon/icon';
import { TaskFormData } from '../../shared/interfaces/task-form-data';

/**
 * Manages task creation and editing.
 */
@Component({
  selector: 'app-add-task',
  imports: [FormsModule, TaskFormField, PrioritySelector, DropdownAssignee, DropdownCategory, Attachments, SubtaskComposer, Toast, ConfirmDialog, Icon],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnChanges, OnDestroy {
  taskService = inject(TaskService);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  isOverlay = input<boolean>(false);
  taskToEdit = input<Task | null>(null);
  initialStatus = input<Task['status']>('to-do');
  closeDialogRequested = output<void>();
  dirtyChange = output<boolean>();
  viewerStateChange = output<boolean>();

  minDueDate = getTodayDateString();
  hasUserEdited: boolean = false;
  isSubmitting: boolean = false;
  addTaskSuccess: boolean = false;
  private toastTimer?: number;
  imageTypeError: boolean = false;
  taskSizeError: boolean = false;
  showDeleteAllConfirm: boolean = false;
  isTitleTouched: boolean = false;
  isDueDateTouched: boolean = false;
  isCategoryTouched: boolean = false;

  taskData: TaskFormData = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignees: [],
    category: null,
    subtasks: [],
    attachments: [],
  };

  // #region Form Lifecycle

  /**
   * Reacts to input changes and updates the form state.
   *
   * If a task is provided, the form is populated for edit mode.
   * Otherwise, the form is reset to its default state.
   *
   * @param changes Angular change object containing updated inputs
   * @returns void
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['taskToEdit']) return;
    const task = this.taskToEdit();

    if (task) {
      this.populateFormForEdit(task);
    } else {
      this.resetForm();
    }
  }

  /**
   * Resets the form to its initial empty state.
   *
   * Clears all form values and validation states.
   *
   * @returns void
   */
  resetForm(): void {
    this.taskData = {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignees: [],
      category: null,
      subtasks: [],
      attachments: [],
    };

    this.resetTouchedStates();
  }

  /**
   * Populates the form with an existing task for editing.
   *
   * Maps backend data to UI-friendly form state.
   *
   * @param task The task to edit
   * @returns void
   */
  private populateFormForEdit(task: Task): void {
    this.taskData = {
      title: task.title,
      description: task.description,
      dueDate: formatDateForInput(task.dueDate.toDate()),
      priority: task.priority,
      assignees: this.mapAssignees(task.assignees),
      category: this.findCategory(task.category),
      subtasks: task.subtasks.map(s => ({ ...s })),
      attachments: Array.from(task.attachments ?? []),
    };

    this.resetTouchedStates();
    this.resetDirtyState();
  }

  // #endregion


  // #region Submit Flow

  /**
   * Handles form submission.
   *
   * Validates input, then creates or updates a task
   * depending on the current mode.
   *
   * @returns Promise resolving when operation is complete
   */
  async createTask(): Promise<void> {
    if (this.isSubmitting) return;

    if (!this.isFormValid) {
      this.markInvalidFields();
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      await this.updateTask();
    } else {
      await this.createNewTask();
    }

    this.showToast();
    this.resetDirtyState();
  }

  /**
   * Creates a new task entry in the database.
   *
   * Calculates the correct order based on current column.
   *
   * @returns Promise resolving after task creation
   */
  private createNewTask(): Promise<void> {
    const task = this.buildTask();

    const order = this.taskService.tasks
      .filter(t => t.status === this.initialStatus()).length;

    return this.taskService.addDocument({
      ...task,
      status: this.initialStatus(),
      order,
    }).then(() => this.resetForm());
  }

  /**
   * Updates an existing task in the database.
   *
   * Merges updated form data into the existing task.
   *
   * @returns Promise resolving after update
   */
  private updateTask(): Promise<void> {
    if (!this.taskToEdit()) return Promise.resolve();

    const updatedTask: Task = {
      ...this.taskToEdit(),
      ...this.buildTask(),
    } as Task;

    return this.taskService.updateDocument(updatedTask, 'tasks');
  }

  /**
   * Builds a task payload from the current form state.
   *
   * Transforms UI values into backend-compatible format.
   *
   * @returns Task payload without id, status and order
   */
  private buildTask(): Omit<Task, 'id' | 'status' | 'order'> {
    return {
      title: this.taskData.title.trim(),
      description: this.taskData.description.trim(),
      dueDate: Timestamp.fromDate(parseDueDate(this.taskData.dueDate)!),
      priority: this.taskData.priority,
      assignees: this.taskData.assignees.map(a => a.id!).filter(Boolean),
      category: this.taskData.category!.value,
      attachments: this.taskData.attachments,
      subtasks: [...this.taskData.subtasks],
    };
  }

  // #endregion


  // #region Validation

  /**
   * Indicates whether the component is in edit mode.
   *
   * @returns True if a task with an ID exists
   */
  get isEditMode(): boolean {
    return Boolean(this.taskToEdit()?.id);
  }

  /**
   * Validates required form fields.
   *
   * @returns True if all required inputs are filled
   */
  get isFormValid(): boolean {
    return Boolean(
      this.taskData.title.trim() &&
      this.taskData.dueDate.trim() &&
      this.taskData.category
    );
  }

  /**
   * Marks invalid form fields as touched.
   *
   * Used to trigger validation messages in the UI.
   *
   * @returns void
   */
  private markInvalidFields(): void {
    if (!this.taskData.title.trim()) this.isTitleTouched = true;
    if (!this.taskData.dueDate.trim()) this.isDueDateTouched = true;
    if (!this.taskData.category) this.isCategoryTouched = true;
  }

  /**
   * Resets all validation/touched states.
   *
   * @returns void
   */
  private resetTouchedStates(): void {
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
  }

  // #endregion


  // #region Mapping

  /**
   * Maps assignee IDs to full contact objects.
   *
   * Filters out invalid or missing contacts.
   *
   * @param ids Array of contact IDs
   * @returns Array of valid Contact objects
   */
  private mapAssignees(ids: string[]): Contact[] {
    return ids
      .map(id => this.firebaseService.contacts.find(c => c.id === id))
      .filter((c): c is Contact => Boolean(c));
  }

  /**
   * Finds the matching category option for a given value.
   *
   * @param value Task category value
   * @returns Matching category option or null if not found
   */
  private findCategory(value: Task['category']): TaskCategoryOption | null {
    return this.taskService.taskCategories.find(c => c.value === value) ?? null;
  }

  // #endregion


  // #region UI Actions

  /**
   * Marks the form as edited and emits dirty state.
   *
   * @returns void
   */
  markAsEdited(): void {
    if (this.hasUserEdited) return;
    this.hasUserEdited = true;
    this.dirtyChange.emit(true);
  }

  /**
   * Resets dirty state and notifies listeners.
   *
   * @returns void
   */
  resetDirtyState(): void {
    this.hasUserEdited = false;
    this.dirtyChange.emit(false);
  }

  /**
   * Deletes all attachments from the form.
   *
   * @returns void
   */
  confirmDeleteAllAttachments(): void {
    this.taskData.attachments = [];
    this.markAsEdited();
    this.showDeleteAllConfirm = false;
  }

  /**
   * Shows a temporary error toast.
   *
   * @param flag Type of error to display
   * @returns void
   */
  showErrorToast(flag: 'imageTypeError' | 'taskSizeError'): void {
    this[flag] = true;
    setTimeout(() => (this[flag] = false), 2500);
  }

  /**
   * Displays success toast and navigates or closes dialog.
   *
   * @returns void
   */
  private showToast(): void {
    this.addTaskSuccess = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      this.addTaskSuccess = false;

      if (this.isOverlay()) {
        this.closeDialogRequested.emit();
        return;
      }

      this.router.navigateByUrl('/board');
    }, 2000);
  }

  // #endregion

  /**
   * Cleans up active timers when component is destroyed.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}