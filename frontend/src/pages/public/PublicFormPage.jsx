import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PublicFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${apiBase}/forms/${id}/public`);
        setForm(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load form.");
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [id]);

  const groupedSections = useMemo(() => {
    const sections = form?.sections?.length
      ? [...form.sections].sort((a, b) => a.order - b.order).map((s) => s.title)
      : [...new Set((form?.fields || []).map((f) => f.section || "General Info"))];

    const map = sections.map((section) => ({
      section,
      fields: (form?.fields || []).filter((f) => (f.section || "General Info") === section),
    }));
    return map.filter((m) => m.fields.length);
  }, [form]);

  const validateSection = (stepIndex) => {
    const step = groupedSections[stepIndex];
    if (!step) return null;
    for (const field of step.fields) {
      if (!field.required) continue;
      if (field.type === "file" && !files[field.fieldId]) return `${field.label} is required.`;
      if (field.type !== "file") {
        const v = values[field.fieldId];
        if (v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === "")) {
          return `${field.label} is required.`;
        }
      }
    }
    return null;
  };

  const nextStep = () => {
    const msg = validateSection(currentStep);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, groupedSections.length - 1));
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    const msg = validateSection(currentStep);
    if (msg) {
      setSubmitting(false);
      setError(msg);
      return;
    }

    try {
      const payload = {
        responses: (form?.fields || []).map((field) => ({
          fieldId: field.fieldId,
          value: values[field.fieldId] ?? (field.type === "multiselect" ? [] : ""),
        })),
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      Object.entries(files).forEach(([fieldId, file]) => {
        if (file) formData.append(`file_${fieldId}`, file);
      });

      const res = await axios.post(`${apiBase}/forms/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage(`Submitted successfully. Submission ID: ${res.data.data.submissionId}`);
      setValues({});
      setFiles({});
      setCurrentStep(0);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading form...</div>;
  if (!form) return <div className="p-10 text-center">{error || "Form not found."}</div>;

  const step = groupedSections[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">{form.name}</h1>
        <p className="mt-2 text-slate-600">{form.description}</p>
        <p className="mt-1 text-sm text-slate-500">Category: {form.categoryName}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {groupedSections.map((s, idx) => {
            const active = idx === currentStep;
            return (
              <button
                key={s.section}
                type="button"
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"
                }`}
                onClick={() => setCurrentStep(idx)}
              >
                <div className="text-xs">Step {idx + 1}</div>
                <div className="mt-1 font-medium">{s.section}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-6 rounded-2xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">{step?.section}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(step?.fields || []).map((field) => (
              <div key={field.fieldId} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  {field.label} {field.required ? <span className="text-rose-600">*</span> : null}
                </label>

                {field.type === "dropdown" ? (
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={values[field.fieldId] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.fieldId]: e.target.value }))}
                  >
                    <option value="">Select</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "multiselect" ? (
                  <select
                    multiple
                    className="h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={values[field.fieldId] || []}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.fieldId]: Array.from(e.target.selectedOptions).map((o) => o.value),
                      }))
                    }
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "file" ? (
                  <input
                    type="file"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    onChange={(e) => setFiles((prev) => ({ ...prev, [field.fieldId]: e.target.files?.[0] || null }))}
                  />
                ) : (
                  <input
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "email"
                        ? "email"
                        : field.type === "date"
                        ? "date"
                        : "text"
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder={field.placeholder || ""}
                    value={values[field.fieldId] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.fieldId]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="rounded-xl border border-slate-300 px-5 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            {currentStep < groupedSections.length - 1 ? (
              <button type="button" onClick={nextStep} className="rounded-xl bg-slate-900 px-5 py-2 text-white">
                Next
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-6 py-2 text-white disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        {successMessage ? <p className="mt-4 text-sm text-emerald-600">{successMessage}</p> : null}
      </div>
    </div>
  );
}
