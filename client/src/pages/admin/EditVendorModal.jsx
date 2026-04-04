import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { X, Building2, User, Mail, Phone, MapPin, Target, Landmark, Save } from "lucide-react";
import Modal from "../../components/Modal";

export default function EditVendorModal({ open, onClose, vendor, onRefresh }) {
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    contactPerson: "",
    category: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (vendor) {
      setFormData({
        companyName: vendor.companyName || "",
        name: vendor.name || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        contactPerson: vendor.contactPerson || "",
        category: vendor.category?._id || vendor.category || "",
        address: typeof vendor.address === 'string' ? vendor.address : (vendor.address?.city ? `${vendor.address.city}, ${vendor.address.state}` : "")
      });
    }
  }, [vendor]);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data);
        } catch (err) {
            console.error("Failed to load categories");
        }
    };
    if (open) fetchCategories();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Updating entity profile...");
    try {
      await api.patch(`/vendors/${vendor._id}`, formData);
      toast.success("Entity profile updated successfully", { id: toastId });
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage Master Entity" size="2xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-slate-300" size={16} />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classification</label>
             <div className="relative">
                <Target className="absolute left-3 top-3 text-slate-300" size={16} />
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all appearance-none"
                >
                    <option value="">Uncategorized</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Authorized Contact</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-300" size={16} />
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-300" size={16} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Hotline</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-300" size={16} />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Corporate Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-300" size={16} />
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            Cancel Action
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Save size={14} /> Update Partner Profile
          </button>
        </div>
      </form>
    </Modal>
  );
}
