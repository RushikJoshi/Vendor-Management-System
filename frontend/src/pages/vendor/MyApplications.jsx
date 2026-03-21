import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, Filter, ArrowUpRight, ChevronRight, Activity, Terminal, Shield, Layers, Calendar, Lock } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/applications') 
            .then(res => setApplications(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusStyle = (status) => {
        const s = status?.toString().toLowerCase();
        if (s === 'approved') return 'bg-slate-900 text-white border-slate-900 shadow-xl';
        if (s === 'rejected') return 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50';
        return 'bg-slate-50 text-slate-400 border-slate-100 shadow-sm';
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Dossier Registry</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Submission Logs</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4 font-sans">Application <span className="text-slate-400">Flux</span></h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6 lowercase tracking-tight">Synchronizing and auditing organizational compliance applications. Real-time monitoring of submission status across all procurement sectors.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 shadow-subtle">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Sync: 100% Stable</span>
                    </div>
                </div>
            </header>

            {/* ── REGISTRY TABLE ─────────────────────────────────────────────── */ }
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden relative">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px] group">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find Transaction Node..." 
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 transition-all outline-none shadow-inner placeholder-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-4 px-8 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-slate-900 hover:text-slate-900 transition-all shadow-subtle group active:scale-95">
                            <Filter size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" /> Threshold Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Sequence</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Sector</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Date</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Status</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Terminal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>
                                    ))
                                ) : applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-40 text-center grayscale opacity-40">
                                            <div className="flex flex-col items-center gap-8">
                                                <div className="w-24 h-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200">
                                                    <FileText size={48} strokeWidth={1} />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-black text-slate-900 tracking-tighter uppercase text-xs">Registry Empty</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 max-w-xs leading-relaxed uppercase tracking-widest italic">No active submission nodes detected in the current organizational scope.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app, idx) => (
                                        <motion.tr 
                                            key={app._id} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-[#FDFDFD] transition-all cursor-pointer border-l-4 border-transparent hover:border-slate-900"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-xl transition-all shadow-inner relative">
                                                        <Activity size={18} />
                                                     </div>
                                                     <span className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">PRT_{app._id.slice(-8).toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-tight shadow-subtle px-3 py-1 bg-white border border-slate-100 rounded-lg w-fit group-hover:border-slate-900 transition-all">
                                                    <Layers size={14} className="text-slate-300" /> {typeof app.category === 'object' ? app.category?.name : (app.category || 'GENERAL_OPS')}
                                                </div>
                                            </td>

                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1 tracking-widest font-black uppercase text-[9px]">
                                                    <div className="flex items-center gap-2 text-slate-900">
                                                      <Calendar size={12} className="text-slate-300" />
                                                      {new Date(app.createdAt).toLocaleDateString('en-IN')}
                                                    </div>
                                                    <div className="text-slate-300 ml-5 font-mono">{new Date(app.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} UTC</div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-subtle transition-all duration-500 ${getStatusStyle(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-slate-900 hover:border-slate-900 hover:shadow-xl transition-all flex items-center justify-center group active:scale-95">
                                                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── SECURITY FOOTER ────────────────────────────────────────── */ }
            <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20 border border-white/5 group-hover:bg-white group-hover:text-slate-900 transition-all">
                            <Terminal size={24} />
                        </div>
                        <div>
                             <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Integrity Vault Active</h3>
                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic leading-none">Global Compliance Sync Terminal</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400 lowercase tracking-tight max-w-lg italic border-l-2 border-white/10 pl-6">All application nodes are multi-layer encrypted and anchored within the decentralized procurement registry for enterprise audit compliance.</p>
                </div>
                <button className="relative z-10 h-16 px-12 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 active:scale-95 transition-all shadow-xl shadow-black/20 group/btn overflow-hidden">
                    <div className="relative z-10 flex items-center gap-4">
                        <Lock size={16} /> Protocol Audit Log
                    </div>
                    <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover/btn:opacity-5 transition-opacity"></div>
                </button>
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
}
