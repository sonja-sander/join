import { Component, computed, inject, input, output } from '@angular/core';
import { TaskService } from '../../../shared/services/task-service';
import { SingleTask } from './single-task/single-task';
import { ContactService } from '../../../shared/services/contact-service';
import { Task } from '../../../shared/interfaces/task';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-task-list',
  imports: [SingleTask, DragDropModule, Icon],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
/**
 * TaskList component
 *
 * Represents a column of tasks filtered by a specific status.
 * Handles task rendering, drag-and-drop interactions,
 * and updates task ordering and status changes.
 */
export class TaskList {
  taskService = inject(TaskService);
  contactService = inject(ContactService);

  status = input<Task['status']>('to-do');
  listTitle = input<string>('');

  openTask = output<Task>();
  addTaskRequested = output<Task['status']>();

  tasksByStatus = computed<Array<Task>>(() => {
    return this.taskService.filteredSearchTasks().filter((task) => task.status === this.status());
  });

  connectedLists: Array<string> = ['to-do', 'in-progress', 'await-feedback', 'done'];

  /**
   * Handles drag-and-drop operations between task lists.
   *
   * Updates the task status and order in both
   * the source and target lists, and persists
   * the changes through the task service.
   *
   * @param event The drag-and-drop event data
   * @returns void
   */
  onDrop(event: CdkDragDrop<Array<Task>>): void {
    const movedTask = event.item.data;
    const sourceTasks = event.previousContainer.data;
    const targetTasks = event.container.data;

    sourceTasks.splice(event.previousIndex, 1);
    targetTasks.splice(event.currentIndex, 0, movedTask);
    movedTask.status = this.status;

    this.updateOrders(sourceTasks);
    if (sourceTasks !== targetTasks) {
      this.updateOrders(targetTasks);
    }
  }

  /**
   * Recalculates and persists the order of a task list.
   *
   * @param tasks The tasks to update
   * @returns void
   */
  updateOrders(tasks: Array<Task>): void {
    tasks.forEach((task, index) => {
      task.order = index;
      this.taskService.updateDocument(task, 'tasks');
    });
  }

  /**
   * Handles the add-task action for the current status.
   *
   * Emits a request to create a new task
   * within the current task status.
   *
   * @returns void
   */
  onAddTaskClick(): void {
    this.addTaskRequested.emit(this.status());
  }
}
