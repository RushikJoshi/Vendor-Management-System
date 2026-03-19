import React, { useState, useEffect } from 'react';
import { Zap, Timer, CheckCircle, FileText, Plus, Search, Filter, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import api from '../../services/api';

export default function RFQResponse() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="relative">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/10 blur-[60px] -z-10 -translate-x-12 -translate-y-12"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 shadow-sm shadow-amber-50">
                            <Zap size={20} className="fill-amber-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Active Procurement</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2 leading-none">
                        RFQ <span className="text-amber-600 italic">Marketplace</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm">Respond to active invitations and secure your spot in the procurement cycle.</p>
                </div>
                
                <div className="w-full md:w-auto p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-6 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total RFQs</p>
                        <p className="text-xl font-black text-gray-900 leading-none">0</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Responses</p>
                        <p className="text-xl font-black text-amber-600 leading-none">0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Empty State */}
                <div className="md:col-span-2 lg:col-span-3 py-24 bg-white border border-gray-100 border-dashed rounded-3xl flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50/50">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform">
                        <Layers size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">No Active RFQs</h3>
                    <p className="text-gray-500 font-medium text-sm max-w-xs leading-relaxed">
                        You have not been invited to any procurement events yet. Please update your profile and categories to increase visibility.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] -z-0 -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                        Elevate your <span className="text-amber-400 italic">Partnership</span>
                    </h3>
                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                        Top performing vendors with 100% compliance score are frequently preferred in global RFQs.
                    </p>
                </div>
                <button className="relative z-10 w-full md:w-auto px-10 py-5 bg-white text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-400 hover:text-slate-900 transition-all active:scale-95 shadow-lg shadow-white/5">
                    View Compliance Score
                </button>
            </div>
            
            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                Enterprise Procurement Protocol v5.12
            </p>
        </div>
    );
}
