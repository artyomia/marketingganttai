import React, { useState, useEffect } from 'react';
import { Plus, BarChart2, Calendar, Sparkles } from 'lucide-react';
import GanttChart from './components/GanttChart';
import StatsDashboard from './components/StatsDashboard';
import AIModal from './components/AIModal';
import EditTaskModal from './components/EditTaskModal';
import { Task, TaskStatus } from './types';
import { INITIAL_TASKS } from './constants';
import { fetchTasks, createTask } from './services/tasksService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'gantt' | 'stats'>('gantt');
  const [isAIModalOpen, setAIModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
  fetchTasks()
    .then((data) => {
      setTasks(data);
    })
    .catch((err) => {
      console.error('Load tasks failed:', err);
    });
}, []);

const handleAddTask = async () => {
  try {
    // 1) Tạo task theo schema DB (Supabase)
    const dbTask = {
      title: 'New Task',
      category: 'Digital',
      owner: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      progress: 0,
      status: TaskStatus.TODO,
      assignees: [],
      description: '',
    };

    // 2) Lưu vào Supabase
    const saved = await createTask(dbTask as any);

    // 3) Map dữ liệu DB -> UI Task (để Gantt/Modal hiểu)
    const uiTask: Task = {
      id: saved.id,
      name: saved.title ?? 'New Task',
      startDate: saved.start_date,
      endDate: saved.end_date,
      category: saved.category ?? 'Digital',
      status: saved.status ?? TaskStatus.TODO,
      assignees: saved.assignees ?? [],
      progress: saved.progress ?? 0,
    };

    // 4) Giữ nguyên hành vi cũ: add vào list + mở modal edit
    setTasks([...tasks, uiTask]);
    setEditingTask(uiTask);
  } catch (err) {
    console.error('Add task failed:', err);
  }
};

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };

  const handleAIPlanGenerated = (newTasks: Task[]) => {
    setTasks(newTasks);
    setView('gantt'); // Switch to Gantt view to see the result
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Navbar - Responsive */}
      <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Logo Replacement: Ensure you have a 'logo.png' in your public folder */}
          <img 
            src="/logo.png" 
            alt="Trans Machine Technologies" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback Text Logo */}
          <h1 className="hidden text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-tight">
             <span className="hidden md:inline">Trans Machine</span>
             <span className="md:hidden">Trans M.</span>
             <span className="text-indigo-600 block md:inline md:ml-2 text-xs md:text-xl font-normal md:font-bold">Tracking</span>
          </h1>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('gantt')}
            className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${view === 'gantt' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-1 md:gap-2"><Calendar size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Gantt</span></span>
          </button>
          <button 
             onClick={() => setView('stats')}
             className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${view === 'stats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-1 md:gap-2"><BarChart2 size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Stats</span></span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setAIModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs md:text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">Generate</span>
          </button>
          <button 
            onClick={handleAddTask}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Add Empty Task"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-6 overflow-hidden flex flex-col">
        {view === 'gantt' ? (
          <div className="flex-1 min-h-0 flex flex-col">
             <div className="mb-2 md:mb-4 flex items-center justify-between">
                <div>
                   <h2 className="text-lg md:text-2xl font-bold text-slate-800">Timeline</h2>
                   <p className="text-slate-500 text-xs md:text-sm hidden sm:block">Manage your marketing tasks and milestones.</p>
                </div>
                <div className="text-xs text-slate-400">
                   {tasks.length} tasks
                </div>
             </div>
             
             <div className="flex-1 min-h-0">
               <GanttChart tasks={tasks} onTaskClick={handleTaskClick} />
             </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
             <div className="mb-4">
               <h2 className="text-xl md:text-2xl font-bold text-slate-800">Project Analytics</h2>
               <p className="text-slate-500 text-sm">Visualize progress and resource distribution.</p>
             </div>
             <StatsDashboard tasks={tasks} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-8 md:h-10 border-t border-slate-200 bg-white flex items-center justify-center text-[10px] md:text-xs text-slate-400">
        &copy; 2024 Trans Machine. Powered by Google Gemini.
      </footer>

      {/* Modals */}
      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setAIModalOpen(false)} 
        onPlanGenerated={handleAIPlanGenerated} 
      />

      <EditTaskModal 
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default App;

