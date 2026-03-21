import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, ShieldCheck, Tag, FileText, Sparkles, Loader2, ChevronRight, Search, Filter, Layers, Zap, Info } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formTemplates, setFormTemplates] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        formTemplate: "",
        isActive: true,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, tempRes] = await Promise.all([
                api.get("/categories"),
                api.get("/forms/published"),
            ]);
            setCategories(catRes.data.data);
            setFormTemplates(tempRes.data.data);
        } catch (err) {
            toast.error("Resource acquisition failure");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAIGenerate = async () => {
        if (!formData.name.trim()) {
            toast.error("Define Segment Alias first for AI synthesis.");
            return;
        }
        setAiLoading(true);
        const toastId = toast.loading("AI Synthesizing Taxonomy...");
        try {
            const response = await axios.post(
                "http://localhost:5000/api/category/generate-ai",
                { segmentName: formData.name.trim() },
                { headers: { "Content-Type": "application/json" } }
            );

            const aiData = response.data?.data;

            if (!aiData) {
                toast.error("AI node returned empty stack.", { id: toastId });
                return;
            }

            setFormData(prev => ({
                ...prev,
                code: aiData.uniqueCode || prev.code,
                description: aiData.description || prev.description,
            }));

            toast.success("AI synthesis complete.", { id: toastId });
        } catch (err) {
            toast.error("AI bridge failed.", { id: toastId });
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Updating Taxonomy...");
        try {
            if (editing) {
                await api.put(`/categories/${editing._id}`, formData);
                toast.success("Taxonomy node updated", { id: toastId });
            } else {
                await api.post("/categories", formData);
                toast.success("Taxonomy node committed", { id: toastId });
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ name: "", code: "", description: "", formTemplate: "", isActive: true });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Registry rejection", { id: toastId });
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setFormData({
            name: cat.name,
            code: cat.code,
            description: cat.description,
            formTemplate: cat.formTemplate?._id || "",
            isActive: cat.isActive,
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Asset Control</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational Taxonomy</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Segments</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Defining structural procurement categories. Mapping vendor groups to specialized onboarding protocols and AI-driven classification.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button 
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: "", code: "", description: "", formTemplate: "", isActive: true });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <Plus size={18} /> Define New Segment
                  </button>
                </div>
            </header>

            {/* ── TAXONOMY REGISTRY ───────────────────────────────────────────── */ }
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find Taxonomy Class..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                          Active Classifications: {categories.length} Nodes
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Segment Identity</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Code</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mapped Protocol</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Integrity Status</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>)
                            ) : categories.map((cat, idx) => (
                                <motion.tr 
                                    key={cat._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                                    onClick={() => handleEdit(cat)}
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner uppercase">
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{cat.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none max-w-xs line-clamp-1 italic">{cat.description || 'General Infrastructure Segment'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="font-mono bg-slate-100 text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all uppercase">
                                            {cat.code}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                                            <FileText size={14} className="text-slate-200" />
                                            {cat.formTemplate?.name || cat.formTemplate?.title || "RAW_ENTRY"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <StatusBadge status={cat.isActive ? "active" : "locked"} />
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                                                className="p-3 bg-white text-slate-300 hover:text-slate-900 hover:border-slate-900 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-3 bg-white text-slate-300 hover:text-rose-600 hover:border-rose-100 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && categories.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                            <Layers size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">Taxonomy Registry Clear</p>
                    </div>
                )}
            </div>

            {/* ── SEGMENT MODAL ──────────────────────────────────────────────── */ }
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <Tag size={200} />
                            </div>

                            <div className="p-12 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Class <span className="text-slate-400">Definition</span></h2>
                                    <div className="flex items-center gap-2">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{editing ? 'Modify Taxonomy Node' : 'Initialize New Operational Class'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
                                {/* ✨ AI Auto-fill Hub */}
                                <div className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                     <div className="flex items-center justify-between relative z-10">
                                         <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
                                                  <Sparkles size={20} />
                                              </div>
                                              <div>
                                                  <h4 className="text-[11px] font-black uppercase tracking-widest">AI Taxonomy Synthesis</h4>
                                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Generate code and descriptions instantly.</p>
                                              </div>
                                         </div>
                                         <button
                                            type="button"
                                            onClick={handleAIGenerate}
                                            disabled={aiLoading}
                                            className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 ${aiLoading ? 'bg-slate-700 text-slate-500' : 'bg-white text-slate-900 hover:bg-emerald-400 hover:text-white'}`}
                                        >
                                            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                                            {aiLoading ? "Synthesizing..." : "Initiate AI Synthesis"}
                                        </button>
                                     </div>
                                     <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl pointer-events-none">
                                          <div className="w-32 h-32 rounded-full bg-emerald-500 animate-pulse"></div>
                                     </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic mb-3 block text-slate-400">Section Alias</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 uppercase tracking-tighter"
                                            placeholder="e.g. Electrical Infrastructure"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic mb-3 block text-slate-400">Functional Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 uppercase tracking-tighter"
                                                placeholder="e.g. ELEC-001"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            />
                                            {formData.code && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">Verified</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic mb-1 block">Scope Documentation</label>
                                    <textarea
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 italic min-h-[120px]"
                                        placeholder="Define functional responsibilities..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic mb-1 block">Assigned Registry Protocol</label>
                                    <select
                                        required
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner appearance-none uppercase tracking-[0.1em]"
                                        value={formData.formTemplate}
                                        onChange={(e) => setFormData({ ...formData, formTemplate: e.target.value })}
                                    >
                                        <option value="">Select Protocol Template...</option>
                                        {formTemplates.map((t) => (
                                            <option key={t._id} value={t._id}>{t.name || t.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-6 h-6 rounded-lg text-slate-900 border-slate-200 focus:ring-slate-900 accent-slate-900"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Operationalize Module Immediately</label>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-95">
                                        <ShieldCheck size={18} /> Commit Configuration to Registry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1.2rem; }
            `}</style>
        </div>
    );
}
