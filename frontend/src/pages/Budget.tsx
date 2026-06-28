import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AlertTriangle, Plus, Wallet, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

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
      <div className="bg-white border border-[#A8B89A]/10 rounded-[24px] p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-[#A8B89A]/10 rounded-full flex items-center justify-center text-[#A8B89A] mx-auto">
          <Wallet size={24} />
        </div>
        <h3 className="text-lg font-light text-[#4B4B4B]">No Workspace Selected</h3>
        <p className="text-xs text-[#7D7D7D] font-light max-w-md mx-auto">
          Please select an active project workspace from the header selector to load the budget ledger.
        </p>
        <div className="flex flex-col items-center justify-center mt-2 space-y-2">
          <label className="text-[9px] text-[#7D7D7D] font-bold uppercase tracking-wider">Select Project Workspace</label>
          <CustomSelect
            value={String(activeProjectId || '')}
            onChange={(val) => setActiveProjectId(Number(val))}
            options={projects.map(p => ({ value: String(p.id), label: p.name }))}
            placeholder="Select project workspace..."
            className="w-64"
          />
        </div>
      </div>
    );
  }

  if (!projectDetails) return <div className="text-center py-20 text-[#7D7D7D]">Loading financial ledger...</div>;

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
    if (pct > 100) return 'text-[#C89A9A]';
    if (pct >= 75) return 'text-[#D7B57D]';
    return 'text-[#8AA17A]';
  };

  // Chart 2: Category Bar Chart calculations
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
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Budget Tracking & Cost Ledger</h2>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">Run audit controls, log direct expenses, and configure alerts for: <strong className="text-[#A8B89A] font-semibold">{projectDetails.project.name}</strong></p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#A8B89A]/15 px-4 py-1.5 rounded-2xl w-full md:w-auto shadow-sm">
          <label className="text-[10px] text-[#7D7D7D] font-bold uppercase tracking-wider cursor-pointer">Workspace:</label>
          <CustomSelect
            value={String(activeProjectId || '')}
            onChange={(val) => setActiveProjectId(Number(val))}
            options={projects.map(p => ({ value: String(p.id), label: p.name }))}
            className="w-48 text-xs font-bold"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#A8B89A]/10 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1">Total Budget Cap</span>
          <p className="text-lg font-semibold text-[#4B4B4B] font-display">INR {totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#A8B89A]/10 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1">Total Cost Sourced</span>
          <p className="text-lg font-semibold text-[#4B4B4B] font-display">INR {totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#A8B89A]/10 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1">Remaining Balance</span>
          <p className={`text-lg font-semibold font-display ${remainingBudget < 0 ? 'text-[#C89A9A]' : 'text-[#8AA17A]'}`}>
            INR {remainingBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-[#A8B89A]/10 p-5 rounded-[24px] shadow-sm">
          <span className="text-[9px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1">Utilization</span>
          <p className={`text-lg font-semibold font-display ${getBudgetTextColor(utilizationPct)}`}>{utilizationPct}%</p>
        </div>
      </div>

      {/* Warning Alert banner */}
      {utilizationPct >= 75 && (
        <div className={`p-4 rounded-[20px] border flex items-center gap-3 text-xs ${
          utilizationPct > 100 
            ? 'bg-[#C89A9A]/10 border-[#C89A9A]/30 text-[#C89A9A]' 
            : 'bg-[#D7B57D]/10 border-[#D7B57D]/30 text-[#D7B57D]'
        }`}>
          <AlertTriangle size={16} />
          <span className="font-medium">
            {utilizationPct > 100 
              ? 'WARNING: Sourced costs exceed allocated contract budget cap! Take immediate corrective action.'
              : 'CAUTION: Budget utilization rate has reached warning levels.'}
          </span>
        </div>
      )}

      {/* Spend chart visual & direct expense logger split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Charts Box */}
        <div className="bg-white border border-[#A8B89A]/10 p-6 rounded-[24px] lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <h3 className="text-sm font-light text-[#4B4B4B] font-display flex items-center gap-2">
              <PieIcon size={16} className="text-[#A8B89A]" />
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
                <circle cx="60" cy="60" r={r} fill="transparent" className="stroke-slate-50" strokeWidth="10" />
                
                {/* Selections Ring (Soft Green) */}
                {selDash > 0 && (
                  <circle
                    cx="60" cy="60" r={r} fill="transparent"
                    stroke="#8AA17A" strokeWidth="10"
                    strokeDasharray={`${selDash} ${circumference}`}
                    strokeDashoffset={0}
                    className="transition-all duration-1000 ease-out"
                  />
                )}

                {/* Expenses Ring (Sage Green) */}
                {expDash > 0 && (
                  <circle
                    cx="60" cy="60" r={r} fill="transparent"
                    stroke="#A8B89A" strokeWidth="10"
                    strokeDasharray={`${expDash} ${circumference}`}
                    strokeDashoffset={-selDash}
                    className="transition-all duration-1000 ease-out"
                  />
                )}

                {/* Remaining Ring (Sand) */}
                {remDash > 0 && (
                  <circle
                    cx="60" cy="60" r={r} fill="transparent"
                    stroke="#D7B57D" strokeWidth="10"
                    strokeDasharray={`${remDash} ${circumference}`}
                    strokeDashoffset={-(selDash + expDash)}
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
              
              {/* Central Text overlay */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-light text-[#4B4B4B] font-display">{utilizationPct}%</span>
                <span className="text-[8px] text-[#7D7D7D] uppercase tracking-widest font-bold">Spent</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#8AA17A]" />
                  <span className="text-[#7D7D7D] font-light">Approved Finishes</span>
                </div>
                <span className="text-[#4B4B4B] font-semibold">INR {approvedSelectionsCost.toLocaleString()} ({Math.round(selPct)}%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#A8B89A]" />
                  <span className="text-[#7D7D7D] font-light">Direct Expenses</span>
                </div>
                <span className="text-[#4B4B4B] font-semibold">INR {expensesCost.toLocaleString()} ({Math.round(expPct)}%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#D7B57D]" />
                  <span className="text-[#7D7D7D] font-light">Remaining Budget</span>
                </div>
                <span className="text-[#7D7D7D] font-semibold">INR {remainingBudget > 0 ? remainingBudget.toLocaleString() : 0} ({Math.round(remPct)}%)</span>
              </div>
            </div>
          </div>

          {/* SVG Category Bar Chart */}
          <div className="pt-6 border-t border-slate-50 space-y-4">
            <h4 className="text-[10px] font-bold text-[#7D7D7D] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={14} className="text-[#A8B89A]" />
              Category Sourcing Breakdown
            </h4>

            {categoryEntries.length > 0 ? (
              <div className="overflow-x-auto w-full pb-2">
                <div className="bg-[#F8F6F3] dark:bg-slate-900/60 p-4 pt-8 rounded-[20px] border border-slate-100 dark:border-slate-800/80 h-56 flex items-end justify-between gap-4 min-w-[420px]" role="img" aria-label="Category sourcing breakdown bar chart">
                  {categoryEntries.map((c, i) => {
                    const pctHeight = Math.max(10, Math.round((c.val / maxVal) * 100));
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end outline-none rounded cursor-pointer"
                        tabIndex={0}
                        aria-label={`${c.cat}: INR ${c.val.toLocaleString()}`}
                      >
                        {/* Bar container with relative positioning and group hover */}
                        <div className="w-full relative group flex flex-col justify-end items-center">
                          {/* Tooltip positioned relative to the bar */}
                          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#4B4B4B] dark:bg-slate-800 border border-[#A8B89A]/30 px-2 py-1 rounded-lg text-[9px] font-bold text-[#A8B89A] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg z-20 pointer-events-none">
                            INR {c.val.toLocaleString()}
                          </div>
                          
                          {/* Animated Bar */}
                          <div className="w-full bg-white dark:bg-slate-950 rounded-t-lg overflow-hidden flex items-end h-[100px] border border-slate-150 dark:border-slate-850">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${pctHeight}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="w-full bg-[#A8B89A] rounded-t-md"
                            />
                          </div>
                        </div>

                        <span className="text-[9px] text-[#7D7D7D] dark:text-slate-400 font-semibold truncate max-w-[50px]" title={c.cat}>
                          {c.cat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#7D7D7D] italic py-10 text-center">No categories with logged expenses.</p>
            )}
          </div>
        </div>

        {/* Direct Sourced Expenses ledger */}
        <div className="bg-white border border-[#A8B89A]/10 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-sm font-light text-[#4B4B4B] font-display">Direct Expenses Ledger</h3>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold border bg-[#F8F6F3] text-[#7D7D7D] border-[#A8B89A]/10 uppercase tracking-wider">
                Staff Only
              </span>
            </div>
            
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {projectDetails.expenses.map((e: any) => (
                <div key={e.id} className="p-3 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#4B4B4B]">{e.category}</span>
                    <span className="text-[#8AA17A] font-bold">INR {e.amount.toLocaleString()}</span>
                  </div>
                  {e.notes && <p className="text-[9px] text-[#7D7D7D] font-light">{e.notes}</p>}
                  <p className="text-[8px] text-[#7D7D7D]/60">{new Date(e.date || Date.now()).toLocaleDateString()}</p>
                </div>
              ))}
              {projectDetails.expenses.length === 0 && (
                <p className="text-xs text-[#7D7D7D] italic py-12 text-center">No direct expenses logged.</p>
              )}
            </div>
          </div>

          {currentUser.role !== 'Client' && (
            <form onSubmit={triggerAddExpense} className="space-y-3 pt-4 border-t border-slate-50 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="budget-expense-category" className="block text-[#7D7D7D] mb-1 text-[9px] uppercase font-bold tracking-wider cursor-pointer">Category</label>
                  <input
                    id="budget-expense-category"
                    type="text" required placeholder="Freight, Labour..."
                    value={expenseCat} onChange={(e) => setExpenseCat(e.target.value)}
                    className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-lg text-[#4B4B4B] placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] min-h-[40px] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="budget-expense-amount" className="block text-[#7D7D7D] mb-1 text-[9px] uppercase font-bold tracking-wider cursor-pointer">Amount (INR)</label>
                  <input
                    id="budget-expense-amount"
                    type="number" required placeholder="1500"
                    value={expenseAmt} onChange={(e) => setExpenseAmt(e.target.value)}
                    className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-lg text-[#4B4B4B] placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] min-h-[40px] transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="budget-expense-notes" className="block text-[#7D7D7D] mb-1 text-[9px] uppercase font-bold tracking-wider cursor-pointer">Details</label>
                <input
                  id="budget-expense-notes"
                  type="text" placeholder="Detail notes..."
                  value={expenseNote} onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-lg text-[#4B4B4B] placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] min-h-[40px] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-bold rounded-xl text-xs transition active:scale-[0.99] outline-none"
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
