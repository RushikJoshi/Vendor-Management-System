import Modal from "../../components/Modal";
import { Building2, User, Mail, Phone, MapPin, FileText, ExternalLink, Briefcase, ShieldCheck } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function VendorDetailsModal({ vendor, onClose }) {
  const [remarks, setRemarks] = useState("");
  const [blacklisting, setBlacklisting] = useState(false);

  if (!vendor) return null;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-5 rounded-[8px] bg-gray-50 border border-gray-100 group hover:border-corp-dark/20 transition-all">
      <div className="p-2.5 rounded-[6px] bg-white border border-gray-100 text-corp-dark group-hover:bg-corp-dark group-hover:text-white transition-all shadow-sm">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
        <p className="text-sm font-bold text-gray-800 tracking-tight">{value || "Not provided"}</p>
      </div>
    </div>
  );

  const handleBlacklist = async () => {
    if (!remarks) return toast.error("Blacklist reason is mandatory for audit log.");
    if (!window.confirm("Are you absolutely sure? This action will permanently blacklist this vendor.")) return;

    setBlacklisting(true);
    const toastId = toast.loading("Executing blacklist protocol...");
    try {
      await api.post(`/vendors/${vendor._id}/blacklist`, { reason: "Policy Violation", remarks });
      toast.success("Vendor blacklisted", { id: toastId });
      onClose(); // Optional: or pass a refresh function via props
    } catch (err) {
      toast.error(err.response?.data?.message || "Execution failed", { id: toastId });
    } finally {
      setBlacklisting(false);
    }
  };

  return (
    <Modal open={!!vendor} onClose={onClose} title="Strategic Partner Profile" size="4xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex items-center gap-6 p-6 bg-gray-50 border border-gray-100 rounded-[10px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-corp-dark/5 rounded-full blur-3xl"></div>
          <div className="w-16 h-16 rounded-[8px] bg-corp-dark flex items-center justify-center text-white text-3xl font-extrabold relative z-10 shadow-sm">
            {vendor.companyName?.charAt(0)}
          </div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-bold text-corp-secondary uppercase tracking-widest bg-white px-2 py-0.5 border border-gray-200 rounded">
                {vendor.category?.name || vendor.serviceType || "General Contractor"}
              </span>
              <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase border ${vendor.lifecycleStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  vendor.lifecycleStatus === 'blacklisted' ? 'bg-gray-900 text-white border-gray-700' :
                    vendor.lifecycleStatus === 'suspended' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                {vendor.lifecycleStatus || "active"}
              </span>
              <StatusBadge status={vendor.status} />
            </div>
          </div>
        </div>

        {/* Risk & Performance Scorecard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 border border-gray-100 rounded-[8px]">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Overall Risk Level</p>
            <p className={`text-xl font-black uppercase ${vendor.riskLevel === 'High' ? 'text-rose-600' : vendor.riskLevel === 'Medium' ? 'text-amber-500' : 'text-[#0F7B4D]'}`}>{vendor.riskLevel || 'Low'}</p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Performance (Rating)</p>
            <p className="text-xl font-black text-gray-900">{vendor.averageRating || vendor.performanceScore || '0'}<span className="text-xs text-gray-400">/5</span></p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Total Contracts</p>
            <p className="text-xl font-black text-gray-900">{vendor.contractsCount || '0'}</p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Application ID</p>
            <p className="text-xs font-black text-gray-500 mt-2 tracking-tighter truncate max-w-[80px] mx-auto" title={vendor.createdFromApplicationId?._id || vendor.createdFromApplicationId || 'N/A'}>
              {vendor.createdFromApplicationId?._id || vendor.createdFromApplicationId ? "🔗 Linked" : "Manual"}
            </p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={User} label="Primary Liasion" value={vendor.contactPerson || vendor.contactDetails?.name} />
          <DetailItem icon={Mail} label="Official Communication" value={vendor.email} />
          <DetailItem icon={Phone} label="Operational Hotline" value={vendor.phone || vendor.contactDetails?.mobile} />
          <DetailItem icon={Briefcase} label="Core Operational Segment" value={vendor.serviceType || vendor.companyDetails?.natureOfBusiness} />
        </div>

        <div className="w-full">
          <DetailItem icon={MapPin} label="Registered Site Address" value={vendor.address} />
        </div>

        {/* Assets Section */}
        {vendor.documentUrl && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={14} />
              Authenticated Compliance Documentation
            </h4>
            <div className="flex items-center justify-between p-4 bg-corp-dark rounded-[8px] text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/10 text-white rounded-[6px]">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5 tracking-tight uppercase">Audit_Dossier_Baseline.pdf</p>
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Verification Signature: Verified</p>
                </div>
              </div>
              <a
                href={vendor.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white text-corp-dark text-[10px] font-bold uppercase tracking-widest rounded-[4px] hover:bg-gray-100 transition-all shadow-sm"
              >
                Access File
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between border-t border-gray-100 mt-6 pt-6">
          <div className="w-1/2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Risk Management (Blacklist)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mandatory reason for blacklisting..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="flex-1 border border-gray-200 rounded-[6px] px-3 py-2 text-xs font-semibold focus:border-corp-dark outline-none placeholder-gray-300"
              />
              <button
                onClick={handleBlacklist}
                disabled={blacklisting || vendor.lifecycleStatus === 'blacklisted'}
                className="px-4 py-2 bg-white border border-rose-600 text-rose-600 font-bold uppercase tracking-wider text-[10px] rounded-[6px] hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                {vendor.lifecycleStatus === 'blacklisted' ? "Already Blacklisted" : "Execute Blacklist"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">
            <ShieldCheck size={12} className="text-[#0B5D3B]" /> Registry node authenticated by authorized ERP gateway
          </div>
        </div>
      </div>
    </Modal>
  );
}