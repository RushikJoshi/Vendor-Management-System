import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    ChevronLeft, Building2, User, Mail, Phone, MapPin, FileText, 
    ShieldCheck, Activity, Target, Landmark, AlertTriangle, Info,
    Globe, Award, Zap, ArrowRight, Shield, Download, Settings,
    Terminal, Hash
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

export default function VendorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [blacklisting, setBlacklisting] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await api.get(`/vendors/${id}`);
        setVendor(res.data.data);
      } catch (err) {
        toast.error("Failed to load partner profile.");
        navigate("/admin/vendors");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id, navigate]);

  const fetchVendor = async () => {
    try {
      const res = await api.get(`/vendors/${id}`);
      setVendor(res.data.data);
    } catch (err) {
      toast.error("Failed to load partner profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async () => {
    if (!remarks) return toast.error("Please provide a reason for blacklisting.");
    if (!window.confirm("Are you sure you want to blacklist this vendor?")) return;

    setBlacklisting(true);
    const toastId = toast.loading("Processing restriction...");
    try {
      await api.post(`/vendors/${vendor._id}/blacklist`, { reason: "Policy Violation", remarks });
      toast.success("Vendor blacklisted", { id: toastId });
      const res = await api.get(`/vendors/${id}`);
      setVendor(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed", { id: toastId });
    } finally {
      setBlacklisting(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Initializing...</div>;
  if (!vendor) return null;

  return (
    <div className="space-y-6 pb-20 fade-in">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 px-6 border-l-4 border-l-indigo-600">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/admin/vendors")} 
                        className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all border border-slate-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vendor Partner Overview</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                             Reference Node: {vendor._id?.slice(-8).toUpperCase()}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate(`/admin/vendors/${id}/audit`)}
                        className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-wider"
                    >
                        <FileText size={14} /> Audit Trail
                    </button>
                    <button 
                        onClick={() => navigate(`/admin/vendors/${id}/edit`)}
                        className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-[11px] font-bold text-white transition-all hover:bg-slate-800 uppercase tracking-wider shadow-lg shadow-slate-100"
                    >
                        Manage Entity
                    </button>
                </div>
            </div>
        </section>

        {/* ── PROFILE BODY ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: PRIMARY INFO (8 COLLS) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Identity & Categorization Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start gap-6 border-b border-slate-100 pb-6 mb-6">
                        <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 text-3xl font-black">
                            {vendor.companyName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-slate-900">{vendor.companyName}</h1>
                                <StatusBadge status={vendor.lifecycleStatus || "active"} />
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><Target size={12} className="text-indigo-500" /> {vendor.category?.name || "General Partner"}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="flex items-center gap-1.5"><Globe size={12} className="text-blue-500" /> Global Ecosystem</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <DataBox label="Contact Person" value={vendor.contactPerson || vendor.name} icon={User} />
                        <DataBox label="Email Address" value={vendor.email} icon={Mail} />
                        <DataBox label="GST/Tax Identity" value={vendor.gstNumber || "Verified"} icon={ShieldCheck} />
                        <DataBox label="Contact Hotline" value={vendor.phone || "N/A"} icon={Phone} />
                        <div className="md:col-span-2 pt-4 border-t border-slate-100">
                             <DataBox label="Registered Address" value={vendor.address?.city ? `${vendor.address.city}, ${vendor.address.state} - ${vendor.address.pincode}` : vendor.address} icon={MapPin} />
                        </div>
                    </div>
                </div>

                {/* Exception Handling Card */}
                <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden border-l-4 border-l-rose-500">
                    <div className="px-6 py-4 bg-rose-50/20 border-b border-rose-100 flex items-center gap-3">
                        <AlertTriangle size={16} className="text-rose-600" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-700">Administrative Governance</h4>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blacklist Reason</label>
                                <input
                                    type="text"
                                    placeholder="Enter reason for operational restriction..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-rose-400 transition-all placeholder:text-slate-300"
                                />
                            </div>
                            <button
                                onClick={handleBlacklist}
                                disabled={blacklisting || vendor.lifecycleStatus === 'blacklisted'}
                                className="px-6 py-2.5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50"
                            >
                                {vendor.lifecycleStatus === 'blacklisted' ? "Blacklisted" : "Enforce Restricted Status"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: PERFORMANCE SIDEBAR (4 COLLS) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Metrics Matrix */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Activity size={14} /> Performance Scorecard
                    </h4>
                    
                    <div className="space-y-1">
                        <MetricRow label="Risk Analysis" value={vendor.riskLevel || 'Low Risk'} color="text-emerald-600" />
                        <MetricRow label="Service Rating" value={vendor.rating || '4.8'} sub="/ 5.0" color="text-slate-900" />
                        <MetricRow label="Operational RFQs" value="05" color="text-indigo-600" />
                        <MetricRow label="Uptime Integrity" value="99.99%" color="text-blue-600" />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button className="flex w-full items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                            Export Partner Dossier <Download size={14} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Strategic Context */}
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 overflow-hidden relative group">
                    <div className="absolute -top-12 -right-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Shield size={180} />
                    </div>
                    <div className="relative z-10">
                        <div className="mb-4 flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                            <Zap size={20} className="text-white" />
                        </div>
                        <h4 className="text-[16px] font-bold mb-2">Governance Vetted</h4>
                        <p className="text-[12px] font-medium opacity-80 leading-relaxed mb-6">
                            This entity is currently meeting all quality and compliance standards for target procurement operations.
                        </p>
                        <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-600 py-3 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-white/90">
                            View Full Audit Report <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}

function DataBox({ label, value, icon: Icon }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</p>
            <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3">
                <Icon size={14} className="text-slate-300" />
                <span className="text-[13px] font-bold text-slate-700 truncate">{value || 'Syncing...'}</span>
            </div>
        </div>
    );
}

function MetricRow({ label, value, color, sub }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
            <span className="text-[12px] font-bold text-slate-500">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={`text-[14px] font-black ${color}`}>{value}</span>
                {sub && <span className="text-[9px] font-bold text-slate-300">{sub}</span>}
            </div>
        </div>
    );
}
