import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/db';
import { Printer, FileSpreadsheet, Download, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const calculateProjectProgress = (p: any): number => {
  const statusProgressMap: Record<string, number> = {
    'Enquiry': 10,
    'Site Visit': 25,
    'Space Planning': 40,
    'Quotation': 55,
    'Design Approval': 70,
    'Material Selection': 80,
    'Execution': 90,
    'Quality Inspection': 95,
    'Completed': 100
  };
  const basePct = statusProgressMap[p.status] || 0;
  
  let selectionPct = 0;
  if (p.total_selections && p.total_selections > 0) {
    selectionPct = Math.round((p.approved_selections! / p.total_selections) * 100);
  }
  
  let pct = p.total_selections && p.total_selections > 0 
    ? Math.round((basePct + selectionPct) / 2)
    : basePct;

  if (p.status === 'Completed') {
    pct = 100;
  }
  return pct;
};

export default function Reports() {
  const {
    projects,
    activeProjectId,
    setActiveProjectId
  } = useAppStore();

  const [reportTab, setReportTab] = useState<'material' | 'vendor' | 'budget' | 'progress'>('material');
  const [materialReportData, setMaterialReportData] = useState<any[]>([]);
  const [vendorReportData, setVendorReportData] = useState<any[]>([]);
  const [budgetReportData, setBudgetReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadReports();
  }, [activeProjectId, reportTab]);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (reportTab === 'material') {
        const query = activeProjectId ? `?projectId=${activeProjectId}` : '';
        const data = await db.getMaterialReport(query);
        setMaterialReportData(data);
      } else if (reportTab === 'vendor') {
        const data = await db.getVendorReport();
        setVendorReportData(data);
      } else if (reportTab === 'budget') {
        const data = await db.getBudgetReport();
        setBudgetReportData(data);
      }
    } catch (err) {
      console.error('Error loading reports details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-[#8AA17A]/10 text-[#8AA17A] border-[#8AA17A]/20';
      case 'Pending': return 'bg-[#D7B57D]/10 text-[#D7B57D] border-[#D7B57D]/20';
      case 'Rejected': return 'bg-[#C89A9A]/10 text-[#C89A9A] border-[#C89A9A]/20';
      case 'Replaced': return 'bg-[#C89A9A]/10 text-[#C89A9A] border-[#C89A9A]/20';
      default: return 'bg-[#F8F6F3] text-[#7D7D7D] border-slate-100';
    }
  };

  const getReportHeadersAndRows = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportTab === 'material') {
      headers = ['Project Name', 'Room Space', 'Material Name', 'Category', 'Sourcing Vendor', 'Quantity', 'Unit Price', 'Total Sourced Cost', 'Status'];
      rows = materialReportData.map(r => [
        r.project_name, r.room_name || 'N/A', r.material_name, r.category, r.vendor_name || 'Direct',
        r.quantity.toString(), r.unit_price.toString(), r.total_cost.toString(), r.status
      ]);
    } else if (reportTab === 'vendor') {
      headers = ['Sourcing Vendor Name', 'Sourcing Category', 'Rating', 'Projects Sourced', 'Materials Sourced', 'Total Sourced cost'];
      rows = vendorReportData.map(r => [
        r.vendor_name, r.category, r.rating.toString(), r.projects_sourced.toString(),
        r.materials_sourced.toString(), r.total_sourced_cost ? r.total_sourced_cost.toString() : '0'
      ]);
    } else if (reportTab === 'budget') {
      headers = ['Project Name', 'Total Budget Limit', 'Approved Materials Cost', 'Site Direct Expenses', 'Gross Sourced Costs', 'Remaining Balance', 'Utilization Rate'];
      rows = budgetReportData.map(r => [
        r.project_name, r.total_budget.toString(), r.approved_materials_cost.toString(),
        r.total_expenses_cost.toString(), r.total_spent.toString(), r.remaining_budget.toString(), `${r.utilization_pct}%`
      ]);
    } else if (reportTab === 'progress') {
      headers = ['Project Name', 'Status Stage', 'Assigned Designer', 'Sourced Budget Cap', 'Start Date', 'Approved Selections', 'Sourced Progress Pct'];
      rows = projects.map(p => {
        const pct = calculateProjectProgress(p);
        return [
          p.name, p.status, p.assigned_designer || 'Nisha Sen', p.budget.toLocaleString(), p.start_date || 'N/A',
          `${p.approved_selections || 0} / ${p.total_selections || 0}`, `${pct}%`
        ];
      });
    }
    return { headers, rows };
  };

  const triggerPrint = () => {
    window.print();
  };

  const triggerExportCSV = () => {
    const { headers, rows } = getReportHeadersAndRows();
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GlorySimon_${reportTab}_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerExportExcel = () => {
    const { headers, rows } = getReportHeadersAndRows();
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.map(val => val.replace(/\t/g, ' ')).join('\t'))
    ].join('\n');

    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GlorySimon_${reportTab}_report.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Sourcing Reports Generator</h2>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">Generate, print, and export CSV/Excel reports.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={triggerPrint}
            className="flex-1 sm:flex-initial p-2 bg-white border border-[#A8B89A]/15 rounded-xl text-[#7D7D7D] hover:text-[#4B4B4B] transition flex items-center justify-center gap-2 text-xs font-semibold min-h-[38px] outline-none shadow-sm"
            title="Print Report"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={triggerExportCSV}
            className="flex-1 sm:flex-initial p-2 bg-white border border-[#A8B89A]/15 rounded-xl text-[#7D7D7D] hover:text-[#4B4B4B] transition flex items-center justify-center gap-2 text-xs font-semibold min-h-[38px] outline-none shadow-sm"
            title="Export CSV"
          >
            <FileSpreadsheet size={14} />
            <span>CSV</span>
          </button>
          <button
            onClick={triggerExportExcel}
            className="flex-1 sm:flex-initial p-2 bg-white border border-[#A8B89A]/15 rounded-xl text-[#8AA17A] hover:text-[#788E69] transition flex items-center justify-center gap-2 text-xs font-semibold min-h-[38px] outline-none shadow-sm"
            title="Export Excel (TSV)"
          >
            <Download size={14} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Reports Internal Tabs */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-slate-100 pb-2 print:hidden">
        <div className="flex flex-wrap gap-4 uppercase text-[9px] font-bold text-[#7D7D7D]" role="tablist" aria-label="Report Category Tabs">
          <button
            onClick={() => setReportTab('material')}
            role="tab"
            aria-selected={reportTab === 'material'}
            className={`pb-2 px-1 border-b-2 transition outline-none ${
              reportTab === 'material' ? 'border-[#A8B89A] text-[#A8B89A] font-bold' : 'border-transparent hover:text-[#4B4B4B]'
            }`}
          >
            Material selection Report
          </button>
          <button
            onClick={() => setReportTab('vendor')}
            role="tab"
            aria-selected={reportTab === 'vendor'}
            className={`pb-2 px-1 border-b-2 transition outline-none ${
              reportTab === 'vendor' ? 'border-[#A8B89A] text-[#A8B89A] font-bold' : 'border-transparent hover:text-[#4B4B4B]'
            }`}
          >
            Vendor Sourcing Report
          </button>
          <button
            onClick={() => setReportTab('budget')}
            role="tab"
            aria-selected={reportTab === 'budget'}
            className={`pb-2 px-1 border-b-2 transition outline-none ${
              reportTab === 'budget' ? 'border-[#A8B89A] text-[#A8B89A] font-bold' : 'border-transparent hover:text-[#4B4B4B]'
            }`}
          >
            Project budget Report
          </button>
          <button
            onClick={() => setReportTab('progress')}
            role="tab"
            aria-selected={reportTab === 'progress'}
            className={`pb-2 px-1 border-b-2 transition outline-none ${
              reportTab === 'progress' ? 'border-[#A8B89A] text-[#A8B89A] font-bold' : 'border-transparent hover:text-[#4B4B4B]'
            }`}
          >
            Project Progress Report
          </button>
        </div>

        {reportTab === 'material' && (
          <div className="relative text-xs self-start lg:self-auto z-20">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-[#A8B89A]/15 dark:border-slate-800/80 px-3 py-2 rounded-xl shadow-sm font-semibold text-[#4B4B4B] dark:text-gray-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[38px] cursor-pointer"
            >
              <span className="text-[#7D7D7D] font-light">Filter Project:</span>
              <span className="font-display font-medium text-[#4B4B4B] dark:text-white">
                {projects.find(p => p.id === activeProjectId)?.name || 'All Project Selections'}
              </span>
              <ChevronDown size={14} className="text-[#A8B89A] shrink-0" />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 min-w-[220px] bg-white dark:bg-slate-900 border border-[#A8B89A]/20 dark:border-slate-800/80 p-1.5 rounded-[18px] shadow-xl z-20 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProjectId(null as any);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all font-display font-medium cursor-pointer ${
                        !activeProjectId
                          ? 'bg-[#A8B89A]/10 text-[#8AA17A] font-bold'
                          : 'text-[#4B4B4B] dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      All Project Selections
                    </button>
                    {projects.map(p => {
                      const isSelected = p.id === activeProjectId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all font-display font-medium cursor-pointer truncate ${
                            isSelected
                              ? 'bg-[#A8B89A]/10 text-[#8AA17A] font-bold'
                              : 'text-[#4B4B4B] dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#A8B89A]/10 p-4 sm:p-6 rounded-[24px] shadow-sm print:bg-white print:text-slate-955 print:border-none">
        {/* Printable header info */}
        <div className="hidden print:block mb-8 space-y-2">
          <h1 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Glory Simon Interiors</h1>
          <p className="text-xs text-[#7D7D7D] font-light">Project Material Sourcing Report • Generated on {new Date().toLocaleDateString()}</p>
          <hr className="border-slate-100" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#7D7D7D] text-xs">Compiling records report...</div>
        ) : (
          <div>
            {/* 1. MATERIAL REPORT */}
            {reportTab === 'material' && (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs print:text-slate-950">
                    <thead>
                      <tr className="border-b border-slate-100 print:border-slate-200 text-[#7D7D7D] print:text-slate-700 font-medium">
                        <th className="pb-3 pr-4">Project / Room</th>
                        <th className="pb-3 pr-4">Material Name</th>
                        <th className="pb-3 pr-4">Sourcing Category</th>
                        <th className="pb-3 pr-4">Vendor</th>
                        <th className="pb-3 pr-4">Units</th>
                        <th className="pb-3 pr-4">Unit Cost</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 text-right">Sourced Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialReportData.map(r => (
                        <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/40 print:border-slate-100 group transition duration-150">
                          <td className="py-3 pr-4 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-l-2xl">
                            <p className="font-bold text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-950">{r.project_name}</p>
                            <p className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8] print:text-slate-600">{r.room_name || 'N/A'}</p>
                          </td>
                          <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 font-medium transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{r.material_name}</td>
                          <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{r.category}</td>
                          <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{r.vendor_name || 'Direct'}</td>
                          <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{r.quantity} units</td>
                          <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">INR {r.unit_price}</td>
                          <td className="py-3 pr-4 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-[#4B4B4B] dark:text-white print:text-slate-950 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-r-2xl">
                            INR {r.total_cost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {materialReportData.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-20 text-[#7D7D7D] italic font-light">No selections logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="space-y-3 sm:hidden">
                  {materialReportData.map(r => (
                    <div key={r.id} className="p-4 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-2xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-[#4B4B4B] text-xs">{r.material_name}</p>
                          <p className="text-[10px] text-[#7D7D7D] mt-0.5">{r.project_name} • {r.room_name || 'N/A'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7D7D7D] space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Category:</span>
                          <span className="text-[#4B4B4B] font-medium">{r.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Supplier Sourced:</span>
                          <span className="text-[#4B4B4B] font-medium">{r.vendor_name || 'Direct'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Quantity / Price:</span>
                          <span className="text-[#4B4B4B]">{r.quantity} units @ INR {r.unit_price}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span className="text-[#7D7D7D] font-semibold">Total Cost:</span>
                          <span className="text-[#8AA17A] font-bold">INR {r.total_cost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {materialReportData.length === 0 && (
                    <p className="text-xs text-[#7D7D7D] italic py-12 text-center">No selections logged.</p>
                  )}
                </div>
              </>
            )}

            {/* 2. VENDOR REPORT */}
            {reportTab === 'vendor' && (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs print:text-slate-950">
                    <thead>
                      <tr className="border-b border-slate-100 print:border-slate-200 text-[#7D7D7D] print:text-slate-700 font-medium">
                        <th className="pb-3 pr-4">Sourcing Vendor Name</th>
                        <th className="pb-3 pr-4">Category Sourced</th>
                        <th className="pb-3 pr-4">Sourcing Rating</th>
                        <th className="pb-3 pr-4">Projects Supplied</th>
                        <th className="pb-3 pr-4">Materials Supplied</th>
                        <th className="pb-3 text-right">Gross Sourced Costs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorReportData.map(v => (
                        <tr key={v.vendor_name} className="border-b border-slate-50 dark:border-slate-800/40 print:border-slate-100 group transition duration-150">
                          <td className="py-3 pr-4 font-bold text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-950 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-l-2xl">{v.vendor_name}</td>
                          <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{v.category}</td>
                          <td className="py-3 pr-4 font-medium text-[#8AA17A] print:text-slate-700 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{v.rating} / 5.0</td>
                          <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{v.projects_sourced} Projects</td>
                          <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{v.materials_sourced} items</td>
                          <td className="py-3 text-right font-bold text-[#8AA17A] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-r-2xl">
                            INR {(v.total_sourced_cost || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="space-y-3 sm:hidden">
                  {vendorReportData.map(v => (
                    <div key={v.vendor_name} className="p-4 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-2xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[#4B4B4B] text-xs">{v.vendor_name}</span>
                        <span className="text-[10px] text-[#8AA17A] font-semibold">{v.rating} / 5.0 ★</span>
                      </div>
                      <div className="text-[10px] text-[#7D7D7D] space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Category:</span>
                          <span className="text-[#4B4B4B] font-medium">{v.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Projects Supplied:</span>
                          <span className="text-[#4B4B4B] font-medium">{v.projects_sourced} Projects</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Materials Supplied:</span>
                          <span className="text-[#4B4B4B] font-medium">{v.materials_sourced} items</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span className="text-[#7D7D7D] font-semibold">Gross Costs Sourced:</span>
                          <span className="text-[#8AA17A] font-bold">INR {(v.total_sourced_cost || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 3. BUDGET REPORT */}
            {reportTab === 'budget' && (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs print:text-slate-950">
                    <thead>
                      <tr className="border-b border-slate-100 print:border-slate-200 text-[#7D7D7D] print:text-slate-700 font-medium">
                        <th className="pb-3 pr-4">Project Name</th>
                        <th className="pb-3 pr-4">Total Budget Cap</th>
                        <th className="pb-3 pr-4">Approved Finishes</th>
                        <th className="pb-3 pr-4">Site Expenses</th>
                        <th className="pb-3 pr-4">Remaining Balance</th>
                        <th className="pb-3 text-right">Utilization Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetReportData.map(b => (
                        <tr key={b.project_name} className="border-b border-slate-50 dark:border-slate-800/40 print:border-slate-100 group transition duration-150">
                          <td className="py-3 pr-4 font-bold text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-l-2xl">{b.project_name}</td>
                          <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">INR {b.total_budget.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">INR {b.approved_materials_cost.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">INR {b.total_expenses_cost.toLocaleString()}</td>
                          <td className={`py-3 pr-4 font-bold ${b.remaining_budget < 0 ? 'text-[#C89A9A]' : 'text-[#8AA17A]'} transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40`}>
                            INR {b.remaining_budget.toLocaleString()}
                          </td>
                          <td className="py-3 text-right font-bold text-[#4B4B4B] dark:text-white print:text-slate-950 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-r-2xl">
                            {b.utilization_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="space-y-3 sm:hidden">
                  {budgetReportData.map(b => (
                    <div key={b.project_name} className="p-4 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-2xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[#4B4B4B] text-xs">{b.project_name}</span>
                        <span className="text-[10px] text-[#7D7D7D] font-bold">{b.utilization_pct}% Used</span>
                      </div>
                      <div className="text-[10px] text-[#7D7D7D] space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Total Budget Cap:</span>
                          <span className="text-[#4B4B4B] font-medium">INR {b.total_budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Approved Finishes:</span>
                          <span className="text-[#4B4B4B] font-medium">INR {b.approved_materials_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7D7D7D]">Site Direct Expenses:</span>
                          <span className="text-[#4B4B4B] font-medium">INR {b.total_expenses_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span className="text-[#7D7D7D] font-semibold">Remaining Balance:</span>
                          <span className={`font-bold ${b.remaining_budget < 0 ? 'text-[#C89A9A]' : 'text-[#8AA17A]'}`}>
                            INR {b.remaining_budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 4. PROGRESS REPORT */}
            {reportTab === 'progress' && (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs print:text-slate-950">
                    <thead>
                      <tr className="border-b border-slate-100 print:border-slate-200 text-[#7D7D7D] print:text-slate-700 font-medium">
                        <th className="pb-3 pr-4">Project Name</th>
                        <th className="pb-3 pr-4">Current Status Stage</th>
                        <th className="pb-3 pr-4">Assigned Designer</th>
                        <th className="pb-3 pr-4">Sourced Budget Cap</th>
                        <th className="pb-3 pr-4">Project Start Date</th>
                        <th className="pb-3 pr-4">Approved / Total Selections</th>
                        <th className="pb-3 text-right">Progress Stage Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(p => {
                        const pct = calculateProjectProgress(p);
                        return (
                          <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/40 print:border-slate-100 group transition duration-150">
                            <td className="py-3 pr-4 font-bold text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-950 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-l-2xl">{p.name}</td>
                            <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{p.status}</td>
                            <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{p.assigned_designer || 'Nisha Sen'}</td>
                            <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">INR {p.budget.toLocaleString()}</td>
                            <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-400 print:text-slate-600 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">{p.start_date || 'N/A'}</td>
                            <td className="py-3 pr-4 text-[#4B4B4B] dark:text-[#E2E8F0] print:text-slate-950 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40">
                              {p.approved_selections || 0} / {p.total_selections || 0} approved
                            </td>
                            <td className="py-3 text-right font-bold text-[#8AA17A] print:text-slate-955 transition-all duration-150 group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-slate-800/40 rounded-r-2xl">
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="space-y-3 sm:hidden">
                  {projects.map(p => {
                    const pct = calculateProjectProgress(p);
                    return (
                      <div key={p.id} className="p-4 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-2xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-[#4B4B4B] text-xs">{p.name}</span>
                          <span className="text-[10px] text-[#8AA17A] font-bold">{pct}% Completed</span>
                        </div>
                        <div className="text-[10px] text-[#7D7D7D] space-y-1.5 pt-1 border-t border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-[#7D7D7D]">Journey Stage:</span>
                            <span className="text-[#4B4B4B] font-medium">{p.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7D7D7D]">Designer Assigned:</span>
                            <span className="text-[#4B4B4B] font-medium">{p.assigned_designer || 'Nisha Sen'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7D7D7D]">Budget Cap:</span>
                            <span className="text-[#4B4B4B] font-semibold">INR {p.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1.5">
                            <span className="text-[#7D7D7D]">Approvals:</span>
                            <span className="text-[#4B4B4B] font-medium">{p.approved_selections || 0} / {p.total_selections || 0} selections approved</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
