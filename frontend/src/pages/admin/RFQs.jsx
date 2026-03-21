import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, CheckCircle, ChevronRight, Zap, FileText, Globe, ShieldCheck, Activity, Layers, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RFQList = () => {
    const navigate = useNavigate();
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRFQs = async () => {
            try {
                const res = await api.get('/rfqs');
                setRfqs(res.data.data);
            } catch (err) {
                toast.error('Procurement sync failure');
            } finally {
                setLoading(false);
            }
        };
        fetchRFQs();
    }, []);

    const StatusBadge = ({ status }) => {
        const styles = {
            draft: "bg-slate-50 text-slate-300 border-slate-100",
            published: "bg-slate-900 text-white border-slate-900 shadow-xl",
            closed: "bg-rose-50 text-rose-600 border-rose-100",
            cancelled: "bg-slate-100 text-slate-400 border-slate-200"
        };
        return (
            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Procurement Flux</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Sourcing Terminal</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">RFQ Matrix</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Managing dynamic Requests for Quotation. Bridging internal demand with global vendor capacity through secure operational bidding.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button 
                    onClick={() => navigate('/admin/rfq/create')}
                    className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <Plus size={18} /> Initiate Sourcing Protocol
                  </button>
                </div>
            </header>

            {/* ── PERFORMANCE DOSSIER ────────────────────────────────────────── */ }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricMini label="Active Protocols" value={rfqs.filter(r => r.status === 'published').length} trend="+12.5%" isPositive={true} icon={Zap} />
                <MetricMini label="Logic Drafts" value={rfqs.filter(r => r.status === 'draft').length} trend="MODERATE" isPositive={false} icon={FileText} />
                <MetricMini label="Unified Responses" value="124" trend="+40.2%" isPositive={true} icon={ShieldCheck} />
            </div>

            {/* ── RFQ REGISTRY ───────────────────────────────────────────────── */ }
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find Procurement Node..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                          Active Transmissions: {rfqs.length} nodes
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sourcing Identity</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Sector</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Matrix</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Deadline Node</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="6"></td></tr>)
                            ) : rfqs.map((rfq, idx) => (
                                <motion.tr 
                                    key={rfq._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner relative overflow-hidden uppercase">
                                                <span className="text-xl font-black">{rfq.title.charAt(0)}</span>
                                                <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{rfq.title}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none max-w-xs line-clamp-1 italic">ID: RFQ-{rfq._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-100 bg-slate-50 px-3 py-1 rounded-lg">{rfq.departmentId?.name || 'GEN_OPS'}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-tight shadow-subtle px-3 py-1 bg-white border border-slate-100 rounded-lg w-fit group-hover:border-slate-900 transition-all">
                                            <Layers size={14} className="text-slate-300" /> {rfqs.items?.length || 0} Units
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1 tracking-widest font-black uppercase text-[9px]">
                                            <div className="flex items-center gap-2 text-slate-900">
                                              <Calendar size={12} className="text-slate-300" />
                                              {new Date(rfq.quoteDeadline).toLocaleDateString('en-IN')}
                                            </div>
                                            <div className="text-slate-300 ml-5 font-mono">18:00 UTC+05:30</div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <StatusBadge status={rfq.status} />
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="p-3 bg-white text-slate-300 hover:text-slate-900 hover:border-slate-900 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95">
                                            <ArrowUpRight size={18} strokeWidth={2.5} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && rfqs.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8 text-slate-200">
                            <FileText size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No active sourcing nodes found</p>
                        <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Awaiting procurement demand initialization.</p>
                    </div>
                )}
            </div>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .shadow-subtle {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

const MetricMini = ({ label, value, trend, isPositive, icon: Icon }) => (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-premium group hover:border-slate-900 transition-all duration-500 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
            <Icon size={100} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 group-hover:text-slate-900 transition-colors uppercase relative z-10">{label}</p>
        <div className="flex items-end justify-between relative z-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {trend}
            </div>
        </div>
    </div>
);

export default RFQList;
