import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Palette, Check, X, RefreshCw, AlertCircle, FileText, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = [
  { id: 'Pending', label: 'Pending Approval', color: 'border-[#D7B57D]/30 text-[#D7B57D] bg-[#D7B57D]/5', dot: 'bg-[#D7B57D]' },
  { id: 'Selected', label: 'Selected / Draft', color: 'border-[#A8B89A]/30 text-[#4B4B4B] bg-[#F4F2EE]', dot: 'bg-[#A8B89A]' },
  { id: 'Approved', label: 'Approved & Signed', color: 'border-[#8AA17A]/30 text-[#8AA17A] bg-[#8AA17A]/5', dot: 'bg-[#8AA17A]' },
  { id: 'Replaced', label: 'Replaced / Swapped', color: 'border-[#C89A9A]/30 text-[#C89A9A] bg-[#C89A9A]/5', dot: 'bg-[#C89A9A]' },
  { id: 'Rejected', label: 'Rejected', color: 'border-[#C89A9A]/40 text-[#C89A9A] bg-[#C89A9A]/10', dot: 'bg-[#C89A9A]' }
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
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] dark:text-[#F8FAFC] font-display">Material Approval Board</h2>
          <p className="text-xs text-[#7D7D7D] dark:text-[#94A3B8] font-light mt-1">Drag & drop selections to coordinate material approvals and sign-offs.</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-[#A8B89A]/15 dark:border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-sm">
          <label htmlFor="workspace-selector" className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8] font-bold uppercase tracking-wider cursor-pointer">Active Project:</label>
          <select
            id="workspace-selector"
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(Number(e.target.value))}
            className="bg-transparent text-xs text-[#A8B89A] font-bold focus:outline-none outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-white dark:bg-slate-900 text-[#7D7D7D] dark:text-[#94A3B8]">Choose Project Workspace...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-[#4B4B4B] dark:text-[#E5E7EB]">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!activeProjectId ? (
        <div className="bg-white dark:bg-slate-900 border border-[#A8B89A]/10 dark:border-slate-800/80 rounded-[24px] p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-[#A8B89A]/10 rounded-full flex items-center justify-center text-[#A8B89A] mx-auto">
            <Palette size={24} />
          </div>
          <h3 className="text-lg font-light text-[#4B4B4B] dark:text-[#F8FAFC]">No Workspace Selected</h3>
          <p className="text-xs text-[#7D7D7D] dark:text-[#94A3B8] font-light max-w-md mx-auto">
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
                className={`bg-white/50 dark:bg-slate-900/30 border border-[#A8B89A]/10 dark:border-slate-800/80 rounded-[24px] p-3.5 flex flex-col space-y-3.5 transition-colors hover:bg-white/80 dark:hover:bg-slate-900/50 shadow-sm ${
                  isMobile ? 'min-h-0' : 'min-h-[550px]'
                }`}
              >
                {/* Column Title / Accordion Header */}
                <button
                  onClick={() => isMobile && toggleColumn(col.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`kanban-column-content-${col.id}`}
                  aria-label={`Toggle column ${col.label}`}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-2xl border ${col.color} focus-visible:ring-2 focus-visible:ring-[#A8B89A]/50 outline-none transition-all ${
                    isMobile ? 'cursor-pointer hover:brightness-110 active:scale-[0.99] select-none' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isMobile && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronRight size={12} />
                      </motion.div>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider">{col.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <span className="text-xs font-semibold">{items.length}</span>
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
                      className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-0.5"
                    >
                      {items.map((item: any) => (
                        <motion.div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onClick={() => openCardDetails(item)}
                          layoutId={`selection-card-${item.id}`}
                          className="bg-white dark:bg-slate-900 border border-[#A8B89A]/10 dark:border-slate-800/80 rounded-[24px] p-4 space-y-3.5 hover:border-[#A8B89A]/30 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] group"
                        >
                          {item.image_url && (
                            <div className="w-20 h-20 bg-[#F8F6F3] dark:bg-slate-950 rounded-full overflow-hidden relative flex items-center justify-center border border-[#A8B89A]/15 mx-auto mb-1">
                              <img
                                src={item.image_url}
                                alt={item.material_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="space-y-1 text-center">
                            <h4 className="text-xs font-semibold text-[#4B4B4B] dark:text-[#E5E7EB] line-clamp-1 group-hover:text-[#A8B89A] transition-colors">{item.material_name}</h4>
                            <div className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8] font-light">
                              {item.brand} • {item.sku}
                            </div>
                            <div className="text-xs text-[#8AA17A] font-medium pt-1">
                              INR {item.unit_price.toLocaleString()}
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-[10px]">
                            <span className="text-[#7D7D7D] dark:text-[#94A3B8] font-light">Qty: <strong className="text-[#4B4B4B] dark:text-white font-semibold">{item.quantity}</strong></span>
                            <span className="text-[#7D7D7D] dark:text-[#94A3B8] font-light truncate max-w-[80px]">{item.vendor_name || 'Direct'}</span>
                          </div>
                        </motion.div>
                      ))}
                      {items.length === 0 && (
                          <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-[#A8B89A]/20 dark:border-slate-800/80 rounded-[24px] text-[#7D7D7D] dark:text-[#94A3B8] text-[11px] font-light">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="card-details-title"
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#A8B89A]/15 dark:border-slate-800/80 rounded-[24px] shadow-2xl overflow-hidden text-left flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-start">
                <div>
                  <h3 id="card-details-title" className="text-lg font-light text-[#4B4B4B] dark:text-[#F8FAFC] font-display">{selectedCard.material_name}</h3>
                  <p className="text-xs text-[#A8B89A] font-semibold mt-1">Status: {selectedCard.status}</p>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-[#7D7D7D] dark:text-[#94A3B8] hover:text-[#4B4B4B] dark:hover:text-white transition p-1 outline-none rounded-lg"
                  aria-label="Close details modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F8F6F3] dark:bg-slate-950 p-3 rounded-[20px] border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[9px] text-[#7D7D7D] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Manufacturer</span>
                    <p className="text-[#4B4B4B] dark:text-[#E5E7EB] font-semibold">{selectedCard.brand}</p>
                  </div>
                  <div className="bg-[#F8F6F3] dark:bg-slate-950 p-3 rounded-[20px] border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[9px] text-[#7D7D7D] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Product SKU</span>
                    <p className="text-[#4B4B4B] dark:text-[#E5E7EB] font-semibold">{selectedCard.sku}</p>
                  </div>
                  <div className="bg-[#F8F6F3] dark:bg-slate-950 p-3 rounded-[20px] border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[9px] text-[#7D7D7D] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Unit Pricing</span>
                    <p className="text-[#8AA17A] font-bold">INR {selectedCard.unit_price.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#F8F6F3] dark:bg-slate-950 p-3 rounded-[20px] border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[9px] text-[#7D7D7D] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Total Est. Cost</span>
                    <p className="text-[#4B4B4B] dark:text-[#E5E7EB] font-bold">INR {(selectedCard.unit_price * selectedCard.quantity).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-[#F8F6F3] dark:bg-slate-950 p-4 rounded-[20px] border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="coordinator-notes" className="text-[9px] text-[#7D7D7D] uppercase font-bold tracking-wider">Sourcing Notes</label>
                    {!isEditingNotes && (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="text-[10px] text-[#A8B89A] hover:underline font-bold tracking-wide focus:outline-none"
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
                        className="w-full bg-white dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 rounded-xl p-3 text-xs text-[#4B4B4B] dark:text-white focus:outline-none focus:border-[#A8B89A] h-24 transition-all"
                        placeholder="Add details, installation advice, or supplier delivery lead times..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-850 text-[#7D7D7D] dark:text-[#94A3B8] rounded-lg text-xs font-semibold hover:text-[#4B4B4B] dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNotes}
                          className="px-3 py-1.5 bg-[#8AA17A] text-white rounded-lg text-xs font-bold hover:bg-[#788E69]"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#7D7D7D] dark:text-[#94A3B8] leading-relaxed italic">
                      {selectedCard.notes || 'No description notes saved for this selection.'}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={async () => {
                      await updateSelection(selectedCard.id, { status: 'Approved' });
                      setSelectedCard(null);
                    }}
                    className="flex-1 py-3 bg-[#8AA17A] hover:bg-[#788E69] text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 min-h-[48px]"
                  >
                    <Check size={14} />
                    Approve Material
                  </button>
                  <button
                    onClick={async () => {
                      await updateSelection(selectedCard.id, { status: 'Rejected' });
                      setSelectedCard(null);
                    }}
                    className="flex-1 py-3 bg-[#C89A9A] hover:bg-[#B58585] text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 min-h-[48px]"
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
