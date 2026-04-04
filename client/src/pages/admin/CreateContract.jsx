import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Layout, 
    ArrowLeft, 
    Save, 
    Building2, 
    Calendar, 
    DollarSign, 
    Users, 
    ShieldCheck,
    Info,
    History
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function CreateContract() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);

    const [formData, setFormData] = useState({
        vendorId: "",
        contractNumber: "",
        contractTitle: "",
        startDate: "",
        endDate: "",
        contractValue: 0,
        currency: "INR",
        contractType: "MSA",
        paymentTerms: "Net 30",
        noticePeriod: 30,
        internalOwner: "",
        description: "",
        status: "active"
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const vRes = await api.get("/vendors");
                setVendors(vRes.data?.data || []);

                if (id) {
                    const cRes = await api.get(`/slm/contracts/${id}`);
                    const contract = cRes.data?.data || cRes.data;
                    if (contract) {
                        setFormData({
                            ...contract,
                            vendorId: contract.vendorId?._id || contract.vendorId || "",
                            startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
                            endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "",
                        });
                    }
                }
            } catch (err) {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading("Processing agreement registry...");
        try {
            if (id) {
                await api.patch(`/slm/contracts/${id}`, formData);
                toast.success("Agreement updated successfully", { id: toastId });
            } else {
                await api.post("/slm/contracts", formData);
                toast.success("New Agreement registered successfully", { id: toastId });
            }
            navigate("/admin/contracts");
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20 fade-in">
            {/* COMPACT HEADER (Standard Admin Page Style) */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/admin/contracts")}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                            <Layout className="text-indigo-600" size={18} />
                            {id ? "Operational Agreement Audit" : "Master Agreement Registration"}
                        </h1>
                        <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-slate-500">
                             <Info size={12} className="text-slate-400" />
                             {id ? "Review and update legal and financial contract parameters." : "Commit a new legal agreement to the institutional registry."}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => navigate("/admin/contracts")}
                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                        {saving ? "Processing..." : (id ? "Save Changes" : "Commit Agreement")} <Save size={12} />
                    </button>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="grid gap-4">
                
                {/* Section 1: Registry & Entities */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <Building2 size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.1 Registry & Entities</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                Vendor Entity <span className="text-rose-500">*</span>
                            </p>
                            <select
                                required
                                disabled={!!id}
                                name="vendorId"
                                value={formData.vendorId}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all disabled:bg-slate-50"
                            >
                                <option value="">Select Vendor...</option>
                                {vendors.map(v => <option key={v._id} value={v._id}>{v.companyName || v.name}</option>)}
                            </select>
                        </div>

                        <InputGroup 
                            label="Agreement Reference #" 
                            name="contractNumber" 
                            value={formData.contractNumber} 
                            onChange={handleChange} 
                            placeholder="e.g. AG-2024-001"
                            required
                        />

                        <InputGroup 
                            label="Agreement Subject Line" 
                            name="contractTitle" 
                            value={formData.contractTitle} 
                            onChange={handleChange} 
                            placeholder="e.g. Master Services Agreement"
                            required
                        />
                    </div>
                </motion.section>

                {/* Section 2: Governance & Classification */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <ShieldCheck size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.2 Governance & Classification</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                        <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">Agreement Type</p>
                            <select
                                name="contractType"
                                value={formData.contractType}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="MSA">MSA (Master Agreement)</option>
                                <option value="SOW">SOW (Scope of Work)</option>
                                <option value="NDA">NDA (Non-Disclosure)</option>
                                <option value="SLA">SLA (Service Level)</option>
                                <option value="Licensing">Licensing Agreement</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">Financial Commitment</p>
                            <div className="flex gap-2">
                                <select 
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 text-[11px] font-bold outline-none"
                                >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                                <input 
                                    required
                                    type="number"
                                    name="contractValue"
                                    value={formData.contractValue}
                                    onChange={handleChange}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-indigo-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">Payment Terms</p>
                            <select
                                name="paymentTerms"
                                value={formData.paymentTerms}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="Immediate">Immediate</option>
                                <option value="Net 15">Net 15 Days</option>
                                <option value="Net 30">Net 30 Days</option>
                                <option value="Net 45">Net 45 Days</option>
                                <option value="Net 60">Net 60 Days</option>
                            </select>
                        </div>

                        <InputGroup 
                            label="Notice Period (Days)" 
                            name="noticePeriod" 
                            type="number"
                            value={formData.noticePeriod} 
                            onChange={handleChange} 
                            placeholder="e.g. 30"
                        />
                    </div>
                </motion.section>

                {/* Section 3: Lifecycle & Timeline */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <Calendar size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.3 Lifecycle & Timeline</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                        <InputGroup 
                            label="Effective Date" 
                            name="startDate" 
                            type="date"
                            value={formData.startDate} 
                            onChange={handleChange} 
                            required
                        />

                        <div className="flex flex-col gap-1">
                             <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                Expiry Date <span className="text-rose-500">*</span>
                             </p>
                             <input 
                                required
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-rose-50/20 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-rose-400 outline-none transition-all"
                             />
                             <p className="text-[10px] text-rose-500 font-medium">Critical Benchmark</p>
                        </div>

                        <InputGroup 
                            label="Internal Stakeholder" 
                            name="internalOwner" 
                            value={formData.internalOwner} 
                            onChange={handleChange} 
                            placeholder="Employee Name"
                        />

                        <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">Operational Status</p>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all"
                            >
                                <option value="active">Operational (Active)</option>
                                <option value="expired">Dormant (Expired)</option>
                                <option value="terminated">Terminated / Void</option>
                            </select>
                        </div>
                    </div>
                </motion.section>

                {/* Section 4: Additional Details */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <History size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.4 Operational Context</h2>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">Agreement Description & Notes</p>
                            <textarea 
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the agreement scope or any operational notes..."
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all"
                            />
                        </div>
                    </div>
                </motion.section>

            </form>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", maxLength, className = "", required = false, disabled = false }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                {label} {required && <span className="text-rose-500">*</span>}
            </p>
            <input
                required={required}
                disabled={disabled}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
            />
        </div>
    );
}
