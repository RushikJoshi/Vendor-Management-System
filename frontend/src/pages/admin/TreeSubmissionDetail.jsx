import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
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

export default function TreeSubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mockEmail, setMockEmail] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/submission/${id}`);
      setRow(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load.");
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
      const k = item.nodePath || "General";
      if (!map[k]) map[k] = [];
      map[k].push(item);
    }
    return map;
  }, [row]);

  const takeAction = async (action) => {
    setMessage("");
    setMockEmail(null);
    try {
      const isApprove = action === "approved";
      const confirmed = window.confirm(
        isApprove
          ? "Approve this submission and send vendor credentials?"
          : "Reject this submission?"
      );
      if (!confirmed) return;

      const payload =
        action === "rejected"
          ? { submissionId: id, action, rejectionReason: window.prompt("Reason", "Incomplete documents") || "Rejected" }
          : { submissionId: id, action };
      const res = await api.post("/submission/approve", payload);
      setMessage(isApprove ? "Submission approved successfully. Credentials email has been sent." : "Submission rejected successfully.");
      setMockEmail(res.data.mockEmail || null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!row) return <div className="p-6 text-rose-600">{error || "Not found"}</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{row.formName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {row.vendorName || "-"} | {row.vendorEmail || "-"} | <span className="capitalize">{row.status}</span> |{" "}
              {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="rounded-lg border px-4 py-2">Back</button>
        </div>
      </div>

      {message ? <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      {mockEmail ? (
        <div className="rounded border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
          Mock Email: {mockEmail.to} | {mockEmail.credentials?.email} |{" "}
          {mockEmail.credentials?.password || mockEmail.credentials?.note}
        </div>
      ) : null}
      {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      {Object.entries(grouped).map(([path, items]) => (
        <section key={path} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">{path}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <div key={item.fieldId} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                {item.type === "file" ? (
                  item.fileUrl ? (
                    <a
                      href={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${item.fileUrl}`}
                      className="mt-2 inline-block text-sm text-indigo-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open {item.fileName}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">No file</p>
                  )
                ) : (
                  <p className="mt-2 text-sm text-slate-900">{formatValue(item.value)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {row.status === "pending" && normalizeRole(user?.role) === "admin" ? (
        <div className="flex gap-3">
          <button onClick={() => takeAction("approved")} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">
            Approve
          </button>
          <button onClick={() => takeAction("rejected")} className="rounded-lg bg-rose-600 px-4 py-2 text-white">
            Reject
          </button>
        </div>
      ) : null}
    </div>
  );
}
