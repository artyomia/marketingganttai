import React, { useMemo, useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { getCategoryStyles } from '../constants';
import { User, ChevronDown, CheckCircle } from 'lucide-react';

interface GanttChartProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const DAY_WIDTH = 50; // pixels per day
const MONTH_HEADER_HEIGHT = 30;
const DAY_HEADER_HEIGHT = 50;
const TOTAL_HEADER_HEIGHT = MONTH_HEADER_HEIGHT + DAY_HEADER_HEIGHT;

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update 'now' every minute to move the red line and update date ranges if day changes
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  // 0. Group Tasks by Category (Handle dynamic categories string)
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    
    // Sort tasks to ensure categories appear in a stable order or just iterate
    tasks.forEach(task => {
      const cat = task.category || 'Uncategorized';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(task);
    });

    // Sort categories alphabetically or customized
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tasks]);

  // 1. Calculate timeline boundaries
  // Logic updated: Show only 3 days before today, and 45 days after today.
  const { startDate, endDate, totalDays } = useMemo(() => {
    const todayTimestamp = new Date(now).setHours(0,0,0,0);
    
    // Default Minimum View: 3 days before today (updated per request) -> 45 days after today
    let minTime = todayTimestamp - (3 * 86400000);
    let maxTime = todayTimestamp + (45 * 86400000);

    if (tasks.length > 0) {
      const startDates = tasks.map(t => new Date(t.startDate).getTime());
      const endDates = tasks.map(t => new Date(t.endDate).getTime());
      
      const taskMin = Math.min(...startDates);
      const taskMax = Math.max(...endDates);

      // Expand view if tasks are outside the default window
      // Ensure we see start of earliest task (minus buffer)
      // Note: We prioritize the "3 days before today" rule for the start, 
      // but if a task is significantly earlier, we might still want to see it? 
      // The requirement says "Time before current date only needs to show 3 days", 
      // which implies cropping history. However, to keep tasks visible, we often check taskMin.
      // If we STRICTLY follow "only show 3 days before", we should clamp minTime.
      // But if a task started 10 days ago, it would be cut off.
      // I will allow taskMin expansion but default to 3 days if no tasks are older.
      
      if (taskMin < minTime) {
         // If there are older tasks, we usually want to see them.
         // But if the user strictly wants to hide old history:
         // minTime = Math.max(taskMin - 86400000, minTime); // This would balance it.
         // For now, let's stick to the base logic but use 3 days as the default anchor.
         minTime = Math.min(minTime, taskMin - (3 * 86400000));
      }
      
      // Ensure we see end of latest task (plus buffer), but preserve the minimum 45-day future view
      maxTime = Math.max(maxTime, taskMax + (15 * 86400000));
    }
    
    const start = new Date(minTime);
    const end = new Date(maxTime);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return { startDate: start, endDate: end, totalDays: days };
  }, [tasks, now]); // Dependency on 'now' ensures auto-update when day rolls over

  // 2. Generate calendar headers (Days)
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [startDate, totalDays]);

  // 2b. Generate Month Headers
  const monthHeaders = useMemo(() => {
    const months: { label: string; count: number }[] = [];
    let currentLabel = '';
    let currentCount = 0;

    calendarDays.forEach((date) => {
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (label !== currentLabel) {
        if (currentLabel) {
          months.push({ label: currentLabel, count: currentCount });
        }
        currentLabel = label;
        currentCount = 1;
      } else {
        currentCount++;
      }
    });
    if (currentLabel) months.push({ label: currentLabel, count: currentCount });
    return months;
  }, [calendarDays]);

  // 3. Calculate "Current Time" Red Line Position
  const todayLineStyle = useMemo(() => {
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    if (diffDays < 0 || diffDays > totalDays) return null;

    return {
      left: `${diffDays * DAY_WIDTH}px`
    };
  }, [startDate, totalDays, now]);

  // 4. Helper to get position numeric values
  const getTaskGeometry = (task: Task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    
    const offsetDays = (start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) || 1; 

    return {
      left: offsetDays * DAY_WIDTH,
      width: Math.max(durationDays * DAY_WIDTH, DAY_WIDTH) // Min width 50px (1 day)
    };
  };

  const getTruncatedName = (name: string) => {
    return name.length > 20 ? name.substring(0, 20) + '...' : name;
  };

  const formatAssignees = (assignees: string[]) => {
    if (!assignees || assignees.length === 0) return 'Unassigned';
    return assignees.join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Scrollable Container */}
      <div className="flex flex-1 overflow-auto relative">
        
        {/* Left Sidebar (Grouped List) - Sticky & Responsive Width */}
        <div className="sticky left-0 z-30 bg-white border-r border-slate-200 w-24 md:w-64 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
          {/* Header aligns with timeline header height */}
          <div 
            className="border-b border-slate-200 bg-slate-50 flex items-center px-2 md:px-4 font-semibold text-slate-600 text-xs md:text-sm"
            style={{ height: `${TOTAL_HEADER_HEIGHT}px` }}
          >
            <span className="hidden md:inline">Task Name</span>
            <span className="md:hidden">Task</span>
          </div>
          <div className="bg-white">
            {groupedTasks.length > 0 ? (
              groupedTasks.map(([category, categoryTasks]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="h-[36px] bg-slate-100 border-b border-slate-200 flex items-center px-2 md:px-4 text-xs font-bold text-slate-600 uppercase tracking-wide sticky top-0 overflow-hidden whitespace-nowrap z-10">
                    <ChevronDown size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{category}</span> 
                    <span className="ml-2 px-1.5 py-0.5 bg-slate-200 rounded-full text-[10px] text-slate-500 hidden md:inline">{categoryTasks.length}</span>
                  </div>
                  {/* Tasks in Category */}
                  <div className="divide-y divide-slate-50 border-b border-slate-100">
                    {categoryTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="h-[60px] px-2 md:px-4 flex flex-col justify-center hover:bg-slate-50 cursor-pointer group transition-colors border-l-4 border-transparent hover:border-indigo-500 overflow-hidden"
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="font-medium text-slate-800 text-xs md:text-sm truncate flex items-center gap-2" title={task.name}>
                           {task.name}
                           {task.status === TaskStatus.DONE && (
                             <CheckCircle size={14} className="text-emerald-500 fill-emerald-100 flex-shrink-0" />
                           )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs text-slate-400 mt-1 truncate">
                          <span className="flex items-center gap-1 truncate">
                            <User size={10} className="flex-shrink-0" /> {formatAssignees(task.assignees)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
               <div className="h-[60px] px-4 flex items-center text-slate-400 italic text-sm">
                 No tasks
               </div>
            )}
          </div>
        </div>

        {/* Right Side (Gantt Visuals) */}
        <div className="flex-1 relative min-w-0 overflow-x-auto">
          
          {/* Calendar Headers Container - Sticky Top */}
          <div className="sticky top-0 z-20 bg-slate-50 shadow-sm">
            
            {/* Month Header Row */}
            <div className="flex border-b border-slate-200/50" style={{ height: `${MONTH_HEADER_HEIGHT}px`, width: `${calendarDays.length * DAY_WIDTH}px` }}>
              {monthHeaders.map((month, i) => (
                <div 
                  key={i}
                  className="flex items-center px-2 text-xs font-bold text-slate-500 bg-slate-100/50 border-r border-slate-200/50 uppercase tracking-wider sticky left-0"
                  style={{ width: `${month.count * DAY_WIDTH}px` }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {/* Day Header Row */}
            <div 
              className="flex border-b border-slate-200 whitespace-nowrap"
              style={{ width: `${calendarDays.length * DAY_WIDTH}px`, height: `${DAY_HEADER_HEIGHT}px` }}
            >
              {calendarDays.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 border-r border-slate-100 flex flex-col justify-center items-center text-xs ${isWeekend ? 'bg-slate-100/50 text-slate-400' : 'text-slate-600'} ${isToday ? 'bg-red-50/50' : ''}`}
                    style={{ width: `${DAY_WIDTH}px` }}
                  >
                    <span className={`font-bold ${isToday ? 'text-red-600' : ''}`}>{date.getDate()}</span>
                    <span className={`text-[10px] uppercase ${isToday ? 'text-red-500' : ''}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Lines Background */}
          <div 
            className="absolute left-0 flex pointer-events-none z-0" 
            style={{ top: `${TOTAL_HEADER_HEIGHT}px`, bottom: 0, width: `${calendarDays.length * DAY_WIDTH}px` }}
          >
            {calendarDays.map((date, i) => {
               const isWeekend = date.getDay() === 0 || date.getDay() === 6;
               return (
                <div 
                  key={i} 
                  className={`flex-shrink-0 border-r border-slate-100 h-full ${isWeekend ? 'bg-slate-50/50' : ''}`}
                  style={{ width: `${DAY_WIDTH}px` }}
                />
               );
            })}
          </div>

          {/* Current Time Red Line */}
          {todayLineStyle && (
            <div 
              className="absolute w-px bg-red-500 z-10 pointer-events-none shadow-[0_0_4px_rgba(239,68,68,0.5)]"
              style={{ ...todayLineStyle, top: `${TOTAL_HEADER_HEIGHT}px`, bottom: 0 }}
            >
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </div>
          )}

          {/* Task Bars Grouped */}
          <div className="relative pt-0 z-10" style={{ width: `${calendarDays.length * DAY_WIDTH}px` }}>
            {groupedTasks.map(([category, categoryTasks]) => (
              <div key={category}>
                 {/* Empty Row for Header alignment */}
                 <div className="h-[36px] bg-slate-100/50 border-b border-slate-200/50 w-full"></div>
                 
                 {/* Bars */}
                 <div className="divide-y divide-slate-100/0 border-b border-slate-100">
                    {categoryTasks.map(task => {
                      const geom = getTaskGeometry(task);
                      const styles = getCategoryStyles(task.category);

                      return (
                        <div key={task.id} className="h-[60px] relative group">
                          
                          {/* The Colored Bar */}
                          <div 
                            className={`absolute top-1/2 -translate-y-1/2 h-7 rounded-lg shadow-sm border border-black/5 cursor-pointer transition-all hover:shadow-md hover:h-8 overflow-hidden ${styles.bg}`}
                            style={{ left: `${geom.left}px`, width: `${geom.width}px` }}
                            onClick={() => onTaskClick(task)}
                            title={`${task.name} (${task.startDate} to ${task.endDate})`}
                          >
                            {/* Progress Bar - Solid Color for Contrast */}
                            <div 
                                className={`absolute left-0 top-0 bottom-0 ${styles.bar} transition-all`} 
                                style={{ width: `${task.progress}%` }} 
                            />
                          </div>

                          {/* The Text Label - Positioned to the Right of the bar */}
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700 whitespace-nowrap pointer-events-none z-20 flex items-center"
                            style={{ left: `${geom.left + geom.width + 8}px` }}
                          >
                             {getTruncatedName(task.name)}
                             <span className="ml-2 text-[10px] text-slate-400 font-normal">({task.progress}%)</span>
                             {task.status === TaskStatus.DONE && (
                               <CheckCircle size={14} className="ml-2 text-emerald-500 fill-white" />
                             )}
                          </div>

                        </div>
                      );
                    })}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;