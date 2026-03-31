import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function VRSFormPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/forms/builder/${id}/preview`);
        setForm(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load preview.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const grouped = useMemo(() => {
    const map = {};
    for (const f of form?.fields || []) {
      const s = f.section || "General Info";
      if (!map[s]) map[s] = [];
      map[s].push(f);
    }
    return map;
  }, [form]);

  if (loading) return <div className="p-6">Loading preview...</div>;
  if (!form) return <div className="p-6 text-rose-600">{error || "Form not found."}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Form Preview</h1>
            <p className="mt-1 text-sm text-slate-500">{form.name} | Status: {form.status}</p>
          </div>
          <button onClick={() => navigate(-1)} className="rounded-xl border border-slate-300 px-4 py-2">
            Back
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([section, fields]) => (
        <section key={section} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{section}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.fieldId} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">{field.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Type: {field.type} | Required: {field.required ? "Yes" : "No"}
                </p>
                {["dropdown", "multiselect"].includes(field.type) ? (
                  <p className="mt-2 text-xs text-slate-500">Options: {(field.options || []).join(", ") || "-"}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
