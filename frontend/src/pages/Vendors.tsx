import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Edit, Trash2, Star, Phone, Mail, MapPin, Award, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vendor } from '../types';

export default function Vendors() {
  const {
    vendors,
    materials,
    createVendor,
    updateVendor,
    deleteVendor,
    currentUser
  } = useAppStore();

  const [activeCompareCategory, setActiveCompareCategory] = useState<string>('Tiles');
  const [showAddEditModal, setShowAddEditModal] = useState<Partial<Vendor> | null>(null);
  
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    category: 'Tiles',
    address: '',
    rating: 5,
    deliveryDays: 5
  });

  const categories = ['Tiles', 'Laminates', 'Paints', 'Furniture', 'Lighting', 'Hardware', 'Fabric'];

  const categoryVendors = vendors.filter(v => v.category === activeCompareCategory);

  // Helper to read/write delivery days since SQLite doesn't support the schema change
  const getDeliveryDays = (vendorId: number) => {
    const stored = localStorage.getItem(`gs_vendor_delivery_${vendorId}`);
    if (stored) return parseInt(stored);
    return (vendorId % 4) + 4; // Mock default delivery days: 4 to 7 days
  };

  const saveDeliveryDays = (vendorId: number, days: number) => {
    localStorage.setItem(`gs_vendor_delivery_${vendorId}`, String(days));
  };

  const getAvgPrice = (vendorId: number) => {
    const catMaterials = materials.filter(m => m.vendor_id === vendorId && m.category === activeCompareCategory);
    return catMaterials.length > 0
      ? Math.round(catMaterials.reduce((sum, m) => sum + m.unit_price, 0) / catMaterials.length)
      : 0;
  };

  // Best Value Recommendation Logic
  const getBestValueVendor = () => {
    if (categoryVendors.length === 0) return null;
    if (categoryVendors.length === 1) return { vendor: categoryVendors[0], reason: 'Only supplier in category.' };

    let bestVendor = categoryVendors[0];
    let bestScore = -1;
    let reason = '';

    // Calculate max and min values for normalization
    const prices = categoryVendors.map(v => getAvgPrice(v.id)).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 50;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 500;

    const speeds = categoryVendors.map(v => getDeliveryDays(v.id));
    const minSpeed = Math.min(...speeds);
    const maxSpeed = Math.max(...speeds);

    categoryVendors.forEach(v => {
      const price = getAvgPrice(v.id) || minPrice;
      const speed = getDeliveryDays(v.id);
      
      // Normalized scores (higher is better)
      const priceScore = maxPrice === minPrice ? 1 : 1 - ((price - minPrice) / (maxPrice - minPrice));
      const speedScore = maxSpeed === minSpeed ? 1 : 1 - ((speed - minSpeed) / (maxSpeed - minSpeed));
      const ratingScore = v.rating / 5;

      // Weighted average: 40% rating, 40% cost, 20% speed
      const totalScore = (ratingScore * 0.4) + (priceScore * 0.4) + (speedScore * 0.2);

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestVendor = v;
        reason = `${v.name} leads with a high ${v.rating}★ rating, budget catalog costs (avg INR ${price.toLocaleString()}), and rapid delivery within ${speed} days.`;
      }
    });

    return { vendor: bestVendor, reason };
  };

  const recommendation = getBestValueVendor();

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      contact_name: '',
      phone: '',
      email: '',
      category: activeCompareCategory,
      address: '',
      rating: 5,
      deliveryDays: 5
    });
    setShowAddEditModal({});
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      contact_name: vendor.contact_name,
      phone: vendor.phone,
      email: vendor.email,
      category: vendor.category,
      address: vendor.address,
      rating: vendor.rating,
      deliveryDays: getDeliveryDays(vendor.id)
    });
    setShowAddEditModal(vendor);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendorData = {
      name: formData.name,
      contact_name: formData.contact_name,
      phone: formData.phone,
      email: formData.email,
      category: formData.category,
      address: formData.address,
      rating: Number(formData.rating)
    };

    if (showAddEditModal && showAddEditModal.id) {
      await updateVendor(showAddEditModal.id, vendorData);
      saveDeliveryDays(showAddEditModal.id, formData.deliveryDays);
      alert('Vendor details successfully updated.');
    } else {
      // Create new vendor
      const created = await createVendor(vendorData);
      // Create returns void, so retrieve from the newly loaded store
      setTimeout(() => {
        const freshList = useAppStore.getState().vendors;
        const matched = freshList.find(v => v.name === formData.name);
        if (matched) {
          saveDeliveryDays(matched.id, formData.deliveryDays);
        }
      }, 500);
      alert('Supplier successfully registered.');
    }
    setShowAddEditModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#4B4B4B] font-display">Vendor Management Directory</h2>
          <p className="text-xs text-[#7D7D7D] font-light mt-1">Match suppliers, inspect rates, and run side-by-side performance checks.</p>
        </div>

        {currentUser.role !== 'Client' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white rounded-xl font-medium text-xs active:scale-[0.98] transition-all flex items-center gap-2 min-h-[44px] w-full md:w-auto justify-center shadow-sm shadow-[#A8B89A]/15"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCompareCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition border min-h-[38px] flex items-center justify-center outline-none ${
              activeCompareCategory === cat
                ? 'bg-[#A8B89A]/10 border-[#A8B89A] text-[#A8B89A] font-bold'
                : 'bg-white border-slate-100 text-[#7D7D7D] hover:text-[#4B4B4B] hover:bg-slate-50'
            }`}
          >
            {cat} Sourcing
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Comparison grid list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] uppercase font-bold text-[#7D7D7D] tracking-wider">Side-by-Side Sourcing Matrix</h3>
            <span className="text-[10px] text-[#7D7D7D] font-medium">{categoryVendors.length} supplier(s) mapped</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryVendors.map(v => {
              const avgPrice = getAvgPrice(v.id);
              const days = getDeliveryDays(v.id);

              return (
                <div key={v.id} className="bg-white border border-[#A8B89A]/10 p-5 rounded-[24px] space-y-4 hover:border-[#A8B89A]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Title & rating */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-[#4B4B4B] text-sm line-clamp-1">{v.name}</h4>
                        <p className="text-[10px] text-[#7D7D7D] mt-0.5">{v.contact_name || 'Generic Manager'} • Coordinator</p>
                      </div>
                      <div className="flex items-center gap-1 bg-[#8AA17A]/10 px-2 py-0.5 rounded-lg border border-[#8AA17A]/20 text-[#8AA17A] text-[10px] font-bold">
                        <Star size={10} className="fill-[#8AA17A] text-[#8AA17A]" />
                        <span>{v.rating}</span>
                      </div>
                    </div>

                    {/* Comparison details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-[#7D7D7D] font-light">Average Catalog Price</span>
                        <span className="text-[#8AA17A] font-medium">
                          {avgPrice > 0 ? `INR ${avgPrice.toLocaleString()}` : 'Direct Sourced'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-[#7D7D7D] font-light">Delivery Lead Speed</span>
                        <span className="text-[#4B4B4B] font-medium">{days} business days</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#7D7D7D] font-light">Sourcing Location</span>
                        <span className="text-[#7D7D7D] text-[10px] text-right truncate max-w-[150px]">{v.address || 'Local Sourced'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Contact */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-2">
                    <div className="flex flex-col gap-0.5 text-[9px] text-[#7D7D7D] max-w-[150px] truncate">
                      <span className="flex items-center gap-1"><Phone size={8} /> {v.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={8} /> {v.email}</span>
                    </div>

                    {currentUser.role !== 'Client' && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-2 text-[#7D7D7D] hover:text-[#4B4B4B] bg-slate-50 hover:bg-slate-100 rounded-lg transition min-h-[32px] outline-none"
                          title="Edit Details"
                          aria-label={`Edit supplier ${v.name}`}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => deleteVendor(v.id)}
                          className="p-2 text-[#C89A9A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[32px] outline-none"
                          title="Delete Supplier"
                          aria-label={`Delete supplier ${v.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {categoryVendors.length === 0 && (
              <p className="text-xs text-[#7D7D7D] italic py-12 text-center col-span-2">No vendors mapped under this category yet.</p>
            )}
          </div>
        </div>

        {/* Best Value Recommendation card */}
        <div className="space-y-4">
          <h3 className="text-[10px] uppercase font-bold text-[#7D7D7D] tracking-wider">Best Value Recommendation</h3>
          {recommendation ? (
            <div className="bg-white border border-[#8AA17A]/30 p-6 rounded-[24px] space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8AA17A]/10 rounded-xl flex items-center justify-center text-[#8AA17A] border border-[#8AA17A]/20">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#4B4B4B] text-sm">{recommendation.vendor.name}</h4>
                  <p className="text-[9px] text-[#8AA17A] font-bold uppercase tracking-wider mt-0.5">Sourcing Recommendation</p>
                </div>
              </div>

              <div className="bg-[#F8F6F3] p-4 rounded-[20px] border border-slate-100 text-xs text-[#7D7D7D] leading-relaxed italic">
                "{recommendation.reason}"
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-[#F8F6F3] p-2.5 rounded-[16px] border border-slate-100">
                  <span className="text-[9px] text-[#7D7D7D] block uppercase font-bold">Avg. Price</span>
                  <span className="text-[#8AA17A] font-bold mt-0.5 block">
                    {getAvgPrice(recommendation.vendor.id) > 0 
                      ? `INR ${getAvgPrice(recommendation.vendor.id).toLocaleString()}` 
                      : 'Catalog N/A'}
                  </span>
                </div>
                <div className="bg-[#F8F6F3] p-2.5 rounded-[16px] border border-slate-100">
                  <span className="text-[9px] text-[#7D7D7D] block uppercase font-bold">Delivery Days</span>
                  <span className="text-[#4B4B4B] font-bold mt-0.5 block">{getDeliveryDays(recommendation.vendor.id)} Days</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-[#A8B89A]/30 p-6 rounded-[24px] text-center text-[#7D7D7D] text-xs italic shadow-sm">
              Create suppliers under this category to compute sifting metrics.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Vendor Modal */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="vendor-modal-title"
              className="w-full max-w-md bg-white border border-[#A8B89A]/15 rounded-[24px] shadow-2xl p-6 relative text-left overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowAddEditModal(null)}
                className="absolute top-4 right-4 text-[#7D7D7D] hover:text-[#4B4B4B] p-2 rounded-lg transition-all"
                title="Close"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <h3 id="vendor-modal-title" className="text-md font-light text-[#4B4B4B] mb-4 font-display">
                {showAddEditModal.id ? 'Modify Supplier Profile' : 'Register New Supplier'}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="vendor-name" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Supplier Name</label>
                    <input
                      id="vendor-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="vendor-contact" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Contact Person</label>
                    <input
                      id="vendor-contact"
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="vendor-phone" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Phone</label>
                    <input
                      id="vendor-phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="vendor-email" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Email</label>
                    <input
                      id="vendor-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="vendor-category" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Category</label>
                    <select
                      id="vendor-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px] cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-white text-[#4B4B4B]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="vendor-delivery" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Delivery Days</label>
                    <input
                      id="vendor-delivery"
                      type="number"
                      min="1"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 5 })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="vendor-rating" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Sourcing Rating</label>
                    <input
                      id="vendor-rating"
                      type="number"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5 })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="vendor-address" className="text-[9px] uppercase font-bold text-[#7D7D7D] tracking-wider">Office Address</label>
                    <input
                      id="vendor-address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[#F8F6F3] border border-[#A8B89A]/20 px-3 py-2 rounded-xl text-xs text-[#4B4B4B] focus:outline-none focus:border-[#A8B89A] transition-all min-h-[40px]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-bold rounded-xl text-xs transition active:scale-[0.99] outline-none"
                >
                  Save Supplier Details
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
