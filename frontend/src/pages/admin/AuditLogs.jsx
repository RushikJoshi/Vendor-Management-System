import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { ShieldCheck, Database, Search, ChevronRight, X, Clock, User, Activity, Filter, ArrowUpRight, Lock, Globe, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({ page: 1, limit: 15, actionType: "" });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, [filters.page, filters.actionType]);

    const fetchLogs = async () => {
        try {
            const query = new URLSearchParams();
            query.append("page", filters.page);
            query.append("limit", filters.limit);
            if (filters.actionType) query.append("actionType", filters.actionType);

            const res = await api.get(`/admin/audit-logs?${query.toString()}`);
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Audit log error:", err);
            toast.error("Audit trail inaccessible.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (filters.page < pagination.pages) setFilters(f => ({ ...f, page: f.page + 1 }));
    };

    const handlePrevPage = () => {
        if (filters.page > 1) setFilters(f => ({ ...f, page: f.page - 1 }));
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Security Cluster</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Immutable Ledger Logs</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Audit Trail</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Mission-critical operational ledger tracking every mutation, authorization change, and administrative protocol across the global registry.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Logs By Action Protocol..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 uppercase tracking-tighter"
                            value={filters.actionType}
                            onChange={(e) => setFilters(f => ({ ...f, actionType: e.target.value.toUpperCase(), page: 1 }))}
                        />
                    </div>
                </div>
            </header>

            {/* ── AUDIT LOG DIRECTORY ─────────────────────────────────────────── */ }
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-50">
                            <Activity size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                                Registry Sync Active
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">Real-time Cryptographic Tracking</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-4">Node Page {filters.page} of {pagination.pages || 1}</span>
                         <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                            <button onClick={handlePrevPage} disabled={filters.page === 1} className="px-6 py-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Prev</button>
                            <button onClick={handleNextPage} disabled={filters.page >= pagination.pages} className="px-6 py-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ml-2">Next</button>
                         </div>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Node</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor Path</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Action</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Entity Context</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Analysis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>)
                            ) : logs.map((log, idx) => (
                                <motion.tr 
                                    key={log._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <Clock size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                            <span className="font-mono text-[10px] font-bold text-slate-500 group-hover:text-slate-900">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.userId?.slice(-8).toUpperCase() || "CORE_SYS"}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                            log.actionType.includes('REJECT') || log.actionType.includes('DELETE') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            log.actionType.includes('APPROVE') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            log.actionType.includes('CREATE') ? 'bg-slate-900 text-white border-slate-900' :
                                            'bg-white text-slate-700 border-slate-100'
                                        }`}>
                                            {log.actionType}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-all">
                                            {log.entityType} <span className="text-slate-200 mx-2">/</span> <span className="text-slate-300 group-hover:text-slate-500">#{log.entityId?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="h-10 px-6 bg-slate-50 text-slate-400 hover:text-slate-900 hover:border-slate-900 border border-transparent rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-subtle group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-xl">
                                          Analyze Drift
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && logs.length === 0 && (
                     <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40 text-center flex-1">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                            <ShieldCheck size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No ledger entries detected</p>
                    </div>
                )}
            </div>

            {/* ── DIFFERENTIAL VIEW MODAL ────────────────────────────────────── */ }
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            <div className="p-12 border-b border-slate-50 bg-slate-50 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                    <Terminal size={150} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                         <Lock size={16} className="text-slate-900" />
                                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ledger Analysis</h3>
                                    </div>
                                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-600 flex items-center gap-2">
                                        BLOCK_ID: {selectedLog._id.slice(-12).toUpperCase()} <span className="text-slate-200">|</span> UNIFIED_UTC: {new Date(selectedLog.createdAt).toISOString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-slate-50/50 px-12 py-6 border-b border-slate-100 grid grid-cols-3 gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="space-y-3">
                                    <span className="italic block ml-1 text-slate-400">Security Actor</span>
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-slate-900 flex items-center gap-3">
                                        <User size={14} /> {selectedLog.userRole} Node <span className="text-slate-300">|</span> {selectedLog.userId?.slice(-8).toUpperCase() || "SYSTEM"}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <span className="italic block ml-1 text-slate-400">Network Origin</span>
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-slate-900 flex items-center gap-3">
                                        <Globe size={14} /> {selectedLog.ipAddress || '127.0.0.1'} <span className="text-slate-300">|</span> TLS_V1.3
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <span className="italic block ml-1 text-slate-400">Entity Drift Context</span>
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between group cursor-pointer active:scale-95 transition-all">
                                        <span className="flex items-center gap-2">{selectedLog.entityType} <ArrowUpRight size={14} /></span>
                                        <span className="text-white/40 group-hover:text-emerald-400 transition-colors">#{selectedLog.entityId?.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                <div className="w-1/2 flex flex-col border-r border-slate-100">
                                    <div className="p-4 flex items-center justify-center gap-2 bg-slate-50 border-b border-slate-100 italic font-black text-[10px] text-rose-400 tracking-widest uppercase">
                                        <span className="w-1h-1 rounded-full bg-rose-400"></span> Previous State (Raw Memory)
                                    </div>
                                    <div className="flex-1 overflow-auto bg-[#FDFDFD] p-10 no-scrollbar">
                                        <pre className="text-[11px] font-mono leading-relaxed text-slate-500 whitespace-pre-wrap">{JSON.stringify(selectedLog.beforeData || {}, null, 4)}</pre>
                                    </div>
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <div className="p-4 flex items-center justify-center gap-2 bg-slate-900 border-b border-slate-800 italic font-black text-[10px] text-emerald-400 tracking-widest uppercase">
                                        <span className="w-1h-1 rounded-full bg-emerald-400"></span> Mutation Committed (Final State)
                                    </div>
                                    <div className="flex-1 overflow-auto bg-[#FDFDFD] p-10 no-scrollbar border-l-[12px] border-emerald-500/5">
                                        <pre className="text-[11px] font-mono leading-relaxed text-slate-900 whitespace-pre-wrap">{JSON.stringify(selectedLog.afterData || {}, null, 4)}</pre>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
