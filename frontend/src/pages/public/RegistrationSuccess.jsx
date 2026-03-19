import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home, Mail, ShieldCheck, FileText, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function RegistrationSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { appId, email } = location.state || {};
    const [copied, setCopied] = useState(false);

    const displayId = appId ? `VR-${appId.toString().slice(-9).toUpperCase()}` : `VR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const copyId = () => {
        navigator.clipboard.writeText(displayId);
        setCopied(true);
        toast.success("Application ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#0F7B4D]"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0F7B4D]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0F7B4D]/5 rounded-full blur-3xl"></div>

            <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 lg:p-16 text-center animate-in zoom-in duration-700 relative">

                <div className="w-28 h-28 bg-[#0F7B4D] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[#0F7B4D]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <CheckCircle size={56} strokeWidth={2.5} />
                </div>

                <div className="space-y-4 mb-10">
                    <p className="text-[10px] font-black text-[#0F7B4D] uppercase tracking-[0.5em]">Registration Submitted</p>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Dossier <br /> Received
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Your vendor registration has been successfully submitted and is now pending review.
                    </p>
                </div>

                {/* Application Reference ID */}
                <div
                    onClick={copyId}
                    className="mb-8 cursor-pointer flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 group hover:bg-emerald-100 transition-all"
                    title="Click to copy Application ID"
                >
                    <FileText size={18} className="text-[#0F7B4D]" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-[#0F7B4D]/60 uppercase tracking-widest">Application Reference ID</p>
                        <p className="text-lg font-black text-[#0F7B4D] tracking-wider">{displayId}</p>
                    </div>
                    <Copy size={14} className={`ml-auto transition-all ${copied ? "text-[#0F7B4D]" : "text-slate-300 group-hover:text-[#0F7B4D]"}`} />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 mb-10 text-left space-y-6">
                    <div className="flex gap-5">
                        <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-[#0F7B4D]">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 mb-1">PDF Confirmation Sent</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Registration submitted successfully. A confirmation PDF has been sent to your email
                                {email && <strong className="text-slate-700"> ({email})</strong>}.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-5">
                        <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-[#0F7B4D]">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 mb-1">Standard Review Cycle: 3–5 Business Days</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Our compliance committee will validate your dossier and notify you via email once reviewed.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 py-5 bg-[#0F7B4D] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#0F7B4D]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Home size={18} />
                        Return to Portal
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-5 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-[#0F7B4D] hover:text-[#0F7B4D] transition-all flex items-center justify-center gap-3"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
