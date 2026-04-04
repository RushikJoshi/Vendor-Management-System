import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FileText, Calendar, Clock3, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { PageShell } from "../../components/vendor/VendorUI";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Not set";

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [contract, setContract] = useState(location.state?.contract || null);
  const [loading, setLoading] = useState(!contract);

  useEffect(() => {
    if (!contract) {
      // Fetch all to find the specific contract
      const fetchContract = async () => {
        try {
          const res = await api.get("/slm/contracts", { params: { limit: 50, status: "Active" } });
          const list = Array.isArray(res.data?.data) ? res.data.data : [];
          const found = list.find((c) => String(c._id) === String(id));
          if (found) {
            setContract(found);
          } else {
            toast.error("Contract not found");
            navigate("/vendor/contracts");
          }
        } catch (err) {
          toast.error("Failed to load contract");
          navigate("/vendor/contracts");
        } finally {
          setLoading(false);
        }
      };
      fetchContract();
    }
  }, [id, contract, navigate]);

  if (loading) {
    return (
      <PageShell>
        <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-200" />
      </PageShell>
    );
  }

  if (!contract) return null;

  return (
    <PageShell className="pb-10">
      <div className="mb-4">
        <button
          onClick={() => navigate("/vendor/contracts")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Agreements
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tight">
            <FileText size={16} className="text-indigo-600" /> Agreement Registry Detail
          </h3>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Summary Card */}
          <div className="p-5 md:p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest leading-none mb-2">Subject Line</p>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{contract.contractTitle}</h4>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 bg-white text-indigo-600 text-[10px] font-bold border border-indigo-200 rounded uppercase">
                {contract.contractType || "MSA"}
              </span>
              <span className="text-xs font-semibold text-slate-500">#{contract.contractNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Total Commitment</p>
              <p className="text-2xl font-black text-slate-900">
                <span className="text-sm font-bold text-slate-400 mr-1.5">{contract.currency || "INR"}</span>
                {Number(contract.contractValue || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Payment Terms</p>
              <p className="text-sm font-bold text-slate-700">{contract.paymentTerms || "Net 30 Days"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            <div className="space-y-1.5 flex items-start gap-3">
              <Calendar size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Effective Date</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(contract.startDate)}</p>
              </div>
            </div>
            <div className="space-y-1.5 flex items-start gap-3">
              <Clock3 size={18} className="text-rose-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Expiry Date</p>
                <p className="text-sm font-bold text-rose-600">{formatDate(contract.endDate)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Institutional Owner</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                {String(contract.internalOwner || "Admin").charAt(0)}
              </div>
              <p className="text-sm font-bold text-slate-700">{contract.internalOwner || "Procurement Manager"}</p>
            </div>
          </div>

          {contract.description && (
            <div className="space-y-2 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Operational Notes</p>
              <p className="text-sm leading-relaxed text-slate-600 italic bg-slate-50 p-4 rounded-xl">
                "{contract.description}"
              </p>
            </div>
          )}

          <div className="pt-6 flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
              This agreement is verified by the central audit system. For discrepancies, please contact your internal procurement head.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
