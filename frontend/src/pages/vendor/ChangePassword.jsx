import { useContext, useState } from "react";
import { AlertTriangle, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";
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
    <PageShell className="pt-6">
      <PageHero
        badge="Vendor security"
        title="Set a secure password."
        description="This page now uses the same font hierarchy, colors, and spacing system as the admin dashboard while keeping the existing password-change flow intact."
        stats={[
          { icon: ShieldCheck, label: "Security mode", value: "Protected" },
          { icon: KeyRound, label: "Password rules", value: 4 },
          { icon: Lock, label: "Access", value: "Vendor only" },
        ]}
        aside={
          <>
            <InfoPanel
              icon={AlertTriangle}
              title="Action required"
              value="Update your password"
              note="Temporary or outdated credentials should be replaced before continuing in the vendor workspace."
              toneClass="bg-amber-50 text-amber-600"
            />
            <InfoPanel
              icon={ShieldCheck}
              title="Backend"
              value="No logic changed"
              note="Only the UI has been updated. The existing auth endpoint remains the same."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Change Password" description="Enter your current password and set a new secure password.">
          <form onSubmit={handleSubmit} className="space-y-5 p-4 xl:p-5">
            <PasswordField
              label="Current password"
              icon={Lock}
              value={form.current}
              onChange={handle("current")}
              onToggle={() => toggle("current")}
              visible={show.current}
              placeholder="Enter current password"
            />

            <PasswordField
              label="New password"
              icon={ShieldCheck}
              value={form.newPass}
              onChange={handle("newPass")}
              onToggle={() => toggle("newPass")}
              visible={show.newPass}
              placeholder="Enter new password"
            />

            <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Password rules</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PASSWORD_RULES.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-2 text-[13px]">
                    <span className={`h-2.5 w-2.5 rounded-full ${rule.test(form.newPass) ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={rule.test(form.newPass) ? "text-slate-900" : "text-slate-500"}>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <PasswordField
              label="Confirm password"
              icon={KeyRound}
              value={form.confirm}
              onChange={handle("confirm")}
              onToggle={() => toggle("confirm")}
              visible={show.confirm}
              placeholder="Confirm new password"
            />

            {form.confirm ? (
              <div className={`rounded-xl px-4 py-3 text-[13px] font-medium ${passwordsMatch ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {passwordsMatch ? "Passwords match and are ready to save." : "Passwords do not match yet."}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <button type="submit" disabled={!canSubmit || loading} className={primaryButtonClass}>
                <ShieldCheck size={16} />
                {loading ? "Saving..." : "Update password"}
              </button>
              <button type="button" onClick={logout} className={secondaryButtonClass}>
                Sign out
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Security Notes" description="Quick context for password setup.">
          <div className="space-y-3 p-4">
            <SummaryTile
              label="Temporary access"
              value="Replace short-term credentials"
              note="This password step is useful when the current password was issued during onboarding."
            />
            <SummaryTile
              label="Consistency"
              value="Admin-style UI applied"
              note="This vendor page now uses the same visual family as the admin dashboard."
            />
            <SummaryTile
              label="Validation"
              value={rulesPass ? "Rules satisfied" : "Rules pending"}
              note="Complete all password requirements before saving the new password."
            />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
