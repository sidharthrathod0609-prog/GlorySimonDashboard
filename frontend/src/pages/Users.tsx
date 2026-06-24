import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User } from '../types';
import { Plus, Search, X, Trash2, UserCheck, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Users() {
  const { 
    usersList, 
    currentUser, 
    fetchUsers,
    addUser, 
    handleAccessRequest, 
    cancelAccess, 
    deleteUserAccess 
  } = useAppStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
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
      password: newPassword,
      status: 'Approved' // Admin manually added accounts start as Active/Approved
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
        return 'bg-[#D7B57D]/10 border-[#D7B57D]/20 text-[#D7B57D]';
      case 'Interior Designer':
        return 'bg-[#A8B89A]/10 border-[#A8B89A]/20 text-[#4B4B4B]';
      case 'Project Manager':
        return 'bg-[#8AA17A]/10 border-[#8AA17A]/20 text-[#8AA17A]';
      case 'Vendor Coordinator':
        return 'bg-[#A8B89A]/15 border-[#A8B89A]/20 text-[#7D7D7D]';
      default:
        return 'bg-[#F8F6F3] border-slate-100 text-[#7D7D7D]';
    }
  };

  const getStatusBadge = (status?: string) => {
    const activeStatus = status || 'Approved';
    switch (activeStatus) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 bg-[#8AA17A]/10 border border-[#8AA17A]/20 text-[#8AA17A] rounded-full text-[10px] font-semibold inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#8AA17A] rounded-full" />
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 bg-[#D7B57D]/10 border border-[#D7B57D]/20 text-[#D7B57D] rounded-full text-[10px] font-semibold inline-flex items-center gap-1 animate-pulse shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#D7B57D] rounded-full" />
            Pending Approval
          </span>
        );
      case 'Declined':
        return (
          <span className="px-2.5 py-0.5 bg-[#C89A9A]/10 border border-[#C89A9A]/20 text-[#C89A9A] rounded-full text-[10px] font-semibold inline-flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#C89A9A] rounded-full" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const renderActions = (user: User) => {
    if (user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      return <span className="text-[10px] text-[#7D7D7D] italic px-1">Current Account</span>;
    }
    const activeStatus = user.status || 'Approved';
    
    return (
      <div className="flex items-center gap-2">
        {activeStatus === 'Pending' && (
          <>
            <button
              onClick={() => handleAccessRequest(user.email, 'Approved')}
              className="px-2 py-1 bg-[#8AA17A] hover:bg-[#7D916E] text-white text-[10px] font-bold rounded-lg transition active:scale-95 flex items-center gap-0.5 shadow-sm cursor-pointer min-h-[26px]"
              title="Approve User Access"
            >
              Approve
            </button>
            <button
              onClick={() => handleAccessRequest(user.email, 'Declined')}
              className="px-2 py-1 bg-[#C89A9A] hover:bg-[#B78888] text-white text-[10px] font-bold rounded-lg transition active:scale-95 flex items-center gap-0.5 shadow-sm cursor-pointer min-h-[26px]"
              title="Decline User Access"
            >
              Decline
            </button>
          </>
        )}
        {activeStatus === 'Approved' && (
          <button
            onClick={() => cancelAccess(user.email)}
            className="px-2.5 py-1 border border-[#C89A9A]/30 text-[#C89A9A] hover:bg-rose-50 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer min-h-[26px]"
            title="Cancel/Suspend Access"
          >
            Cancel Access
          </button>
        )}
        {activeStatus === 'Declined' && (
          <button
            onClick={() => handleAccessRequest(user.email, 'Approved')}
            className="px-2.5 py-1 bg-[#8AA17A] hover:bg-[#7D916E] text-white text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer min-h-[26px]"
            title="Restore/Approve Access"
          >
            Re-Approve
          </button>
        )}
        <button
          onClick={() => deleteUserAccess(user.email)}
          className="p-1.5 text-[#7D7D7D] hover:text-[#C89A9A] hover:bg-rose-50 rounded-lg transition active:scale-95 cursor-pointer min-h-[26px] flex items-center justify-center border-none bg-transparent"
          title="Delete Account Access"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">User Directory</h1>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">
            Manage workspace user roles, request approvals, and active credentials.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all min-h-[44px] w-full sm:w-auto shadow-sm shadow-[#A8B89A]/15 cursor-pointer"
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
            <div role="dialog" aria-modal="true" aria-labelledby="user-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white border border-[#A8B89A]/15 p-6 rounded-[24px] shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 text-[#7D7D7D] hover:text-[#4B4B4B] p-2 rounded-lg transition"
                  title="Close"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <h2 id="user-modal-title" className="text-lg font-light text-[#4B4B4B] font-display mb-4">Add System Account</h2>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="user-name" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Full Name</label>
                    <input
                      id="user-name"
                      type="text"
                      required
                      placeholder="e.g. Meera Nair"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="user-email" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Email Address</label>
                    <input
                      id="user-email"
                      type="email"
                      required
                      placeholder="e.g. meera@glorysimon.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="user-role" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Access Role</label>
                    <select
                      id="user-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] cursor-pointer focus:border-[#A8B89A] transition-all"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Interior Designer">Interior Designer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Vendor Coordinator">Vendor Coordinator</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="user-password" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Login Password</label>
                    <input
                      id="user-password"
                      type="password"
                      required
                      placeholder="Assign login password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2.5 bg-slate-50 border border-slate-100 text-[#7D7D7D] text-xs font-semibold rounded-xl hover:bg-slate-100 min-h-[44px] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white text-xs font-bold rounded-xl active:scale-[0.98] min-h-[44px] transition-all"
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
        <div className="bg-white border border-[#A8B89A]/10 p-6 rounded-[24px] space-y-4 shadow-sm">
          <div className="flex items-center gap-3 bg-[#F8F6F3] border border-[#A8B89A]/15 px-4 py-2 rounded-xl w-full sm:max-w-md shadow-sm">
            <Search size={16} className="text-[#7D7D7D]" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-[#4B4B4B] focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden sm:table">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] text-[#7D7D7D] uppercase font-bold tracking-wider">
                  <th className="pb-3 pl-4">Account User</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Workspace Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-4">Access Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F6F3]/40 transition-all">
                    <td className="py-4 pl-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A8B89A]/10 border border-[#A8B89A]/20 text-[#A8B89A] flex items-center justify-center font-bold text-[11px]">
                        {user.avatar || user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#4B4B4B]">{user.name}</p>
                        {user.email.toLowerCase() === currentUser.email.toLowerCase() && (
                          <span className="text-[9px] text-[#8AA17A] uppercase tracking-wider font-semibold">Active Session</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-[#7D7D7D]">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 text-right pr-4 flex justify-end">
                      {renderActions(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="space-y-3 sm:hidden">
              {filteredUsers.map((user, idx) => (
                <div key={idx} className="p-4 bg-white border border-[#A8B89A]/10 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A8B89A]/10 border border-[#A8B89A]/20 text-[#A8B89A] flex items-center justify-center font-bold text-[11px] shrink-0">
                        {user.avatar || user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#4B4B4B] text-xs">{user.name}</p>
                        {user.email.toLowerCase() === currentUser.email.toLowerCase() && (
                          <span className="text-[9px] text-[#8AA17A] uppercase tracking-wider font-semibold">Active Session</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold shrink-0 ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#7D7D7D] space-y-1.5 pt-2 border-t border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7D7D7D]">Email Address:</span>
                      <span className="text-[#4B4B4B] font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7D7D7D]">Status:</span>
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                      <span className="text-[#7D7D7D]">Actions:</span>
                      {renderActions(user)}
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
