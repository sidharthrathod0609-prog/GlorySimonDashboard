import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar as CalendarIcon, Clock, User, FileText, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
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
    calendarCells.push(<div key={`empty-${i}`} className="min-h-[50px] sm:min-h-[100px] bg-slate-900/10 border border-white/5 opacity-30" />);
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
        className="min-h-[50px] sm:min-h-[100px] bg-slate-900/30 border border-white/5 p-1 sm:p-2 flex flex-col justify-between hover:bg-slate-900/50 hover:border-gold/30 cursor-pointer transition-all"
      >
        <span className="text-[10px] sm:text-xs font-bold text-gray-400 self-end">{day}</span>
        
        {/* Full text list on desktop */}
        <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px] pr-0.5 w-full hidden sm:block">
          {dayVisits.map((v: any) => {
            const vDate = v.visit_date || v.visitDate;
            const timeStr = vDate ? new Date(vDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
            return (
              <div
                key={v.id}
                className="bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5 text-[9px] text-gold truncate font-semibold"
                title={`${v.visitor_name || v.visitorName} @ ${timeStr}\n${v.notes}`}
              >
                {timeStr} - {v.visitor_name || v.visitorName}
              </div>
            );
          })}
        </div>

        {/* Mobile indicator dots */}
        <div className="flex flex-wrap gap-0.5 justify-center mt-1 sm:hidden">
          {dayVisits.map((v: any) => (
            <span key={v.id} className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_4px_#c5a880]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Site Visit Scheduler</h2>
          <p className="text-sm text-gray-400">Log client measurements checkups, designer consultations, and supervisor reports.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 px-4 py-2.5 rounded-xl">
          <label htmlFor="workspace-select" className="text-xs text-gray-400 font-medium cursor-pointer">Select Workspace:</label>
          <select
            id="workspace-select"
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(Number(e.target.value))}
            className="bg-transparent text-xs text-gold font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-900 text-gray-400">Choose Project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-gray-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!activeProjectId ? (
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 mx-auto">
            <CalendarIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">No Project Workspace Selected</h3>
          <p className="text-sm text-gray-400">
            Please choose a project workspace from the header dropdown to access the site visit schedules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid View */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-white/5 p-4 sm:p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white font-display">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-white transition min-h-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-white transition min-h-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                  aria-label="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map(day => (
                <div key={day} className="text-[10px] uppercase font-bold text-gray-500 py-1">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="inline sm:hidden">{day[0]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid cells */}
            <div className="grid grid-cols-7 gap-1 bg-white/5 rounded-xl overflow-hidden p-0.5">
              {calendarCells}
            </div>
          </div>

          {/* Visits Detail Feed panel */}
          <div className="bg-slate-900/40 border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-display">Upcoming Logs Registry</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {visits.map((v: any) => {
                  const vDate = v.visit_date || v.visitDate;
                  const dateObj = vDate ? new Date(vDate) : null;
                  const formattedDate = dateObj ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  const formattedTime = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

                  return (
                    <div key={v.id} className="p-3.5 bg-slate-950/60 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                        <span className="flex items-center gap-1"><Clock size={10} className="text-gold" /> {formattedTime} • {formattedDate}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1">
                          <User size={10} className="text-gold" /> {v.visitor_name || v.visitorName}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{v.notes || 'No visit summary recorded.'}</p>
                      </div>
                    </div>
                  );
                })}
                {visits.length === 0 && (
                  <p className="text-xs text-gray-500 italic py-12 text-center">No visits logged for this workspace.</p>
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
              className="w-full py-2.5 bg-gradient-to-r from-gold-dark to-gold text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg shadow-gold/10 min-h-[48px] mt-4 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
            >
              <Plus size={14} /> Log New Visit
            </button>
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="visit-modal-title"
              className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative text-left overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded-lg transition-all"
                title="Close"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <h3 id="visit-modal-title" className="text-md font-bold text-white mb-4 font-display">Log Site Visit ({selectedDateStr})</h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="visit-visitor" className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Visitor / Consult Designer</label>
                  <input
                    id="visit-visitor"
                    type="text"
                    placeholder="Enter name (e.g. Nisha PM)..."
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none transition-all min-h-[48px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="visit-time" className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scheduled Time</label>
                  <input
                    id="visit-time"
                    type="time"
                    value={formData.visitTime}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none transition-all min-h-[48px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="visit-notes" className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Agenda / Measurements Check notes</label>
                  <textarea
                    id="visit-notes"
                    placeholder="Notes, room dimensions audit info..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none transition-all h-20 min-h-[60px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-gold-dark to-gold text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 shadow-lg min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
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
