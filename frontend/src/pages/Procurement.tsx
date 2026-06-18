import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { RefreshCw, Search, Calendar, CheckCircle, Package, Truck, Key, User } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_STEPS = ['Ordered', 'Shipped', 'Delivered', 'Installed'] as const;

export default function Procurement() {
  const {
    procurements,
    updateProcurementStatus
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('All');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ordered': return <Package size={14} className="text-amber-400" />;
      case 'Shipped': return <Truck size={14} className="text-sky-400" />;
      case 'Delivered': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'Installed': return <Key size={14} className="text-purple-400" />;
      default: return <Package size={14} className="text-gray-400" />;
    }
  };

  const getStatusBgColor = (status: string, currentStatus: string) => {
    const isCurrent = status === currentStatus;
    if (!isCurrent) return 'bg-slate-950 border-white/5 text-gray-500';
    
    switch (status) {
      case 'Ordered': return 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold';
      case 'Shipped': return 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold';
      case 'Delivered': return 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
      case 'Installed': return 'bg-purple-500/20 border-purple-500 text-purple-400 font-bold';
      default: return 'bg-slate-900 border-white/5 text-gray-400';
    }
  };

  const filteredProcurements = procurements.filter(p => {
    const matchesSearch = p.material.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeFilterStatus === 'All' || p.status === activeFilterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">Procurement Tracker</h2>
        <p className="text-sm text-gray-400">Track shipments, verify vendor dispatcher lead times, and update installation handovers.</p>
      </div>

      {/* Toolbar Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {['All', ...STATUS_STEPS].map(status => (
            <button
              key={status}
              onClick={() => setActiveFilterStatus(status)}
              className={`px-4 py-3 sm:py-2 rounded-xl text-xs font-semibold border transition min-h-[48px] sm:min-h-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
                activeFilterStatus === status
                  ? 'bg-gold-dark/20 border-gold text-gold font-bold'
                  : 'bg-slate-900/40 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-4 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search material or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/5 pl-9 pr-4 py-3 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none min-h-[48px] transition-all"
            aria-label="Search material or supplier"
          />
        </div>
      </div>

      {/* Procurement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProcurements.map((item: any) => (
          <div
            key={item.id}
            className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl space-y-4 hover:border-white/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Material Title & Current Status Badge */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{item.material}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Supplier: <strong className="text-gray-300 font-bold">{item.vendor}</strong></p>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border ${getStatusBgColor(item.status, item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span>{item.status}</span>
                </div>
              </div>

              {/* Quantity & Dates */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5 text-[10px]">
                <div className="space-y-0.5">
                  <span className="text-gray-500 font-semibold uppercase tracking-wider block">Quantity</span>
                  <span className="text-white font-bold text-xs">{item.quantity} units</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-500 font-semibold uppercase tracking-wider block">Ordered</span>
                  <span className="text-white font-bold">{item.orderedDate}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-500 font-semibold uppercase tracking-wider block">Estimated Delivery</span>
                  <span className="text-gold font-bold">{item.deliveryDate}</span>
                </div>
              </div>
            </div>

            {/* Workflow Progress Path & Sourcing Transition triggers */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Logistics Sourcing Status Updates</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_STEPS.map(step => (
                  <button
                    key={step}
                    onClick={() => updateProcurementStatus(item.id, step)}
                    aria-label={`Mark status of ${item.material} as ${step}`}
                    className={`py-3 rounded-lg text-[10px] font-bold border transition min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
                      getStatusBgColor(step, item.status)
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredProcurements.length === 0 && (
          <div className="col-span-2 bg-slate-900/10 border border-dashed border-white/5 rounded-2xl py-16 text-center text-gray-500 text-xs italic">
            No procurement items matching active search filter details.
          </div>
        )}
      </div>
    </div>
  );
}
