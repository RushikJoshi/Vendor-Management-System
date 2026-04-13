import { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Mail,
  ExternalLink,
  Layout,
  ShieldCheck,
  AlertCircle,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { normalizeRole } from "../../config/roles";

const ACTIONABLE_STATUSES = new Set(["pending", "needs_correction", "on_hold", "escalated", "conditionally_approved"]);
const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
  needs_correction: "bg-orange-50 text-orange-700 border-orange-100",
  on_hold: "bg-slate-100 text-slate-700 border-slate-200",
  escalated: "bg-indigo-50 text-indigo-700 border-indigo-100",
  conditionally_approved: "bg-teal-50 text-teal-700 border-teal-100",
};

const ACTION_OPTIONS = [
  { key: "send_back", label: "Send Back", className: "bg-orange-500 hover:bg-orange-400 text-white" },
  { key: "hold", label: "Hold", className: "bg-slate-600 hover:bg-slate-500 text-white" },
  { key: "escalate", label: "Escalate", className: "bg-indigo-600 hover:bg-indigo-500 text-white" },
  { key: "conditional_approve", label: "Conditional", className: "bg-teal-600 hover:bg-teal-500 text-white" },
  { key: "reject", label: "Reject", className: "bg-rose-600 hover:bg-rose-500 text-white" },
  { key: "approve", label: "Approve", className: "bg-emerald-600 hover:bg-emerald-500 text-white" },
];

const formatValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (value === 0) return "0";
  if (value === false) return "No";
  if (value === true) return "Yes";
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text || "-";
};

const formatStatus = (status) => String(status || "").replaceAll("_", " ");

const StatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${STATUS_STYLES[key] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${key === "approved" ? "bg-emerald-500" : key === "pending" ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`} />
      {formatStatus(key)}
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
  const [decisionReason, setDecisionReason] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [riskScore, setRiskScore] = useState(50);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/submission/${id}`);
      const next = res.data.data;
      setRow(next);
      setRiskLevel(String(next?.riskLevel || "medium").toLowerCase());
      setRiskScore(Number(next?.riskScore ?? 50));
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load submission.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of row?.data || []) {
      const key = item.nodePath || "General Information";
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [row]);

  const canDecide = normalizeRole(user?.role) === "admin" && ACTIONABLE_STATUSES.has(String(row?.status || "").toLowerCase());

  const takeAction = async (action) => {
    if (!canDecide || processing) return;
    const reasonRequired = action !== "approve";
    if (reasonRequired && !decisionReason.trim()) {
      toast.error("Reason is required for this action.");
      return;
    }

    setProcessing(true);
    setMockEmail(null);
    const toastId = toast.loading("Applying decision...");
    try {
      const payload = {
        submissionId: id,
        action,
        reason: decisionReason.trim(),
        riskLevel,
        riskScore: Number(riskScore),
      };
      const res = await api.post("/submission/approve", payload);
      toast.success(res.data?.message || "Decision recorded.", { id: toastId });
      setMockEmail(res.data.mockEmail || null);
      setDecisionReason("");
      await load();
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

  if (!row) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">DOSSIER NOT FOUND</h2>
        <p className="text-slate-500 mb-6">The requested submission ID is invalid or unavailable.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Return to Submissions
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 px-2 sm:px-4 transition-all">
      <div className="sticky top-0 z-40 mb-4">
        <div className="backdrop-blur-md bg-white border border-slate-200 p-3 sm:rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
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
          <button onClick={() => navigate(-1)} className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">
            Back
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mockEmail && (
          <div className="overflow-hidden">
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
          </div>
        )}
      </AnimatePresence>

      {row.rejectionReason ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span className="font-semibold">Decision Note:</span> {row.rejectionReason}
        </div>
      ) : null}

      {canDecide ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity size={15} className="text-indigo-600" />
              Advanced Decision Terminal
            </h3>
            <span className="text-xs text-slate-500">Reason is mandatory except Approve</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                disabled={processing}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Risk Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={riskScore}
                onChange={(e) => setRiskScore(e.target.value)}
                disabled={processing}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Reason</label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                disabled={processing}
                rows={2}
                placeholder="Why are you taking this decision?"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ACTION_OPTIONS.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => takeAction(action.key)}
                disabled={processing}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${action.className}`}
              >
                {processing ? "Processing..." : action.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4">
        {Object.entries(grouped).map(([path, items]) => (
          <section key={path} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
              <Layout size={13} className="text-indigo-600" />
              <h2 className="text-[12px] font-bold text-slate-800 tracking-wide">{path}</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
              {items.map((item, idx) => (
                <div key={`${path}-${item.fieldId}-${idx}`} className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none">{item.label}</p>
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
                    <p className="text-[14px] font-semibold text-slate-900 break-words leading-normal">{formatValue(item.value)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Decision History</h3>
        {Array.isArray(row.decisionHistory) && row.decisionHistory.length > 0 ? (
          <div className="space-y-2">
            {[...row.decisionHistory].reverse().map((entry, index) => (
              <div key={`${entry.createdAt}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <p className="font-semibold text-slate-800">
                  {formatStatus(entry.action)}: {formatStatus(entry.toStatus)}
                </p>
                <p className="text-slate-600">{entry.reason || "-"}</p>
                <p className="text-slate-500 mt-1">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "-"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No decision history available yet.</p>
        )}
      </section>

      <div className="mt-8 flex flex-col items-center gap-1 opacity-20 select-none pointer-events-none">
        <ShieldCheck size={16} />
        <p className="text-[8px] font-bold tracking-widest">SECURE SYSTEM</p>
      </div>
    </div>
  );
}
