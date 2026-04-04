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

const getAddressText = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    return [address.city, address.state, address.pincode].filter(Boolean).join(", ");
  }
  return "";
};

export default function Profile() {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/vendors/me")
      .then((res) => {
        const nextInfo = res.data.data || {};
        setInfo({
          ...nextInfo,
          address: getAddressText(nextInfo.address),
        });
      })
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
      const payload = {
        ...info,
        address: info.address ? { city: info.address } : undefined,
      };
      await api.put("/vendors/me", payload);
      toast.success("Profile updated successfully", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div className="col-span-1 h-96 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
           <div className="col-span-2 h-[500px] rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
        </div>
      </div>
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
    <div className="space-y-4 pb-10">
      {/* HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                  <Building2 size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Manage Profile</h1>
                <p className="text-xs font-medium text-slate-500">Keep your company details and contact information aligned with the procurement office.</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Profile Completion</p>
                <p className="text-sm font-black text-emerald-600">{completion}%</p>
            </div>
            <div className="h-10 w-10 rounded-full border-[3px] border-emerald-100 flex items-center justify-center">
                <ShieldCheck size={16} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Summary */}
        <div className="md:col-span-4 space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-600/30 mb-4 border-4 border-white">
                        {info.companyName?.charAt(0)?.toUpperCase() || "V"}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {info.companyName || "Your Company Name"}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1 capitalize">{info.serviceType || "Primary Service Undefined"}</p>
                    <span className="mt-3 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] uppercase tracking-wider rounded-full">
                        Active Vendor
                    </span>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <Mail size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Email</p>
                            <p className="text-sm font-semibold text-slate-700">{info.email || "Not Provided"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                            <p className="text-sm font-semibold text-slate-700">{info.phone || "Not Provided"}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="flex items-start gap-3">
                    <Activity size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[13px] font-bold text-indigo-900">Why keep this updated?</h4>
                        <p className="text-[11px] font-medium text-indigo-700/80 mt-1.5 leading-relaxed">
                            Procurement relies on these details for dispatching purchase orders, generating contracts, and contacting your representatives during bidding cycles.
                        </p>
                    </div>
                </div>
            </section>
        </div>

        {/* RIGHT COLUMN: Organization Info (Read-Only) */}
        <div className="md:col-span-8">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
                <div className="border-b border-slate-100 bg-slate-50/50 p-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            Organization Information
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">LOCKED</span>
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Primary business data provided during registration (Read-Only).</p>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Company Name</label>
                            <input
                                value={info.companyName || ""}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Service / Category Type</label>
                            <input
                                value={info.serviceType || ""}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Primary Contact Person</label>
                            <input
                                value={info.contactPerson || ""}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Email Address</label>
                            <input
                                type="email"
                                value={info.email || ""}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Phone Number</label>
                            <input
                                value={info.phone || ""}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Corporate Website</label>
                            <input
                                value={info.website || ""}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Business Address</label>
                            <textarea
                                value={info.address || ""}
                                disabled
                                rows="3"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>

      </div>
    </div>
  );
}
