import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, CheckCircle, Package, Truck, Key } from 'lucide-react';

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
      case 'Ordered': return <Package size={14} className="text-[#D7B57D]" />;
      case 'Shipped': return <Truck size={14} className="text-[#A8B89A]" />;
      case 'Delivered': return <CheckCircle size={14} className="text-[#8AA17A]" />;
      case 'Installed': return <Key size={14} className="text-[#8AA17A]" />;
      default: return <Package size={14} className="text-[#7D7D7D]" />;
    }
  };

  const getStatusBgColor = (status: string, currentStatus: string) => {
    const isCurrent = status === currentStatus;
    if (!isCurrent) return 'bg-[#F8F6F3]/50 border-slate-100 text-[#7D7D7D]';
    
    switch (status) {
      case 'Ordered': return 'bg-[#D7B57D]/10 border-[#D7B57D] text-[#D7B57D] font-semibold';
      case 'Shipped': return 'bg-[#A8B89A]/10 border-[#A8B89A] text-[#A8B89A] font-semibold';
      case 'Delivered': return 'bg-[#8AA17A]/10 border-[#8AA17A] text-[#8AA17A] font-semibold';
      case 'Installed': return 'bg-[#8AA17A]/15 border-[#8AA17A] text-[#4B4B4B] font-semibold';
      default: return 'bg-white border-slate-100 text-[#7D7D7D]';
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
        <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Procurement Tracker</h2>
        <p className="text-xs text-[#7D7D7D] font-light mt-1">Track shipments, verify vendor dispatcher lead times, and update installation handovers.</p>
      </div>

      {/* Toolbar Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {['All', ...STATUS_STEPS].map(status => (
            <button
              key={status}
              onClick={() => setActiveFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition min-h-[38px] flex items-center justify-center outline-none ${
                activeFilterStatus === status
                  ? 'bg-[#A8B89A]/10 border-[#A8B89A] text-[#A8B89A] font-bold'
                  : 'bg-white border-slate-100 text-[#7D7D7D] hover:text-[#4B4B4B] hover:bg-slate-50 shadow-sm'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shadow-sm rounded-xl">
          <Search className="absolute left-3.5 top-3.5 text-[#7D7D7D]" size={14} />
          <input
            type="text"
            placeholder="Search material or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#A8B89A]/20 pl-9 pr-4 py-2.5 rounded-xl text-xs text-[#4B4B4B] placeholder-[#7D7D7D]/60 focus:outline-none focus:border-[#A8B89A] outline-none transition-all"
            aria-label="Search material or supplier"
          />
        </div>
      </div>

      {/* Procurement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProcurements.map((item: any) => (
          <div
            key={item.id}
            className="bg-white border border-[#A8B89A]/10 p-5 rounded-[24px] space-y-4 hover:border-[#A8B89A]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Material Title & Current Status Badge */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-semibold text-[#4B4B4B] text-sm line-clamp-1">{item.material}</h4>
                  <p className="text-[10px] text-[#7D7D7D] mt-0.5">Supplier: <strong className="text-[#4B4B4B] font-semibold">{item.vendor}</strong></p>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border ${getStatusBgColor(item.status, item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span>{item.status}</span>
                </div>
              </div>

              {/* Quantity & Dates */}
              <div className="grid grid-cols-3 gap-2 bg-[#F8F6F3] p-3 rounded-xl border border-slate-100 text-[10px]">
                <div className="space-y-0.5">
                  <span className="text-[#7D7D7D] font-semibold uppercase tracking-wider block">Quantity</span>
                  <span className="text-[#4B4B4B] font-bold text-xs">{item.quantity} units</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[#7D7D7D] font-semibold uppercase tracking-wider block">Ordered</span>
                  <span className="text-[#4B4B4B] font-bold">{item.orderedDate}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[#7D7D7D] font-semibold uppercase tracking-wider block">Est. Delivery</span>
                  <span className="text-[#8AA17A] font-bold">{item.deliveryDate}</span>
                </div>
              </div>
            </div>

            {/* Workflow Progress Path & Sourcing Transition triggers */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Logistics Status Updates</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_STEPS.map(step => (
                  <button
                    key={step}
                    onClick={() => updateProcurementStatus(item.id, step)}
                    aria-label={`Mark status of ${item.material} as ${step}`}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition min-h-[38px] flex items-center justify-center outline-none ${
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
          <div className="col-span-2 bg-white border border-dashed border-[#A8B89A]/30 rounded-[24px] py-16 text-center text-[#7D7D7D] text-xs italic shadow-sm">
            No procurement items matching active search filter details.
          </div>
        )}
      </div>
    </div>
  );
}
