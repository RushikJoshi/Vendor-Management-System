import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, FileText, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import api from "../../services/api";
import {
  EmptyState,
  PageShell,
  SectionCard,
  StatusBadge,
} from "../../components/vendor/VendorUI";

const getStatusTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "published" || normalized === "open") return "emerald";
  if (normalized === "closed") return "slate";
  return "amber";
};

const getDeadlineLabel = (date) => {
  if (!date) return "No deadline";
  const target = new Date(date);
  const diffDays = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Ends today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
};

export default function MyRFQs() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rfqs");
      setRfqs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load RFQs.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-44 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />)}
        </div>
      </div>
    );
  }

  const openCount = rfqs.filter((rfq) => {
    const status = String(rfq.status || "").toLowerCase();
    return status === "open" || status === "published";
  }).length;

  return (
    <div className="space-y-4 pb-10">
      {/* HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                  <FileText size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Bid Opportunities (RFQs)</h1>
                <p className="text-xs font-medium text-slate-500">Active requests for quotation invited to your account.</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Invitations</p>
                <p className="text-sm font-black text-indigo-600">{openCount} RFQs</p>
            </div>
            <button
                onClick={fetchRFQs}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
            </button>
          </div>
        </div>
      </section>

      {/* RFQ LIST */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Bidding Window</h2>
            <p className="text-[10px] font-medium text-slate-500 italic">Only RFQs relevant to your category are visible.</p>
        </div>

        {rfqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                 <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
                    <FileText size={24} />
                 </div>
                 <h3 className="text-base font-bold text-slate-900">No RFQs available</h3>
                 <p className="mt-1 text-xs text-slate-500">You haven't been invited to any active requests for quotation yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rfqs.map((rfq) => {
                const status = String(rfq.status || "").toLowerCase();
                const isClosed = status === "closed";
                const isExpired = new Date(rfq.quoteDeadline) < new Date();
                const deadlineLabel = getDeadlineLabel(rfq.quoteDeadline);

                return (
                  <article key={rfq._id} className="group rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                    #{String(rfq._id || "").slice(-8).toUpperCase()}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {rfq.title || "Untitled RFQ"}
                                </h3>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                                isClosed ? 'bg-slate-50 text-slate-500 border-slate-200' : 
                                isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {isClosed ? 'CLOSED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                            </div>
                        </div>
                        
                        <p className="mt-3 text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                            {rfq.description || "No detailed description provided for this request."}
                        </p>

                        <div className="mt-5 pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2.5">
                                <CalendarDays size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">Bidding Ends</p>
                                    <p className="mt-1 text-xs font-bold text-slate-700">
                                        {rfq.quoteDeadline ? new Date(rfq.quoteDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "No Date"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">Timer</p>
                                <p className={`mt-1 text-xs font-bold ${isExpired || isClosed ? 'text-slate-400' : 'text-rose-600'}`}>
                                    {deadlineLabel}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                {status.charAt(0)}
                             </div>
                             <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight capitalize">{status}</span>
                        </div>
                        
                        {!isClosed && !isExpired ? (
                            <button
                                onClick={() => navigate(`/vendor/submit-quotation/${rfq._id}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-black transition-all shadow-sm active:scale-95"
                            >
                                SUBMIT QUOTE
                                <ArrowRight size={14} />
                            </button>
                        ) : (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                Submission Ended
                            </span>
                        )}
                    </div>
                  </article>
                );
              })}
            </div>
        )}
      </section>
    </div>
  );
}

function StatMiniCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">{label}</p>
          <p className="mt-1.5 text-lg font-black text-slate-900 leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

