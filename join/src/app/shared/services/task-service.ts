import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { Task } from '../interfaces/task';
import { Unsubscribe } from '@angular/fire/auth';

export type TaskCategoryOption = { value: Task['category']; label: string };

@Injectable({
  providedIn: 'root',
})
/**
 * TaskService
 *
 * Manages task data stored in Firestore.
 * Handles task retrieval, filtering, creation,
 * updates, deletions, and real-time synchronization.
 */
export class TaskService {
  firestore: Firestore = inject(Firestore);
  tasks: Array<Task> = [];
  taskCategories: TaskCategoryOption[] = [
    { value: 'technical-task', label: 'Technical Task' },
    { value: 'user-story', label: 'User Story' },
  ];
  unsubCollection!: Unsubscribe;
  loading: boolean = true;
  searchTerm: string = '';

  constructor() {
    this.unsubCollection = this.subCollection();
  }

  /**
   * Returns the number of tasks for a given status.
   *
   * @param status The task status to count
   * @returns The number of tasks with the specified status
   */
  getTaskCountByStatus(status: 'to-do' | 'in-progress' | 'await-feedback' | 'done'): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getUrgentTaskCount(): number {
    return this.tasks.filter(task => task.priority === 'high').length;
  }

  getNextDeadline(): Date | null {
    let nextDate: Date | null = null;

    for (const task of this.tasks){
      const date = task.dueDate.toDate();

      if(!nextDate || date < nextDate){
        nextDate = date;
      }
    }
    return nextDate;
  }

  setSearchTerm(term: string): void {
    this.searchTerm = term;
    window.dispatchEvent(new Event('tasks-updated'));
  }

  /**
   * Returns tasks filtered by the current search term.
   *
   * @returns An array of filtered tasks
   */
  getFilteredTasks(): Array<Task> {
    if (!this.searchTerm) return this.tasks;

    return this.tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(this.searchTerm) ||
        task.description.toLowerCase().includes(this.searchTerm) || 
        task.category.toLowerCase().includes(this.searchTerm)
      );
    });
  }

  /**
   * Subscribes to the tasks collection in Firestore.
   *
   * Listens for real-time updates and refreshes
   * the local task array when changes occur.
   *
   * @returns The unsubscribe function for the listener
   */
  subCollection(): Unsubscribe {
    this.loading = true;
    const tasksQuery = query(this.getTasksRef(), orderBy('status'), orderBy('order'));

    return onSnapshot(tasksQuery, (snapshot) => {
      this.tasks.length = 0;
      snapshot.forEach((task) => {
        this.tasks.push(this.mapTaskObj(task.data(), task.id));
      });

      this.loading = false;
      window.dispatchEvent(new Event('tasks-updated'));
    });
  }

  /**
   * Maps raw Firestore data to a Task object.
   *
   * @param obj The raw Firestore document data
   * @param id The document identifier
   * @returns A mapped Task object
   */
  mapTaskObj(obj: any, id: string): Task {
    return {
      id: id,
      status: obj.status || '',
      order: obj.order || 0,
      title: obj.title || '',
      description: obj.description || '',
      dueDate: obj.dueDate || null,
      priority: obj.priority || '',
      assignees: obj.assignees || [],
      category: obj.category || '',
      subtasks: obj.subtasks || [],
    };
  }

  /**
   * Deletes a document from the specified collection.
   *
   * @param colId The collection identifier
   * @param docId The document identifier
   * @returns A promise that resolves when deletion completes
   */
  async deleteDocument(colId: string, docId: string): Promise<void> {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Updates a task document in Firestore.
   *
   * @param item The task to update
   * @param colId The collection identifier
   * @returns A promise that resolves when the update completes
   */
  async updateDocument(item: Task, colId: string): Promise<void> {
    if (item.id) {
      let docRef = this.getSingleDocRef(colId, item.id);
      await updateDoc(docRef, this.getCleanJson(item))
        .catch((err) => {
          console.log(err);
        })
        .then();
    }
  }

  /**
   * Creates a clean JSON object from a task.
   *
   * Used to remove unwanted properties before
   * sending data to Firestore.
   *
   * @param task The task to clean
   * @returns A plain JSON object representing the task
   */
  getCleanJson(task: Task): {} {
    return {
      status: task.status,
      order: task.order,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      assignees: task.assignees,
      category: task.category,
      subtasks: task.subtasks,
    };
  }

  /**
   * Updates only the subtasks of a task in Firestore.
   *
   * @param task The task whose subtasks should be updated
   * @returns A promise that resolves when the update completes
   */
  async updateSubtasks(task: Task): Promise<void> {
    if (task.id) {
      const docRef = this.getSingleDocRef('tasks', task.id);
      await updateDoc(docRef, this.getCleanJsonSubtasks(task))
        .catch((err) => {
          console.log(err);
        })
        .then();
    }
  }

  /**
   * Creates a clean JSON object containing only subtasks.
   *
   * @param task The task containing subtasks
   * @returns A plain JSON object with subtasks only
   */
  getCleanJsonSubtasks(task: Task): {} {
    return {
      subtasks: task.subtasks
    };
  }

  /**
   * Adds a new task document to Firestore.
   *
   * @param item The task to add
   * @returns The created document ID or null if an error occurs
   */
  async addDocument(item: Task): Promise<string | null> {
    try {
      const docRef = await addDoc(this.getTasksRef(), item);
      return docRef.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Cleans up the Firestore subscription when the service is destroyed.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    this.unsubCollection();
  }

  /**
   * Returns a reference to the tasks collection.
   *
   * @returns The Firestore collection reference
   */
  getTasksRef() {
    return collection(this.firestore, 'tasks');
  }

  /**
   * Returns a reference to a single document.
   *
   * @param colId The collection identifier
   * @param docId The document identifier
   * @returns The Firestore document reference
   */
  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
