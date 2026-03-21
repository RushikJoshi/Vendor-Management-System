import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home, Mail, ShieldCheck, FileText, Copy, Printer, Globe, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function RegistrationSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { appId, email } = location.state || {};
    const [copied, setCopied] = useState(false);

    const displayId = appId ? `VR-${appId.toString().slice(-9).toUpperCase()}` : `VR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const copyId = () => {
        navigator.clipboard.writeText(displayId);
        setCopied(true);
        toast.success("Registry ID Copied to Clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-10 relative overflow-hidden fade-in">
            {/* Background Decorative Mesh/Glow */}
            <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-emerald-500/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 -z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 -z-0 pointer-events-none"></div>

            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl w-full bg-white rounded-[4rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 lg:p-20 text-center relative z-10 overflow-hidden"
            >
                {/* Status Indicator */}
                <div className="relative inline-block mb-12">
                    <motion.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-32 h-32 bg-[#0F172A] text-emerald-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative z-10"
                    >
                        <CheckCircle size={64} strokeWidth={2} />
                    </motion.div>
                    <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="flex items-center justify-center gap-3">
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">Protocol Synchronized</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] uppercase">
                        Dossier <br /> <span className="text-emerald-500 italic">Received</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-widest leading-relaxed">
                        Your enterprise registration protocol has been successfully committed to the global registry.
                    </p>
                </div>

                {/* Reference ID Component */}
                <motion.div
                    whileHover={{ y: -2 }}
                    whileActive={{ scale: 0.98 }}
                    onClick={copyId}
                    className="mb-12 cursor-pointer relative group"
                >
                    <div className="absolute inset-0 bg-slate-900 rounded-3xl blur-xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    <div className="relative flex items-center justify-between bg-slate-50 border border-slate-100 rounded-3xl p-6 transition-all group-hover:bg-white group-hover:border-emerald-500/30 overflow-hidden">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all shadow-inner">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registry Artifact Reference</p>
                                <p className="text-xl font-black text-slate-900 tracking-wider font-mono">{displayId}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all">
                           <Copy size={16} className={`${copied ? "text-emerald-500" : ""}`} />
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left space-y-3 group hover:bg-white hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm">
                                <Mail size={16} />
                             </div>
                             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Email Uplink</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-black leading-relaxed uppercase tracking-wider">
                            Encrypted PDF confirmation transmitted to: <span className="text-blue-600 block truncate">{email || "Registry Address"}</span>
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left space-y-3 group hover:bg-white hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm">
                                <ShieldCheck size={16} />
                             </div>
                             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Audit Cycle</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-black leading-relaxed uppercase tracking-wider">
                            Standard compliance review window: <span className="text-emerald-600 block uppercase">3-5 Business Cycles</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 py-6 bg-[#0F172A] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 border border-slate-700 active:scale-95"
                    >
                        Return to Hub <Globe size={18} className="text-emerald-400" />
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-10 py-6 bg-white border border-slate-200 text-slate-600 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:border-slate-900 transition-all flex items-center justify-center gap-4 active:scale-95 group shadow-sm"
                    >
                        Extract Receipt <Printer size={18} className="group-hover:translate-y-[-1px] transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
