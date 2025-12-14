import React, { useState } from 'react';
import { generateMarketingPlan } from '../services/geminiService';
import { Task } from '../types';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (tasks: Task[]) => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onPlanGenerated }) => {
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const tasks = await generateMarketingPlan(description, startDate);
      onPlanGenerated(tasks);
      onClose();
      setDescription('');
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Project Planner
            </h2>
            <p className="text-indigo-100 text-sm mt-1">Describe your campaign, and we'll build the timeline.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Description</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="e.g., Launch a new organic coffee line in Vietnam targeting Gen Z, including social media influencers and pop-up events."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input 
              type="date"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
