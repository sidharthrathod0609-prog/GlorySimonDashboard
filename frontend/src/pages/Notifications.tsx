import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, AlertTriangle, Palette, Calendar, Check, X, ShieldAlert, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const {
    notifications,
    fetchNotifications,
    currentUser,
    handleAccessRequest,
    markNotificationRead,
    deleteNotification
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<'All' | 'budget' | 'approval' | 'visit' | 'vendor' | 'access'>('All');

  // Trigger notification generation on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget': return <AlertTriangle size={16} className="text-[#C89A9A]" />;
      case 'approval': return <Palette size={16} className="text-[#8AA17A]" />;
      case 'visit': return <Calendar size={16} className="text-[#A8B89A]" />;
      case 'vendor': return <ShieldAlert size={16} className="text-[#A8B89A]" />;
      case 'access': return <UserPlus size={16} className="text-[#A8B89A]" />;
      default: return <Bell size={16} className="text-[#7D7D7D]" />;
    }
  };

  const getNotificationBorder = (type: string, read: boolean) => {
    if (read) return 'border-slate-100 bg-[#F8F6F3]/50 opacity-60';
    switch (type) {
      case 'budget': return 'border-[#C89A9A]/30 bg-[#C89A9A]/5';
      case 'approval': return 'border-[#8AA17A]/30 bg-[#8AA17A]/5';
      case 'visit': return 'border-[#A8B89A]/30 bg-[#A8B89A]/5';
      case 'vendor': return 'border-[#A8B89A]/20 bg-[#A8B89A]/5';
      case 'access': return 'border-[#A8B89A]/30 bg-[#A8B89A]/5';
      default: return 'border-slate-100 bg-white';
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display flex items-center gap-2.5">
            <Bell size={24} className="text-[#A8B89A]" />
            Live System Alerts
          </h2>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">Review pending material selections, designer schedules, and project budget cap warnings.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white border border-[#A8B89A]/15 text-[#7D7D7D] hover:text-[#4B4B4B] rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 min-h-[38px] outline-none shadow-sm"
          >
            <Check size={14} className="text-[#8AA17A]" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Category Filters panel */}
        <div className="bg-white border border-[#A8B89A]/10 p-4 rounded-[24px] space-y-1.5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block mb-2 px-2.5">Alert Categories</span>
          {[
            { id: 'All', label: 'All Notifications', count: notifications.length },
            { id: 'budget', label: 'Budget Warnings', count: notifications.filter(n => n.type === 'budget').length },
            { id: 'approval', label: 'Material Sign-offs', count: notifications.filter(n => n.type === 'approval').length },
            { id: 'visit', label: 'Site Visits', count: notifications.filter(n => n.type === 'visit').length },
            { id: 'vendor', label: 'Vendor Dispatchers', count: notifications.filter(n => n.type === 'vendor').length },
            ...(currentUser.role === 'Admin' ? [{ id: 'access', label: 'Access Requests', count: notifications.filter(n => n.type === 'access').length }] : [])
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-semibold border transition min-h-[44px] outline-none ${
                activeFilter === filter.id
                  ? 'bg-[#A8B89A]/10 border-[#A8B89A]/20 text-[#A8B89A] font-bold'
                  : 'bg-transparent border-transparent text-[#7D7D7D] hover:text-[#4B4B4B] hover:bg-slate-50'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeFilter === filter.id ? 'bg-[#A8B89A]/20 text-[#A8B89A]' : 'bg-[#F8F6F3] text-[#7D7D7D]'}`}>
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
                className={`p-4 border rounded-[24px] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-[#A8B89A]/30 transition-all ${getNotificationBorder(item.type, item.read)}`}
              >
                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-xl bg-[#F8F6F3] border border-slate-100 flex items-center justify-center shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs font-semibold ${item.read ? 'text-[#7D7D7D]' : 'text-[#4B4B4B]'}`}>{item.title}</h4>
                      {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-[#8AA17A]" />}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${item.read ? 'text-[#7D7D7D]' : 'text-[#7D7D7D] font-medium'}`}>{item.message}</p>
                    <span className="text-[9px] text-[#7D7D7D]/60 block">{item.date}</span>

                    {/* Access Request Accept/Decline action buttons */}
                    {item.type === 'access' && currentUser.role === 'Admin' && !item.message.startsWith('[Approved]') && !item.message.startsWith('[Declined]') && (
                      <div className="flex items-center gap-2 pt-2.5">
                        <button
                          type="button"
                          onClick={() => handleAccessRequest(item.requestEmail, 'Approved')}
                          className="px-3.5 py-1 bg-[#8AA17A] hover:bg-[#7D916E] text-white text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer shadow-sm shadow-[#8AA17A]/10 min-h-[26px]"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccessRequest(item.requestEmail, 'Declined')}
                          className="px-3.5 py-1 bg-[#C89A9A] hover:bg-[#B78888] text-white text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer shadow-sm shadow-[#C89A9A]/10 min-h-[26px]"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 self-end sm:self-auto shrink-0 border-t border-slate-100 sm:border-none pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => toggleReadStatus(item.id)}
                    className="p-2 text-[#7D7D7D] hover:text-[#4B4B4B] hover:bg-slate-50 rounded-xl transition min-h-[38px] flex items-center justify-center outline-none"
                    title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                    aria-label={item.read ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    <Check size={14} className={item.read ? 'text-[#7D7D7D]' : 'text-[#8AA17A]'} />
                  </button>
                  <button
                    onClick={() => dismissNotification(item.id)}
                    className="p-2 text-[#7D7D7D] hover:text-[#C89A9A] hover:bg-rose-50 rounded-xl transition min-h-[38px] flex items-center justify-center outline-none"
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
            <div className="bg-[#F8F6F3]/50 border border-dashed border-[#A8B89A]/30 rounded-[24px] py-20 text-center text-[#7D7D7D] text-xs italic">
              All clear! No pending notifications in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
