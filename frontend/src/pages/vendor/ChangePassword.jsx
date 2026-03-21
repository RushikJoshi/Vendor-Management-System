import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
    Lock, Eye, EyeOff, ShieldCheck, AlertTriangle,
    KeyRound, CheckCircle2, ArrowRight, Shield, Terminal, Activity, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD_RULES = [
    { id: "length", label: "8+ BYTES REQUIRED", test: (p) => p.length >= 8 },
    { id: "upper", label: "UPPERCASE_NODE", test: (p) => /[A-Z]/.test(p) },
    { id: "lower", label: "LOWERCASE_NODE", test: (p) => /[a-z]/.test(p) },
    { id: "number", label: "NUMERIC_ID", test: (p) => /\d/.test(p) },
];

function StrengthBar({ password }) {
    const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
    const colors = ["bg-slate-200", "bg-slate-400", "bg-slate-600", "bg-slate-900"];
    const labels = ["Insecure", "Marginal", "Synchronized", "Encrypted"];
    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i < passed ? colors[passed - 1] : "bg-slate-100"}`} />
                ))}
            </div>
            {password && (
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] italic ${passed === 4 ? "text-emerald-500" : "text-slate-400"}`}>
                    Protocol Strength: {labels[passed - 1] || "Critical_Failure"}
                </p>
            )}
        </div>
    );
}

export default function ChangePassword() {
    const { onPasswordChanged, logout } = useContext(AuthContext);
    const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
    const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
    const [loading, setLoading] = useState(false);

    const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));
    const handle = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const rulesPass = PASSWORD_RULES.every(r => r.test(form.newPass));
    const passwordsMatch = form.newPass === form.confirm && form.confirm !== "";
    const canSubmit = form.current && rulesPass && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        const toastId = toast.loading("Executing Security Protocol Update...");
        try {
            const res = await api.post("/auth/change-password", {
                currentPassword: form.current,
                newPassword: form.newPass
            });
            toast.success("Security Vault Updated. Node Activated.", { id: toastId });
            onPasswordChanged(res.data.token);
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol Update Failure.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 fade-in">
            <div className="relative w-full max-w-[500px] space-y-8">
                {/* ── SECURITY HEADER ───────────────────────────────────────── */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(255,255,255,0.05)_0%,_transparent_50%)]"></div>
                    <div className="flex items-center gap-6 relative z-10 mb-8">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-white group-hover:text-slate-900 transition-all duration-700">
                            <Lock size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2 font-sans">Security <span className="text-slate-500 italic">Vault</span></h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none mb-2">Protocol_v4.2.0 Ingress</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10 group-hover:border-white/20 transition-all duration-500">
                        <AlertTriangle size={20} className="text-amber-400 mt-1 shrink-0 animate-pulse" />
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest leading-relaxed italic lowercase tracking-tight">
                            Temporary access detected. You must initialize a permanent encryption key before synchronization with the enterprise dashboard.
                        </p>
                    </div>
                </div>

                {/* ── CREDENTIAL CANVAS ─────────────────────────────────────── */}
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden relative group/canvas">
                    <form onSubmit={handleSubmit} className="p-12 space-y-10 relative z-10">

                        {/* Current password */}
                        <div className="space-y-4 group/input">
                            <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-slate-900 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-focus-within/input:bg-slate-900 transition-all"></div>
                                Temporary Node Key
                            </label>
                            <div className="relative">
                                <Terminal size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                <input
                                    type={show.current ? "text" : "password"}
                                    value={form.current}
                                    onChange={handle("current")}
                                    placeholder="Enter ingress key..."
                                    className="w-full pl-16 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 focus:ring-12 focus:ring-slate-50 outline-none transition-all shadow-inner"
                                />
                                <button type="button" onClick={() => toggle("current")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-slate-50 border-t border-dashed border-slate-200" />

                        {/* New password */}
                        <div className="space-y-6">
                            <div className="space-y-4 group/input">
                                <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-slate-900 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-focus-within/input:bg-slate-900 transition-all"></div>
                                    New Encryption Key
                                </label>
                                <div className="relative">
                                    <ShieldCheck size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    <input
                                        type={show.newPass ? "text" : "password"}
                                        value={form.newPass}
                                        onChange={handle("newPass")}
                                        placeholder="Initialize new protocol..."
                                        className="w-full pl-16 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 focus:ring-12 focus:ring-slate-50 outline-none transition-all shadow-inner"
                                    />
                                    <button type="button" onClick={() => toggle("newPass")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                        {show.newPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Strength bar */}
                            <AnimatePresence>
                                {form.newPass && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-4"
                                    >
                                        <StrengthBar password={form.newPass} />
                                        
                                        <div className="mt-6 grid grid-cols-2 gap-4">
                                            {PASSWORD_RULES.map(rule => (
                                                <div key={rule.id} className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${rule.test(form.newPass) ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"}`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${rule.test(form.newPass) ? "text-slate-900" : "text-slate-300"}`}>
                                                        {rule.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-4 group/input">
                            <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-slate-900 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-focus-within/input:bg-slate-900 transition-all"></div>
                                Key Confirmation
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                <input
                                    type={show.confirm ? "text" : "password"}
                                    value={form.confirm}
                                    onChange={handle("confirm")}
                                    placeholder="Re-enter to validate..."
                                    className={`w-full pl-16 pr-14 py-5 bg-slate-50 border rounded-2xl text-sm font-black text-slate-900 placeholder-slate-300 outline-none transition-all shadow-inner
                                        ${form.confirm
                                            ? passwordsMatch
                                                ? "border-emerald-400 focus:ring-12 focus:ring-emerald-50"
                                                : "border-rose-400 focus:ring-12 focus:ring-rose-50"
                                            : "border-slate-100 focus:bg-white focus:border-slate-900 focus:ring-12 focus:ring-slate-50"
                                        }`}
                                />
                                <button type="button" onClick={() => toggle("confirm")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={!canSubmit || loading}
                                className="w-full h-20 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.6em] rounded-3xl hover:bg-black hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:pointer-events-none shadow-2xl relative overflow-hidden group/btn"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-5 transition-opacity"></div>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-4">
                                        <Activity size={20} className="animate-spin" /> SYNCHRONIZING_FLUX...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-4">
                                        Activate Cluster Node <ArrowRight size={20} className="group-hover/btn:translate-x-3 transition-transform duration-500" />
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={logout}
                                className="w-full text-center text-[9px] font-black text-slate-300 hover:text-slate-900 transition-colors uppercase tracking-[0.5em] mt-8 group/logout flex items-center justify-center gap-2"
                            >
                                <div className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-slate-900 transition-all"></div>
                                Terminate Current Session
                            </button>
                        </div>
                    </form>
                </div>

                <footer className="text-center space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                    <div className="flex items-center justify-center gap-8">
                         <Globe size={16} className="text-slate-300" />
                         <span className="text-[9px] font-black uppercase tracking-[1em] select-none text-slate-300">VMS_ENTERPRISE_AUTHENTICATION</span>
                         <Shield size={16} className="text-slate-300" />
                    </div>
                </footer>
            </div>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .fade-in {
                    animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
