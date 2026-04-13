import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ACTIONABLE_STATUSES = new Set(["pending", "needs_correction", "on_hold", "escalated", "conditionally_approved"]);

export default function TreeSubmissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/submission/all");
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowStatus = String(row.status || "").toLowerCase();
      const byStatus = statusFilter === "all" ? true : rowStatus === statusFilter;

      const createdAt = row.createdAt ? new Date(row.createdAt) : null;
      const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

      const byFromDate = from && createdAt ? createdAt >= from : true;
      const byToDate = to && createdAt ? createdAt <= to : true;

      return byStatus && byFromDate && byToDate;
    });
  }, [rows, statusFilter, fromDate, toDate]);

  const pendingCount = filteredRows.filter((r) => ACTIONABLE_STATUSES.has(String(r.status || "").toLowerCase())).length;

  const statusClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "approved") return "bg-emerald-100 text-emerald-800";
    if (s === "rejected") return "bg-rose-100 text-rose-800";
    if (s === "needs_correction") return "bg-orange-100 text-orange-800";
    if (s === "escalated") return "bg-indigo-100 text-indigo-800";
    if (s === "conditionally_approved") return "bg-teal-100 text-teal-800";
    if (s === "on_hold") return "bg-slate-200 text-slate-700";
    return "bg-amber-100 text-amber-800";
  };

  const takeAction = async (submissionId, action) => {
    try {
      const isApprove = action === "approve";
      const confirmed = window.confirm(
        isApprove
          ? "Approve this vendor submission and create vendor login credentials?"
          : "Reject this vendor submission?"
      );
      if (!confirmed) return;

      let rejectionReason = "";
      if (!isApprove) {
        rejectionReason = window.prompt("Rejection reason", "Incomplete details") || "Rejected by admin";
      }
      setActionLoadingId(`${submissionId}-${action}`);
      setMessage("");
      await api.post("/submission/approve", {
        submissionId,
        action,
        ...(action === "reject" ? { reason: rejectionReason } : {}),
      });
      setMessage(isApprove ? "Submission approved and vendor credentials sent successfully." : "Submission rejected.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-3 md:p-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Vendor Submissions</h1>
            <p className="mt-1 text-sm text-slate-500">Review submitted vendor forms and take action quickly.</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
        {message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="on_hold">On Hold</option>
            <option value="escalated">Escalated</option>
            <option value="conditionally_approved">Conditionally Approved</option>
          </select>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"
          />
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setFromDate("");
              setToDate("");
            }}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            {pendingCount > 0 ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
            {pendingCount} actionable submission{pendingCount > 1 ? "s" : ""}. Review now.
          </div>
        ) : null}
        <table className="w-full">
          <thead className="bg-slate-50 text-sm">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Vendor Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>Loading submissions...</td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td className="px-4 py-10" colSpan={5}>
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="rounded-full bg-slate-100 p-3">
                      <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7h16M6 4h12l1 3H5l1-3Zm0 3v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-700">{error || "No submissions found"}</p>
                    <p className="text-xs text-slate-500">Try adjusting status or date filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.vendorName || "-"}</td>
                  <td className="px-4 py-3 text-slate-700 break-all">{r.vendorEmail || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(r.status)}`}>
                      {String(r.status || "").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/submissions/${r._id}`}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => takeAction(r._id, "approve")}
                        disabled={!ACTIONABLE_STATUSES.has(String(r.status || "").toLowerCase()) || !!actionLoadingId}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoadingId === `${r._id}-approve` ? "Approving..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => takeAction(r._id, "reject")}
                        disabled={!ACTIONABLE_STATUSES.has(String(r.status || "").toLowerCase()) || !!actionLoadingId}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoadingId === `${r._id}-reject` ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
