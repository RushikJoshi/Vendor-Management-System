import { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import {
    Eye, Building2, Mail, Filter,
    ArrowRight, Activity, Zap, Layers, AlertCircle, CheckCircle2, MoreHorizontal, ChevronRight, Search,
    TrendingUp, ShieldCheck, Terminal, ArrowUpRight
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import ApplicationDetail from "./ApplicationDetail";
import Stepper from "../../components/vms/Stepper";
import MatchProgress from "../../components/vms/MatchProgress";
import { motion, AnimatePresence } from "framer-motion";

export default function Applications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        highRisk: 0,
        approved: 0
    });

    useEffect(() => {
        fetchApps();
    }, [filterStatus]);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/applications`);
            const data = res.data.data;
            setApps(data);
            
            setStats({
                total: data.length,
                pending: data.filter(a => a.status === 'pending' || a.status === 'submitted').length,
                highRisk: data.filter(a => a.riskLevel === 'High').length,
                approved: data.filter(a => a.status === 'approved').length
            });
        } catch (err) {
            toast.error("Registry access failure.");
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = apps.filter(app => {
        if (filterStatus === 'all') return true;
        return app.status?.toLowerCase() === filterStatus.toLowerCase();
    });

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Operations Center</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Onboarding Queue</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Applications</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Mission-critical pipeline for evaluating vendor eligibility, risk mitigation, and compliance synchronization.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95">
                    <Filter size={16} /> Configure Pipeline
                  </button>
                  <button 
                    className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <ShieldCheck size={18} /> Batch Validate
                  </button>
                </div>
            </header>

            {/* ── METRIC SNAPSHOT ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 <MetricMini label="Active Pool" value={stats.total} trend="Total" isPositive={true} />
                 <MetricMini label="Pending Audit" value={stats.pending} trend="Action Req" isPositive={false} />
                 <MetricMini label="Critical Risk" value={stats.highRisk} trend="Alert" isPositive={false} />
                 <MetricMini label="Registry Verified" value={stats.approved} trend="Finalized" isPositive={true} />
            </div>

            {/* ── APPLICATIONS TABLE COMPONENT ────────────────────────────────── */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Universal Dossier Search..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                        />
                    </div>

                    <div className="flex bg-slate-50 p-1.5 rounded-[1.8rem] border border-slate-200 shadow-inner">
                        {['All', 'Draft', 'Pending', 'Approved', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status.toLowerCase())}
                                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all duration-500 ${
                                    filterStatus === status.toLowerCase() 
                                    ? 'bg-slate-900 text-white shadow-xl' 
                                    : 'text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendor Dossier</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Intelligence Context</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Stage</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Synthesis</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>)
                            ) : filteredApps.map((app, idx) => (
                                <motion.tr 
                                    key={app._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner">
                                                <Building2 size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                     <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">{app.companyName || "N/A"}</p>
                                                     {app.isNew && <span className="bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md">NEW</span>}
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest">{app.category?.name || "General Registry"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wide italic">
                                                <Mail size={12} className="text-slate-300" />
                                                {app.email}
                                            </div>
                                            <div className="text-[9px] text-slate-300 font-black uppercase tracking-widest">
                                                Dossier: #{app._id?.slice(-8).toUpperCase()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-4">
                                            <Stepper currentStage={app.currentStage || 'Submitted'} />
                                            <div className="flex items-center gap-3">
                                                 <StatusBadge status={app.status} />
                                                 <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                 <span className="text-[9px] text-slate-300 font-black tracking-widest uppercase">Cycle Active</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-5">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                                    app.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    app.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                    {app.riskLevel || 'Low'} Risk Potential
                                                </span>
                                            </div>
                                            <MatchProgress percentage={app.eligibilityScore || 85} />
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button className="h-10 px-6 bg-slate-50 text-slate-400 hover:text-slate-900 hover:border-slate-900 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-subtle group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-xl">
                                                Review
                                            </button>
                                            <button className="p-2 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {!loading && filteredApps.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                            <Layers size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">Registry Queue Clear</p>
                    </div>
                )}
            </div>

            {selectedApp && (
                <Modal open={true} onClose={() => setSelectedApp(null)} size="7xl">
                    <ApplicationDetail app={selectedApp} onSuccess={() => { setSelectedApp(null); fetchApps(); }} />
                </Modal>
            )}

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
}

const MetricMini = ({ label, value, trend, isPositive }) => (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-premium group hover:border-slate-900 transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 group-hover:text-slate-900 transition-colors uppercase">{label}</p>
        <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {trend}
            </div>
        </div>
    </div>
);
