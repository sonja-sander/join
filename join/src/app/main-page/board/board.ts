import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { TaskList } from './task-list/task-list';
import { TaskService } from '../../shared/services/task-service';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { TaskDialog } from './task-dialog/task-dialog';
import { Task } from '../../shared/interfaces/task';
import { AddTask } from '../add-task/add-task';

@Component({
  selector: 'app-board',
  imports: [TaskList, FormsModule, TaskDialog, AddTask],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
/**
 * Board component
 *
 * Represents the main task board view.
 * Handles task searching, opening task details,
 * deleting tasks, and managing the add-task overlay
 * including edit and close confirmation behavior.
 */
export class Board {
  taskService = inject(TaskService);
  searchTerm: string = '';
  isAddTaskOverlayOpen: boolean = false;
  taskToEdit: Task | null = null;
  addTaskStatus: Task['status'] = 'to-do';
  @ViewChild('taskDialog') taskDialog!: TaskDialog;
  selectedTask!: Task;
  showCloseConfirm: boolean = false;
  isAddTaskDirty: boolean = false;

  /**
   * Performs a search based on the current search term.
   *
   * Updates the search term in the task service
   * after trimming and normalizing the input.
   *
   * @returns void
   */
  search(): void {
    this.taskService.setSearchTerm(this.searchTerm.trim().toLowerCase());
  }

  /**
   * Opens the task dialog for the selected task.
   *
   * Sets the selected task and triggers the dialog display.
   *
   * @param task The task to open in the dialog
   * @returns void
   */
  openTask(task: Task): void {
    this.selectedTask = task;

    setTimeout(() => {
      this.taskDialog.openDialog();
    });
  }

  /**
   * Deletes a task by its identifier.
   *
   * Removes the task from the data source
   * and clears the selected task state.
   *
   * @param taskId The identifier of the task to delete
   * @returns void
   */
  deleteTask(taskId: string): void {
    if (!taskId) return;

    this.taskService.deleteDocument('tasks', taskId);
    this.selectedTask = null as any;
  }

  /**
   * Opens the add-task overlay in create mode.
   *
   * Resets edit state and sets the initial status
   * for the new task.
   *
   * @param status The status the new task should start with
   * @returns void
   */
  openAddTaskOverlay(status: Task['status'] = 'to-do'): void {
    this.taskToEdit = null;
    this.addTaskStatus = status;
    this.isAddTaskOverlayOpen = true;
  }

  /**
   * Opens the add-task overlay in edit mode.
   *
   * Loads the selected task into the overlay
   * for editing.
   *
   * @param task The task to edit
   * @returns void
   */
  openEditTaskOverlay(task: Task): void {
    this.taskToEdit = task;
    this.addTaskStatus = task.status;
    this.isAddTaskOverlayOpen = true;
  }

  /**
   * Updates the dirty state of the add-task overlay.
   *
   * @param isDirty Indicates whether the form has unsaved changes
   * @returns void
   */
  onAddTaskDirtyChange(isDirty: boolean): void {
    this.isAddTaskDirty = isDirty;
  }

  /**
   * Confirms closing of the add-task overlay.
   *
   * Resets confirmation state and closes the overlay.
   *
   * @returns void
   */
  confirmClose(): void {
    this.showCloseConfirm = false;
    this.closeAddTaskOverlay();
  }

  /**
   * Cancels the close confirmation dialog.
   *
   * @returns void
   */
  cancelClose(): void {
    this.showCloseConfirm = false;
  }

  /**
   * Handles explicit close requests for the add-task overlay.
   *
   * Shows a confirmation dialog if unsaved changes exist.
   *
   * @returns void
   */
  onCloseAddTaskClick(): void {
    if (!this.isAddTaskDirty) {
      this.closeAddTaskOverlay();
      return;
    }

    this.showCloseConfirm = true;
  }

  /**
   * Handles mouse interactions on the add-task overlay backdrop.
   *
   * Closes the overlay or shows a confirmation dialog
   * depending on the dirty state.
   *
   * @param event The mouse event triggered by the interaction
   * @returns void
   */
  onAddTaskOverlayMouseDown(event: MouseEvent): void {
    if (event.target !== event.currentTarget) return;

    if (!this.isAddTaskDirty) {
      this.closeAddTaskOverlay();
      return;
    }

    this.showCloseConfirm = true;
  }

  /**
   * Handles the Escape key interaction.
   *
   * Closes the add-task overlay or opens a confirmation
   * dialog if unsaved changes are present.
   *
   * @returns void
   */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isAddTaskOverlayOpen) return;
    if (this.showCloseConfirm) return;

    if (!this.isAddTaskDirty) {
      this.closeAddTaskOverlay();
      return;
    }

    this.showCloseConfirm = true;
  }

  /**
   * Closes the add-task overlay.
   *
   * Resets overlay state and reopens the task dialog
   * when returning from edit mode.
   *
   * @returns void
   */
  closeAddTaskOverlay(): void {
    const editedTask = this.taskToEdit;
    this.isAddTaskOverlayOpen = false;
    this.taskToEdit = null;
    this.addTaskStatus = 'to-do';
    this.isAddTaskDirty = false;

    if (editedTask?.id) {
      this.openTask(
        this.taskService.tasks.find((task) => task.id === editedTask.id) ?? editedTask
      );
    }
  }
}
