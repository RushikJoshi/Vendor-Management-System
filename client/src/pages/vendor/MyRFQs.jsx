import React, { useEffect, useState } from "react";
import { 
    FileText, RefreshCcw, TrendingUp, Clock, 
    ArrowRight, CheckCircle2, AlertCircle, Calendar, 
    ShieldCheck, Building2, User, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";

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
      toast.error("Failed to load assigned sourcing events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const getStatusStyle = (status) => {
    const s = String(status || "draft").toLowerCase();
    if (s === 'published' || s === 'open') return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === 'closed') return "bg-slate-100 text-slate-500 border-slate-200";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="space-y-6 pb-20 fade-in">
      {/* ── HEADER SECTION ────────────────────────────────────────── */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-3 block italic">Strategic_Sourcing_Matrix</span>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Sourcing Opportunities</h1>
                <p className="mt-2 text-slate-500 text-[15px] font-medium max-w-xl">Review and respond to active Requests for Quotations (RFQs) specifically targeted to your vendor node capability.</p>
            </div>
            <button
                type="button"
                onClick={fetchRFQs}
                className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition hover:bg-indigo-600 active:scale-95 group"
            >
                <RefreshCcw size={16} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                Sync Opportunities
            </button>
        </div>
      </section>

      {/* ── OPPORTUNITY GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-white border border-slate-100 rounded-3xl animate-pulse" />)
        ) : rfqs.length > 0 ? (
            rfqs.map((rfq) => (
                <div key={rfq._id} className="group bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col">
                    <div className="p-6 pb-4 border-b border-slate-50 relative z-10 flex-1">
                        <div className="flex items-center justify-between mb-5">
                            <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(rfq.status)}`}>
                                {rfq.status || "Targeted"}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={12} /> {rfq.quoteDeadline ? `${Math.ceil((new Date(rfq.quoteDeadline) - new Date()) / (1000 * 60 * 60 * 24))} Days Left` : "No Deadline"}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{rfq.title}</h3>
                        <p className="text-[13px] font-medium text-slate-400 line-clamp-3 leading-relaxed mb-6 italic">
                            {rfq.description || "Core operational requirement requiring formal quotation submission."}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Response_Target</p>
                                <p className="text-[12px] font-bold text-slate-800 tracking-tight leading-none truncate">{new Date(rfq.quoteDeadline).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Registry_ID</p>
                                <p className="text-[12px] font-bold text-slate-800 tracking-tight leading-none truncate">#{rfq._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 group-hover:bg-white transition-colors border-t border-slate-50 relative z-10">
                        {rfq.status === 'closed' ? (
                             <div className="w-full h-14 bg-slate-100 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                                Procurement Closed
                            </div>
                        ) : (
                            <button 
                                onClick={() => navigate('/vendor/submit-quotation', { state: { rfqId: rfq._id, title: rfq.title } })}
                                className="w-full h-14 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                Respond to RFQ <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                <ShieldCheck size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Zero Target Events</h3>
                <p className="mt-2 text-[12px] font-bold uppercase italic">Awaiting sourcing participation requests</p>
            </div>
        )}
      </div>
    </div>
  );
}
