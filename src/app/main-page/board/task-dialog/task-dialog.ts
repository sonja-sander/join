import { Component, HostListener, inject, input, output, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Attachment, Task } from '../../../shared/interfaces/task';
import { TaskService } from '../../../shared/services/task-service';
import { ContactService } from '../../../shared/services/contact-service';
import { FileService } from '../../../shared/services/file-service';
import { ImageViewer } from '../../../shared/components/image-viewer/image-viewer';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-task-dialog',
  imports: [NgClass, DatePipe, ImageViewer, ConfirmDialog, A11yModule, Avatar, Icon],
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
  taskService = inject(TaskService);
  contactService = inject(ContactService);
  fileService = inject(FileService);

  task = input.required<Task>();

  deleteTask = output<string>();
  editTask = output<Task>();
  close = output<void>();

  showDeleteConfirm = signal(false);
  showViewer = signal(false);
  viewerAttachments = signal<Array<Attachment>>([]);
  viewerStartIndex = signal(0);

  /**
   * Initiates the delete confirmation state.
   *
   * @returns void
   */
  onDeleteClick(): void {
    this.showDeleteConfirm.set(true);
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
    this.editTask.emit(this.task());
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
    this.deleteTask.emit(this.task().id ?? '');
    this.showDeleteConfirm.set(false);
    this.closeDialog();
  }

  /**
   * Cancels the delete confirmation.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
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
    this.close.emit();
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
    const target = event.target as HTMLElement;

    if (target.classList.contains('task-dialog-overlay')) {
      this.closeDialog();
    }
  }

  /**
   * Handles the Escape key interaction.
   *
   * Prevents the default browser behavior and
   * closes the dialog when no blocking overlays
   * (viewer or delete confirmation) are active.
   *
   * @param event The keyboard event triggered by pressing Escape
   * @returns void
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: Event): void {
    if (this.showViewer()) return;
    if (this.showDeleteConfirm()) return;

    event.stopPropagation();
    event.preventDefault();
    this.closeDialog();
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
    const task = this.task();
    if (!task) return;

    task.subtasks[index].done = !task.subtasks[index].done;
    this.taskService.updateSubtasks(task);
  }

  /**
   * Opens the image viewer for task attachments.
   *
   * Initializes the viewer with the task's attachments
   * and sets the starting index for the displayed image.
   *
   * @param index The index of the image to display first
   * @returns void
   */
  openImageViewer(index: number): void {
    const task = this.task();
    if (!task) return;

    this.viewerAttachments.set(task.attachments);
    this.viewerStartIndex.set(index);
    this.showViewer.set(true);
  }

  /**
   * Downloads the selected attachment.
   *
   * Stops event propagation to prevent triggering
   * parent click handlers.
   *
   * @param event The mouse event triggering the download
   * @param attachment The attachment to download
   * @returns void
   */
  downloadAttachment(event: MouseEvent, attachment: Attachment): void {
    event.stopPropagation();
    this.fileService.downloadAttachment(attachment);
  }
}
