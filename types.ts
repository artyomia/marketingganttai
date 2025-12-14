export const DEFAULT_CATEGORIES = [
  'Digital',
  'Event',
  'Sale',
  'Content',
  'Design',
  'Planning',
  'Review'
];

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  BLOCKED = 'Blocked'
}

export interface Task {
  id: string;
  name: string;
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string;   // ISO Date string YYYY-MM-DD
  category: string;  // Changed to string to allow custom categories
  status: TaskStatus;
  assignees: string[]; // Changed to array for multiple assignees
  description?: string;
  progress: number; // 0-100
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  categoryDistribution: { name: string; value: number }[];
}
