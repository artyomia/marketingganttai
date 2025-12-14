import { supabase } from './supabaseClient';

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

  return data as Task[];
}

export async function createTask(task: Task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Create task error:', error);
    throw error;
  }

  return data as Task;
}
