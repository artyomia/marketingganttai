import { TaskStatus, DEFAULT_CATEGORIES } from './types';

export const ASSIGNEES = ['Tuan', 'Tu'];

// Predefined palettes for consistent coloring
const COLOR_PALETTE = [
  { bar: 'bg-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bar: 'bg-rose-500', bg: 'bg-rose-100', text: 'text-rose-800' },
  { bar: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bar: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-800' },
  { bar: 'bg-pink-500', bg: 'bg-pink-100', text: 'text-pink-800' },
  { bar: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-800' },
  { bar: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-800' },
  { bar: 'bg-cyan-500', bg: 'bg-cyan-100', text: 'text-cyan-800' },
];

// Helper to get color based on category string (deterministic)
export const getCategoryStyles = (category: string) => {
  if (!category) return COLOR_PALETTE[0];
  
  // Specific overrides for default categories to match original design if desired
  const normalized = category.toLowerCase();
  if (normalized.includes('digital')) return COLOR_PALETTE[0];
  if (normalized.includes('event')) return COLOR_PALETTE[1];
  if (normalized.includes('sale')) return COLOR_PALETTE[2];
  if (normalized.includes('content')) return COLOR_PALETTE[3];
  if (normalized.includes('design')) return COLOR_PALETTE[4];
  if (normalized.includes('plan')) return COLOR_PALETTE[5];

  // Hash string to pick a palette index
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-slate-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-400',
  [TaskStatus.DONE]: 'bg-emerald-500',
  [TaskStatus.BLOCKED]: 'bg-red-400',
};

export const INITIAL_TASKS = [
  {
    id: '1',
    name: 'Q3 Digital Strategy',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    category: 'Digital',
    status: TaskStatus.DONE,
    assignees: ['Tu'],
    progress: 100
  },
  {
    id: '2',
    name: 'Summer Sale Promo',
    startDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    category: 'Sale',
    status: TaskStatus.IN_PROGRESS,
    assignees: ['Tuan'],
    progress: 40
  },
  {
    id: '3',
    name: 'Launch Event Setup',
    startDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    category: 'Event',
    status: TaskStatus.TODO,
    assignees: ['Tu', 'Tuan'],
    progress: 0
  }
];
