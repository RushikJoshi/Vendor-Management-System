import React, { useState, useEffect } from 'react';
import { FileSignature, ShieldCheck, Download, ExternalLink, Calendar, Layers, Clock, CheckCircle, Search, ChevronRight, Activity, Terminal, Lock, Globe, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contracts() {
    return (
        <div className="space-y-16 fade-in pb-20 mt-10">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Legal Framework</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Agreement Registry</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4 font-sans">Agreement <span className="text-slate-300">Vault</span></h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6 lowercase tracking-tight">Securely manage and audit your enterprise commercial protocols. Real-time synchronization of MSA, NDA, and localized procurement contracts.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10 w-full xl:w-auto">
                    <div className="flex-1 xl:flex-none p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-subtle group cursor-pointer hover:border-slate-900 transition-all">
                         <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse transition-all group-hover:scale-125"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">VMS_CORE_SIGNATURE_SYNC: Active</span>
                    </div>
                </div>
            </header>

            {/* ── REGISTRY CANVAS ───────────────────────────────────────────── */ }
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-[4rem] shadow-premium border border-slate-100 overflow-hidden relative group/canvas"
            >
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px] group/search">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-slate-900 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Universal Agreement Audit Search..." 
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 transition-all outline-none shadow-inner placeholder-slate-300"
                        />
                    </div>
                </div>

                <div className="p-24 lg:p-40 text-center grayscale opacity-80 group/empty relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none group-hover/empty:scale-110 transition-transform duration-1000 group-hover/empty:rotate-12">
                        <Lock size={600} strokeWidth={1} />
                    </div>

                    <div className="relative z-10 inline-block mb-16">
                        <div className="w-40 h-40 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 group-hover/empty:bg-slate-900 group-hover/empty:border-slate-900 group-hover/empty:text-white group-hover/empty:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 overflow-hidden relative">
                            <FileSignature size={80} className="group-hover/empty:scale-110 transition-transform" strokeWidth={1} />
                            <div className="absolute inset-4 border border-slate-200 group-hover/empty:border-white/10 rounded-2xl border-dashed"></div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-200 shadow-2xl group-hover/empty:text-emerald-500 group-hover/empty:rotate-12 transition-all">
                            <Activity size={28} strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-6 leading-none group-hover/empty:text-slate-900 transition-colors relative z-10 transition-opacity">Ledger Silence Detected</h3>
                    <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] mb-16 italic lowercase relative z-10">
                        No executed commercial protocols detected. Your finalized agreement nodes will appear here once digital signatures are synchronized across the cluster.
                    </p>
                    
                    <button className="h-16 px-12 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_50px_-10px_rgba(15,23,42,0.4)] hover:shadow-none hover:bg-black transition-all active:scale-95 flex items-center gap-6 mx-auto group/btn relative z-10">
                        Generate Standard MSA Protocol <ChevronRight size={20} className="text-emerald-400 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* ── SECURITY MODULES ────────────────────────────────────────── */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 flex items-center gap-10 group hover:bg-white hover:border-slate-900 hover:shadow-premium transition-all duration-500 cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Layers size={140} /></div>
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-xl group-hover:border-slate-900 transition-all duration-500 relative z-10">
                        <Download size={28} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Reference Library</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Global Operational Guidelines</p>
                    </div>
                    <ArrowUpRight size={20} className="ml-auto text-slate-200 group-hover:text-slate-900 transition-colors relative z-10" />
                </div>
                
                <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white flex items-center gap-10 group hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] transition-all duration-500 cursor-pointer overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]"></div>
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-emerald-400 group-hover:bg-white group-hover:text-slate-900 transition-all shadow-xl relative z-10 overflow-hidden">
                         <div className="absolute inset-2 border border-white/10 group-hover:border-slate-200 rounded-xl border-dashed"></div>
                        <Terminal size={28} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Secure Audit_V4.2</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Ledger Integrity Validated</p>
                    </div>
                </div>
            </div>

            <footer className="flex flex-col items-center gap-6 pt-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 text-slate-400">
                <Globe size={24} className="hover:rotate-180 transition-transform duration-[2000ms]" />
                <p className="text-[9px] font-black uppercase tracking-[0.8em] text-center select-none">Global Procurement Architecture Validated</p>
            </footer>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .shadow-subtle {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                .fade-in {
                    animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
