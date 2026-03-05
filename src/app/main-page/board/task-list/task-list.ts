import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TaskService } from '../../../shared/services/task-service';
import { SingleTask } from './single-task/single-task';
import { FirebaseService } from '../../../shared/services/firebase-service';
import { Task } from '../../../shared/interfaces/task';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  imports: [SingleTask, DragDropModule],
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
  contactService = inject(FirebaseService);
  @Input() status: Task['status'] = 'to-do';
  @Input() listTitle: string = '';
  @Output() openTask = new EventEmitter<Task>();
  @Output() addTaskRequested = new EventEmitter<Task['status']>();
  connectedLists: Array<string> = ['to-do', 'in-progress', 'await-feedback', 'done'];
  tasksByStatus: Array<Task> = [];

  /**
   * Initializes the component.
   *
   * Loads the tasks for the current status and
   * listens for task update events to refresh the list.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.updateTasks();

    window.addEventListener('tasks-updated', () => {
      this.updateTasks();
    });
  }

  /**
   * Updates the task list based on the current status.
   *
   * Retrieves filtered tasks from the service
   * and keeps only those matching the list status.
   *
   * @returns void
   */
  updateTasks(): void {
    this.tasksByStatus = this.taskService.getFilteredTasks()
      .filter(task => task.status === this.status);
  }

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

    sourceTasks.forEach((task, index) => {
      task.order = index;
      this.taskService.updateDocument(task, 'tasks');
    });

    targetTasks.forEach((task, index) => {
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
    this.addTaskRequested.emit(this.status);
  }
}
