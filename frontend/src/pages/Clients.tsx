import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Client } from '../types';
import { Plus, Search, Mail, Phone, MapPin, Edit, FolderOpen, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Clients() {
  const { clients, projects, fetchClients, createClient, updateClient, deleteClient, setActiveProjectId } = useAppStore();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Client Management</h1>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">
            Store and manage customer details, phone numbers, emails, and mapped workspace projects.
          </p>
        </div>
        
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all min-h-[44px] w-full sm:w-auto shadow-sm shadow-[#A8B89A]/15"
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
            <div role="dialog" aria-modal="true" aria-labelledby="client-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white border border-[#A8B89A]/15 p-6 rounded-[24px] shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button
                  onClick={() => { setShowAddForm(false); setShowEditForm(null); }}
                  className="absolute top-4 right-4 text-[#7D7D7D] hover:text-[#4B4B4B] p-2 rounded-lg transition"
                  title="Close"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <h2 id="client-modal-title" className="text-lg font-light text-[#4B4B4B] font-display mb-4">
                  {showAddForm ? 'Add Customer Details' : 'Edit Customer Details'}
                </h2>
                
                <form onSubmit={showAddForm ? handleCreateClient : handleUpdateClient} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label htmlFor="client-name" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Full Name</label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="e.g. Sidharth Rathod"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="client-phone" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Phone Number</label>
                      <input
                        id="client-phone"
                        type="text"
                        placeholder="e.g. +91 99999 88888"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="client-email" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Email Address</label>
                      <input
                        id="client-email"
                        type="email"
                        placeholder="e.g. sidharth@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="client-address" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Address</label>
                    <input
                      id="client-address"
                      type="text"
                      placeholder="e.g. Flat 1402, Highrise Heights, Bandra West, Mumbai"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs min-h-[40px] focus:border-[#A8B89A] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="client-type" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Client Type</label>
                      <select
                        id="client-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs cursor-pointer min-h-[40px] focus:border-[#A8B89A] transition-all"
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="client-status" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider block">Status</label>
                      <select
                        id="client-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 text-[#4B4B4B] rounded-xl outline-none px-3 py-2 text-xs cursor-pointer min-h-[40px] focus:border-[#A8B89A] transition-all"
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
                      className="flex-1 py-2.5 bg-slate-50 border border-slate-100 text-[#7D7D7D] text-xs font-semibold rounded-xl hover:bg-slate-100 min-h-[44px] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white text-xs font-bold rounded-xl active:scale-[0.98] min-h-[44px] transition-all"
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
        <div className="bg-white border border-[#A8B89A]/10 p-6 rounded-[24px] space-y-4 shadow-sm">
          <div className="flex items-center gap-3 bg-[#F8F6F3] border border-[#A8B89A]/15 px-4 py-2 rounded-xl w-full sm:max-w-md shadow-sm">
            <Search size={16} className="text-[#7D7D7D]" />
            <input
              type="text"
              placeholder="Search clients by name, email, or address..."
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
                  <th className="pb-3 pl-4">Client Customer</th>
                  <th className="pb-3">Contact Sourcing Details</th>
                  <th className="pb-3">Registered Address</th>
                  <th className="pb-3">Project Type</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#F8F6F3]/40 transition-all">
                    <td className="py-4 pl-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A8B89A]/10 border border-[#A8B89A]/20 text-[#A8B89A] flex items-center justify-center font-bold text-[11px]">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#4B4B4B]">{client.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${
                          client.status === 'Active' ? 'bg-[#8AA17A]/10 border-[#8AA17A]/20 text-[#8AA17A]' : 'bg-[#C89A9A]/10 border-[#C89A9A]/20 text-[#C89A9A]'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 space-y-1">
                      <p className="text-[#4B4B4B] flex items-center gap-1.5"><Phone size={12} className="text-[#7D7D7D]" /> {client.phone || 'N/A'}</p>
                      <p className="text-[#7D7D7D] flex items-center gap-1.5"><Mail size={12} className="text-[#7D7D7D]" /> {client.email || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-[#4B4B4B] max-w-[200px] truncate" title={client.company}>
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#7D7D7D] flex-shrink-0" /> {client.company || 'N/A'}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                        client.type === 'Residential' ? 'bg-[#A8B89A]/10 border-[#A8B89A]/20 text-[#4B4B4B]' : 'bg-[#8AA17A]/10 border-[#8AA17A]/20 text-[#4B4B4B]'
                      }`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4 space-x-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1.5 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-lg text-[#7D7D7D] hover:text-[#A8B89A] transition inline-flex items-center"
                        title="Edit Client"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleViewProjects(client.name)}
                        className="p-1.5 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-lg text-[#7D7D7D] hover:text-[#A8B89A] transition inline-flex items-center gap-1 text-[10px] font-bold"
                        title="View Projects"
                      >
                        <FolderOpen size={12} />
                        <span>View Projects</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete client ${client.name}?`)) {
                            await deleteClient(client.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-100 transition inline-flex items-center"
                        title="Delete Client"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#7D7D7D] italic">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="space-y-3 sm:hidden">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-4 bg-white border border-[#A8B89A]/10 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A8B89A]/10 border border-[#A8B89A]/20 text-[#A8B89A] flex items-center justify-center font-bold text-[11px] shrink-0">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#4B4B4B] text-xs">{client.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${
                          client.status === 'Active' ? 'bg-[#8AA17A]/10 border-[#8AA17A]/20 text-[#8AA17A]' : 'bg-[#C89A9A]/10 border-[#C89A9A]/20 text-[#C89A9A]'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold shrink-0 ${
                      client.type === 'Residential' ? 'bg-[#A8B89A]/10 border-[#A8B89A]/20 text-[#4B4B4B]' : 'bg-[#8AA17A]/10 border-[#8AA17A]/20 text-[#4B4B4B]'
                    }`}>
                      {client.type}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#7D7D7D] space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#7D7D7D] flex-shrink-0" />
                      <span className="text-[#4B4B4B]">{client.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-[#7D7D7D] flex-shrink-0" />
                      <span className="text-[#4B4B4B]">{client.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin size={12} className="text-[#7D7D7D] flex-shrink-0 mt-0.5" />
                      <span className="text-[#4B4B4B] leading-relaxed">{client.company || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditModal(client)}
                      className="flex-1 py-2.5 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-xl text-[#7D7D7D] hover:text-[#A8B89A] transition text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[38px]"
                      title="Edit Client"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleViewProjects(client.name)}
                      className="flex-1 py-2.5 bg-[#F8F6F3] border border-[#A8B89A]/10 rounded-xl text-[#7D7D7D] hover:text-[#A8B89A] transition text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[38px]"
                      title="View Projects"
                    >
                      <FolderOpen size={12} />
                      <span>Projects</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete client ${client.name}?`)) {
                          await deleteClient(client.id);
                        }
                      }}
                      className="py-2.5 px-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 hover:bg-rose-100 transition text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[38px]"
                      title="Delete Client"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <p className="text-xs text-[#7D7D7D] italic py-10 text-center">No customers found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
