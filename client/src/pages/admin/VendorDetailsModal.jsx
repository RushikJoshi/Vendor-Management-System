import Modal from "../../components/Modal";
import { 
    Building2, User, Mail, Phone, MapPin, FileText, 
    ExternalLink, Briefcase, ShieldCheck, Activity, 
    ChevronRight, Target, Landmark, AlertTriangle
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function VendorDetailsModal({ vendor, onClose }) {
  const [remarks, setRemarks] = useState("");
  const [blacklisting, setBlacklisting] = useState(false);

  if (!vendor) return null;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
      <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
        <p className="text-[13px] font-bold text-slate-700 truncate">{value || "NOT_PROVIDED"}</p>
      </div>
    </div>
  );

  const handleBlacklist = async () => {
    if (!remarks) return toast.error("Audit remark is mandatory for blacklisting.");
    if (!window.confirm("CONFIRM BLACKLIST PROTOCOL: This action is permanent.")) return;

    setBlacklisting(true);
    const toastId = toast.loading("Executing blacklist protocol...");
    try {
      await api.post(`/vendors/${vendor._id}/blacklist`, { reason: "Policy Violation", remarks });
      toast.success("Registry Node Blacklisted", { id: toastId });
      onClose(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Execution Error", { id: toastId });
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
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700">
                    <Building2 size={18} />
                </div>
                <div>
                    <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest leading-none">Strategic_Partner_Dossier</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic leading-none">Registry Node: {vendor._id?.slice(-12).toUpperCase()}</p>
                </div>
            </div>
        } 
        size="4xl"
    >
      <div className="space-y-6 p-2">
        {/* Dossier Header */}
        <div className="flex items-center gap-6 p-6 bg-slate-900 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black relative z-10 border border-white/20 shadow-2xl">
            {vendor.companyName?.charAt(0)}
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="text-2xl font-black text-white tracking-tight">{vendor.companyName}</h3>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                <Target size={12} /> {vendor.category?.name || "Tier_One_Partner"}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${vendor.lifecycleStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  vendor.lifecycleStatus === 'blacklisted' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                {vendor.lifecycleStatus || "active"}
              </span>
              <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400 shadow-lg shadow-indigo-500/20">
                {vendor.status}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Scorecard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 border border-slate-100 rounded-2xl shadow-sm">
          <ScorecardItem label="Risk Index" value={vendor.riskLevel || 'LOW'} color={vendor.riskLevel === 'High' ? 'text-rose-600' : 'text-emerald-600'} />
          <ScorecardItem label="Performance" value={`${vendor.rating || '4.0'}`} sub="/ 5.0" color="text-slate-900" />
          <ScorecardItem label="Contracts" value={vendor.contractsCount || '02'} color="text-indigo-600" />
          <ScorecardItem label="Registry Link" value="LOCKED" color="text-slate-400" isStatus />
        </div>

        {/* Identity Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={User} label="Primary Admin Liaison" value={vendor.contactPerson || vendor.name} />
          <DetailItem icon={Mail} label="Secure Communication" value={vendor.email} />
          <DetailItem icon={Phone} label="Operational Hotline" value={vendor.phone || "+91 000-000-0000"} />
          <DetailItem icon={ShieldCheck} label="Tax Identification" value={vendor.gstNumber || "VERIFIED_NODE"} />
        </div>

        <div className="w-full">
          <DetailItem icon={MapPin} label="Strategic Site Address" value={vendor.address?.city ? `${vendor.address.city}, ${vendor.address.state} - ${vendor.address.pincode}` : vendor.address} />
        </div>

        {/* Compliance Terminal */}
        <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <Landmark size={14} className="not-italic" />
                    Administrative_Authorization_Terminal
                </h4>
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <ShieldCheck size={12} /> Registry node encrypted
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-end justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="w-full md:w-2/3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Risk Mitigation Protocol (Blacklist)</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Mandatory audit remark for blacklisting..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all placeholder:text-slate-300"
                        />
                        <button
                            onClick={handleBlacklist}
                            disabled={blacklisting || vendor.lifecycleStatus === 'blacklisted'}
                            className="px-8 py-3 bg-white border-2 border-rose-600 text-rose-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-100 disabled:opacity-50 active:scale-95"
                        >
                            {vendor.lifecycleStatus === 'blacklisted' ? "Node_Blacklisted" : "Execute_Protocol"}
                        </button>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 px-4 py-2 bg-indigo-50 rounded-lg transition-colors border border-indigo-100 self-center md:self-end">
                    Advanced Audit <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
}

function ScorecardItem({ label, value, color, sub, isStatus }) {
    return (
        <div className="text-center group border-r border-slate-100 last:border-0 flex flex-col items-center justify-center">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-3 group-hover:text-indigo-400 transition-colors">{label}</p>
            <div className="flex items-baseline gap-1">
                <p className={`text-xl font-black uppercase tracking-tight ${color}`}>{value}</p>
                {sub && <span className="text-[10px] font-bold text-slate-300">{sub}</span>}
            </div>
            {isStatus && (
                <div className="mt-2 flex h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                </div>
            )}
        </div>
    );
}