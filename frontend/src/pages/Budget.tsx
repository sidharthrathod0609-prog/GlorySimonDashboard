import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AlertTriangle, Plus, ClipboardList, Wallet, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Budget() {
  const {
    projects,
    activeProjectId,
    projectDetails,
    addExpense,
    setActiveProjectId,
    currentUser
  } = useAppStore();

  const [expenseCat, setExpenseCat] = useState('');
  const [expenseAmt, setExpenseAmt] = useState('');
  const [expenseNote, setExpenseNote] = useState('');

  if (!activeProjectId) {
    return (
      <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto">
          <Wallet size={24} />
        </div>
        <h3 className="text-lg font-bold text-white">No Workspace Selected</h3>
        <p className="text-sm text-gray-400">
          Please select an active project workspace from the header selector to load the budget ledger.
        </p>
        <div className="flex flex-col items-center justify-center mt-2 space-y-1">
          <label htmlFor="budget-fallback-selector" className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Select Project Workspace</label>
          <select
            id="budget-fallback-selector"
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(Number(e.target.value))}
            className="bg-slate-900 border border-white/10 text-xs text-gold font-bold px-4 py-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none cursor-pointer min-h-[48px] transition-all"
          >
            <option value="" disabled>Select project workspace...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (!projectDetails) return <div className="text-center py-20 text-gray-400">Loading financial ledger...</div>;

  const triggerAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'Client') return;
    if (!expenseCat || !expenseAmt) return;
    await addExpense({
      category: expenseCat,
      amount: parseFloat(expenseAmt) || 0,
      notes: expenseNote
    });
    setExpenseCat(''); setExpenseAmt(''); setExpenseNote('');
    alert('Sourcing expense logged successfully.');
  };

  const approvedSelectionsCost = projectDetails.selections
    .filter((s: any) => s.status === 'Approved')
    .reduce((sum: number, s: any) => sum + (s.quantity * s.unit_price), 0);
  
  const expensesCost = projectDetails.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSpent = approvedSelectionsCost + expensesCost;
  const totalBudget = projectDetails.project.budget || 1;
  const remainingBudget = totalBudget - totalSpent;
  const utilizationPct = Math.round((totalSpent / totalBudget) * 100);

  // Chart 1: Donut/Pie Chart logic (SVG circle stroke-dasharray)
  const r = 50;
  const circumference = 2 * Math.PI * r; // ~314.16
  
  // Calculate relative sizes. If spent > budget, adjust denominators to totalSpent
  const maxDenom = Math.max(totalBudget, totalSpent);
  const selPct = (approvedSelectionsCost / maxDenom) * 100;
  const expPct = (expensesCost / maxDenom) * 100;
  const remPct = Math.max(0, (remainingBudget / maxDenom) * 100);

  const selDash = (selPct / 100) * circumference;
  const expDash = (expPct / 100) * circumference;
  const remDash = (remPct / 100) * circumference;

  const getBudgetTextColor = (pct: number) => {
    if (pct > 100) return 'text-rose-400';
    if (pct >= 75) return 'text-amber-400';
    return 'text-emerald-400';
  };

  // Chart 2: Category Bar Chart calculations
  // Collect all spend by category
  const categoriesMap: Record<string, number> = {};
  
  projectDetails.selections
    .filter((s: any) => s.status === 'Approved')
    .forEach((s: any) => {
      const cat = s.category || 'Finishes';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (s.quantity * s.unit_price);
    });

  projectDetails.expenses.forEach((e: any) => {
    const cat = e.category || 'Direct';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + e.amount;
  });

  const categoryEntries = Object.entries(categoriesMap).map(([cat, val]) => ({ cat, val }));
  const maxVal = categoryEntries.length > 0 ? Math.max(...categoryEntries.map(c => c.val)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Budget Tracking & Cost Ledger</h2>
          <p className="text-sm text-gray-400">Run audit controls, log direct expenses, and configure alerts for: <strong className="text-gold">{projectDetails.project.name}</strong></p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 px-4 py-2.5 rounded-xl w-full md:w-auto">
          <label htmlFor="budget-workspace-selector" className="text-xs text-gray-400 font-medium cursor-pointer">Workspace:</label>
          <select
            id="budget-workspace-selector"
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(Number(e.target.value))}
            className="bg-transparent text-xs text-gold font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 outline-none cursor-pointer min-h-[36px]"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-gray-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Budget Cap</span>
          <p className="text-xl font-bold text-white font-display">INR {totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Cost Sourced</span>
          <p className="text-xl font-bold text-white font-display">INR {totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Remaining Balance</span>
          <p className={`text-xl font-bold font-display ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            INR {remainingBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Utilization</span>
          <p className={`text-xl font-bold font-display ${getBudgetTextColor(utilizationPct)}`}>{utilizationPct}%</p>
        </div>
      </div>

      {/* Warning Alert banner */}
      {utilizationPct >= 75 && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
          utilizationPct > 100 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <AlertTriangle size={16} />
          <span>
            {utilizationPct > 100 
              ? 'WARNING: Sourced costs exceed allocated contract budget cap! Take immediate corrective action.'
              : 'CAUTION: Budget utilization rate has reached warning levels.'}
          </span>
        </div>
      )}

      {/* Spend chart visual & direct expense logger split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Charts Box */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <PieIcon size={16} className="text-gold" />
              Cost Utilization Analysis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Donut Chart */}
            <div className="flex flex-col items-center justify-center relative">
              <svg width="180" height="180" viewBox="0 0 120 120" className="transform -rotate-90" role="img" aria-label={`Budget utilization donut chart showing ${utilizationPct}% spent`}>
                <title>Budget utilization donut chart</title>
                <desc>{`Approved Finishes: INR ${approvedSelectionsCost.toLocaleString()} (${Math.round(selPct)}%), Direct Expenses: INR ${expensesCost.toLocaleString()} (${Math.round(expPct)}%), Remaining Budget: INR ${remainingBudget.toLocaleString()} (${Math.round(remPct)}%)`}</desc>
                {/* Background Ring */}
                <circle cx="60" cy="60" r={r} fill="transparent" stroke="#1e293b" strokeWidth="12" />
                
                {/* Selections Ring (Gold) */}
                {selDash > 0 && (
                  <circle
                    cx="60" cy="60" r={r} fill="transparent"
                    stroke="#c5a880" strokeWidth="12"
                    strokeDasharray={`${selDash} ${circumference}`}
                    strokeDashoffset={0}
                    className="transition-all duration-1000 ease-out"
                  />
                )}

                {/* Expenses Ring (Purple) */}
                {expDash > 0 && (
                  <circle
                    cx="60" cy="60" r={r} fill="transparent"
                    stroke="#a78bfa" strokeWidth="12"
                    strokeDasharray={`${expDash} ${circumference}`}
                    strokeDashoffset={-selDash}
                    className="transition-all duration-1000 ease-out"
                  />
                )}

                {/* Remaining Ring (Emerald) */}
                {remDash > 0 && (
                  <circle
                    cx="60" cy="60" r={r} fill="transparent"
                    stroke="#34d399" strokeWidth="12"
                    strokeDasharray={`${remDash} ${circumference}`}
                    strokeDashoffset={-(selDash + expDash)}
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
              
              {/* Central Text overlay */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-display">{utilizationPct}%</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Spent</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gold" />
                  <span className="text-gray-400 font-medium">Approved Finishes</span>
                </div>
                <span className="text-white font-bold">INR {approvedSelectionsCost.toLocaleString()} ({Math.round(selPct)}%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-400" />
                  <span className="text-gray-400 font-medium">Direct Expenses</span>
                </div>
                <span className="text-white font-bold">INR {expensesCost.toLocaleString()} ({Math.round(expPct)}%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-400" />
                  <span className="text-gray-400 font-medium">Remaining Budget</span>
                </div>
                <span className="text-emerald-400 font-bold">INR {remainingBudget > 0 ? remainingBudget.toLocaleString() : 0} ({Math.round(remPct)}%)</span>
              </div>
            </div>
          </div>

          {/* SVG Category Bar Chart */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={14} className="text-gold" />
              Category Sourcing Breakdown
            </h4>

            {categoryEntries.length > 0 ? (
              <div className="overflow-x-auto w-full pb-2">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 h-48 flex items-end justify-between gap-4 min-w-[420px]" role="img" aria-label="Category sourcing breakdown bar chart">
                  {categoryEntries.map((c, i) => {
                    const pctHeight = Math.max(10, Math.round((c.val / maxVal) * 100));
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded cursor-pointer"
                        tabIndex={0}
                        aria-label={`${c.cat}: INR ${c.val.toLocaleString()}`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-gold opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                          INR {c.val.toLocaleString()}
                        </div>
                        
                        {/* Animated Bar */}
                        <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden flex items-end h-[100px] border border-white/5">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${pctHeight}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="w-full bg-gradient-to-t from-gold-dark to-gold rounded-t-md"
                          />
                        </div>

                        <span className="text-[9px] text-gray-500 font-semibold truncate max-w-[50px]" title={c.cat}>
                          {c.cat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-10 text-center">No categories with logged expenses.</p>
            )}
          </div>
        </div>

        {/* Direct Sourced Expenses ledger */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white font-display">Direct Expenses Ledger</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-950 text-gray-500 border-white/5">
                Staff Only
              </span>
            </div>
            
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {projectDetails.expenses.map((e: any) => (
                <div key={e.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-200">{e.category}</span>
                    <span className="text-gold font-bold">INR {e.amount.toLocaleString()}</span>
                  </div>
                  {e.notes && <p className="text-[9px] text-gray-400">{e.notes}</p>}
                  <p className="text-[8px] text-gray-500">{new Date(e.date || Date.now()).toLocaleDateString()}</p>
                </div>
              ))}
              {projectDetails.expenses.length === 0 && (
                <p className="text-xs text-gray-500 italic py-12 text-center">No direct expenses logged.</p>
              )}
            </div>
          </div>

          {currentUser.role !== 'Client' && (
            <form onSubmit={triggerAddExpense} className="space-y-3 pt-4 border-t border-white/5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="budget-expense-category" className="block text-gray-500 mb-1 text-[9px] uppercase font-bold tracking-wider cursor-pointer">Category</label>
                  <input
                    id="budget-expense-category"
                    type="text" required placeholder="Freight, Labour..."
                    value={expenseCat} onChange={(e) => setExpenseCat(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 px-3 py-2.5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="budget-expense-amount" className="block text-gray-500 mb-1 text-[9px] uppercase font-bold tracking-wider cursor-pointer">Amount (INR)</label>
                  <input
                    id="budget-expense-amount"
                    type="number" required placeholder="1500"
                    value={expenseAmt} onChange={(e) => setExpenseAmt(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 px-3 py-2.5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="budget-expense-notes" className="block text-gray-500 mb-1 text-[9px] uppercase font-bold tracking-wider cursor-pointer">Details</label>
                <input
                  id="budget-expense-notes"
                  type="text" placeholder="Detail notes..."
                  value={expenseNote} onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 px-3 py-2.5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 shadow-lg min-h-[48px] flex items-center justify-center transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
              >
                Log Direct Expense
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
