import React, { useState, useEffect } from 'react';
import { FileSignature, ShieldCheck, Download, ExternalLink, Calendar, Layers, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function Contracts() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-emerald-100 shadow-sm shadow-emerald-50">
                        <ShieldCheck size={14} /> Legal Center Enabled
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2 leading-none">
                        Active <span className="text-emerald-600 italic">Agreements</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-lg">Manage your commercial contracts, MSA, and NDA documents securely.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Empty State */}
                <div className="md:col-span-2 lg:col-span-3 py-32 bg-white border border-gray-100 border-dashed rounded-3xl flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50/50">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-8 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                        <FileSignature size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">No Executed Contracts</h3>
                    <p className="text-gray-500 font-medium text-sm max-w-sm leading-relaxed">
                        Your partnership documents will appear here once they are finalized and signed by both parties.
                    </p>
                    <button className="mt-10 px-10 py-5 border border-gray-200 text-gray-400 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-white hover:text-gray-900 hover:border-gray-900 transition-all active:scale-95">
                        Download Master Agreement Template
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                   <Clock size={16} /> <span>Automatic Notifications Enabled</span>
               </div>
               <div className="hidden md:block w-px h-4 bg-gray-200 mx-2"></div>
               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                   <ShieldCheck size={16} /> <span>Digital Signatures Verified By Antigravity Corp</span>
               </div>
            </div>
            
            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                Legal Infrastructure Protocol v1.1
            </p>
        </div>
    );
}
