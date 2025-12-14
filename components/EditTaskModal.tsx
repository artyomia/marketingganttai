import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, DEFAULT_CATEGORIES } from '../types';
import { X, Save, Trash2, Check, ChevronDown } from 'lucide-react';
import { ASSIGNEES } from '../constants';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => prev ? { ...prev, [field]: value } : null);
  };

  const toggleAssignee = (person: string) => {
    if (!editedTask) return;
    const currentAssignees = editedTask.assignees || [];
    const newAssignees = currentAssignees.includes(person)
      ? currentAssignees.filter(p => p !== person)
      : [...currentAssignees, person];
    handleChange('assignees', newAssignees);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  // High contrast dark theme styles
  const inputClass = "w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-colors";
  const labelClass = "block text-xs font-medium text-slate-300 uppercase mb-1 tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 my-auto">
        
        <div className="bg-slate-900/50 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0">
          <h3 className="font-semibold text-white text-lg">Edit Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Task Name</label>
            <input 
              type="text" 
              required
              className={inputClass}
              value={editedTask.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input 
                type="date" 
                required
                className={`${inputClass} [color-scheme:dark]`}
                value={editedTask.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input 
                type="date" 
                required
                className={`${inputClass} [color-scheme:dark]`}
                value={editedTask.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Assignees (Multi-select)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ASSIGNEES.map(person => {
                const isSelected = editedTask.assignees?.includes(person);
                return (
                  <div 
                    key={person}
                    onClick={() => toggleAssignee(person)}
                    className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all select-none ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-white border-white text-indigo-600' : 'border-slate-400'}`}>
                      {isSelected && <Check size={12} strokeWidth={4} />}
                    </div>
                    {person}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
               <label className={labelClass}>Category (Select or Type)</label>
               <div className="relative">
                 <input 
                    type="text"
                    className={`${inputClass} pr-10`}
                    value={editedTask.category}
                    onChange={(e) => {
                        handleChange('category', e.target.value);
                        setIsCategoryDropdownOpen(true);
                    }}
                    onFocus={() => setIsCategoryDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                    placeholder="Type to add new..."
                 />
                 <button 
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                 >
                    <ChevronDown size={16} />
                 </button>
               </div>
               
               {isCategoryDropdownOpen && (
                 <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                   {DEFAULT_CATEGORIES.map(cat => (
                     <div 
                       key={cat} 
                       className="px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors"
                       onMouseDown={(e) => {
                         e.preventDefault(); // Prevent input blur
                         handleChange('category', cat);
                         setIsCategoryDropdownOpen(false);
                       }}
                     >
                       {cat}
                     </div>
                   ))}
                 </div>
               )}
            </div>
            <div>
              <label className={labelClass}>Progress (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                className={inputClass}
                value={editedTask.progress}
                onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select 
                className={inputClass}
                value={editedTask.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status} className="bg-slate-700 text-white">{status}</option>
                ))}
              </select>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-700 mt-2">
            {onDelete && (
                <button 
                type="button"
                onClick={() => {
                    if(confirm('Are you sure you want to delete this task?')) {
                        onDelete(editedTask.id);
                        onClose();
                    }
                }}
                className="px-4 py-2 text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-rose-400/20"
                >
                <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                </button>
            )}
            <div className="flex-1"></div>
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
