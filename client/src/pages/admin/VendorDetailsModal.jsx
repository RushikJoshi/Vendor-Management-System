import Modal from "../../components/Modal";
import { 
    Building2, User, Mail, Phone, MapPin, FileText, 
    ExternalLink, Briefcase, ShieldCheck, Activity, 
    ChevronRight, Target, Landmark, AlertTriangle, Info,
    Hash, Globe, Award, Zap, MoreHorizontal, ArrowRight,
    Search, Download, Trash2, Shield
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function VendorDetailsModal({ vendor, onClose }) {
  const [remarks, setRemarks] = useState("");
  const [blacklisting, setBlacklisting] = useState(false);

  if (!vendor) return null;

  const handleBlacklist = async () => {
    if (!remarks) return toast.error("Please provide a reason for blacklisting.");
    if (!window.confirm("Are you sure you want to blacklist this vendor?")) return;

    setBlacklisting(true);
    const toastId = toast.loading("Processing...");
    try {
      await api.post(`/vendors/${vendor._id}/blacklist`, { reason: "Policy Violation", remarks });
      toast.success("Vendor blacklisted", { id: toastId });
      onClose(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed", { id: toastId });
    } finally {
      setBlacklisting(false);
    }
  };

  return (
    <Modal 
        open={!!vendor} 
        onClose={onClose} 
        title={
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
                    <Building2 size={20} />
                </div>
                <div>
                    <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Vendor Profile & Performance</h2>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">UID: {vendor._id?.slice(-8).toUpperCase()}</p>
                </div>
            </div>
        } 
        size="5xl"
    >
      <div className="p-0 font-sans">
        {/* Clean Profile Header */}
        <div className="relative border-b border-slate-200 bg-white p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                    <div className="relative shrink-0">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border-2 border-slate-100 text-indigo-600 text-3xl font-black shadow-sm">
                            {vendor.companyName?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border-2 border-white shadow-sm">
                            <ShieldCheck size={16} strokeWidth={3} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{vendor.companyName}</h3>
                            <StatusBadge status={vendor.lifecycleStatus || "active"} />
                        </div>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                <Target size={14} className="text-slate-400" /> 
                                {vendor.category?.name || "Member Vendor"}
                            </span>
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                <Globe size={14} className="text-slate-400" /> 
                                Global Partner
                            </span>
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                <Shield size={14} className="text-slate-400" /> 
                                Verified Credentials
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-[12px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95">
                        <FileText size={16} className="text-slate-400" /> View History
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[12px] font-bold text-white transition-all hover:bg-slate-800 active:scale-95">
                        <Settings size={16} /> Manage Partner
                    </button>
                </div>
            </div>
        </div>

        <div className="p-8 bg-slate-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Identification Matrix */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
                            <Info size={16} className="text-indigo-600" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Partner Identification & Info</h4>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DataField label="Contact Person" value={vendor.contactPerson || vendor.name} icon={User} />
                            <DataField label="Email Address" value={vendor.email} icon={Mail} />
                            <DataField label="GST Registration" value={vendor.gstNumber || "Unverified"} icon={Hash} />
                            <DataField label="Phone Connection" value={vendor.phone || "N/A"} icon={Phone} />
                            <div className="md:col-span-2 pt-2 border-t border-slate-50">
                                <DataField label="Registered Workspace Address" value={vendor.address?.city ? `${vendor.address.city}, ${vendor.address.state} - ${vendor.address.pincode}` : vendor.address} icon={MapPin} />
                            </div>
                        </div>
                    </div>

                    {/* Restrictive Actions Section */}
                    <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden border-l-4 border-l-rose-500">
                        <div className="px-6 py-4 bg-rose-50/30 border-b border-rose-100 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-rose-600" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-700">Governance & Exceptions</h4>
                        </div>
                        <div className="p-6 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-rose-700 uppercase tracking-widest ml-1">Blacklist Justification</label>
                                <input
                                    type="text"
                                    placeholder="State reason for operational restriction..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleBlacklist}
                                disabled={blacklisting || vendor.lifecycleStatus === 'blacklisted'}
                                className="px-6 py-3.5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 active:scale-95"
                            >
                                {vendor.lifecycleStatus === 'blacklisted' ? "Action Terminated" : "Enforce Blacklist"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Scorecard */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h4 className="mb-6 text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Activity size={14} /> Operational Health
                        </h4>
                        <div className="space-y-2">
                            <ScoreRow label="Risk Profile" value={vendor.riskLevel || 'Low'} color="text-emerald-600" />
                            <ScoreRow label="Performance" value={vendor.rating || '4.8'} sub="/ 5" color="text-slate-900" />
                            <ScoreRow label="Active Tasks" value="02" color="text-indigo-600" />
                            <ScoreRow label="On-Time Delivery" value="99%" color="text-blue-600" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                             <button className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5 text-[11px] font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all">
                                Download Audit Dossier <Download size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Shield size={120} />
                        </div>
                        <h4 className="text-[15px] font-bold mb-2">Compliance Status</h4>
                        <p className="text-[12px] opacity-80 leading-relaxed font-medium mb-6">
                            This vendor is currently meeting all operational compliance standards.
                        </p>
                        <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl border border-white/30 transition-all">
                            Verify Details <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Modal>
  );
}

function DataField({ label, value, icon: Icon }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</p>
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm">
                <div className="text-slate-400">
                    <Icon size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800 truncate">{value || 'Not Registered'}</span>
            </div>
        </div>
    );
}

function ScoreRow({ label, value, color, sub }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <span className="text-[12px] font-bold text-slate-500">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={`text-[14px] font-black ${color}`}>{value}</span>
                {sub && <span className="text-[10px] font-bold text-slate-300">{sub}</span>}
            </div>
        </div>
    );
}

const Settings = ({ size, className }) => (
    <MoreHorizontal size={size} className={className} />
);