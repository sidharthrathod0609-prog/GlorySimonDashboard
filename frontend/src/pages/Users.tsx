import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User } from '../types';
import { Plus, Search, Mail, Shield, UserCheck, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Users() {
  const { usersList, currentUser, addUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Interior Designer' | 'Project Manager' | 'Vendor Coordinator'>('Interior Designer');

  const filteredUsers = usersList.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    const initials = newName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser: User = {
      name: newName,
      email: newEmail,
      role: newRole,
      avatar: initials || 'US',
      password: newPassword
    };

    addUser(newUser);
    
    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('Interior Designer');
    setShowAddForm(false);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-amber-500/15 border-amber-500/35 text-amber-400';
      case 'Interior Designer':
        return 'bg-blue-500/15 border-blue-500/35 text-blue-400';
      case 'Project Manager':
        return 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400';
      case 'Vendor Coordinator':
        return 'bg-purple-500/15 border-purple-500/35 text-purple-400';
      default:
        return 'bg-gray-500/15 border-gray-500/35 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">User Directory</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage workspace user roles and system authentication tokens.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-gold-dark to-gold text-slate-950 text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all min-h-[48px] w-full sm:w-auto"
        >
          <Plus size={16} />
          Create System User
        </button>
      </div>

      {/* Grid with main content and modal form */}
      <div className="relative">
        {/* User Creator Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div role="dialog" aria-modal="true" aria-labelledby="user-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md glass-panel border border-white/10 p-6 bg-slate-900 shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded-lg"
                  title="Close"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <h2 id="user-modal-title" className="text-lg font-bold text-white font-display mb-4">Add System Account</h2>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="user-name" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      id="user-name"
                      type="text"
                      required
                      placeholder="e.g. Meera Nair"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="user-email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                    <input
                      id="user-email"
                      type="email"
                      required
                      placeholder="e.g. meera@glorysimon.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="user-role" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Access Role</label>
                    <select
                      id="user-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] cursor-pointer focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Interior Designer">Interior Designer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Vendor Coordinator">Vendor Coordinator</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="user-password" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Login Password</label>
                    <input
                      id="user-password"
                      type="password"
                      required
                      placeholder="Assign login password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2.5 bg-slate-950 border border-white/5 text-gray-400 text-xs font-bold rounded-xl hover:bg-white/5 min-h-[48px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-br from-gold-dark to-gold text-slate-950 text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] min-h-[48px]"
                    >
                      Confirm Account
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Directory Card */}
        <div className="glass-panel border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3 bg-slate-950/80 border border-white/5 px-4 py-3 rounded-xl w-full sm:max-w-md">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-200 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden sm:table">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  <th className="pb-3 pl-4">Account User</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Workspace Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-4 pl-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-[11px]">
                        {user.avatar || user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200">{user.name}</p>
                        {user.email === currentUser.email && (
                          <span className="text-[9px] text-gold uppercase tracking-wider font-semibold">Active Session</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-emerald-400 font-bold inline-flex items-center gap-1.5 pt-5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Active
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="space-y-3 sm:hidden">
              {filteredUsers.map((user, idx) => (
                <div key={idx} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-[11px] shrink-0">
                        {user.avatar || user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 text-xs">{user.name}</p>
                        {user.email === currentUser.email && (
                          <span className="text-[9px] text-gold uppercase tracking-wider font-semibold">Active Session</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold shrink-0 ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 space-y-1.5 pt-2 border-t border-white/5 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Email Address:</span>
                      <span className="text-white font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
