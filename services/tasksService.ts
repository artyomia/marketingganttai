import { supabase } from './supabaseClient';
import { Task, TaskStatus } from '../types';

export type Task = {
  id?: string;
  title: string;
  category?: string;
  owner?: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
};

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Fetch tasks error:', error);
    throw error;
  }

  // Map DB row -> UI Task
  const tasks: Task[] = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.title ?? 'Untitled',
    startDate: row.start_date,
    endDate: row.end_date,
    category: row.category ?? 'Digital',
    status: (row.status as TaskStatus) ?? TaskStatus.TODO,
    assignees: row.assignees ?? [],
    progress: row.progress ?? 0,
    description: row.description ?? '',
  }));

  return tasks;
}
