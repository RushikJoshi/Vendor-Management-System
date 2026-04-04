import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    Layout, ArrowLeft, Save, Info, Building2, User, MapPin, Landmark, 
    Activity, Globe, Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function ManageVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "", // Authorized Person (Required)
    email: "", // Primary Email (Required)
    phone: "", // Contact Number (Required)
    companyName: "", // Trade Name
    category: "",
    gstNumber: "",
    address: {
        city: "",
        state: "",
        pincode: ""
    },
    lifecycleStatus: "active"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, cRes] = await Promise.all([
          api.get(`/vendors/${id}`),
          api.get("/categories")
        ]);
        const v = vRes.data.data;
        setVendor(v);
        setCategories(cRes.data.data);
        
        setFormData({
            name: v.name || "",
            email: v.email || "",
            phone: v.phone || "",
            companyName: v.companyName || "",
            category: v.category?._id || v.category || "",
            gstNumber: v.gstNumber || "",
            address: {
                city: v.address?.city || "",
                state: v.address?.state || "",
                pincode: v.address?.pincode || ""
            },
            lifecycleStatus: v.lifecycleStatus || "active"
        });
      } catch (err) {
        toast.error("Critical System Error: Entity data unreachable.");
        navigate(`/admin/vendors/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
        const [parent, child] = name.split(".");
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [child]: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Executing Master State Synchronization...");
    try {
      const sanitizedId = id.toString().trim();
      const payload = { ...formData };
      
      // Sanitization for database compatibility
      if (!payload.category || payload.category === "") payload.category = null;
      if (!payload.gstNumber || payload.gstNumber === "") delete payload.gstNumber;

      // Ensure name is never empty for the schema (required: true)
      if (!payload.name) payload.name = payload.companyName || "Unknown Partner";

      await api.patch(`/vendors/${sanitizedId}`, payload);
      toast.success("Operational Hub: Partner master record synchronized", { id: toastId });
      navigate(`/admin/vendors/${id}`);
    } catch (err) {
      console.error("Sync Error:", err);
      // Surface EXACT error from message if available
      const msg = err.response?.data?.message || err.message || "Internal Node Sync Failure";
      toast.error(`Operational Error: ${msg}`, { id: toastId, duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initializing Component...</div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20 fade-in">
        {/* COMPACT HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
        >
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                        Manage Master Entity
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 tracking-tight">
                            Reference ID: {id}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? "Syncing..." : "Update Master Record"} <Save size={12} />
                </button>
            </div>
        </motion.div>

        {/* CONTENT SECTIONS */}
        <div className="grid gap-4">
            {/* 1. Organizations Identity */}
            <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                    <Building2 size={13} className="text-indigo-600" />
                    <h2 className="text-[13px] font-semibold text-slate-800">1.1 Organizational Identity</h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputGroup 
                        label="Official Trade Name" 
                        name="companyName" 
                        value={formData.companyName} 
                        onChange={handleChange} 
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <p className="text-[12px] font-medium text-slate-600 leading-none mb-1">Entity Classification</p>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all shadow-sm"
                        >
                            <option value="">Uncategorized Partner</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <InputGroup 
                        label="GSTIN Identifier" 
                        name="gstNumber" 
                        value={formData.gstNumber} 
                        onChange={handleChange} 
                        placeholder="15-digit GSTIN"
                        className="uppercase"
                    />

                    <div className="flex flex-col gap-1.5">
                        <p className="text-[12px] font-medium text-slate-600 leading-none mb-1">Lifecycle Status</p>
                        <select
                            name="lifecycleStatus"
                            value={formData.lifecycleStatus}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-semibold text-indigo-600 focus:border-indigo-400 outline-none transition-all shadow-sm"
                        >
                            <option value="active">Active / Verified</option>
                            <option value="suspended">Suspended / On-Hold</option>
                            <option value="blacklisted">Blacklisted / Restricted</option>
                        </select>
                    </div>
                </div>
            </motion.section>

            {/* 2. Operational Contact */}
            <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                    <User size={13} className="text-indigo-600" />
                    <h2 className="text-[13px] font-semibold text-slate-800">1.2 Operational Infrastructure</h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputGroup 
                        label="Authorized Person Name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required
                    />
                    <InputGroup 
                        label="Primary Email Address" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        type="email"
                        required
                    />
                    <InputGroup 
                        label="Primary Contact Number" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required
                    />
                </div>
            </motion.section>

            {/* 3. Geographical Mapping */}
            <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                    <MapPin size={13} className="text-indigo-600" />
                    <h2 className="text-[13px] font-semibold text-slate-800">1.3 Geographical Metadata</h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputGroup 
                        label="City/District" 
                        name="address.city" 
                        value={formData.address.city} 
                        onChange={handleChange} 
                        required
                    />
                    <InputGroup 
                        label="State" 
                        name="address.state" 
                        value={formData.address.state} 
                        onChange={handleChange} 
                        required
                    />
                    <InputGroup 
                        label="Postal Pincode" 
                        name="address.pincode" 
                        value={formData.address.pincode} 
                        onChange={handleChange} 
                        required
                    />
                </div>
            </motion.section>
        </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, type = "text", placeholder = "", className="", required = false, disabled = false }) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[12px] font-medium text-slate-600 leading-none mb-1">
                {label} {required && <span className="text-rose-500 font-semibold">*</span>}
            </p>
            <input
                required={required}
                disabled={disabled}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm ${className}`}
            />
        </div>
    );
}
