import { TaskCategoryOption } from "../services/task-service"
import { Contact } from "./contact"
import { Attachment, Subtask, Task } from "./task";

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string; 
  priority: Task['priority'];
  assignees: Contact[]; 
  category: TaskCategoryOption | null;
  subtasks: Subtask[];
  attachments: Attachment[];
}
