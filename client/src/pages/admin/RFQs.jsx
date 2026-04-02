import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock3, FileText, Plus, RefreshCcw, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import CreateRFQModal from "./CreateRFQModal";
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

const RFQList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const canCreateRFQ =
    String(user?.role || "").toLowerCase() === "admin" || hasPermission(user, "rfq_create");
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
              onClick={() => canCreateRFQ && setShowCreateModal(true)}
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
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusTone(normalizedStatus)}`}
                        >
                          {normalizedStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(rfq.quoteDeadline)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/rfqs/${rfq._id}/compare`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 transition hover:bg-indigo-600 hover:text-white shadow-sm shadow-indigo-100 active:scale-95"
                        >
                          Compare Bids <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <CreateRFQModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchRFQs}
        disabled={!canCreateRFQ}
      />
    </div>
  );
};

export default RFQList;
