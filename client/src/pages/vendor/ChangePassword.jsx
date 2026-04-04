import { useContext, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Field,
  InfoPanel,
  PageHero,
  PageShell,
  SectionCard,
  SummaryTile,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/vendor/VendorUI";

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /\d/.test(value) },
];

function PasswordField({ label, icon: Icon, visible, onToggle, ...props }) {
  return (
    <Field label={label}>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`${inputClass} pl-11 pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  );
}

export default function ChangePassword() {
  const { onPasswordChanged, logout } = useContext(AuthContext);
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const toggle = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  const handle = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const rulesPass = PASSWORD_RULES.every((rule) => rule.test(form.newPass));
  const passwordsMatch = form.newPass === form.confirm && form.confirm !== "";
  const canSubmit = Boolean(form.current) && rulesPass && passwordsMatch;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    const toastId = toast.loading("Updating password...");
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      toast.success("Password updated successfully", { id: toastId });
      onPasswordChanged(res.data.token);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                  <KeyRound size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Security Settings</h1>
                <p className="text-xs font-medium text-slate-500">Manage your access credentials and authentication security.</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">System Protected</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: Guidelines */}
        <div className="lg:col-span-4 space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Password Standards</h3>
                <div className="space-y-4">
                    {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(form.newPass);
                        return (
                            <div key={rule.id} className="flex items-center justify-between">
                                <span className={`text-[13px] font-medium transition-colors ${passed ? "text-slate-900" : "text-slate-400"}`}>
                                    {rule.label}
                                </span>
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${passed ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 text-slate-300"}`}>
                                    <CheckCircle2 size={12} className={passed ? "scale-100" : "scale-50 opacity-0"} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-50">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                            Your password must be distinct from any previous ones used to maintain account integrity.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
                <div className="flex items-start gap-3 text-indigo-600 mb-3">
                    <Lock size={18} className="shrink-0 mt-0.5" />
                    <h4 className="text-sm font-bold text-indigo-900 leading-none">Access Control</h4>
                </div>
                <p className="text-[11px] font-medium text-indigo-700/80 leading-relaxed">
                    Changing your password will sign you out of all other active sessions for security purposes.
                </p>
            </section>
        </div>

        {/* RIGHT: Form */}
        <div className="lg:col-span-8">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
                <div className="border-b border-slate-100 bg-slate-50/50 p-5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Update Authentication</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Enter your current credentials to authorize this change.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 flex-1 flex flex-col">
                    <div className="space-y-6 flex-1">
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Current Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={show.current ? "text" : "password"}
                                    value={form.current}
                                    onChange={handle("current")}
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:font-medium placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button" onClick={() => toggle("current")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">New Password</label>
                                <div className="relative">
                                    <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={show.newPass ? "text" : "password"}
                                        value={form.newPass}
                                        onChange={handle("newPass")}
                                        className="w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:font-medium placeholder:text-slate-300"
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                    <button type="button" onClick={() => toggle("newPass")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {show.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Confirm Password</label>
                                <div className="relative">
                                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={show.confirm ? "text" : "password"}
                                        value={form.confirm}
                                        onChange={handle("confirm")}
                                        className="w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:font-medium placeholder:text-slate-300"
                                        placeholder="Repeat new password"
                                        required
                                    />
                                    <button type="button" onClick={() => toggle("confirm")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {form.confirm && (
                            <div className={`mt-2 flex items-center gap-2 p-3 rounded-lg border text-[11px] font-black uppercase tracking-widest ${passwordsMatch ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
                                {passwordsMatch ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                {passwordsMatch ? "PASSWORDS MATCH & SECURE" : "PASSWORDS DO NOT MATCH"}
                            </div>
                        )}
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button type="button" onClick={logout} className="text-[11px] font-black text-rose-600 uppercase tracking-widest hover:underline">
                            SIGN OUT INSTEAD
                        </button>
                        <div className="flex items-center gap-3">
                            <button 
                                type="submit" 
                                disabled={!canSubmit || loading} 
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-[11px] font-black text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-black active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? <Activity size={16} className="animate-spin" /> : <ShieldCheck size={16} className="group-hover:animate-pulse" />}
                                {loading ? "UPDATING..." : "UPDATE CREDENTIALS"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>

      </div>
    </div>
  );
}

function SummaryMiniTile({ label, value, note }) {
  return (
    <div className="p-3 rounded-xl border border-slate-50 bg-slate-50/30">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="mt-2 text-xs font-bold text-slate-700">{value}</p>
        <p className="mt-1 text-[10px] font-medium text-slate-400 italic">{note}</p>
    </div>
  )
}


