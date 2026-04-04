import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    ChevronLeft, Shield, Clock, User, Activity, ArrowRight,
    Terminal, Hash, Filter, Download, Info, Layout
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function VendorAuditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, lRes] = await Promise.all([
          api.get(`/vendors/${id}`),
          api.get(`/activity-logs`, {
            params: { 
              entityId: id,
              entityType: "Vendor",
              limit: 100,
              sort: "-createdAt"
            }
          })
        ]);
        setVendor(vRes.data.data);
        setLogs(lRes.data.data);
      } catch (err) {
        toast.error("Failed to load institutional audit data.");
        navigate(`/admin/vendors/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Ledger...</div>;

  return (
    <div className="space-y-4 pb-20 fade-in">
        {/* COMPACT HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
        >
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                    <ChevronLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                        <Activity className="text-indigo-600" size={18} />
                        Partner Audit History
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500">
                        <div className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                             Node: {vendor?.companyName}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                    <Download size={14} /> Export Report
                </button>
            </div>
        </motion.div>

        {/* AUDIT TIMELINE */}
        <div className="grid gap-4">
            <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm min-h-[60vh]"
            >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">Institutional Ledger History</h2>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Events Detected: {logs.length}</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <Activity size={48} strokeWidth={1} className="mb-4 opacity-30" />
                            <p className="text-[11px] font-black uppercase tracking-[0.2em]">No mutation history found.</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className="p-6 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-6 flex-1">
                                        <div className={`mt-1 h-12 w-12 rounded-xl flex items-center justify-center border font-black text-xs shrink-0 ${getActionStyle(log.action)}`}>
                                            {log.action?.slice(0, 2)}
                                        </div>
                                        
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getActionStyle(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-[12px] font-bold text-slate-900 leading-none">
                                                        Partner state mutation on global node
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-5 text-[11px] font-bold text-slate-400">
                                                    <div className="flex items-center gap-1.5"><User size={12} className="text-slate-300" /> {log.performedBy?.name || "System"}</div>
                                                    <div className="flex items-center gap-1.5"><Clock size={12} className="text-slate-300" /> {format(new Date(log.createdAt), "MMM dd, yyyy • HH:mm:ss")}</div>
                                                    {log.ipAddress && <div className="flex items-center gap-1.5"><Terminal size={12} className="text-slate-300" /> {log.ipAddress}</div>}
                                                </div>
                                            </div>

                                            {/* Details sync placeholder */}
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                                                <p className="text-[12px] font-medium text-slate-600 leading-relaxed">
                                                    Institutional data parameters were successfully synchronized with the master repository. 
                                                    Administrative verification complete.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.section>
        </div>
    </div>
  );
}

function getActionStyle(action) {
    if (action?.includes("CREATE")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (action?.includes("UPDATE")) return "bg-indigo-50 text-indigo-600 border-indigo-100";
    if (action?.includes("BLACKLIST")) return "bg-rose-50 text-rose-600 border-rose-100";
    if (action?.includes("DELETE")) return "bg-red-50 text-red-600 border-red-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
}
