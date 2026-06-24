import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LayoutGrid } from 'lucide-react';
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
      case 'Completed': return 'text-[#8AA17A] bg-[#8AA17A]/10 border-[#8AA17A]/20';
      case 'In Progress': return 'text-[#A8B89A] bg-[#A8B89A]/10 border-[#A8B89A]/20';
      default: return 'text-[#7D7D7D] bg-[#F8F6F3] border-slate-100';
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
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Installation Tracker</h2>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">Monitor fit-out progress, adjust completion percentages, and log site status logs.</p>
        </div>

        {/* Overall Progress Widget */}
        <div className="bg-white border border-[#A8B89A]/15 px-5 py-3 rounded-2xl flex items-center gap-4 w-full md:w-auto shadow-sm">
          <div>
            <span className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Average Fit-Out Done</span>
            <span className="text-lg font-semibold text-[#4B4B4B] font-display">{overallProgress}%</span>
          </div>
          <div className="flex-1 md:w-24 h-2 bg-[#F8F6F3] rounded-full overflow-hidden border border-slate-100">
            <div
              className="h-full bg-[#A8B89A] transition-all duration-500"
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
            className="bg-white border border-[#A8B89A]/10 p-6 rounded-[24px] space-y-5 shadow-sm hover:border-[#A8B89A]/30 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Task Title & Status Pill */}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-[#4B4B4B] text-sm font-display flex items-center gap-2">
                  <LayoutGrid size={14} className="text-[#A8B89A]" />
                  {item.task} Sourcing Fit-out
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {/* Progress Slider Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[#7D7D7D]">
                  <label htmlFor={`installation-slider-${item.id}`} className="cursor-pointer font-light">Interactive Progress Completion</label>
                  <span className="text-[#4B4B4B] font-bold">{item.progress}%</span>
                </div>
                
                {/* CSS Transition Progress bar background */}
                <div className="w-full h-2 bg-[#F8F6F3] rounded-full overflow-hidden relative border border-slate-100 mb-1">
                  <div
                    className="h-full bg-[#A8B89A] transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="py-1">
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
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#A8B89A] outline-none"
                  />
                </div>
              </div>

              {/* Notes Details */}
              <div className="bg-[#F8F6F3] border border-[#A8B89A]/10 p-4 rounded-2xl space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center">
                  <label htmlFor={`installation-notes-input-${item.id}`} className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider cursor-pointer">Site Execution Log notes</label>
                  {editingNotesId !== item.id && (
                    <button
                      onClick={() => startEditingNotes(item)}
                      className="text-[9px] text-[#A8B89A] hover:underline font-bold min-h-[24px] flex items-center outline-none transition-all"
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
                      className="w-full bg-white border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] min-h-[40px] transition-all"
                      placeholder="Add details on installers, schedules, or fitment checklist..."
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-3 py-1 text-xs text-[#7D7D7D] hover:text-[#4B4B4B]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNotes(item.id)}
                        className="px-3 py-1 bg-[#8AA17A] text-white font-bold rounded-lg text-xs hover:bg-[#788E69]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#7D7D7D] italic leading-relaxed font-light">
                    {item.notes || 'No operational execution details logged yet.'}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Status toggle buttons */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => updateInstallationStatus(item.id, 'In Progress')}
                aria-label={`Mark status of ${item.task} as In Progress`}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition min-h-[38px] flex items-center justify-center outline-none ${
                  item.status === 'In Progress'
                    ? 'bg-[#A8B89A]/10 border-[#A8B89A] text-[#A8B89A]'
                    : 'bg-white border-slate-100 text-[#7D7D7D] hover:text-[#4B4B4B] hover:bg-slate-50'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => updateInstallationStatus(item.id, 'Completed')}
                aria-label={`Mark status of ${item.task} as Completed`}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition min-h-[38px] flex items-center justify-center outline-none ${
                  item.status === 'Completed'
                    ? 'bg-[#8AA17A]/10 border-[#8AA17A] text-[#8AA17A]'
                    : 'bg-white border-slate-100 text-[#7D7D7D] hover:text-[#4B4B4B] hover:bg-slate-50'
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
