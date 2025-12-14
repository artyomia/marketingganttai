import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Task, TaskStatus } from '../types';
import { getCategoryStyles } from '../constants';
import { CheckCircle, Calendar } from 'lucide-react';

interface StatsDashboardProps {
  tasks: Task[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ tasks }) => {
  
  // Extract hex color from tailwind class name helper
  // Mapping predefined tailwind classes to approximate hex for Recharts
  const getHexColor = (tailwindClass: string) => {
    if (tailwindClass.includes('indigo')) return '#6366f1';
    if (tailwindClass.includes('rose')) return '#f43f5e';
    if (tailwindClass.includes('emerald')) return '#10b981';
    if (tailwindClass.includes('purple')) return '#a855f7';
    if (tailwindClass.includes('pink')) return '#ec4899';
    if (tailwindClass.includes('blue')) return '#3b82f6';
    if (tailwindClass.includes('orange')) return '#f97316';
    if (tailwindClass.includes('cyan')) return '#06b6d4';
    if (tailwindClass.includes('gray')) return '#6b7280';
    return '#cbd5e1';
  };

  // Prepare data for Category Distribution (Dynamic)
  const categoryCounts: Record<string, number> = {};
  tasks.forEach(t => {
     const cat = t.category || 'Uncategorized';
     categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => {
     const styles = getCategoryStyles(name);
     return {
        name,
        value,
        fill: getHexColor(styles.bar)
     };
  });

  // Prepare data for Status Distribution
  const statusData = Object.values(TaskStatus).map(stat => ({
    name: stat,
    value: tasks.filter(t => t.status === stat).length
  })).filter(item => item.value > 0);

  const STATUS_CHART_COLORS = ['#cbd5e1', '#60a5fa', '#10b981', '#f87171'];

  // Calculate Average Progress
  const avgProgress = Math.round(tasks.reduce((acc, curr) => acc + curr.progress, 0) / (tasks.length || 1));

  // Get Completed Tasks sorted by endDate (recent first)
  const completedTasks = tasks
    .filter(t => t.status === TaskStatus.DONE)
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      
      {/* Overview Card */}
      <div className="md:col-span-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
         <div>
            <h3 className="text-lg font-semibold opacity-90">Overall Project Health</h3>
            <p className="text-slate-300 text-sm">Tracking {tasks.length} active tasks</p>
         </div>
         <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">{avgProgress}%</div>
            <div className="text-xs text-slate-300 uppercase tracking-wider">Avg Completion</div>
         </div>
      </div>

      {/* Completed Tasks List */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-emerald-500" />
          Recently Completed Tasks
        </h3>
        {completedTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {completedTasks.map(task => (
              <div key={task.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex flex-col gap-2 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-800 text-sm line-clamp-1" title={task.name}>{task.name}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-bold uppercase">Done</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-auto">
                  <Calendar size={12} />
                  <span>Finished: {new Date(task.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            No completed tasks yet. Keep going!
          </div>
        )}
      </div>

      {/* Tasks by Category - Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Tasks by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} textAnchor="middle" height={30} />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Status - Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Task Status Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_CHART_COLORS[index % STATUS_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;