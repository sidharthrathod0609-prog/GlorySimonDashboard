import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SiteVisits() {
  const {
    projects,
    activeProjectId,
    projectDetails,
    createSiteVisit,
    setActiveProjectId
  } = useAppStore();

  // Calendar State: Default to June 2026 to align with seeded data
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, so 5 is June
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  const [formData, setFormData] = useState({
    visitorName: '',
    visitTime: '10:00',
    notes: ''
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Load visits
  const visits = projectDetails?.visits || [];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCellClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setSelectedDateStr(`${currentYear}-${formattedMonth}-${formattedDay}`);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) {
      alert('Please select an active project workspace first.');
      return;
    }
    if (!formData.visitorName) {
      alert('Please enter visitor name.');
      return;
    }

    // Combine date and time
    const dateTimeStr = `${selectedDateStr}T${formData.visitTime}:00`;

    // Pass BOTH camelCase and snake_case keys to support both backend and mock database services
    await createSiteVisit({
      visitDate: dateTimeStr,
      visit_date: dateTimeStr,
      visitorName: formData.visitorName,
      visitor_name: formData.visitorName,
      notes: formData.notes,
      photos: '/assets/photos/visit_generic.svg'
    });

    setFormData({ visitorName: '', visitTime: '10:00', notes: '' });
    setShowAddModal(false);
    alert('Site visit logged successfully.');
  };

  // Generate calendar day cells
  const calendarCells = [];
  // Empty slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="min-h-[50px] sm:min-h-[110px] bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/60 dark:border-slate-800/40 opacity-40 rounded-xl" />);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const cellDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    // Filter visits on this day
    const dayVisits = visits.filter((v: any) => {
      const vDate = v.visit_date || v.visitDate;
      return vDate && vDate.startsWith(cellDateStr);
    });

    calendarCells.push(
      <div
        key={`day-${day}`}
        onClick={() => handleCellClick(day)}
        className={`min-h-[70px] sm:min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-all rounded-xl border duration-200 hover:scale-[1.01] hover:shadow-md ${
          dayVisits.length > 0
            ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-l-2 border-l-[#A8B89A] border-slate-150 dark:border-slate-800/60 hover:bg-emerald-500/10'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-[#A8B89A]/30'
        }`}
      >
        <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full select-none self-end ${
          dayVisits.length > 0 
            ? 'bg-[#A8B89A] text-white shadow-sm' 
            : 'text-[#7D7D7D] dark:text-slate-400'
        }`}>
          {day}
        </span>
        
        {/* Full text list on desktop */}
        <div className="mt-1 space-y-1 overflow-y-auto max-h-[75px] pr-0.5 w-full hidden sm:block">
          {dayVisits.map((v: any) => {
            const vDate = v.visit_date || v.visitDate;
            const timeStr = vDate ? new Date(vDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
            
            // Creative color-coding based on role
            let pillClass = 'bg-[#A8B89A]/10 dark:bg-[#A8B89A]/20 text-[#4B4B4B] dark:text-slate-200 border border-[#A8B89A]/20';
            const nameLower = (v.visitor_name || v.visitorName || '').toLowerCase();
            if (nameLower.includes('designer')) {
              pillClass = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20';
            } else if (nameLower.includes('client')) {
              pillClass = 'bg-[#D7B57D]/10 dark:bg-[#D7B57D]/20 text-[#A68042] dark:text-[#E8C58D] border border-[#D7B57D]/20';
            } else if (nameLower.includes('engineer') || nameLower.includes('manager')) {
              pillClass = 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-850 dark:text-sky-305 border border-sky-500/20';
            }

            return (
              <div
                key={v.id}
                className={`rounded px-1.5 py-0.5 text-[9px] truncate font-semibold shadow-2xs ${pillClass}`}
                title={`${v.visitor_name || v.visitorName} @ ${timeStr}\n${v.notes}`}
              >
                {timeStr} - {v.visitor_name || v.visitorName}
              </div>
            );
          })}
        </div>

        {/* Mobile indicator dots */}
        <div className="flex flex-wrap gap-0.5 justify-center mt-1 sm:hidden">
          {dayVisits.map((v: any) => {
            let dotClass = 'bg-[#A8B89A]';
            const nameLower = (v.visitor_name || v.visitorName || '').toLowerCase();
            if (nameLower.includes('designer')) {
              dotClass = 'bg-emerald-500';
            } else if (nameLower.includes('client')) {
              dotClass = 'bg-[#D7B57D]';
            } else if (nameLower.includes('engineer') || nameLower.includes('manager')) {
              dotClass = 'bg-sky-500';
            }
            return (
              <span key={v.id} className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] dark:text-white font-display">Site Visit Scheduler</h2>
          <p className="text-xs text-[#7D7D7D] dark:text-slate-400 font-light mt-1">Log client measurements checkups, designer consultations, and supervisor reports.</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-[#A8B89A]/15 dark:border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-sm">
          <label htmlFor="workspace-select" className="text-[10px] text-[#7D7D7D] dark:text-slate-400 font-bold uppercase tracking-wider cursor-pointer">Active Project:</label>
          <select
            id="workspace-select"
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(Number(e.target.value))}
            className="bg-transparent text-xs text-[#A8B89A] font-bold focus:outline-none outline-none cursor-pointer"
          >
            <option value="" disabled className="text-[#7D7D7D] dark:text-slate-400">Choose Project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-[#4B4B4B] dark:text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!activeProjectId ? (
        <div className="bg-white dark:bg-slate-900 border border-[#A8B89A]/10 dark:border-slate-800/80 rounded-[24px] p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-[#C89A9A] mx-auto">
            <CalendarIcon size={24} />
          </div>
          <h3 className="text-lg font-light text-[#4B4B4B] dark:text-white">No Project Workspace Selected</h3>
          <p className="text-xs text-[#7D7D7D] dark:text-slate-400 font-light max-w-md mx-auto">
            Please choose a project workspace from the header dropdown to access the site visit schedules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid View */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-905 border border-[#A8B89A]/10 dark:border-slate-800/80 p-4 sm:p-5 rounded-[24px] space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/50">
              <h3 className="text-sm font-semibold text-[#4B4B4B] dark:text-white font-display">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[#7D7D7D] dark:text-slate-400 hover:text-[#4B4B4B] dark:hover:text-white transition min-h-[32px] flex items-center justify-center cursor-pointer"
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[#7D7D7D] dark:text-slate-400 hover:text-[#4B4B4B] dark:hover:text-white transition min-h-[32px] flex items-center justify-center cursor-pointer"
                  aria-label="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map(day => (
                <div key={day} className="text-[10px] uppercase font-bold text-[#7D7D7D] dark:text-slate-400 py-1">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="inline sm:hidden">{day[0]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid cells */}
            <div className="grid grid-cols-7 gap-1.5 bg-slate-50/50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
              {calendarCells}
            </div>
          </div>

          {/* Visits Detail Feed panel */}
          <div className="bg-white dark:bg-slate-905 border border-[#A8B89A]/10 dark:border-slate-800/80 p-4 sm:p-6 rounded-[24px] space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#4B4B4B] dark:text-white font-display">Upcoming Logs Registry</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {visits.map((v: any) => {
                  const vDate = v.visit_date || v.visitDate;
                  const dateObj = vDate ? new Date(vDate) : null;
                  const formattedDate = dateObj ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  const formattedTime = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

                  let borderClass = 'border-[#A8B89A]/15';
                  const nameLower = (v.visitor_name || v.visitorName || '').toLowerCase();
                  if (nameLower.includes('designer')) {
                    borderClass = 'border-emerald-500/20';
                  } else if (nameLower.includes('client')) {
                    borderClass = 'border-[#D7B57D]/20';
                  } else if (nameLower.includes('engineer') || nameLower.includes('manager')) {
                    borderClass = 'border-sky-500/20';
                  }

                  return (
                    <div key={v.id} className={`p-3.5 bg-[#F8F6F3] dark:bg-slate-900/60 border ${borderClass} rounded-2xl space-y-2 shadow-xs`}>
                      <div className="flex justify-between items-center text-[10px] text-[#7D7D7D] dark:text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Clock size={10} className="text-[#A8B89A]" /> {formattedTime} • {formattedDate}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#4B4B4B] dark:text-white flex items-center gap-1">
                          <User size={10} className="text-[#A8B89A]" /> {v.visitor_name || v.visitorName}
                        </h4>
                        <p className="text-[10px] text-[#7D7D7D] dark:text-slate-400 mt-1 leading-relaxed font-light">{v.notes || 'No visit summary recorded.'}</p>
                      </div>
                    </div>
                  );
                })}
                {visits.length === 0 && (
                  <p className="text-xs text-[#7D7D7D] dark:text-slate-400 italic py-12 text-center">No visits logged for this workspace.</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                const today = new Date();
                const formattedTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                setSelectedDateStr(formattedTodayStr);
                setShowAddModal(true);
              }}
              className="w-full py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white font-semibold rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 min-h-[40px] shadow-sm shadow-[#A8B89A]/15 mt-4 cursor-pointer"
            >
              <Plus size={14} /> Log New Visit
            </button>
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="visit-modal-title"
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-[#A8B89A]/15 dark:border-slate-800/80 rounded-[24px] shadow-2xl p-6 relative text-left overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-[#7D7D7D] hover:text-[#4B4B4B] dark:hover:text-white p-2 rounded-lg transition-all cursor-pointer"
                title="Close"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <h3 id="visit-modal-title" className="text-md font-semibold text-[#4B4B4B] dark:text-white mb-4 font-display">Log Site Visit ({selectedDateStr})</h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="visit-visitor" className="text-[9px] uppercase font-bold text-[#7D7D7D] dark:text-slate-400 tracking-wider">Visitor / Consult Designer</label>
                  <input
                    id="visit-visitor"
                    type="text"
                    placeholder="Enter name (e.g. Nisha PM)..."
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] dark:text-white placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="visit-time" className="text-[9px] uppercase font-bold text-[#7D7D7D] dark:text-slate-400 tracking-wider">Scheduled Time</label>
                  <input
                    id="visit-time"
                    type="time"
                    value={formData.visitTime}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                    className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] dark:text-white focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="visit-notes" className="text-[9px] uppercase font-bold text-[#7D7D7D] dark:text-slate-400 tracking-wider">Agenda / Measurements notes</label>
                  <textarea
                    id="visit-notes"
                    placeholder="Notes, room dimensions audit info..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] dark:text-white placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] transition-all h-20 min-h-[60px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-bold rounded-xl text-xs transition active:scale-[0.99] outline-none cursor-pointer"
                >
                  Save Log Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
