import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, AlertTriangle, Palette, Calendar, Clock, Check, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const {
    notifications,
    fetchNotifications
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<'All' | 'budget' | 'approval' | 'visit' | 'vendor'>('All');

  // Trigger notification generation on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget': return <AlertTriangle size={16} className="text-rose-400" />;
      case 'approval': return <Palette size={16} className="text-amber-400" />;
      case 'visit': return <Calendar size={16} className="text-sky-400" />;
      case 'vendor': return <ShieldAlert size={16} className="text-purple-400" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getNotificationBorder = (type: string, read: boolean) => {
    if (read) return 'border-white/5 bg-slate-900/10 opacity-60';
    switch (type) {
      case 'budget': return 'border-rose-500/20 bg-rose-950/10';
      case 'approval': return 'border-amber-500/20 bg-amber-950/10';
      case 'visit': return 'border-sky-500/20 bg-sky-950/10';
      case 'vendor': return 'border-purple-500/20 bg-purple-950/10';
      default: return 'border-white/10 bg-slate-900/40';
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    useAppStore.setState({ notifications: updated });
  };

  const toggleReadStatus = (id: number) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    useAppStore.setState({ notifications: updated });
  };

  const dismissNotification = (id: number) => {
    const updated = notifications.filter(n => n.id !== id);
    useAppStore.setState({ notifications: updated });
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <Bell size={24} className="text-gold" />
            Live System Alerts
          </h2>
          <p className="text-sm text-gray-400">Review pending material selections, designer schedules, and project budget cap warnings.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-200 rounded-xl text-xs font-semibold hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
          >
            <Check size={14} className="text-gold" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Category Filters panel */}
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 px-2.5">Alert Categories</span>
          {[
            { id: 'All', label: 'All Notifications', count: notifications.length },
            { id: 'budget', label: 'Budget Warnings', count: notifications.filter(n => n.type === 'budget').length },
            { id: 'approval', label: 'Material Sign-offs', count: notifications.filter(n => n.type === 'approval').length },
            { id: 'visit', label: 'Site Visits', count: notifications.filter(n => n.type === 'visit').length },
            { id: 'vendor', label: 'Vendor Dispatchers', count: notifications.filter(n => n.type === 'vendor').length }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`w-full flex justify-between items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none ${
                activeFilter === filter.id
                  ? 'bg-gold-dark/20 border-gold text-gold font-bold'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeFilter === filter.id ? 'bg-gold/20 text-gold' : 'bg-slate-950 text-gray-500'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((item: any) => (
              <motion.div
                key={item.id}
                layoutId={`notify-row-${item.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-white/10 transition-all ${getNotificationBorder(item.type, item.read)}`}
              >
                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-center shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs font-bold ${item.read ? 'text-gray-400' : 'text-white'}`}>{item.title}</h4>
                      {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${item.read ? 'text-gray-500' : 'text-gray-300'}`}>{item.message}</p>
                    <span className="text-[9px] text-gray-500 block">{item.date}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 self-end sm:self-auto shrink-0 border-t border-white/5 sm:border-none pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => toggleReadStatus(item.id)}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
                    title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                    aria-label={item.read ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    <Check size={14} className={item.read ? 'text-gray-500' : 'text-gold'} />
                  </button>
                  <button
                    onClick={() => dismissNotification(item.id)}
                    className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-500/50 outline-none"
                    title="Dismiss Alert"
                    aria-label={`Dismiss Alert: ${item.title}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotifications.length === 0 && (
            <div className="bg-slate-900/10 border border-dashed border-white/5 rounded-2xl py-20 text-center text-gray-500 text-xs italic">
              All clear! No pending notifications in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
