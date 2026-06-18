import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/db';
import { Printer, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

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
      case 'Approved': return 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20';
      case 'Pending': return 'bg-amber-950/20 text-amber-400 border-amber-500/20';
      case 'Rejected': return 'bg-rose-950/20 text-rose-400 border-rose-500/20';
      case 'Replaced': return 'bg-indigo-950/20 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-900 text-gray-400 border-white/5';
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
        const pct = p.status === 'Completed' ? 100 
                   : p.status === 'Quality Inspection' ? 90 
                   : p.status === 'Execution' ? 80 
                   : p.status === 'Material Selection' ? 70 
                   : p.status === 'Design Approval' ? 50 
                   : p.status === 'Space Planning' ? 35 
                   : p.status === 'Site Visit' ? 20 
                   : 10;
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
    // Generate TSV content which Excel opens by default
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
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Sourcing Reports Generator</h2>
          <p className="text-sm text-gray-400">Generate, print, and export CSV/Excel reports.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={triggerPrint}
            className="flex-1 sm:flex-initial p-2.5 bg-slate-900 border border-white/5 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center gap-2 text-xs font-semibold min-h-[48px] sm:min-h-0 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
            title="Print Report"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={triggerExportCSV}
            className="flex-1 sm:flex-initial p-2.5 bg-slate-900 border border-white/5 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center gap-2 text-xs font-semibold min-h-[48px] sm:min-h-0 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
            title="Export CSV"
          >
            <FileSpreadsheet size={14} />
            <span>CSV</span>
          </button>
          <button
            onClick={triggerExportExcel}
            className="flex-1 sm:flex-initial p-2.5 bg-slate-900 border border-white/5 rounded-xl text-gold hover:text-white transition flex items-center justify-center gap-2 text-xs font-semibold min-h-[48px] sm:min-h-0 focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
            title="Export Excel (TSV)"
          >
            <Download size={14} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Reports Internal Tabs */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-white/5 pb-2 print:hidden">
        <div className="flex flex-wrap gap-3 uppercase text-[10px] font-bold text-gray-400" role="tablist" aria-label="Report Category Tabs">
          <button
            onClick={() => setReportTab('material')}
            role="tab"
            aria-selected={reportTab === 'material'}
            className={`pb-2 px-1 border-b-2 transition focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
              reportTab === 'material' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Material selection Report
          </button>
          <button
            onClick={() => setReportTab('vendor')}
            role="tab"
            aria-selected={reportTab === 'vendor'}
            className={`pb-2 px-1 border-b-2 transition focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
              reportTab === 'vendor' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Vendor Sourcing Report
          </button>
          <button
            onClick={() => setReportTab('budget')}
            role="tab"
            aria-selected={reportTab === 'budget'}
            className={`pb-2 px-1 border-b-2 transition focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
              reportTab === 'budget' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Project budget Report
          </button>
          <button
            onClick={() => setReportTab('progress')}
            role="tab"
            aria-selected={reportTab === 'progress'}
            className={`pb-2 px-1 border-b-2 transition focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
              reportTab === 'progress' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Project Progress Report
          </button>
        </div>

        {reportTab === 'material' && (
          <div className="flex items-center gap-2 text-xs bg-slate-950 border border-white/5 px-3 py-2 rounded-xl self-start lg:self-auto min-h-[44px]">
            <label htmlFor="report-project-filter" className="text-gray-500 cursor-pointer">Filter Project:</label>
            <select
              id="report-project-filter"
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(Number(e.target.value))}
              className="bg-transparent text-gray-300 outline-none focus-visible:ring-2 focus-visible:ring-gold/50 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-gray-300">All Project Selections</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-gray-300">{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-slate-900/40 border border-white/5 p-4 sm:p-6 rounded-2xl print:bg-white print:text-slate-950 print:border-none">
        {/* Printable header info */}
        <div className="hidden print:block mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-display">Glory Simon Interiors</h1>
          <p className="text-sm text-slate-700">Project Material Sourcing Report • Generated on {new Date().toLocaleDateString()}</p>
          <hr className="border-slate-300" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xs">Compiling records report...</div>
        ) : (
          <div>
            {/* 1. MATERIAL REPORT */}
            {reportTab === 'material' && (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs print:text-slate-950">
                    <thead>
                      <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
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
                        <tr key={r.id} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                          <td className="py-3 pr-4">
                            <p className="font-bold text-gray-200 print:text-slate-950">{r.project_name}</p>
                            <p className="text-[10px] text-gray-500 print:text-slate-600">{r.room_name || 'N/A'}</p>
                          </td>
                          <td className="py-3 pr-4 text-gray-300 print:text-slate-950 font-medium">{r.material_name}</td>
                          <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{r.category}</td>
                          <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{r.vendor_name || 'Direct'}</td>
                          <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{r.quantity} units</td>
                          <td className="py-3 pr-4 text-gray-400 print:text-slate-600">INR {r.unit_price}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-gray-200 print:text-slate-950">
                            INR {r.total_cost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {materialReportData.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-20 text-gray-500 italic">No selections logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="space-y-3 sm:hidden">
                  {materialReportData.map(r => (
                    <div key={r.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-gray-200 text-xs">{r.material_name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{r.project_name} • {r.room_name || 'N/A'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-white font-medium">{r.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Supplier Sourced:</span>
                          <span className="text-white font-medium">{r.vendor_name || 'Direct'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quantity / Price:</span>
                          <span className="text-white">{r.quantity} units @ INR {r.unit_price}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1.5">
                          <span className="text-gray-500 font-semibold">Total Cost:</span>
                          <span className="text-gold font-bold">INR {r.total_cost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {materialReportData.length === 0 && (
                    <p className="text-xs text-gray-500 italic py-12 text-center">No selections logged.</p>
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
                      <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
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
                        <tr key={v.vendor_name} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                          <td className="py-3 pr-4 font-bold text-gray-200 print:text-slate-950">{v.vendor_name}</td>
                          <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{v.category}</td>
                          <td className="py-3 pr-4 font-medium text-gold print:text-slate-700">{v.rating} / 5.0</td>
                          <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{v.projects_sourced} Projects</td>
                          <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{v.materials_sourced} items</td>
                          <td className="py-3 text-right font-bold text-gold print:text-slate-950">
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
                    <div key={v.vendor_name} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-gray-200 text-xs">{v.vendor_name}</span>
                        <span className="text-[10px] text-gold font-semibold">{v.rating} / 5.0 ★</span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-white font-medium">{v.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Projects Supplied:</span>
                          <span className="text-white font-medium">{v.projects_sourced} Projects</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Materials Supplied:</span>
                          <span className="text-white font-medium">{v.materials_sourced} items</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1.5">
                          <span className="text-gray-500 font-semibold">Gross Costs Sourced:</span>
                          <span className="text-gold font-bold">INR {(v.total_sourced_cost || 0).toLocaleString()}</span>
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
                      <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
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
                        <tr key={b.project_name} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                          <td className="py-3 pr-4 font-bold text-gray-200 print:text-slate-950">{b.project_name}</td>
                          <td className="py-3 pr-4 text-gray-400 print:text-slate-600">INR {b.total_budget.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-gray-300 print:text-slate-950">INR {b.approved_materials_cost.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-gray-300 print:text-slate-950">INR {b.total_expenses_cost.toLocaleString()}</td>
                          <td className={`py-3 pr-4 font-bold ${b.remaining_budget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            INR {b.remaining_budget.toLocaleString()}
                          </td>
                          <td className="py-3 text-right font-bold text-gray-200 print:text-slate-950">
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
                    <div key={b.project_name} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-gray-200 text-xs">{b.project_name}</span>
                        <span className="text-[10px] text-white font-bold">{b.utilization_pct}% Used</span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Budget Cap:</span>
                          <span className="text-white font-medium">INR {b.total_budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Approved Finishes:</span>
                          <span className="text-white font-medium">INR {b.approved_materials_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Site Direct Expenses:</span>
                          <span className="text-white font-medium">INR {b.total_expenses_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1.5">
                          <span className="text-gray-500 font-semibold">Remaining Balance:</span>
                          <span className={`font-bold ${b.remaining_budget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                      <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
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
                        const pct = p.status === 'Completed' ? 100 
                                   : p.status === 'Quality Inspection' ? 90 
                                   : p.status === 'Execution' ? 80 
                                   : p.status === 'Material Selection' ? 70 
                                   : p.status === 'Design Approval' ? 50 
                                   : p.status === 'Space Planning' ? 35 
                                   : p.status === 'Site Visit' ? 20 
                                   : 10;
                        return (
                          <tr key={p.id} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                            <td className="py-3 pr-4 font-bold text-gray-200 print:text-slate-950">{p.name}</td>
                            <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{p.status}</td>
                            <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{p.assigned_designer || 'Nisha Sen'}</td>
                            <td className="py-3 pr-4 text-gray-400 print:text-slate-600">INR {p.budget.toLocaleString()}</td>
                            <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{p.start_date || 'N/A'}</td>
                            <td className="py-3 pr-4 text-gray-300 print:text-slate-950">
                              {p.approved_selections || 0} / {p.total_selections || 0} approved
                            </td>
                            <td className="py-3 text-right font-bold text-gold print:text-slate-950">
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
                    const pct = p.status === 'Completed' ? 100 
                               : p.status === 'Quality Inspection' ? 90 
                               : p.status === 'Execution' ? 80 
                               : p.status === 'Material Selection' ? 70 
                               : p.status === 'Design Approval' ? 50 
                               : p.status === 'Space Planning' ? 35 
                               : p.status === 'Site Visit' ? 20 
                               : 10;
                    return (
                      <div key={p.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-gray-200 text-xs">{p.name}</span>
                          <span className="text-[10px] text-gold font-bold">{pct}% Completed</span>
                        </div>
                        <div className="text-[10px] text-gray-400 space-y-1.5 pt-1 border-t border-white/5">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Journey Stage:</span>
                            <span className="text-white font-medium">{p.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Designer Assigned:</span>
                            <span className="text-white font-medium">{p.assigned_designer || 'Nisha Sen'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Budget Cap:</span>
                            <span className="text-white font-semibold">INR {p.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/5 pt-1.5">
                            <span className="text-gray-500">Approvals:</span>
                            <span className="text-white font-medium">{p.approved_selections || 0} / {p.total_selections || 0} selections approved</span>
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
