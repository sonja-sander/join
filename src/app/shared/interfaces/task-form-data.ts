import { TaskCategoryOption } from '../services/task-service';
import { Contact } from './contact';
import { Attachment, Subtask, Task } from './task';

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: Task['priority'];
  assignees: Array<Contact>;
  category: TaskCategoryOption | null;
  subtasks: Array<Subtask>;
  attachments: Array<Attachment>;
}

export interface SubtaskFormData {
  title: string;
  editingIndex: number | null;
}
