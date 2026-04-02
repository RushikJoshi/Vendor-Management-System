import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function VRSSubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState(null);

  const loadDetails = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get(`/submissions/${id}`);
      setSubmission(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load submission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const grouped = useMemo(() => {
    const map = {};
    for (const r of submission?.responses || []) {
      const section = r.section || "General Info";
      if (!map[section]) map[section] = [];
      map[section].push(r);
    }
    return map;
  }, [submission]);

  const review = async (action) => {
    setMessage("");
    setCredentials(null);
    try {
      const body =
        action === "reject"
          ? { action, rejectionReason: window.prompt("Rejection reason:", "Documents invalid") || "Rejected" }
          : { action };
      const res = await api.patch(`/submissions/${id}/review`, body);
      setMessage(res.data.message);
      if (action === "approve") setCredentials(res.data.data.credentials);
      loadDetails();
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed.");
    }
  };

  if (loading) return <div className="p-6">Loading details...</div>;
  if (!submission) return <div className="p-6 text-rose-600">{message || "Submission not found."}</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Submission Details</h1>
            <p className="mt-1 text-sm text-slate-500">
              {submission.formName} | {submission.vendorEmail || "No email"} |{" "}
              <span className="capitalize">{submission.status}</span>
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="rounded-xl border border-slate-300 px-4 py-2">
            Back
          </button>
        </div>
      </div>

      {message ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{message}</div> : null}
      {credentials ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Vendor Credentials: {credentials.email} / {credentials.password || "existing-user-password-unchanged"}
        </div>
      ) : null}

      {Object.entries(grouped).map(([section, items]) => (
        <section key={section} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{section}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div key={item.fieldId} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                {item.type === "file" ? (
                  item.fileUrl ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`.replace("/api", "") + item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-indigo-600 underline"
                    >
                      Open File ({item.fileName})
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No file</p>
                  )
                ) : Array.isArray(item.value) ? (
                  <p className="mt-2 text-sm text-slate-900">{item.value.join(", ") || "-"}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-900">{item.value || "-"}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {submission.status === "pending" ? (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => review("approve")} className="rounded-xl bg-emerald-600 px-5 py-2 text-white">
            Approve Vendor
          </button>
          <button onClick={() => review("reject")} className="rounded-xl bg-rose-600 px-5 py-2 text-white">
            Reject Vendor
          </button>
        </div>
      ) : null}
    </div>
  );
}
