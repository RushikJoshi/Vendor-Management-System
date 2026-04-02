import { useEffect, useState } from "react";
import { Activity, Building2, Globe, Mail, MapPin, Phone, Save, ShieldCheck, User } from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../../services/api";
import {
  Field,
  InfoPanel,
  LinkButton,
  PageHero,
  PageShell,
  SectionCard,
  SummaryTile,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "../../components/vendor/VendorUI";

export default function Profile() {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/vendors/me")
      .then((res) => setInfo(res.data.data || {}))
      .catch(() => toast.error("Failed to load vendor profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving profile...");
    try {
      await api.put("/vendors/me", info);
      toast.success("Profile updated successfully", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="h-64 rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="h-[420px] rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
          <div className="h-[420px] rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
        </div>
      </PageShell>
    );
  }

  const completionFields = [
    info.companyName,
    info.serviceType,
    info.contactPerson,
    info.email,
    info.phone,
    info.website,
    info.address,
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <PageShell>
      <PageHero
        badge="Vendor profile"
        title="Manage your company profile."
        description="Keep your company information, contact details, and business address aligned with the admin workspace so reviews and approvals stay accurate."
        stats={[
          { icon: Building2, label: "Company", value: info.companyName || "Not added" },
          { icon: User, label: "Primary contact", value: info.contactPerson || "Not added" },
          { icon: ShieldCheck, label: "Completion", value: `${completion}%` },
        ]}
        aside={
          <>
            <InfoPanel
              icon={ShieldCheck}
              title="Profile status"
              value="Vendor record active"
              note="Update the details below to keep onboarding, approvals, and communication routes accurate."
              toneClass="bg-emerald-50 text-emerald-600"
            />
            <InfoPanel
              icon={Mail}
              title="Registered email"
              value={info.email || "Not available"}
              note="This email is used for system notifications and vendor communication."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
        secondaryAction={<LinkButton to="/vendor/dashboard" variant="secondary">Back to dashboard</LinkButton>}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.78fr_1.22fr]">
        <SectionCard title="Profile Summary" description="A quick overview of the current vendor record.">
          <div className="space-y-3 p-4">
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-slate-900 text-3xl font-semibold text-white">
                {info.companyName?.charAt(0)?.toUpperCase() || "V"}
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                {info.companyName || "Vendor Company"}
              </h3>
              <p className="mt-2 text-[13px] text-slate-500">{info.serviceType || "Service type not added yet"}</p>
            </div>

            <SummaryTile label="Company name" value={info.companyName || "Not added"} note="This is shown across vendor workflows and reviews." />
            <SummaryTile label="Primary contact" value={info.contactPerson || "Not added"} note="Used for admin coordination and onboarding communication." />
            <SummaryTile label="Business address" value={info.address || "Not added"} note="Keep this current for verification and audit records." />
          </div>
        </SectionCard>

        <SectionCard title="Edit Details" description="Update the main company details used across the vendor portal.">
          <form onSubmit={handleSubmit} className="space-y-5 p-4 xl:p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Company name">
                <input
                  name="companyName"
                  value={info.companyName || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter company name"
                  required
                />
              </Field>
              <Field label="Service type">
                <input
                  name="serviceType"
                  value={info.serviceType || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter service type"
                  required
                />
              </Field>
              <Field label="Contact person">
                <input
                  name="contactPerson"
                  value={info.contactPerson || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter primary contact"
                  required
                />
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={info.email || ""}
                    disabled
                    className={`${inputClass} cursor-not-allowed bg-slate-50 pl-11 text-slate-500`}
                  />
                </div>
              </Field>
              <Field label="Phone number">
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="phone"
                    value={info.phone || ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </Field>
              <Field label="Website">
                <div className="relative">
                  <Globe size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="website"
                    value={info.website || ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                    placeholder="https://company.com"
                  />
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Business address">
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-4 top-4 text-slate-400" />
                    <textarea
                      name="address"
                      value={info.address || ""}
                      onChange={handleChange}
                      rows="4"
                      className={`${textareaClass} pl-11`}
                      placeholder="Enter business address"
                      required
                    />
                  </div>
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[12px] font-medium text-slate-600">
                <Activity size={16} className="text-indigo-500" />
                Admin dashboard color and typography applied here.
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={secondaryButtonClass} onClick={() => window.history.back()}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={primaryButtonClass}>
                  <Save size={16} />
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </form>
        </SectionCard>
      </div>
    </PageShell>
  );
}
