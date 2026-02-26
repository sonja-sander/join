import { Timestamp } from "@angular/fire/firestore";

export interface Task {
  status: 'to-do' | 'in-progress' | 'await-feedback' | 'done';
  order: number;
  id?: string; 
  title: string;
  description: string;
  dueDate: Timestamp; 
  priority: 'low' | 'medium' | 'high';
  assignees: Array<string>; 
  category: 'user-story' | 'technical-task';
  attachments: Array<Attachment>;
  subtasks: Array<Subtask>;
}

export interface Subtask {
  title: string;
  done: boolean;
}

export interface Attachment{
  fileName: string;
  fileType: string;
  fileSize: number;
  base64: string;
}

