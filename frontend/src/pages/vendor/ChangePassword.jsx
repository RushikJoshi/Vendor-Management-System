import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
    Lock, Eye, EyeOff, ShieldCheck, AlertTriangle,
    KeyRound, CheckCircle2, ArrowRight
} from "lucide-react";

const PASSWORD_RULES = [
    { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
    { id: "upper", label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "lower", label: "At least one lowercase letter", test: (p) => /[a-z]/.test(p) },
    { id: "number", label: "At least one number", test: (p) => /\d/.test(p) },
];

function StrengthBar({ password }) {
    const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
    const colors = ["bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
    const labels = ["Weak", "Fair", "Good", "Strong"];
    return (
        <div className="space-y-2">
            <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < passed ? colors[passed - 1] : "bg-slate-100"}`} />
                ))}
            </div>
            {password && (
                <p className={`text-[10px] font-black uppercase tracking-widest ${colors[passed - 1]?.replace("bg-", "text-") || "text-slate-400"}`}>
                    {labels[passed - 1] || "Too Weak"}
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
        try {
            const res = await api.post("/auth/change-password", {
                currentPassword: form.current,
                newPassword: form.newPass
            });
            toast.success("Password changed! Welcome to your dashboard. 🎉");
            onPasswordChanged(res.data.token);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center p-6">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{ backgroundImage: "radial-gradient(circle, #0B5D3B 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

            <div className="relative w-full max-w-[460px]">
                {/* Header card */}
                <div className="bg-[#0B5D3B] rounded-2xl p-8 mb-4 shadow-2xl shadow-[#0B5D3B]/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <KeyRound size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">Set Your Password</h1>
                            <p className="text-emerald-300 text-xs font-semibold mt-0.5">First-time login security setup</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-amber-400/20 border border-amber-400/30 rounded-xl p-4">
                        <AlertTriangle size={16} className="text-amber-300 mt-0.5 shrink-0" />
                        <p className="text-amber-100 text-xs font-medium leading-relaxed">
                            You're using a <strong>temporary password</strong>. You must set a permanent password before accessing your vendor dashboard.
                        </p>
                    </div>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">

                        {/* Current password */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                Temporary Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type={show.current ? "text" : "password"}
                                    value={form.current}
                                    onChange={handle("current")}
                                    placeholder="Enter temporary password from email"
                                    className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-300 focus:border-[#0B5D3B] focus:ring-4 focus:ring-[#0B5D3B]/8 outline-none transition-all"
                                />
                                <button type="button" onClick={() => toggle("current")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                                    {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-slate-100" />

                        {/* New password */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                New Password
                            </label>
                            <div className="relative">
                                <ShieldCheck size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type={show.newPass ? "text" : "password"}
                                    value={form.newPass}
                                    onChange={handle("newPass")}
                                    placeholder="Create a strong password"
                                    className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-300 focus:border-[#0B5D3B] focus:ring-4 focus:ring-[#0B5D3B]/8 outline-none transition-all"
                                />
                                <button type="button" onClick={() => toggle("newPass")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                                    {show.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {form.newPass && (
                                <div className="mt-3">
                                    <StrengthBar password={form.newPass} />
                                </div>
                            )}

                            {/* Rules checklist */}
                            {form.newPass && (
                                <div className="mt-3 space-y-1.5">
                                    {PASSWORD_RULES.map(rule => (
                                        <div key={rule.id} className="flex items-center gap-2">
                                            <CheckCircle2
                                                size={12}
                                                className={rule.test(form.newPass) ? "text-emerald-500" : "text-slate-200"}
                                            />
                                            <span className={`text-[10px] font-semibold ${rule.test(form.newPass) ? "text-emerald-700" : "text-slate-400"}`}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type={show.confirm ? "text" : "password"}
                                    value={form.confirm}
                                    onChange={handle("confirm")}
                                    placeholder="Re-enter new password"
                                    className={`w-full pl-11 pr-11 py-3.5 border rounded-xl text-sm font-medium text-slate-800 placeholder-slate-300 outline-none transition-all
                                        ${form.confirm
                                            ? passwordsMatch
                                                ? "border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                                                : "border-rose-400 focus:ring-4 focus:ring-rose-50"
                                            : "border-slate-200 focus:border-[#0B5D3B] focus:ring-4 focus:ring-[#0B5D3B]/8"
                                        }`}
                                />
                                <button type="button" onClick={() => toggle("confirm")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                                    {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.confirm && !passwordsMatch && (
                                <p className="text-rose-500 text-[10px] font-bold mt-1.5">Passwords do not match</p>
                            )}
                            {form.confirm && passwordsMatch && (
                                <p className="text-emerald-600 text-[10px] font-bold mt-1.5">✓ Passwords match</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-[#0B5D3B] text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:from-emerald-700 hover:to-[#0a4f32] transition-all shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Securing Account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Activate Account <ArrowRight size={14} />
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest mt-2"
                        >
                            Sign out instead
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
                    VMS Enterprise · Vendor Portal · Secured Session
                </p>
            </div>
        </div>
    );
}
