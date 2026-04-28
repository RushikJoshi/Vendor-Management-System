import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    Plus, Edit2, Trash2, Tag, Layout, ArrowLeft, 
    Save, Check, XCircle, Users, ExternalLink, 
    ArrowRightLeft, ShieldCheck, Scale, Award, 
    BarChart3, FileText, Briefcase, IndianRupee,
    TrendingUp, Star, Info
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";

export default function Categories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [categoryVendors, setCategoryVendors] = useState({});
    const [loadingVendors, setLoadingVendors] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active",
        criteria: {
            minimumTurnover: 0,
            minimumExperienceYears: 0,
            mandatoryDocuments: []
        }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data);
        } catch (err) {
            toast.error("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editing ? "Updating category..." : "Creating category...");
        try {
            if (editing) {
                await api.put(`/categories/${editing._id}`, formData);
                toast.success("Category updated successfully", { id: toastId });
            } else {
                await api.post("/categories", formData);
                toast.success("Category created successfully", { id: toastId });
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ 
                name: "", 
                description: "", 
                status: "active",
                criteria: { minimumTurnover: 0, minimumExperienceYears: 0, mandatoryDocuments: [] }
            });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save category", { id: toastId });
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setFormData({
            name: cat.name,
            description: cat.description || "",
            status: cat.status || "active",
            criteria: cat.criteria || { minimumTurnover: 0, minimumExperienceYears: 0, mandatoryDocuments: [] }
        });
        setShowModal(true);
    };

    const getTrustScore = (cat) => {
        // Mock trust score calculation based on criteria
        let score = 30; // base score
        if (cat.criteria?.minimumTurnover > 10000000) score += 20;
        else if (cat.criteria?.minimumTurnover > 0) score += 10;
        
        if (cat.criteria?.minimumExperienceYears >= 5) score += 20;
        else if (cat.criteria?.minimumExperienceYears >= 2) score += 10;

        if (cat.criteria?.mandatoryDocuments?.length >= 3) score += 30;
        else if (cat.criteria?.mandatoryDocuments?.length > 0) score += 15;

        return Math.min(score, 100);
    };

    const toggleExpand = async (catId) => {
        if (expandedId === catId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(catId);
        if (!categoryVendors[catId]) {
            setLoadingVendors(true);
            try {
                const res = await api.get(`/vendors?category=${catId}`);
                setCategoryVendors(prev => ({ ...prev, [catId]: res.data.data }));
            } catch (err) {
                toast.error("Failed to load vendors for this category.");
            } finally {
                setLoadingVendors(false);
            }
        }
    };

    if (showComparison) {
        const selectedCats = categories.filter(c => selectedIds.includes(c._id));
        return (
            <div className="space-y-6 pb-20 fade-in">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowComparison(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 border border-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                                <ArrowRightLeft className="text-indigo-600" size={20} />
                                Category Comparison Matrix
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Evaluating {selectedCats.length} selected categories side-by-side
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCats.map((cat) => {
                        const score = getTrustScore(cat);
                        return (
                            <motion.div 
                                key={cat._id}
                                layoutId={cat._id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                            >
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                            <Tag size={20} />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            score > 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            score > 40 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                            'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                            Trust Score: {score}%
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{cat.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description || 'No operational definition provided'}</p>
                                </div>

                                <div className="p-5 space-y-5 flex-1">
                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <Users size={10} /> Active Partners
                                            </p>
                                            <p className="text-xl font-black text-slate-900">{cat.vendorCount || 0}</p>
                                        </div>
                                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                                            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <FileText size={10} /> Pending Apps
                                            </p>
                                            <p className="text-xl font-black text-slate-900">{cat.applicantCount || 0}</p>
                                        </div>
                                    </div>

                                    {/* Criteria */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-slate-300" /> Qualification Criteria
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <IndianRupee size={14} />
                                                    <span className="text-xs font-semibold">Min. Turnover</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">
                                                    ₹{(cat.criteria?.minimumTurnover || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Briefcase size={14} />
                                                    <span className="text-xs font-semibold">Min. Experience</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">
                                                    {cat.criteria?.minimumExperienceYears || 0} Years
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <FileText size={14} />
                                                    <span className="text-xs font-semibold">Mandatory Docs</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-900">
                                                    {cat.criteria?.mandatoryDocuments?.length || 0} Files
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Badge Logic */}
                                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reliability Check</p>
                                        <div className="flex items-center gap-2">
                                            {score > 70 ? (
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            ) : score > 40 ? (
                                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                            )}
                                            <span className="text-[11px] font-bold text-slate-700">
                                                {score > 70 ? 'High-Trust Strategic Tier' : score > 40 ? 'Standard Operational Tier' : 'Emerging / Low-Barrier Tier'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-white border-t border-slate-50">
                                    <button 
                                        onClick={() => handleEdit(cat)}
                                        className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        Configure Parameters <Edit2 size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (showModal) {
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
                            onClick={() => setShowModal(false)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                                <Tag className="text-indigo-600" size={18} />
                                {editing ? 'Edit Vendor Category' : 'Register New Vendor Category'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500">
                                <div className="flex items-center gap-1 text-[12px] font-medium">
                                    <ShieldCheck size={12} className="text-slate-400" />
                                    Define qualification criteria to build trust and ensure quality vendors.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Category"} <Save size={12} />
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm h-fit"
                    >
                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                            <Tag size={13} className="text-indigo-600" />
                            <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.1 Core Configuration</h2>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <InputGroup 
                                label="Official Category Name" 
                                name="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter full category name"
                                required
                            />

                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                    Operational Description
                                </p>
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300 min-h-[100px]"
                                    placeholder="Enter operational definition..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                    Status
                                </p>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active Classification</option>
                                    <option value="inactive">Inactive / Deprecated</option>
                                </select>
                            </div>
                        </div>
                    </motion.section>

                    {/* Trust & Qualification Criteria */}
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm h-fit"
                    >
                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.2 Qualification Criteria (Trust Metrics)</h2>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup 
                                    label="Min. Annual Turnover (INR)" 
                                    type="number"
                                    value={formData.criteria.minimumTurnover} 
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        criteria: { ...formData.criteria, minimumTurnover: Number(e.target.value) } 
                                    })}
                                    placeholder="e.g. 50,00,000"
                                />
                                <InputGroup 
                                    label="Min. Experience (Years)" 
                                    type="number"
                                    value={formData.criteria.minimumExperienceYears} 
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        criteria: { ...formData.criteria, minimumExperienceYears: Number(e.target.value) } 
                                    })}
                                    placeholder="e.g. 3"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                    Mandatory Compliance Documents
                                </p>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            id="new-doc"
                                            placeholder="Add document name (e.g. GST Certificate, MSME)"
                                            className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none"
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = e.target.value.trim();
                                                    if(val) {
                                                        setFormData({
                                                            ...formData,
                                                            criteria: {
                                                                ...formData.criteria,
                                                                mandatoryDocuments: [...formData.criteria.mandatoryDocuments, val]
                                                            }
                                                        });
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const el = document.getElementById('new-doc');
                                                const val = el.value.trim();
                                                if(val) {
                                                    setFormData({
                                                        ...formData,
                                                        criteria: {
                                                            ...formData.criteria,
                                                            mandatoryDocuments: [...formData.criteria.mandatoryDocuments, val]
                                                        }
                                                    });
                                                    el.value = '';
                                                }
                                            }}
                                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {formData.criteria.mandatoryDocuments.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold border border-indigo-100">
                                                <span>{doc}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        criteria: {
                                                            ...formData.criteria,
                                                            mandatoryDocuments: formData.criteria.mandatoryDocuments.filter((_, i) => i !== idx)
                                                        }
                                                    })}
                                                    className="hover:text-rose-500"
                                                >
                                                    <XCircle size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.criteria.mandatoryDocuments.length === 0 && (
                                            <p className="text-[11px] text-slate-400 italic">No mandatory documents defined yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                                <Info size={16} className="text-indigo-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-indigo-900 tracking-tight">AI Scoring Logic Enabled</p>
                                    <p className="text-[11px] text-indigo-700 leading-relaxed">
                                        These parameters will be used to calculate the <b>Category Trust Index</b> and help procurement managers identify high-reliability segments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* HEADER */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                        <Layout className="text-indigo-600" size={20} />
                        Vendor Categories
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Manage global vendor categories and trust qualification criteria
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={() => setShowComparison(true)}
                            className="px-5 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg text-[13px] font-bold hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <ArrowRightLeft size={16} /> Compare {selectedIds.length} Categories
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setEditing(null);
                            setFormData({ 
                                name: "", 
                                description: "", 
                                status: "active",
                                criteria: { minimumTurnover: 0, minimumExperienceYears: 0, mandatoryDocuments: [] }
                            });
                            setShowModal(true);
                        }}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-sm shadow-indigo-200"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </motion.div>

            {/* TABLE SECTION */}
            <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
                <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                        <Tag size={16} className="text-indigo-500" />
                        <span>Registry: {categories.length} Categories</span>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                {selectedIds.length} Selected
                            </span>
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="text-[11px] font-bold text-slate-400 hover:text-rose-500"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedIds.length === categories.length && categories.length > 0}
                                        onChange={() => {
                                            if(selectedIds.length === categories.length) setSelectedIds([]);
                                            else setSelectedIds(categories.map(c => c._id));
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">Category Name</th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">Trust Metrics</th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-6" colSpan={5}><div className="h-4 w-full bg-slate-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : categories.map((cat) => {
                                const score = getTrustScore(cat);
                                const isExpanded = expandedId === cat._id;
                                const vendors = categoryVendors[cat._id] || [];

                                return (
                                    <React.Fragment key={cat._id}>
                                        <tr className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(cat._id) ? 'bg-indigo-50/30' : ''} ${isExpanded ? 'bg-indigo-50/10' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedIds.includes(cat._id)}
                                                        onChange={() => toggleSelection(cat._id)}
                                                    />
                                                    <button 
                                                        onClick={() => toggleExpand(cat._id)}
                                                        className={`p-1 rounded-md transition-all ${isExpanded ? 'bg-indigo-600 text-white rotate-90' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                                                        <Tag size={14} />
                                                    </div>
                                                    <div 
                                                        className="cursor-pointer group"
                                                        onClick={() => navigate(`/admin/categories/${cat._id}`)}
                                                    >
                                                        <span className="text-[14px] font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">{cat.name}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium line-clamp-1 max-w-xs">{cat.description || 'No description'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                                }`}
                                                                style={{ width: `${score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500">{score}% Reliability</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleExpand(cat._id)}>
                                                            <Users size={10} className="text-slate-400" />
                                                            <span className="text-[11px] font-bold text-slate-600">{cat.vendorCount || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FileText size={10} className="text-slate-400" />
                                                            <span className="text-[11px] font-bold text-slate-600">{cat.applicantCount || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={cat.status || "inactive"} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(cat)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                                                        title="Edit Category"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if(window.confirm("Are you sure you want to delete this category?")) {
                                                                const toastId = toast.loading("Deleting...");
                                                                api.delete(`/categories/${cat._id}`).then(() => {
                                                                    toast.success("Deleted", { id: toastId });
                                                                    fetchData();
                                                                }).catch(() => toast.error("Failed to delete", { id: toastId }));
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={5} className="p-0 border-none">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-20 py-4 bg-slate-50/50 border-b border-slate-100">
                                                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                                                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                                                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                            <Users size={12} className="text-indigo-500" />
                                                                            Associated Vendors: {cat.name}
                                                                        </h4>
                                                                    </div>
                                                                    
                                                                    <div className="overflow-x-auto">
                                                                        {loadingVendors && !categoryVendors[cat._id] ? (
                                                                            <div className="p-8 flex flex-col items-center justify-center gap-3">
                                                                                <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Retrieving Partner Records...</p>
                                                                            </div>
                                                                        ) : vendors.length > 0 ? (
                                                                            <table className="w-full text-left">
                                                                                <thead>
                                                                                    <tr className="bg-slate-50/30 border-b border-slate-100">
                                                                                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Vendor ID</th>
                                                                                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Company Name</th>
                                                                                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact</th>
                                                                                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Rating</th>
                                                                                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-50">
                                                                                    {vendors.map((v) => (
                                                                                        <tr key={v._id} className="hover:bg-indigo-50/30 transition-colors">
                                                                                            <td className="px-4 py-3 text-[12px] font-mono font-bold text-indigo-600 uppercase">#{v.vendorId?.slice(-6) || 'TEMP'}</td>
                                                                                            <td className="px-4 py-3">
                                                                                                <p className="text-[13px] font-bold text-slate-900">{v.companyName || v.name}</p>
                                                                                                <p className="text-[10px] text-slate-400 font-medium">{v.email}</p>
                                                                                            </td>
                                                                                            <td className="px-4 py-3 text-[12px] font-semibold text-slate-600">{v.phone}</td>
                                                                                            <td className="px-4 py-3">
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                                                                                    <span className="text-[11px] font-bold text-slate-700">{v.rating || 0}</span>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="px-4 py-3 text-right">
                                                                                                <a 
                                                                                                    href={`/admin/vendors/${v._id}`}
                                                                                                    className="p-1.5 bg-slate-900 text-white rounded-md hover:bg-indigo-600 transition-all inline-flex"
                                                                                                >
                                                                                                    <ExternalLink size={12} />
                                                                                                </a>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        ) : (
                                                                            <div className="p-12 text-center">
                                                                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                                                    <Users size={20} className="text-slate-300" />
                                                                                </div>
                                                                                <p className="text-[13px] font-bold text-slate-900">No vendors found</p>
                                                                                <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest">This category is currently unpopulated</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                            {categories.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-[13px] font-medium">
                                        No categories found. Click 'Add Category' to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", required = false, disabled = false }) {
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
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
            />
        </div>
    );
}
