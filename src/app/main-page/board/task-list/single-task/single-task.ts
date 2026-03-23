import { Component, inject, input, OnInit, output } from '@angular/core';
import { Task } from '../../../../shared/interfaces/task';
import { FirebaseService } from '../../../../shared/services/firebase-service';
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
export class SingleTask implements OnInit {
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);

  task = input.required<Task>();
  openTask = output<Task>();

  userColor: string | null = null;
  moveMenuOpen: boolean = false;
  isMobile: boolean = false;

  statuses: Array<'to-do' | 'in-progress' | 'await-feedback' | 'done'> = [
    'to-do',
    'in-progress',
    'await-feedback',
    'done'
  ];

  /**
   * Initializes the component.
   *
   * Detects the current device type and listens
   * for resize events to update the device state.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.checkDevice();
    window.addEventListener('resize', () => this.checkDevice());
  }

  /**
   * Checks whether the current device is a mobile device.
   *
   * Updates the mobile state based on pointer
   * and hover capabilities.
   *
   * @returns void
   */
  checkDevice(): void {
    this.isMobile =
      window.innerWidth <= 1024 ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
  }

  /**
   * Opens the move menu for the task.
   *
   * @param event The mouse event triggering the menu
   * @returns void
   */
  openMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moveMenuOpen = true;
  }

  /**
   * Closes the move menu for the task.
   *
   * @param event The mouse event triggering the close action
   * @returns void
   */
  closeMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moveMenuOpen = false;
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
    const otherTasks = this.taskService.tasks.filter(
      t => t.status === status && t.id !== this.task().id
    );
    
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

  /**
   * Returns the number of completed subtasks.
   *
   * @returns The count of subtasks marked as done
   */
  get doneCount(): number {
    if (!this.task().subtasks) {
      return 0;
    }

    return this.task().subtasks.filter((s) => s.done).length;
  }

  /**
   * Returns the total number of subtasks.
   *
   * @returns The total subtask count
   */
  get totalCount(): number {
    if (!this.task().subtasks) {
      return 0;
    }

    return this.task().subtasks.length;
  }

  /**
   * Retrieves the name of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The name of the assignee
   */
  getAssigneeName(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.name || "Unknown";
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
   * Retrieves the avatar image of an assignee.
   *
   * Searches the contact list for the specified ID
   * and returns the base64 encoded avatar if available.
   *
   * @param id The identifier of the assignee
   * @returns The base64 avatar string or null if no avatar exists
   */
  getAssigneeAvatar(id: string): string | null {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });
    
    return contact?.avatar?.base64 || null;
  }
}
