import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import { Task } from '../../../../shared/interfaces/task';
import { ContactService } from '../../../../shared/services/contact-service';
import { NgClass } from '@angular/common';
import { TaskService } from '../../../../shared/services/task-service';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-single-task',
  imports: [NgClass, DragDropModule, CdkDrag, Avatar, Icon],
  templateUrl: './single-task.html',
  styleUrl: './single-task.scss',
})
/**
 * SingleTask component
 *
 * Represents an individual task card within a task list.
 * Handles mobile detection, task movement between statuses,
 * and displays task-related information such as assignees
 * and subtask progress.
 */
export class SingleTask {
  taskService = inject(TaskService);
  contactService = inject(ContactService);

  task = input.required<Task>();

  openTask = output<Task>();

  moveMenuOpen = signal<boolean>(false);
  isMobile = signal<boolean>(this.checkIsMobile());

  doneSubtasksCount = computed<number>(() => this.task().subtasks?.filter((s) => s.done).length ?? 0);
  totalSubtasksCount = computed<number>(() => this.task().subtasks?.length ?? 0);

  statuses: Array<'to-do' | 'in-progress' | 'await-feedback' | 'done'> = [
    'to-do',
    'in-progress',
    'await-feedback',
    'done',
  ];

  /**
   * Checks whether the current device is a mobile device.
   *
   * Updates the mobile state based on pointer
   * and hover capabilities.
   *
   * @returns boolean
   */
  checkIsMobile(): boolean {
    return window.innerWidth <= 1024 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Checks whether the current device is still a mobile device after resizing.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(this.checkIsMobile());
  }

  /**
   * Opens the move menu for the task.
   *
   * @param event The mouse event triggering the menu
   * @returns void
   */
  openMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moveMenuOpen.set(true);
  }

  /**
   * Closes the move menu for the task.
   *
   * @param event The mouse event triggering the close action
   * @returns void
   */
  closeMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moveMenuOpen.set(false);
  }

  /**
   * Moves the task to a different status.
   *
   * Updates the order of tasks in the target list
   * and persists the changes through the task service.
   *
   * @param status The target status for the task
   * @param event The mouse event triggering the action
   * @returns void
   */
  moveTo(status: 'to-do' | 'in-progress' | 'await-feedback' | 'done', event: MouseEvent): void {
    const otherTasks = this.taskService
      .tasks()
      .filter((t) => t.status === status && t.id !== this.task().id);

    for (const t of otherTasks) {
      t.order = t.order + 1;
      this.taskService.updateDocument(t, 'tasks');
    }

    this.task().status = status;
    this.task().order = 0;
    this.taskService.updateDocument(this.task(), 'tasks');
    this.closeMenu(event);
  }

  /**
   * Returns the short label for a given task status.
   *
   * Maps internal status values (used in the data model) to
   * shorter labels displayed in the UI.
   *
   * @param status - The task status identifier
   * ('to-do' | 'in-progress' | 'await-feedback' | 'done')
   *
   * @returns The corresponding display label for the status.
   * Returns an empty string if the status is unknown.
   */
  getMoveLabel(status: 'to-do' | 'in-progress' | 'await-feedback' | 'done'): string {
    if (status === 'to-do') return 'To-do';
    if (status === 'in-progress') return 'Doing';
    if (status === 'await-feedback') return 'Review';
    if (status === 'done') return 'Done';

    return '';
  }
}
