import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Palette, Check, X, RefreshCw, AlertCircle, FileText, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = [
  { id: 'Pending', label: 'Pending Approval', color: 'border-amber-500/20 text-amber-400 bg-amber-950/20', dot: 'bg-amber-400' },
  { id: 'Selected', label: 'Selected / Draft', color: 'border-sky-500/20 text-sky-400 bg-sky-950/20', dot: 'bg-sky-400' },
  { id: 'Approved', label: 'Approved & Signed', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20', dot: 'bg-emerald-400' },
  { id: 'Replaced', label: 'Replaced / Swapped', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-950/20', dot: 'bg-indigo-400' },
  { id: 'Rejected', label: 'Rejected', color: 'border-rose-500/20 text-rose-400 bg-rose-950/20', dot: 'bg-rose-400' }
] as const;

export default function MaterialApproval() {
  const {
    projects,
    activeProjectId,
    projectDetails,
    updateSelection,
    setActiveProjectId,
    currentUser
  } = useAppStore();

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [notesText, setNotesText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  // Viewport resize state & collapsible accordion state for mobile
  const [isMobile, setIsMobile] = useState(false);
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    Pending: true,
    Selected: false,
    Approved: false,
    Replaced: false,
    Rejected: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleColumn = (colId: string) => {
    setExpandedColumns(prev => ({
      ...prev,
      [colId]: !prev[colId]
    }));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const selections = projectDetails?.selections || [];

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: typeof COLUMNS[number]['id']) => {
    e.preventDefault();
    if (draggedId === null) return;
    
    // Check permission - client cannot drag & drop (client can only view or approve/reject via buttons, designers/PMs/admins can organize)
    if (currentUser.role === 'Client' && status !== 'Approved' && status !== 'Rejected') {
      alert('Clients are only permitted to Approve or Reject selections.');
      setDraggedId(null);
      return;
    }

    await updateSelection(draggedId, { status });
    setDraggedId(null);
  };

  const saveNotes = async () => {
    if (!selectedCard) return;
    await updateSelection(selectedCard.id, { notes: notesText });
    setSelectedCard({ ...selectedCard, notes: notesText });
    setIsEditingNotes(false);
  };

  const openCardDetails = (card: any) => {
    setSelectedCard(card);
    setNotesText(card.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Material Approval Board</h2>
          <p className="text-sm text-gray-400">Drag & drop selections to coordinate material approvals and sign-offs.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 px-4 py-2.5 rounded-xl">
          <label htmlFor="workspace-selector" className="text-xs text-gray-400 font-medium cursor-pointer">Select Workspace:</label>
          <select
            id="workspace-selector"
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
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto">
            <Palette size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">No Workspace Selected</h3>
          <p className="text-sm text-gray-400">
            Please choose a project workspace from the header selector to load its material design board.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map(col => {
            const items = selections.filter((s: any) => s.status === col.id);
            const isExpanded = !isMobile || expandedColumns[col.id];
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-slate-900/30 border border-white/5 rounded-2xl p-3 flex flex-col space-y-3 transition-colors hover:bg-slate-900/40 ${
                  isMobile ? 'min-h-0' : 'min-h-[500px]'
                }`}
              >
                {/* Column Title / Accordion Header */}
                <button
                  onClick={() => isMobile && toggleColumn(col.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`kanban-column-content-${col.id}`}
                  aria-label={`Toggle column ${col.label}`}
                  className={`w-full text-left flex items-center justify-between px-2.5 py-2.5 rounded-xl border ${col.color} focus-visible:ring-2 focus-visible:ring-gold/50 outline-none transition-all ${
                    isMobile ? 'cursor-pointer hover:brightness-110 active:scale-[0.99] select-none' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isMobile && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider">{col.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <span className="text-xs font-bold">{items.length}</span>
                  </div>
                </button>

                {/* Column Items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`kanban-column-content-${col.id}`}
                      initial={isMobile ? { height: 0, opacity: 0 } : false}
                      animate={isMobile ? { height: 'auto', opacity: 1 } : false}
                      exit={isMobile ? { height: 0, opacity: 0 } : false}
                      className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-0.5"
                    >
                      {items.map((item: any) => (
                        <motion.div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onClick={() => openCardDetails(item)}
                          layoutId={`selection-card-${item.id}`}
                          className="bg-slate-900/80 border border-white/5 rounded-xl p-3.5 space-y-3 hover:border-gold/30 hover:shadow-lg cursor-pointer transition-all active:scale-[0.98] group"
                        >
                          {item.image_url && (
                            <div className="w-full h-24 bg-slate-950/80 rounded-lg overflow-hidden relative flex items-center justify-center border border-white/5">
                              <img
                                src={item.image_url}
                                alt={item.material_name}
                                className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-gold transition-colors">{item.material_name}</h4>
                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                              <span>{item.brand} • {item.sku}</span>
                              <span className="text-gold font-semibold">INR {item.unit_price}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                            <span className="text-gray-400 font-medium">Qty: <strong className="text-white font-bold">{item.quantity}</strong></span>
                            <span className="text-gray-500 truncate max-w-[80px]">{item.vendor_name || 'Direct'}</span>
                          </div>
                        </motion.div>
                      ))}
                      {items.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-xl text-gray-600 text-xs">
                          Drag cards here
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Card Details & Notes Editor Modal */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="card-details-title"
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div>
                  <h3 id="card-details-title" className="text-lg font-bold text-white font-display">{selectedCard.material_name}</h3>
                  <p className="text-xs text-gold font-semibold mt-1">Status: {selectedCard.status}</p>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-500 hover:text-white transition p-1 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded-lg"
                  aria-label="Close details modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Manufacturer</span>
                    <p className="text-white font-semibold">{selectedCard.brand}</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Product SKU</span>
                    <p className="text-white font-semibold">{selectedCard.sku}</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Unit Pricing</span>
                    <p className="text-gold font-bold">INR {selectedCard.unit_price.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Est. Cost</span>
                    <p className="text-white font-bold">INR {(selectedCard.unit_price * selectedCard.quantity).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="coordinator-notes" className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sourcing Coordinator Notes</label>
                    {!isEditingNotes && (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="text-[10px] text-gold hover:underline font-semibold font-display focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded px-1"
                        aria-label="Edit notes"
                      >
                        Edit Notes
                      </button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        id="coordinator-notes"
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none h-24 transition-all"
                        placeholder="Add details, installation advice, or supplier delivery lead times..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-3 py-1.5 bg-slate-950 text-gray-400 rounded-lg text-xs font-semibold hover:text-white focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNotes}
                          className="px-3 py-1.5 bg-gold text-slate-950 rounded-lg text-xs font-bold hover:brightness-110 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      {selectedCard.notes || 'No description notes saved for this selection.'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await updateSelection(selectedCard.id, { status: 'Approved' });
                      setSelectedCard(null);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 outline-none"
                  >
                    <Check size={14} />
                    Approve Material
                  </button>
                  <button
                    onClick={async () => {
                      await updateSelection(selectedCard.id, { status: 'Rejected' });
                      setSelectedCard(null);
                    }}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500/50 outline-none"
                  >
                    <X size={14} />
                    Reject Material
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
