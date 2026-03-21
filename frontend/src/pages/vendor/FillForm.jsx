import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Send, ShieldCheck, ArrowRight, Zap, Target, FileText, Activity, Shield, Layers, Globe, Cpu, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FillForm() {
    return (
        <div className="max-w-6xl mx-auto space-y-16 fade-in pb-20 mt-12 px-4 shadow-subtle group/container">
            {/* ── DIGITAL ACTIVATION HEADER ─────────────────────────────────── */}
            <header className="text-center relative space-y-10 group">
                <div className="flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-4 px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-2xl border border-white/10 relative overflow-hidden active:scale-95 transition-all"
                    >
                        <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <Sparkles size={16} className="text-emerald-400 animate-pulse" /> 
                         AI Assisted Onboarding Protocol_v4.2
                    </motion.div>
                    
                    <h1 className="text-6xl lg:text-9xl font-black text-slate-900 tracking-[-0.05em] mb-8 leading-[0.8] uppercase select-none">
                        Digital <span className="text-slate-300 italic block mt-4 hover:text-slate-900 transition-colors duration-1000">Activation</span>
                    </h1>
                    
                    <p className="text-slate-400 font-bold text-sm max-w-2xl mx-auto leading-relaxed border-l-4 border-slate-900/10 pl-8 lowercase italic tracking-tight">
                        Initializing organizational compliance matrix. Submit your verified entity data to synchronize with global procurement clusters and unlock high-frequency operational scalability.
                    </p>
                </div>

                <div className="absolute top-1/2 left-0 -translate-x-12 opacity-[0.03] rotate-12 pointer-events-none group-hover/container:scale-110 transition-transform duration-1000">
                     <Cpu size={300} />
                </div>
            </header>

            {/* ── INITIALIZATION CANVAS ──────────────────────────────────── */ }
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="bg-white rounded-[4rem] shadow-premium border border-slate-100 p-16 lg:p-28 overflow-hidden relative group/canvas"
            >
                {/* Decorative background overlay */}
                <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover/canvas:scale-110 transition-transform duration-1000 group-hover/canvas:rotate-6">
                    <Layers size={600} strokeWidth={1} />
                </div>
                
                <div className="relative z-10 space-y-20">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_50px_-10px_rgba(15,23,42,0.3)] group-hover/canvas:shadow-none transition-all">
                            <Activity size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-2">Entity Registry Matrix</h2>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">General Operational Ingress Protocol</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                        <InputGroup label="Legal Entity Nomenclature" icon={Target} sequence="01">
                            <input 
                                type="text" 
                                className="vms-onboarding-input h-20 shadow-inner"
                                placeholder="Alpha Industries Global_Node..."
                            />
                        </InputGroup>
                        
                        <InputGroup label="Taxonomy Identifier (GST/PAN)" icon={Zap} sequence="02">
                            <input 
                                type="text" 
                                className="vms-onboarding-input h-20 shadow-inner"
                                placeholder="REG-NODE-9988-INTL"
                            />
                        </InputGroup>

                        <div className="md:col-span-2 space-y-6">
                                <label className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic group-focus-within:text-slate-900 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    <FileText size={16} />
                                    Operational Sector Synthesis (03)
                                </label>
                                <textarea 
                                    rows="6"
                                    className="vms-onboarding-input resize-none py-8 shadow-inner"
                                    placeholder="Provide a high-frequency synthesis of your core enterprise logic, market specializations, and infrastructure capabilities..."
                                />
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right italic">Max Characters: 2000_BYTES</p>
                        </div>
                    </div>

                    <div className="pt-20 border-t border-slate-50 flex flex-col xl:flex-row items-center justify-between gap-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 px-8 py-5 rounded-[2rem] border border-emerald-100 shadow-subtle group/shield cursor-help">
                                <ShieldCheck size={24} className="group-hover/shield:scale-110 transition-transform" />
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] leading-none block">ECC-256 Protocol Active</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/60 mt-1 block">Military-Grade Tunneling Validated</span>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic hover:text-slate-900 transition-colors">
                                <Globe size={14} /> CLUSTER_STABLE_01
                            </div>
                        </div>

                        <button className="group w-full xl:w-auto flex items-center justify-center gap-8 bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden">
                             <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>
                            Deploy Submission Protocol <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform duration-500" />
                        </button>
                    </div>
                </div>
            </motion.div>
            
            <footer className="flex flex-col items-center gap-8 pt-12">
                <div className="flex items-center gap-4">
                     <span className="text-[9px] font-black text-slate-200 uppercase tracking-[1em] select-none">VALIDATED_BY</span>
                </div>
                <div className="flex items-center gap-12 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 cursor-default">
                    <div className="flex items-center gap-3">
                         <Shield size={18} className="text-slate-900" />
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Antigravity Core</span>
                    </div>
                </div>
            </footer>

            <style>{`
                .vms-onboarding-input {
                    width: 100%;
                    padding: 0 2rem;
                    background-color: #F8FAFC;
                    border: 1px solid #F1F5F9;
                    border-radius: 2rem;
                    font-size: 0.9375rem;
                    font-weight: 900;
                    color: #0F172A;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    outline: none;
                    text-transform: uppercase;
                }
                .vms-onboarding-input:focus {
                    background-color: #FFFFFF;
                    border-color: #0F172A;
                    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }
                .vms-onboarding-input::placeholder {
                    color: #CBD5E1;
                    letter-spacing: normal;
                    text-transform: none;
                }
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

const InputGroup = ({ label, icon: Icon, sequence, children }) => (
    <div className="space-y-6 group/input">
        <label className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-slate-900 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-focus-within/input:bg-slate-900 transition-all"></div>
            <Icon size={16} />
            {label} ({sequence})
        </label>
        {children}
    </div>
);
