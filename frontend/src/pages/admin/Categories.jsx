import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, ShieldCheck, Tag, FileText, Sparkles, Loader2, ChevronRight, Search, Filter, Layers, Zap, Info, X } from "lucide-react";
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
        description: "",
        status: "active",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data);
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
            // Simplified AI generation for name/description
            const response = await axios.post(
                "http://localhost:5000/api/category/generate-ai",
                { segmentName: formData.name.trim() },
                { headers: { "Content-Type": "application/json" } }
            );

            const aiData = response.data?.data;

            if (aiData) {
                setFormData(prev => ({
                    ...prev,
                    description: aiData.description || prev.description,
                }));
                toast.success("AI synthesis complete.", { id: toastId });
            }
        } catch (err) {
            toast.error("AI bridge failed.", { id: toastId });
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editing ? "Refining Taxonomy..." : "Committing Taxonomy...");
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
            setFormData({ name: "", description: "", status: "active" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Registry rejection", { id: toastId });
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setFormData({
            name: cat.name,
            description: cat.description || "",
            status: cat.status || "active",
        });
        setShowModal(true);
    };

    // ... (logic continues with updated table columns)
    
    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Master Module</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vendor Categories</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Categories</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Manage global vendor categories. These acts as the primary classification for all vendor onboarding and lifecycle management.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button 
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: "", description: "", status: "active" });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <Plus size={18} /> Add Category
                  </button>
                </div>
            </header>

            {/* ── CATEGORY REGISTRY ───────────────────────────────────────────── */ }
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                          Total Categories: {categories.length}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Category Name</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="4"></td></tr>)
                            ) : categories.map((cat, idx) => (
                                <motion.tr 
                                    key={cat._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 transition-all shadow-inner uppercase">
                                                <Tag size={18} />
                                            </div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">{cat.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight max-w-xs line-clamp-1 italic">{cat.description || 'No description provided'}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <StatusBadge status={cat.status === 'active' ? "active" : "locked"} />
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleEdit(cat)}
                                                className="p-3 bg-white text-slate-300 hover:text-slate-900 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                               onClick={() => {
                                                   if(window.confirm("Are you sure you want to delete this category?")) {
                                                       api.delete(`/categories/${cat._id}`).then(() => fetchData());
                                                   }
                                               }}
                                               className="p-3 bg-white text-slate-300 hover:text-rose-600 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MODAL ──────────────────────────────────────────────────────── */ }
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            <div className="p-12 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{editing ? 'Edit' : 'New'} Category</h2>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-12 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner uppercase tracking-tighter"
                                        placeholder="e.g. RAW MATERIALS"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                                    <textarea
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 italic min-h-[100px]"
                                        placeholder="Category definition..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Operational Status</label>
                                    <select
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner appearance-none uppercase tracking-[0.1em]"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-95">
                                        <ShieldCheck size={18} /> {editing ? 'Update' : 'Initialize'} Category
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


