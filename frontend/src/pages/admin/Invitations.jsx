import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Send, Clock, Plus, X, Mail, ShieldCheck, ChevronRight, MoreVertical, Search, Filter, ArrowUpRight, Globe, Lock } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function Invitations() {
    const [invitations, setInvitations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ email: "", categoryId: "" });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, catRes] = await Promise.all([
                api.get("/invitations"),
                api.get("/categories"),
            ]);
            setInvitations(invRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch (err) {
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Synthesizing Access Key...");
        try {
            await api.post("/invitations/send", formData);
            toast.success("Invitation dispatched to global nodes.", { id: toastId });
            setShowModal(false);
            setFormData({ email: "", categoryId: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol rejection", { id: toastId });
        }
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Security Hub</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Issuance</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Onboarding Access</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Secure entry-point management for strategic partners. Validating credentials before registry integration.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <Plus size={18} /> Issue Invitation
                  </button>
                </div>
            </header>

            {/* ── INVITATION TABLE ────────────────────────────────────────────── */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter Active Invitations..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                          Registry Logs: {invitations.length} entries
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Recipient Node</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Classification</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dispatch Log</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Integrity Validity</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>)
                            ) : invitations.map((inv, idx) => (
                                <motion.tr 
                                    key={inv._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 shadow-inner transition-all">
                                                <Mail size={18} />
                                            </div>
                                            <span className="text-sm font-black text-slate-900 lowercase tracking-tight">{inv.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-4 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                            {inv.category?.name || "Unclassified"}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                            {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Clock size={12} className="text-slate-300" />
                                            {new Date(inv.expiresAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <StatusBadge status={inv.status} />
                                            <button className="p-2 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && invitations.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                            <Send size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No invitations dispatched</p>
                    </div>
                )}
            </div>

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
            >
                <div className="p-10 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <Lock size={16} className="text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Authorization</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Consign New Link</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Target Access Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                                placeholder="node.operator@enterprise.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Operational Segment</label>
                            <select
                                required
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner appearance-none"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">Select segment classification...</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-6">
                            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-95">
                                <ShieldCheck size={18} /> Initialize Dispatch Protocol
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

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
