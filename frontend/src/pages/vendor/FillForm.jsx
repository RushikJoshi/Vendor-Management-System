import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Send, ShieldCheck, ArrowRight } from 'lucide-react';

export default function FillForm() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 blur-[100px] -z-10"></div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100 shadow-sm shadow-indigo-50">
                    <Sparkles size={14} className="animate-pulse" /> Smart Compliance
                </div>
                <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4 leading-none">
                    Digital <span className="text-indigo-600 italic">Onboarding</span>
                </h1>
                <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                    Please provide the requested enterprise information to complete your partner profile and stay compliant.
                </p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)] border border-gray-100 p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <ClipboardCheck size={200} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Legal Company Name</label>
                        <input 
                            type="text" 
                            className="w-full px-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Enter legal entity name..."
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Tax Identifier / GST</label>
                        <input 
                            type="text" 
                            className="w-full px-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            placeholder="AA-00000000"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Business Description</label>
                        <textarea 
                            rows="4"
                            className="w-full px-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                            placeholder="Briefly describe your core operations..."
                        />
                    </div>
                </div>

                <div className="mt-12 pt-12 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50">
                        <ShieldCheck size={20} spellCheck="true" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Encrypted Transmission</span>
                    </div>

                    <button className="group w-full md:w-auto flex items-center justify-center gap-4 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95">
                        Complete Submission <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            
            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                Secure Enterprise Protocol v2.4
            </p>
        </div>
    );
}
