import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Home, Edit, Check, Settings, LayoutGrid, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Installation() {
  const {
    installations,
    updateInstallationStatus
  } = useAppStore();

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Calculate overall project installation progress
  const overallProgress = Math.round(
    installations.reduce((sum, item) => sum + item.progress, 0) / installations.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20';
      case 'In Progress': return 'text-sky-400 bg-sky-950/20 border-sky-500/20';
      default: return 'text-gray-400 bg-slate-900 border-white/5';
    }
  };

  const handleSliderChange = (id: string, progressVal: number) => {
    let status = 'In Progress';
    if (progressVal === 0) status = 'Not Started';
    if (progressVal === 100) status = 'Completed';

    const updated = installations.map(item => {
      if (item.id === id) {
        return { ...item, status, progress: progressVal };
      }
      return item;
    });

    // Directly update Zustand store state and persist in local storage
    useAppStore.setState({ installations: updated });
    localStorage.setItem('gs_installations', JSON.stringify(updated));
  };

  const saveNotes = (id: string) => {
    const updated = installations.map(item => {
      if (item.id === id) {
        return { ...item, notes: tempNotes };
      }
      return item;
    });

    useAppStore.setState({ installations: updated });
    localStorage.setItem('gs_installations', JSON.stringify(updated));
    setEditingNotesId(null);
  };

  const startEditingNotes = (item: any) => {
    setEditingNotesId(item.id);
    setTempNotes(item.notes || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Installation Tracker</h2>
          <p className="text-sm text-gray-400">Monitor fit-out progress, adjust completion percentages, and log site status logs.</p>
        </div>

        {/* Overall Progress Widget */}
        <div className="bg-slate-900/60 border border-white/5 px-5 py-3 rounded-2xl flex items-center gap-4 w-full md:w-auto">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Average Fit-Out Done</span>
            <span className="text-lg font-bold text-white font-display">{overallProgress}%</span>
          </div>
          <div className="flex-1 md:w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {installations.map((item: any) => (
          <div
            key={item.id}
            className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Task Title & Status Pill */}
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-sm font-display flex items-center gap-2">
                  <LayoutGrid size={14} className="text-gold" />
                  {item.task} Sourcing Fit-out
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {/* Progress Slider Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <label htmlFor={`installation-slider-${item.id}`} className="cursor-pointer">Interactive Progress Completion</label>
                  <span className="text-white font-bold">{item.progress}%</span>
                </div>
                
                {/* CSS Transition Progress bar background */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden relative border border-white/5 mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="py-2">
                  <input
                    id={`installation-slider-${item.id}`}
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={item.progress}
                    onChange={(e) => handleSliderChange(item.id, parseInt(e.target.value))}
                    aria-label={`Progress for ${item.task}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.progress}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-gold py-2 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notes Details */}
              <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={`installation-notes-input-${item.id}`} className="text-[9px] uppercase font-bold text-gray-500 tracking-wider cursor-pointer">Site Execution Log notes</label>
                  {editingNotesId !== item.id && (
                    <button
                      onClick={() => startEditingNotes(item)}
                      className="text-[9px] text-gold hover:underline font-bold min-h-[32px] flex items-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded px-1 transition-all"
                      aria-label={`Update notes for ${item.task}`}
                    >
                      Update notes
                    </button>
                  )}
                </div>

                {editingNotesId === item.id ? (
                  <div className="space-y-2">
                    <input
                      id={`installation-notes-input-${item.id}`}
                      type="text"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] transition-all"
                      placeholder="Add details on installers, schedules, or fitment checklist..."
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-3 py-1.5 text-xs text-gray-400 hover:text-white min-h-[36px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNotes(item.id)}
                        className="px-4 py-1.5 bg-gold text-slate-950 font-bold rounded text-xs hover:brightness-110 min-h-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 italic leading-relaxed">
                    {item.notes || 'No operational execution details logged yet.'}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Status toggle buttons */}
            <div className="pt-3 border-t border-white/5 flex gap-2">
              <button
                onClick={() => updateInstallationStatus(item.id, 'In Progress')}
                aria-label={`Mark status of ${item.task} as In Progress`}
                className={`flex-1 py-3 rounded-lg text-[10px] font-bold border transition min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
                  item.status === 'In Progress'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                    : 'bg-slate-950 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => updateInstallationStatus(item.id, 'Completed')}
                aria-label={`Mark status of ${item.task} as Completed`}
                className={`flex-1 py-3 rounded-lg text-[10px] font-bold border transition min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
                  item.status === 'Completed'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
