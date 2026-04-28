import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertCircle, Clock3, FileText, Plus, RefreshCcw, TrendingUp, ArrowRight, 
  Send, Trash2, XCircle, CheckCircle, Edit3
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { hasPermission } from "../../config/permissions";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDaysUntil = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / DAY_IN_MS);
};

const getStatusTone = (status) => {
  const normalized = String(status || "draft").toLowerCase();
  if (normalized === "published") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (normalized === "approved") return "bg-sky-50 text-sky-700 border-sky-100";
  if (normalized === "pending_approval") return "bg-amber-50 text-amber-700 border-amber-100";
  if (normalized === "rejected") return "bg-rose-50 text-rose-700 border-rose-100";
  if (normalized === "closed") return "bg-rose-50 text-rose-700 border-rose-100";
  if (normalized === "cancelled") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const getVendorLabel = (rfq) => {
  const selectionType = rfq?.vendorSelection?.type;
  const targetedCount = rfq?.vendorSelection?.targetedVendors?.length || 0;
  if (selectionType === "targeted") return `${targetedCount} vendor${targetedCount === 1 ? "" : "s"}`;
  return "All vendors";
};

const requiresApproval = (rfq) =>
  Boolean(rfq?.approvals?.manager?.required || rfq?.approvals?.finance?.required);

const getPendingApprovalStage = (rfq) => {
  if (rfq?.approvals?.manager?.required && rfq?.approvals?.manager?.status === "pending") {
    return "manager";
  }
  if (rfq?.approvals?.finance?.required && rfq?.approvals?.finance?.status === "pending") {
    return "finance";
  }
  return null;
};

const getApprovalSummary = (rfq) => {
  const stage = getPendingApprovalStage(rfq);
  if (stage === "manager") return "Awaiting Manager Approval";
  if (stage === "finance") return "Awaiting Finance Approval";
  if (String(rfq?.status || "").toLowerCase() === "approved") return "Approved for Publish";
  if (String(rfq?.status || "").toLowerCase() === "rejected") return rfq?.rejectionReason || "RFQ Rejected";
  return "No approval required";
};

const RFQList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const canCreateRFQ =
    String(user?.role || "").toLowerCase() === "admin" || hasPermission(user, "rfq_create");
  const canApproveRFQ =
    String(user?.role || "").toLowerCase() === "admin" || hasPermission(user, "rfq_approve");
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchRFQs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/rfqs");
      setRfqs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError("Failed to load RFQs.");
      toast.error("Unable to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();

    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail || "");
    };

    window.addEventListener("GLOBAL_SEARCH", handleGlobalSearch);
    return () => window.removeEventListener("GLOBAL_SEARCH", handleGlobalSearch);
  }, []);

  const handleApprovalReview = async (rfqId, action) => {
    const remarks =
      action === "reject"
        ? window.prompt("Reject reason likhiye")?.trim()
        : window.prompt("Optional remarks likhiye (chahe to blank chhod dijiye)")?.trim() || "";

    if (action === "reject" && !remarks) {
      toast.error("Reject karne ke liye reason zaroori hai");
      return;
    }

    try {
      await api.post(`/rfqs/${rfqId}/review`, { action, remarks });
      toast.success(action === "approve" ? "RFQ approval recorded" : "RFQ rejected");
      fetchRFQs();
    } catch (err) {
      toast.error(err.response?.data?.message || "RFQ review failed");
    }
  };

  const totalRfqs = rfqs.length;
  const activeRfqs = rfqs.filter((rfq) => String(rfq.status || "").toLowerCase() === "published").length;
  const closingSoon = rfqs.filter((rfq) => {
    const daysRemaining = getDaysUntil(rfq.quoteDeadline);
    return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
  }).length;

  const stats = [
    { key: "total", label: "Total RFQs", value: totalRfqs, icon: FileText },
    { key: "active", label: "Active RFQs", value: activeRfqs, icon: FileText },
    { key: "closing", label: "Closing Soon", value: closingSoon, icon: Clock3 },
  ].filter((item) => item.value > 0);

  const filteredRfqs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rfqs
      .filter((rfq) => {
        if (!query) return true;
        const id = String(rfq._id || "").toLowerCase();
        const title = String(rfq.title || "").toLowerCase();
        const status = String(rfq.status || "").toLowerCase();
        return id.includes(query) || title.includes(query) || status.includes(query);
      })
      .sort((a, b) => {
        const aTime = a.quoteDeadline ? new Date(a.quoteDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.quoteDeadline ? new Date(b.quoteDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [rfqs, searchTerm]);

  return (
    <div className="space-y-5 pb-10 fade-in">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">RFQ Management</h1>
            <p className="mt-1 text-sm text-slate-500">Track all RFQs in one focused table view.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchRFQs}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => canCreateRFQ && navigate("/admin/rfqs/create")}
              disabled={!canCreateRFQ}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              Create RFQ
            </button>
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <Icon size={16} className="text-slate-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            );
          })}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">RFQ ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Vendors</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Closing Date</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading &&
                [1, 2, 3, 4].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-52 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-8 w-20 rounded bg-slate-100" /></td>
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={32} className="text-rose-400" />
                      <p className="mt-3 text-sm font-semibold text-slate-900">{error}</p>
                      <button
                        type="button"
                        onClick={fetchRFQs}
                        className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && filteredRfqs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                    No RFQs found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredRfqs.map((rfq) => {
                  const id = String(rfq._id || "").slice(-8).toUpperCase() || "-";
                  const normalizedStatus = String(rfq.status || "draft").toLowerCase();

                  return (
                    <tr key={rfq._id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-800">#{id}</td>
                      <td className="px-4 py-4 text-sm text-slate-800">
                        <div className="max-w-[300px] truncate font-medium" title={rfq.title || "Untitled RFQ"}>
                          {rfq.title || "Untitled RFQ"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{getVendorLabel(rfq)}</td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusTone(normalizedStatus)}`}
                          >
                            {normalizedStatus}
                          </span>
                          {requiresApproval(rfq) && (
                            <p className="max-w-[180px] text-[10px] font-semibold text-slate-500">
                              {getApprovalSummary(rfq)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(rfq.quoteDeadline)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {normalizedStatus === "draft" && (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const nextStatus = requiresApproval(rfq) ? "pending_approval" : "published";
                                    await api.patch(`/rfqs/${rfq._id}/status`, { status: nextStatus });
                                    toast.success(
                                      nextStatus === "published"
                                        ? "RFQ published successfully"
                                        : "RFQ sent for approval"
                                    );
                                    fetchRFQs();
                                  } catch (err) {
                                    toast.error(err.response?.data?.message || "Transmission failed");
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                                title={requiresApproval(rfq) ? "Send for approval" : "Publish to Market"}
                              >
                                <Send size={12} /> {requiresApproval(rfq) ? "Request Approval" : "Publish"}
                              </button>
                               <button
                                type="button"
                                onClick={async () => {
                                  if(!window.confirm("Abort this draft protocol?")) return;
                                  try {
                                    await api.delete(`/rfqs/${rfq._id}`);
                                    toast.success("Draft Purged");
                                    fetchRFQs();
                                  } catch (err) {
                                    toast.error("Cleanup failed");
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}

                          {normalizedStatus === "pending_approval" && canApproveRFQ && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprovalReview(rfq._id, "approve")}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-sky-700 transition hover:bg-sky-600 hover:text-white"
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprovalReview(rfq._id, "reject")}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-600 hover:text-white"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}

                          {normalizedStatus === "approved" && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await api.patch(`/rfqs/${rfq._id}/status`, { status: "published" });
                                  toast.success("Approved RFQ published");
                                  fetchRFQs();
                                } catch (err) {
                                  toast.error(err.response?.data?.message || "Publish failed");
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                            >
                              <Send size={12} /> Publish
                            </button>
                          )}

                          {normalizedStatus === "published" && (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/rfqs/${rfq._id}/compare`)}
                                className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 transition hover:bg-indigo-600 hover:text-white shadow-sm shadow-indigo-100 active:scale-95"
                              >
                                Compare Bids <ArrowRight size={14} />
                              </button>
                               <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await api.patch(`/rfqs/${rfq._id}/status`, { status: 'closed' });
                                    toast.success("Cycle Terminated");
                                    fetchRFQs();
                                  } catch (err) {
                                    toast.error("Closure failed");
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Close Sourcing Event"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}

                          {(normalizedStatus === "closed" || normalizedStatus === "cancelled") && (
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/rfqs/${rfq._id}/compare`)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-200 shadow-sm active:scale-95"
                              >
                                View Results <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>


    </div>
  );
};

export default RFQList;
