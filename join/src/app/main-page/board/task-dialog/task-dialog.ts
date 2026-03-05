import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../shared/interfaces/task';
import { TaskService } from '../../../shared/services/task-service';
import { FirebaseService } from '../../../shared/services/firebase-service';

@Component({
  selector: 'app-task-dialog',
  imports: [NgClass, DatePipe],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
/**
 * TaskDialog component
 *
 * Represents a modal dialog displaying detailed information
 * about a task. Handles edit and delete actions, subtask updates,
 * and dialog interactions.
 */
export class TaskDialog {
  @ViewChild('taskDialog') dialog!: ElementRef<HTMLDialogElement>;
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
  @Input() task!: Task;
  @Output() deleteTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  showDeleteConfirm: boolean = false;

  /**
   * Opens the task dialog.
   *
   * Displays the dialog as a modal window
   * and applies the active dialog styling.
   *
   * @returns void
   */
  openDialog(): void {
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
  }

  /**
   * Initiates the delete confirmation state.
   *
   * @returns void
   */
  onDeleteClick(): void {
    this.showDeleteConfirm = true;
  }

  /**
   * Triggers the edit action for the current task.
   *
   * Closes the dialog and emits the edit event
   * with the selected task.
   *
   * @returns void
   */
  onEditClick(): void {
    this.closeDialog();
    this.editTask.emit(this.task);
  }

  /**
   * Confirms deletion of the current task.
   *
   * Emits the delete event, resets the confirmation state,
   * and closes the dialog.
   *
   * @returns void
   */
  confirmDelete(): void {
    this.deleteTask.emit(this.task.id);
    this.showDeleteConfirm = false;
    this.closeDialog();
  }

  /**
   * Cancels the delete confirmation.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  /**
   * Closes the dialog.
   *
   * Removes the active dialog state and
   * closes the native dialog element.
   *
   * @returns void
   */
  closeDialog(): void {
    const el = this.dialog.nativeElement;
    el.classList.remove('opened');
    el.close();
  }

  /**
   * Handles clicks on the dialog backdrop.
   *
   * Closes the dialog only when the backdrop
   * itself is clicked.
   *
   * @param event The mouse event triggered by the click
   * @returns void
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
  }

  /**
   * Handles the Escape key interaction.
   *
   * Prevents the default browser behavior
   * and closes the dialog manually.
   *
   * @param event The triggered escape event
   * @returns void
   */
  onEsc(event: Event): void {
    event.preventDefault();
    this.closeDialog();
  }

  /**
   * Retrieves the initials of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The initials of the assignee
   */
  getAssigneeInitials(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return getTwoInitials(contact?.name || 'Unknown');
  }

  /**
   * Retrieves the full name of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The name of the assignee
   */
  getAssigneeName(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.name || 'Unknown';
  }

  /**
   * Retrieves the display color of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The color assigned to the contact
   */
  getUserColor(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.userColor || '#9327ff';
  }

  /**
   * Toggles the completion state of a subtask.
   *
   * Updates the subtask status and persists
   * the changes through the task service.
   *
   * @param index The index of the subtask to toggle
   * @returns void
   */
  toggleSubtask(index: number): void {
    this.task.subtasks[index].done = !this.task.subtasks[index].done;
    this.taskService.updateSubtasks(this.task);
  }
}
