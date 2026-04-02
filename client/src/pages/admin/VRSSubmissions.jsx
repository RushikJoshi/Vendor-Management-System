import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function VRSSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [search, setSearch] = useState("");

  const loadSubmissions = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/submissions");
      setSubmissions(res.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) =>
      [s.formName, s.vendorName, s.vendorEmail, s.categoryName, s.status].some((v) =>
        (v || "").toString().toLowerCase().includes(q)
      )
    );
  }, [search, submissions]);

  const review = async (id, action) => {
    setMessage("");
    setCredentials(null);
    try {
      const body =
        action === "reject"
          ? { action, rejectionReason: window.prompt("Rejection reason:", "Incomplete documents") || "Rejected" }
          : { action };

      const res = await api.patch(`/submissions/${id}/review`, body);
      setMessage(res.data.message);
      if (action === "approve") {
        setCredentials(res.data.data.credentials);
      }
      loadSubmissions();
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Submission Management</h1>
        <p className="mt-1 text-sm text-slate-500">View full vendor onboarding submissions and take approval actions.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Search by form, vendor, category, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{message}</div> : null}
      {credentials ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Mock Email Credentials: Email <strong>{credentials.email}</strong>, Password{" "}
          <strong>{credentials.password || "Existing user (unchanged password)"}</strong>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Form</th>
              <th className="px-4 py-3 text-left">Vendor</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={7}>
                  Loading submissions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4" colSpan={7}>
                  No submissions found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">{item.formName}</td>
                  <td className="px-4 py-3">{item.vendorName || "-"}</td>
                  <td className="px-4 py-3">{item.vendorEmail || "-"}</td>
                  <td className="px-4 py-3">{item.categoryName}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/vrs/submissions/${item._id}`} className="rounded-lg border px-3 py-1.5 text-sm">
                        View Details
                      </Link>
                      <button
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                        onClick={() => review(item._id, "approve")}
                        disabled={item.status !== "pending"}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                        onClick={() => review(item._id, "reject")}
                        disabled={item.status !== "pending"}
                      >
                        Reject
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
