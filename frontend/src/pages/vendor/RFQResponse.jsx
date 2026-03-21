import React, { useState, useEffect } from 'react';
import { Zap, Timer, CheckCircle, FileText, Plus, Search, Filter, ShieldCheck, ArrowRight, Layers, Activity, Globe, Terminal, Lock, ChevronRight, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function RFQResponse() {
    return (
        <div className="space-y-12 fade-in pb-20 mt-8">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Procurement Flux</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active RFQ Marketplace</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4 font-sans">Sourcing <span className="text-slate-300">Terminal</span></h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6 lowercase tracking-tight">Synchronizing with global procurement cycles. Respond to active architectural invitations and secure your node in the network registry.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10 w-full xl:w-auto">
                    <div className="flex-1 xl:flex-none p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-8 shadow-premium group cursor-pointer hover:border-slate-900 transition-all duration-500">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-2">Aggregate RFQs</p>
                            <p className="text-3xl font-black text-slate-900 leading-none group-hover:scale-110 transition-transform">00</p>
                        </div>
                        <div className="h-10 w-px bg-slate-100 group-hover:bg-slate-900 transition-colors"></div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-2">Sync Responses</p>
                            <p className="text-3xl font-black text-emerald-500 leading-none group-hover:scale-110 transition-transform">00</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── REGISTRY CANVAS ───────────────────────────────────────────── */ }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Empty State / Marketplace Hub */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 lg:col-span-3 py-44 bg-white border border-slate-100 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50/50 hover:border-slate-900 duration-1000 shadow-premium relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(15,23,42,0.02)_0%,_transparent_50%)]"></div>
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 mb-10 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-2xl transition-all duration-500 relative z-10">
                        <Layers size={48} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Marketplace Terminal Silence</h3>
                        <p className="text-slate-400 font-bold text-xs max-w-sm mx-auto leading-relaxed lowercase italic tracking-tight border-l-2 border-slate-100 pl-6">
                            No active procurement cycles detected. Ensure your entity taxonomy is refined to increase protocol visibility within the Antigravity sourcing grid.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ── COMPLIANCE ELEVATION ────────────────────────────────────────── */ }
            <div className="bg-slate-900 rounded-[3.5rem] p-12 lg:p-16 flex flex-col xl:flex-row items-center justify-between gap-12 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-[0.02] rounded-full blur-[80px] -mr-40 -mt-40 group-hover:scale-[1.1] transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-emerald-400 shadow-2xl group-hover:bg-white group-hover:text-slate-900 transition-all duration-500">
                        <ShieldCheck size={36} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                            Elevate Your <span className="text-emerald-400">Registry Score</span>
                        </h3>
                        <p className="text-slate-400 text-xs font-medium lowercase italic tracking-tight max-w-lg border-l-2 border-white/10 pl-6 leading-relaxed">
                            Nodes with 100% compliance integrity are frequently prioritized in global RFQ cycles. Synchronize documentation to improve your organizational weight.
                        </p>
                    </div>
                </div>
                
                <button className="relative z-10 w-full xl:w-auto h-20 px-12 bg-white text-slate-900 font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] hover:bg-emerald-400 hover:text-slate-900 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-6 overflow-hidden group/btn">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-900 opacity-5 group-hover/btn:opacity-20 transition-opacity"></div>
                    Sync Integrity Metadata <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
            </div>
            
            <footer className="flex flex-col items-center gap-6 pt-12">
                <div className="flex items-center gap-4 text-slate-200">
                     <Terminal size={14} />
                     <p className="text-[9px] font-black uppercase tracking-[0.6em]">Enterprise Procurement Protocol v5.12-stable</p>
                </div>
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
