import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Client, Project } from '../types';
import { Plus, Search, Mail, Phone, MapPin, Edit, FolderOpen, Briefcase, UserCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Clients() {
  const { clients, projects, fetchClients, createClient, updateClient, setActiveProjectId } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<Client | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'Residential' | 'Commercial'>('Residential');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchClients();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setAddress('');
    setType('Residential');
    setStatus('Active');
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await createClient({
      name,
      email,
      phone,
      company: company || 'N/A',
      type,
      status
    });

    resetForm();
    setShowAddForm(false);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditForm || !name) return;

    await updateClient(showEditForm.id, {
      name,
      email,
      phone,
      company: company || 'N/A',
      type,
      status
    });

    resetForm();
    setShowEditForm(null);
  };

  const openEditModal = (client: Client) => {
    setName(client.name);
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setCompany(client.company || '');
    setShowEditForm(client);
  };

  const handleViewProjects = (clientName: string) => {
    // Find projects matching client name
    const clientProjects = projects.filter(p => p.client_name?.toLowerCase() === clientName.toLowerCase());
    if (clientProjects.length > 0) {
      // Set the first project as active
      setActiveProjectId(clientProjects[0].id);
      navigate('/projects');
    } else {
      alert(`No active projects found for client: ${clientName}`);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (client.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    (client.company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Client Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Store and manage customer details, phone numbers, emails, and mapped workspace projects.
          </p>
        </div>
        
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-gold-dark to-gold text-slate-950 text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all min-h-[48px] w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="relative">
        {/* Modals: Add / Edit Form */}
        <AnimatePresence>
          {(showAddForm || showEditForm) && (
            <div role="dialog" aria-modal="true" aria-labelledby="client-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md glass-panel border border-white/10 p-6 bg-slate-900 shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button
                  onClick={() => { setShowAddForm(false); setShowEditForm(null); }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none rounded-lg"
                  title="Close"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <h2 id="client-modal-title" className="text-lg font-bold text-white font-display mb-4">
                  {showAddForm ? 'Add Customer Details' : 'Edit Customer Details'}
                </h2>
                
                <form onSubmit={showAddForm ? handleCreateClient : handleUpdateClient} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label htmlFor="client-name" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="e.g. Sidharth Rathod"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="client-phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
                      <input
                        id="client-phone"
                        type="text"
                        placeholder="e.g. +91 99999 88888"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="client-email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                      <input
                        id="client-email"
                        type="email"
                        placeholder="e.g. sidharth@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="client-address" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Address</label>
                    <input
                      id="client-address"
                      type="text"
                      placeholder="e.g. Flat 1402, Highrise Heights, Bandra West, Mumbai"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="client-type" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Client Type</label>
                      <select
                        id="client-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="client-status" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</label>
                      <select
                        id="client-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-white rounded-xl focus:border-gold outline-none px-3 py-2.5 text-xs cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => { setShowAddForm(false); setShowEditForm(null); }}
                      className="flex-1 py-2.5 bg-slate-950 border border-white/5 text-gray-400 text-xs font-bold rounded-xl hover:bg-white/5 min-h-[48px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-br from-gold-dark to-gold text-slate-950 text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] min-h-[48px]"
                    >
                      Save Client
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
              placeholder="Search clients by name, email, or address..."
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
                  <th className="pb-3 pl-4">Client Customer</th>
                  <th className="pb-3">Contact Sourcing Details</th>
                  <th className="pb-3">Registered Address</th>
                  <th className="pb-3">Project Type</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-4 pl-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-[11px]">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200">{client.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          client.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 space-y-1">
                      <p className="text-gray-300 flex items-center gap-1.5"><Phone size={12} className="text-gray-500" /> {client.phone || 'N/A'}</p>
                      <p className="text-gray-400 flex items-center gap-1.5"><Mail size={12} className="text-gray-500" /> {client.email || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-gray-300 max-w-[200px] truncate" title={client.company}>
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-500 flex-shrink-0" /> {client.company || 'N/A'}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                        client.type === 'Residential' ? 'bg-blue-500/15 border-blue-500/35 text-blue-400' : 'bg-purple-500/15 border-purple-500/35 text-purple-400'
                      }`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4 space-x-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-gold transition inline-flex items-center"
                        title="Edit Client"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleViewProjects(client.name)}
                        className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-sky-400 transition inline-flex items-center gap-1 text-[10px] font-bold"
                        title="View Projects"
                      >
                        <FolderOpen size={12} />
                        <span>View Projects</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 italic">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="space-y-3 sm:hidden">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-[11px] shrink-0">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 text-xs">{client.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          client.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold shrink-0 ${
                      client.type === 'Residential' ? 'bg-blue-500/15 border-blue-500/35 text-blue-400' : 'bg-purple-500/15 border-purple-500/35 text-purple-400'
                    }`}>
                      {client.type}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-500 flex-shrink-0" />
                      <span className="text-white">{client.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-500 flex-shrink-0" />
                      <span className="text-white">{client.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin size={12} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-white leading-relaxed">{client.company || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => openEditModal(client)}
                      className="flex-1 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-gray-300 hover:text-gold transition text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
                      title="Edit Client"
                    >
                      <Edit size={12} />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => handleViewProjects(client.name)}
                      className="flex-1 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-gray-300 hover:text-sky-400 transition text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
                      title="View Projects"
                    >
                      <FolderOpen size={12} />
                      <span>View Projects</span>
                    </button>
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <p className="text-xs text-gray-500 italic py-10 text-center">No customers found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
