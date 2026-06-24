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
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Interactive Quotation Builder</h2>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">Compute material quantity estimates, apply GST, and generate customer invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:hidden">
        {/* Quote Form Creator */}
        <div className="lg:col-span-2 bg-white border border-[#A8B89A]/10 p-4 sm:p-6 rounded-[24px] space-y-6 shadow-sm">
          <h3 className="text-md font-light text-[#4B4B4B] font-display">New Estimate Calculator</h3>
          <form onSubmit={handleSaveQuote} className="space-y-6">
            {/* Client selection dropdown */}
            <div className="space-y-2">
              <label htmlFor="client-selector" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider cursor-pointer">Target Client Profile</label>
              <select
                id="client-selector"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
                className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 p-3 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] outline-none min-h-[44px] cursor-pointer transition-all"
                required
              >
                <option value="" disabled className="bg-white text-[#7D7D7D]">Select Customer...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-[#4B4B4B]">
                    {c.name} ({c.company || 'Residential'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quote calculator rows */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Line Items</span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs text-[#A8B89A] font-bold hover:text-[#96A689] flex items-center gap-1 min-h-[32px] outline-none transition-all"
                >
                  <Plus size={12} /> Add Row
                </button>
              </div>

              <div className="space-y-3">
                {quoteItems.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-2 md:items-center bg-[#F8F6F3] border border-[#A8B89A]/10 p-3.5 rounded-2xl">
                    {/* Material Input or Dropdown */}
                    <div className="flex-1 space-y-1">
                      <label htmlFor={`item-name-${index}`} className="sr-only">Material Name</label>
                      <input
                        id={`item-name-${index}`}
                        type="text"
                        placeholder="Material or description..."
                        value={item.material}
                        onChange={(e) => handleUpdateItem(index, 'material', e.target.value)}
                        className="w-full bg-white border border-[#A8B89A]/20 p-2 rounded-lg text-xs text-[#4B4B4B] placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] transition-all"
                        required
                      />
                      {/* Dropdown helper selector */}
                      <label htmlFor={`item-catalog-${index}`} className="sr-only">Pick Catalog Item</label>
                      <select
                        id={`item-catalog-${index}`}
                        onChange={(e) => handleSelectCatalogueItem(index, e.target.value)}
                        value=""
                        className="w-full bg-white border border-[#A8B89A]/15 p-2 rounded-lg text-[9px] text-[#7D7D7D] focus:outline-none focus:border-[#A8B89A] cursor-pointer transition-all"
                      >
                        <option value="" disabled className="bg-white text-[#7D7D7D]">Or pick from catalog...</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.name} className="bg-white text-[#4B4B4B]">
                            {m.name} - INR {m.unit_price}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Numeric controls grid on mobile, row inline elements on desktop */}
                    <div className="flex gap-2 w-full md:w-auto">
                      {/* Quantity */}
                      <div className="flex-1 md:w-20">
                        <label htmlFor={`item-quantity-${index}`} className="block text-[8px] uppercase tracking-wider text-[#7D7D7D] font-bold mb-1 md:hidden">Quantity</label>
                        <input
                          id={`item-quantity-${index}`}
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-[#A8B89A]/20 p-2 rounded-lg text-xs text-[#4B4B4B] text-center focus:outline-none focus:border-[#A8B89A] transition-all"
                          required
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="flex-1.5 md:w-24">
                        <label htmlFor={`item-unitcost-${index}`} className="block text-[8px] uppercase tracking-wider text-[#7D7D7D] font-bold mb-1 md:hidden">Unit Cost (INR)</label>
                        <input
                          id={`item-unitcost-${index}`}
                          type="number"
                          min="0"
                          placeholder="Unit Cost"
                          value={item.unitCost || ''}
                          onChange={(e) => handleUpdateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-[#A8B89A]/20 p-2 rounded-lg text-xs text-[#4B4B4B] text-right focus:outline-none focus:border-[#A8B89A] transition-all"
                          required
                        />
                      </div>

                      {/* Remove button */}
                      <div className="flex items-end md:items-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-2 text-[#C89A9A] hover:bg-rose-50 rounded-lg transition flex items-center justify-center border border-[#A8B89A]/15 md:border-none w-10 outline-none"
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
            <div className="bg-[#F8F6F3] p-4 rounded-xl border border-slate-100 text-xs space-y-2.5">
              <div className="flex justify-between text-[#7D7D7D] font-light">
                <span>Subtotal (Net Estimate)</span>
                <span>INR {sub.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#7D7D7D] font-light">
                <span>GST Tax (Surcharge 18%)</span>
                <span>INR {gst.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#4B4B4B] text-sm">
                <span>Total Quotation Sourced</span>
                <span className="text-[#8AA17A]">INR {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-bold rounded-xl text-xs transition active:scale-[0.99] outline-none"
            >
              Generate & Record Quotation
            </button>
          </form>
        </div>

        {/* Recorded Quotations Registry */}
        <div className="bg-white border border-[#A8B89A]/10 p-4 sm:p-6 rounded-[24px] space-y-4 shadow-sm">
          <h3 className="text-md font-light text-[#4B4B4B] font-display">Quotation Records</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {quotations.map((q: any) => (
              <div key={q.id} className="p-4 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-2xl space-y-3 hover:border-[#A8B89A]/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[#4B4B4B] text-xs">{q.clientName}</h4>
                    <p className="text-[10px] text-[#7D7D7D] mt-0.5">{q.projectName}</p>
                  </div>
                  <span className="text-[9px] text-[#7D7D7D] font-medium">{q.date}</span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-200/60 text-xs">
                  <span className="text-[#8AA17A] font-bold">INR {q.total.toLocaleString()}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShowPrintModal(q)}
                      className="p-2 text-[#7D7D7D] hover:text-[#4B4B4B] bg-white rounded-lg transition min-h-[32px] outline-none border border-[#A8B89A]/10"
                      title="View PDF"
                      aria-label={`View invoice details for ${q.clientName}`}
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => triggerPrint(q)}
                      className="p-2 text-[#7D7D7D] hover:text-[#A8B89A] bg-white rounded-lg transition min-h-[32px] outline-none border border-[#A8B89A]/10"
                      title="Print PDF Invoice"
                      aria-label={`Print invoice for ${q.clientName}`}
                    >
                      <Printer size={12} />
                    </button>
                    <button
                      onClick={() => deleteQuotation(q.id)}
                      className="p-2 text-[#C89A9A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[32px] outline-none border border-slate-100"
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
              <p className="text-xs text-[#7D7D7D] italic py-12 text-center">No quotation logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* PDF View Modal / Print overlay */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:relative print:bg-[#ffffff] print:p-0 print:inset-auto overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pdf-modal-title"
              className="w-full max-w-2xl bg-[#ffffff] text-[#1f2937] rounded-[24px] shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col max-h-[90vh] print:max-h-none print:w-full my-8 print:my-0"
            >
              {/* Controls bar (Hidden during print) */}
              <div className="bg-[#4B4B4B] border-b border-[#A8B89A]/20 p-4 flex justify-between items-center text-[#f8fafc] print:hidden">
                <span id="pdf-modal-title" className="text-xs font-medium font-display">PDF Quotation Preview</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-[#A8B89A] hover:bg-[#96A689] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 min-h-[32px] outline-none"
                  >
                    <Printer size={12} /> Print PDF
                  </button>
                  <button
                    onClick={() => setShowPrintModal(null)}
                    className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg transition min-h-[32px] outline-none"
                    aria-label="Close modal"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="p-4 sm:p-8 space-y-6 overflow-y-auto print:overflow-visible bg-[#ffffff] print:p-6 text-[#4b4b4b]">
                {/* Header branding */}
                <div className="flex justify-between items-start border-b border-[#e5e7eb] pb-5">
                  <div className="space-y-1">
                    <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#4b4b4b] font-display">GLORY SIMON INTERIORS</h1>
                    <p className="text-[9px] sm:text-[10px] text-[#7d7d7d] font-semibold tracking-widest uppercase">Smart Material Selection & Project Management Platform</p>
                    <p className="text-[9px] sm:text-[10px] text-[#9ca3af]">Luxury Interior Sourcing Coordinator</p>
                  </div>
                  <div className="text-right text-[10px] sm:text-[11px] text-[#7d7d7d] space-y-0.5">
                    <p className="font-bold text-[#4b4b4b] text-xs">OFFICIAL QUOTATION</p>
                    <p>Doc ID: #Q-{showPrintModal.id}</p>
                    <p>Date: {showPrintModal.date}</p>
                  </div>
                </div>

                {/* Billing Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-[11px]">
                  <div>
                    <h5 className="font-bold text-[#7d7d7d] uppercase tracking-wider mb-1">CLIENT BILL TO</h5>
                    <p className="font-bold text-[#4b4b4b] text-xs">{showPrintModal.clientName}</p>
                    <p className="text-[#7d7d7d] mt-0.5">{showPrintModal.projectName}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#7d7d7d] uppercase tracking-wider mb-1">PROJECT SCOPE</h5>
                    <p className="font-semibold text-[#4b4b4b]">Custom Finishing Sourcing</p>
                    <p className="text-[#9ca3af]">Includes materials & logistics verification.</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#d1d5db] text-[10px] font-bold text-[#7d7d7d] uppercase bg-[#f9fafb]">
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
                          <td className="py-3 px-3 font-semibold text-[#4b4b4b]">{item.material}</td>
                          <td className="py-3 px-3 text-right text-[#7d7d7d]">{item.quantity}</td>
                          <td className="py-3 px-3 text-right text-[#7d7d7d]">INR {item.unitCost.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-[#7d7d7d]">{item.gst}%</td>
                          <td className="py-3 px-3 text-right font-bold text-[#4b4b4b]">INR {item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grand totals and tax values */}
                <div className="flex justify-end pt-3">
                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-[#7d7d7d] border-b border-[#f3f4f6] pb-1.5">
                      <span>Total Net Price</span>
                      <span className="font-semibold text-[#4b4b4b]">INR {Math.round(showPrintModal.total / 1.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#7d7d7d] border-b border-[#f3f4f6] pb-1.5">
                      <span>SGST + CGST (18%)</span>
                      <span className="font-semibold text-[#4b4b4b]">INR {Math.round(showPrintModal.total - (showPrintModal.total / 1.18)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#4b4b4b] text-sm bg-[#f9fafb] p-2 rounded-lg">
                      <span>Grand Total (Gross)</span>
                      <span>INR {showPrintModal.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer and Terms */}
                <div className="border-t border-[#e5e7eb] pt-6 text-[10px] text-[#9ca3af] text-center space-y-1">
                  <p className="font-semibold text-[#7d7d7d]">Thank you for coordinating with Glory Simon Interiors.</p>
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
