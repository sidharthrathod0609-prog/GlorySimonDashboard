import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash2, Printer, Check, X, FileSpreadsheet, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteItem {
  material: string;
  quantity: number;
  unitCost: number;
}

export default function QuotationBuilder() {
  const {
    clients,
    materials,
    quotations,
    createQuotation,
    deleteQuotation
  } = useAppStore();

  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { material: '', quantity: 1, unitCost: 0 }
  ]);
  const [showPrintModal, setShowPrintModal] = useState<any | null>(null);

  // Quick select standard items from catalogue
  const handleSelectCatalogueItem = (index: number, matName: string) => {
    const matched = materials.find(m => m.name === matName);
    if (!matched) return;
    
    const newItems = [...quoteItems];
    newItems[index] = {
      ...newItems[index],
      material: matched.name,
      unitCost: matched.unit_price
    };
    setQuoteItems(newItems);
  };

  const handleUpdateItem = (index: number, key: keyof QuoteItem, value: any) => {
    const newItems = [...quoteItems];
    newItems[index] = {
      ...newItems[index],
      [key]: value
    };
    setQuoteItems(newItems);
  };

  const addItemRow = () => {
    setQuoteItems([...quoteItems, { material: '', quantity: 1, unitCost: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (quoteItems.length === 1) return;
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const calculateGst = (sub: number) => {
    return Math.round(sub * 0.18);
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert('Please select a client.');
      return;
    }
    const client = clients.find(c => c.id === Number(selectedClientId));
    if (!client) return;

    const sub = calculateSubtotal();
    const gst = calculateGst(sub);
    const total = sub + gst;

    const formattedItems = quoteItems.map(item => ({
      material: item.material || 'Custom Finishing Service',
      quantity: item.quantity,
      unitCost: item.unitCost,
      gst: 18,
      total: Math.round(item.quantity * item.unitCost * 1.18)
    }));

    await createQuotation({
      date: new Date().toISOString().split('T')[0],
      clientName: client.name,
      projectName: `${client.company || client.name} Design Project`,
      items: formattedItems,
      total
    });

    // Reset Quote Creator state
    setQuoteItems([{ material: '', quantity: 1, unitCost: 0 }]);
    setSelectedClientId('');
    alert('Quotation successfully generated and recorded.');
  };

  const triggerPrint = (quote: any) => {
    setShowPrintModal(quote);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const sub = calculateSubtotal();
  const gst = calculateGst(sub);
  const total = sub + gst;

  return (
    <div className="space-y-6 print:p-0 print:m-0">
      {/* Header Panel */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Interactive Quotation Builder</h2>
          <p className="text-sm text-gray-400">Compute material quantity estimates, apply GST, and generate customer invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:hidden">
        {/* Quote Form Creator */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-4 sm:p-6 rounded-2xl space-y-6">
          <h3 className="text-md font-bold text-white font-display">New Estimate Calculator</h3>
          <form onSubmit={handleSaveQuote} className="space-y-6">
            {/* Client selection dropdown */}
            <div className="space-y-2">
              <label htmlFor="client-selector" className="text-[10px] uppercase font-bold text-gray-400 tracking-wider cursor-pointer">Target Client Profile</label>
              <select
                id="client-selector"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-xs text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] cursor-pointer transition-all"
                required
              >
                <option value="" disabled>Select Customer...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || 'Residential'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quote calculator rows */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Line Items</span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs text-gold font-bold hover:underline flex items-center gap-1 min-h-[36px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded px-1 transition-all"
                >
                  <Plus size={12} /> Add Row
                </button>
              </div>

              <div className="space-y-3">
                {quoteItems.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-2 md:items-center bg-slate-950/40 border border-white/5 p-3 rounded-xl">
                    {/* Material Input or Dropdown */}
                    <div className="flex-1 space-y-1">
                      <label htmlFor={`item-name-${index}`} className="sr-only">Material Name</label>
                      <input
                        id={`item-name-${index}`}
                        type="text"
                        placeholder="Material or description..."
                        value={item.material}
                        onChange={(e) => handleUpdateItem(index, 'material', e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 p-3 md:p-2 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] md:min-h-0 transition-all"
                        required
                      />
                      {/* Dropdown helper selector */}
                      <label htmlFor={`item-catalog-${index}`} className="sr-only">Pick Catalog Item</label>
                      <select
                        id={`item-catalog-${index}`}
                        onChange={(e) => handleSelectCatalogueItem(index, e.target.value)}
                        value=""
                        className="w-full bg-slate-900 border border-white/5 p-2 md:p-1 rounded-lg text-[10px] md:text-[9px] text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none cursor-pointer min-h-[36px] md:min-h-0 transition-all"
                      >
                        <option value="" disabled>Or pick from catalog...</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.name}>
                            {m.name} - INR {m.unit_price}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Numeric controls grid on mobile, row inline elements on desktop */}
                    <div className="flex gap-2 w-full md:w-auto">
                      {/* Quantity */}
                      <div className="flex-1 md:w-20">
                        <label htmlFor={`item-quantity-${index}`} className="block text-[8px] uppercase tracking-wider text-gray-500 font-bold mb-1 md:hidden">Quantity</label>
                        <input
                          id={`item-quantity-${index}`}
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-white/5 p-3 md:p-2 rounded-lg text-xs text-white text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] md:min-h-0 transition-all"
                          required
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="flex-1.5 md:w-24">
                        <label htmlFor={`item-unitcost-${index}`} className="block text-[8px] uppercase tracking-wider text-gray-500 font-bold mb-1 md:hidden">Unit Cost (INR)</label>
                        <input
                          id={`item-unitcost-${index}`}
                          type="number"
                          min="0"
                          placeholder="Unit Cost"
                          value={item.unitCost || ''}
                          onChange={(e) => handleUpdateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-white/5 p-3 md:p-2 rounded-lg text-xs text-white text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] md:min-h-0 transition-all"
                          required
                        />
                      </div>

                      {/* Remove button */}
                      <div className="flex items-end md:items-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-lg transition min-h-[48px] md:min-h-0 flex items-center justify-center border border-white/5 md:border-none w-12 focus-visible:ring-2 focus-visible:ring-rose-500/50 outline-none"
                          disabled={quoteItems.length === 1}
                          aria-label={`Remove row ${index + 1}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations panel */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-xs space-y-2.5">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal (Net Estimate)</span>
                <span>INR {sub.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST Tax (Surcharge 18%)</span>
                <span>INR {gst.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Quotation Sourced</span>
                <span className="text-gold">INR {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 shadow-lg hover:shadow-gold/15 transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
            >
              Generate & Record Quotation
            </button>
          </form>
        </div>

        {/* Recorded Quotations Registry */}
        <div className="bg-slate-900/40 border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4">
          <h3 className="text-md font-bold text-white font-display">Quotation Records</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {quotations.map((q: any) => (
              <div key={q.id} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl space-y-3 hover:border-gold/20 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-xs">{q.clientName}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{q.projectName}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">{q.date}</span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-xs">
                  <span className="text-gold font-bold">INR {q.total.toLocaleString()}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShowPrintModal(q)}
                      className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                      title="View PDF"
                      aria-label={`View invoice details for ${q.clientName}`}
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => triggerPrint(q)}
                      className="p-2 text-gray-400 hover:text-gold bg-white/5 rounded-lg transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                      title="Print PDF Invoice"
                      aria-label={`Print invoice for ${q.clientName}`}
                    >
                      <Printer size={12} />
                    </button>
                    <button
                      onClick={() => deleteQuotation(q.id)}
                      className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-rose-500/50 outline-none"
                      title="Delete Invoice Record"
                      aria-label={`Delete invoice record for ${q.clientName}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {quotations.length === 0 && (
              <p className="text-xs text-gray-500 italic py-12 text-center">No quotation logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* PDF View Modal / Print overlay */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 print:relative print:bg-[#ffffff] print:p-0 print:inset-auto overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pdf-modal-title"
              className="w-full max-w-2xl bg-[#ffffff] text-[#1f2937] rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col max-h-[90vh] print:max-h-none print:w-full my-8 print:my-0"
            >
              {/* Controls bar (Hidden during print) */}
              <div className="bg-[#0f172a] border-b border-white/10 p-4 flex justify-between items-center text-[#f8fafc] print:hidden">
                <span id="pdf-modal-title" className="text-xs font-bold font-display">PDF Quotation Preview</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-gold text-[#0f172a] font-bold rounded-lg text-[10px] hover:brightness-110 flex items-center gap-1 min-h-[36px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                  >
                    <Printer size={12} /> Print PDF
                  </button>
                  <button
                    onClick={() => setShowPrintModal(null)}
                    className="p-1.5 text-gray-400 hover:text-[#f8fafc] bg-white/5 rounded-lg transition min-h-[36px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                    aria-label="Close modal"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="p-4 sm:p-8 space-y-6 overflow-y-auto print:overflow-visible bg-[#ffffff] print:p-6 text-[#1f2937]">
                {/* Header branding */}
                <div className="flex justify-between items-start border-b border-[#e5e7eb] pb-5">
                  <div className="space-y-1">
                    <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#1f2937] font-display">GLORY SIMON INTERIORS</h1>
                    <p className="text-[9px] sm:text-[10px] text-[#4b5563] font-semibold tracking-widest uppercase">Premium Sourcing & Execution</p>
                    <p className="text-[9px] sm:text-[10px] text-[#9ca3af]">12th Floor, Trade Center, Bandra, Mumbai</p>
                  </div>
                  <div className="text-right text-[10px] sm:text-[11px] text-[#4b5563] space-y-0.5">
                    <p className="font-bold text-[#1f2937] text-xs">OFFICIAL QUOTATION</p>
                    <p>Doc ID: #Q-{showPrintModal.id}</p>
                    <p>Date: {showPrintModal.date}</p>
                  </div>
                </div>

                {/* Billing Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-[11px]">
                  <div>
                    <h5 className="font-bold text-[#4b5563] uppercase tracking-wider mb-1">CLIENT BILL TO</h5>
                    <p className="font-bold text-[#1f2937] text-xs">{showPrintModal.clientName}</p>
                    <p className="text-[#4b5563] mt-0.5">{showPrintModal.projectName}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#4b5563] uppercase tracking-wider mb-1">PROJECT SCOPE</h5>
                    <p className="font-semibold text-[#1f2937]">Custom Finishing Sourcing</p>
                    <p className="text-[#6b7280]">Includes materials & logistics verification.</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#d1d5db] text-[10px] font-bold text-[#4b5563] uppercase bg-[#f9fafb]">
                        <th className="py-2 px-3">Item Details / Catalog Sourced</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">GST Rate</th>
                        <th className="py-2 px-3 text-right">Estimated Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showPrintModal.items.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-[#e5e7eb]">
                          <td className="py-3 px-3 font-semibold text-[#1f2937]">{item.material}</td>
                          <td className="py-3 px-3 text-right text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-3 text-right text-gray-700">INR {item.unitCost.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-gray-700">{item.gst}%</td>
                          <td className="py-3 px-3 text-right font-bold text-[#1f2937]">INR {item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grand totals and tax values */}
                <div className="flex justify-end pt-3">
                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-[#4b5563] border-b border-[#f3f4f6] pb-1.5">
                      <span>Total Net Price</span>
                      <span className="font-semibold text-gray-800">INR {Math.round(showPrintModal.total / 1.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#4b5563] border-b border-[#f3f4f6] pb-1.5">
                      <span>SGST + CGST (18%)</span>
                      <span className="font-semibold text-gray-800">INR {Math.round(showPrintModal.total - (showPrintModal.total / 1.18)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1f2937] text-sm bg-[#f9fafb] p-2 rounded-lg">
                      <span>Grand Total (Gross)</span>
                      <span>INR {showPrintModal.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer and Terms */}
                <div className="border-t border-[#e5e7eb] pt-6 text-[10px] text-[#9ca3af] text-center space-y-1">
                  <p className="font-semibold text-[#6b7280]">Thank you for coordinating with Glory Simon Interiors.</p>
                  <p>Invoices are generated based on active selection sheets and valid vendor catalogue data.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
