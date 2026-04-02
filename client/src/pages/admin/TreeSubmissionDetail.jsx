import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  ExternalLink, 
  Layout,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  MessageSquare
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { normalizeRole } from "../../config/roles";

const formatValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (value === 0) return "0";
  if (value === false) return "No";
  if (value === true) return "Yes";
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text || "-";
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${styles[status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'approved' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
      {status}
    </span>
  );
};

export default function TreeSubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mockEmail, setMockEmail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/submission/${id}`);
      setRow(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load submission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of row?.data || []) {
      const k = item.nodePath || "General Information";
      if (!map[k]) map[k] = [];
      map[k].push(item);
    }
    return map;
  }, [row]);

  const takeAction = async (action) => {
    setProcessing(true);
    setMockEmail(null);
    const toastId = toast.loading(action === "approved" ? "Authorizing submission..." : "Processing rejection...");
    try {
      const isApprove = action === "approved";
      
      let rejectionReason = "";
      if (!isApprove) {
        rejectionReason = window.prompt("Reason for rejection:", "Incomplete documents or mismatched information");
        if (!rejectionReason) {
            setProcessing(false);
            toast.dismiss(toastId);
            return;
        }
      }

      const payload = action === "rejected"
          ? { submissionId: id, action, rejectionReason }
          : { submissionId: id, action };
          
      const res = await api.post("/submission/approve", payload);
      
      toast.success(isApprove ? "Submission Approved Successfully" : "Submission Rejected", { id: toastId });
      setMockEmail(res.data.mockEmail || null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Deciphering Submission Data...</p>
      </div>
    );
  }

  if (!row) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">DOSSIER NOT FOUND</h2>
        <p className="text-slate-500 mb-6">The requested submission synchronization ID is invalid or has been purged.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">
            <ArrowLeft size={18} /> Return to Submissions
        </button>
    </div>
  );

  return (
    <div className="w-full pb-10 px-2 sm:px-4 transition-all">
      
      {/* HEADER: Compact & Simplified */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 mb-4"
      >
        <div className="backdrop-blur-md bg-white border border-slate-200 p-3 sm:rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 mb-1">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <StatusBadge status={row.status} />
                </div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                    <Layout className="text-indigo-600" size={18} />
                    {row.formName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500">
                    <div className="flex items-center gap-1 text-[12px] font-medium">
                        <User size={12} className="text-slate-400" />
                        {row.vendorName || "Unknown Vendor"}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] font-medium">
                        <Mail size={12} className="text-slate-400" />
                        {row.vendorEmail || "no-email@vms.erp"}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(row.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(-1)}
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                    Back
                </button>
            </div>
        </div>
      </motion.div>

      {/* FEEDBACK MESSAGES */}
      <AnimatePresence>
        {mockEmail && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 flex items-start gap-3">
               <Mail size={16} className="text-sky-600 mt-0.5 shrink-0" />
               <div className="text-[12px]">
                  <p className="font-bold text-sky-900">Credentials Transmitted</p>
                  <p className="font-medium text-sky-700 mt-0.5">
                     Account: <span className="font-bold">{mockEmail.credentials?.email}</span> | 
                     Token: <span className="font-mono bg-white px-1 ml-1 border rounded">{mockEmail.credentials?.password || mockEmail.credentials?.note}</span>
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT SECTIONS: Compact Grid */}
      <div className="grid gap-4">
        {Object.entries(grouped).map(([path, items], index) => (
          <motion.section 
            key={path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
             <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                <Layout size={13} className="text-indigo-600" />
                <h2 className="text-[12px] font-bold text-slate-800 tracking-wide">{path}</h2>
             </div>
             
             <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                {items.map((item) => (
                  <div key={item.fieldId} className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none">
                        {item.label}
                    </p>
                    
                    {item.type === "file" ? (
                      <div className="mt-1">
                        {item.fileUrl ? (
                          <a
                            href={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${item.fileUrl}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={14} className="text-indigo-600" />
                            {item.fileName || "View Document"}
                            <ExternalLink size={11} className="opacity-40" />
                          </a>
                        ) : (
                          <span className="text-[13px] font-medium text-slate-300 italic">No document</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[14px] font-semibold text-slate-900 break-words leading-normal">
                        {formatValue(item.value)}
                      </p>
                    )}
                  </div>
                ))}
             </div>
          </motion.section>
        ))}
      </div>

      {/* FLOAT ACTION BAR: Compact */}
      {row.status === "pending" && normalizeRole(user?.role) === "admin" && (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xl">
                <div className="flex-1 pl-3 hidden sm:block">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Decision Terminal</p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => takeAction("rejected")}
                        disabled={processing}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-rose-400 rounded-xl text-xs font-bold transition-all"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => takeAction("approved")}
                        disabled={processing}
                        className="flex-1 sm:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </motion.div>
      )}

      {/* COMPACT FOOTER */}
      <div className="mt-8 flex flex-col items-center gap-1 opacity-20 select-none pointer-events-none">
          <ShieldCheck size={16} />
          <p className="text-[8px] font-bold tracking-widest">SECURE SYSTEM</p>
      </div>

    </div>
  );
}
