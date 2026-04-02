import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

const flattenNodes = (nodes, prefix = "", acc = []) => {
  nodes.forEach((node, idx) => {
    const current = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    acc.push({ ...node, number: current });
    flattenNodes(node.children || [], current, acc);
  });
  return acc;
};

function TreeNodeRenderer({ node, number, values, files, setValues, setFiles, collapsed, setCollapsed }) {
  const key = node.id;
  const defaultCollapsed = number.includes(".");
  const isCollapsed = collapsed[key] ?? defaultCollapsed;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm md:p-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <button
          type="button"
          onClick={() => setCollapsed((p) => ({ ...p, [key]: !isCollapsed }))}
          className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          aria-label={isCollapsed ? "Expand section" : "Collapse section"}
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${isCollapsed ? "" : "rotate-90"}`}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">{number}</span>
        <h3 className="text-[15px] font-semibold text-slate-900 md:text-base">{node.title}</h3>
      </div>

      {!isCollapsed ? (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {(node.fields || []).map((field) => (
              <FieldRenderer key={field.id} field={field} values={values} files={files} setValues={setValues} setFiles={setFiles} />
            ))}
          </div>
          <div className="space-y-3 border-l-2 border-slate-100 pl-2.5 md:pl-3">
            {(node.children || []).map((child, idx) => (
              <TreeNodeRenderer
                key={child.id}
                node={child}
                number={`${number}.${idx + 1}`}
                values={values}
                files={files}
                setValues={setValues}
                setFiles={setFiles}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldRenderer({ field, values, files, setValues, setFiles }) {
  const setValue = (v) => setValues((p) => ({ ...p, [field.id]: v }));
  const current = values[field.id] ?? (field.type === "checkbox" ? [] : "");
  const isWideField = field.type === "checkbox" || field.type === "radio" || field.type === "file";
  const wideSpanClass = isWideField ? "md:col-span-2 xl:col-span-3" : "";
  const pattern = field.validation?.pattern;
  const hintText = pattern === "gst" ? "Format: 22AAAAA0000A1Z5" : pattern === "ifsc" ? "Format: HDFC0001234" : "";
  const inputBaseClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

  if (field.type === "dropdown" || field.type === "radio") {
    if (field.type === "dropdown") {
      return (
        <div className={`space-y-1 ${wideSpanClass}`}>
          <label className="text-xs font-semibold tracking-wide text-slate-700">
            {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
          </label>
          <select className={inputBaseClass} value={current} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div className={`space-y-1 ${wideSpanClass}`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
              <input type="radio" name={field.id} checked={current === opt} onChange={() => setValue(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={`space-y-1 ${wideSpanClass}`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={(current || []).includes(opt)}
                onChange={(e) => {
                  const next = new Set(current || []);
                  if (e.target.checked) next.add(opt);
                  else next.delete(opt);
                  setValue(Array.from(next));
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className={`space-y-1 ${wideSpanClass}`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <input
          type="file"
          className={`${inputBaseClass} file:mr-3 file:rounded-lg file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-stone-800`}
          onChange={(e) => setFiles((p) => ({ ...p, [field.id]: e.target.files?.[0] || null }))}
        />
        {files[field.id]?.name ? <p className="text-xs text-slate-500">Selected: {files[field.id].name}</p> : null}
      </div>
    );
  }

  const handleInputChange = (e) => {
    let val = e.target.value;
    const labelLo = field.label?.toLowerCase() || "";

    // 1. MOBILE / CONTACT / PHONE: Only allow numbers, max 15
    if (labelLo.includes("mobile") || labelLo.includes("phone") || labelLo.includes("alternate")) {
      val = val.replace(/\D/g, "").slice(0, 15);
    }
    // 2. GST: Alphanumeric, max 15, uppercase
    else if (labelLo.includes("gst")) {
      val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
    }
    // 3. PAN: Alphanumeric, max 10, uppercase
    else if (labelLo.includes("pan")) {
      val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
    }
    // 4. CIN: Alphanumeric, max 21, uppercase
    else if (labelLo.includes("cin")) {
      val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 21);
    }
    // 5. MSME / UDYAM: Allow Alphanumeric + Hyphens, max 19, uppercase
    else if (labelLo.includes("msme") || labelLo.includes("udyam")) {
      val = val.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase().slice(0, 19);
    }

    setValue(val);
  };

  return (
    <div className={`space-y-1 ${wideSpanClass}`}>
      <label className="text-xs font-semibold tracking-wide text-slate-700">
        {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
      </label>
      <input
        type={field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
        className={inputBaseClass}
        placeholder={field.placeholder || ""}
        value={current}
        onChange={handleInputChange}
      />
      {hintText ? <p className="text-[11px] text-slate-500">{hintText}</p> : null}
    </div>
  );
}

export default function TreeFormRenderer() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const draftStorageKey = useMemo(() => `tree_form_draft_${id}`, [id]);
  const previousAutofillValuesRef = useRef({});
  const requestedAutofillValuesRef = useRef({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${apiBase}/form/${id}`);
        setForm(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load form");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!form) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const savedValues = parsed?.values;
      if (!savedValues || typeof savedValues !== "object") return;
      setValues(savedValues);
      setSuccess("Saved draft restored.");
    } catch {}
  }, [form, draftStorageKey]);

  const topSections = useMemo(() => form?.structure || [], [form]);

  const autoFillFromApi = async (field, value) => {
    const pattern = field.validation?.pattern || "none";
    const normalizedValue = String(value || "").trim().toUpperCase();
    if (!normalizedValue) return;

    if (pattern === "gst" && GST_REGEX.test(normalizedValue)) {
      try {
        const res = await axios.post(`${apiBase}/form/autofill/gst`, { gstNumber: normalizedValue });
        const company = res.data?.data?.companyName || "";
        if (company) {
          const allNodes = flattenNodes(form?.structure || []);
          const candidate = allNodes
            .flatMap((n) => n.fields || [])
            .find((f) => /company name/i.test(f.label) || /company_name/i.test(f.id));
          if (candidate) {
            setValues((p) => {
              if (p[candidate.id] === company) return p;
              return { ...p, [candidate.id]: company };
            });
          }
        }
      } catch {}
    }
    if (pattern === "ifsc" && IFSC_REGEX.test(normalizedValue)) {
      try {
        const res = await axios.get(`https://ifsc.razorpay.com/${normalizedValue}`);
        const bank = res.data?.BANK || "";
        const branch = res.data?.BRANCH || "";
        const allNodes = flattenNodes(form?.structure || []);
        const bankField = allNodes.flatMap((n) => n.fields || []).find((f) => /bank name/i.test(f.label));
        const branchField = allNodes.flatMap((n) => n.fields || []).find((f) => /branch/i.test(f.label));
        setValues((p) => ({ 
          ...p, 
          ...(bankField && bank ? { [bankField.id]: bank } : {}),
          ...(branchField && branch ? { [branchField.id]: branch } : {})
        }));
      } catch {}
    }
    
    // PINCODE AUTOFILL
    if (label.includes("pincode") && PINCODE_REGEX.test(normalizedValue)) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${normalizedValue}`);
        const data = res.data?.[0];
        if (data?.Status === "Success") {
            const first = data.PostOffice?.[0];
            const city = first?.District || first?.Block || "";
            const state = first?.State || "";
            
            const allNodes = flattenNodes(form?.structure || []);
            const cityField = allNodes.flatMap((n) => n.fields || []).find((f) => /city/i.test(f.label));
            const stateField = allNodes.flatMap((n) => n.fields || []).find((f) => /state/i.test(f.label));
            
            setValues((p) => ({
                ...p,
                ...(cityField && city ? { [cityField.id]: city } : {}),
                ...(stateField && state ? { [stateField.id]: state } : {})
            }));
        }
      } catch {}
    }

    // CITY TO PINCODE AUTOFILL
    if (label.includes("city") && normalizedValue.length > 3) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/postoffice/${normalizedValue}`);
        const data = res.data?.[0];
        if (data?.Status === "Success") {
            const first = data.PostOffice?.[0];
            const pincode = first?.Pincode || "";
            const state = first?.State || "";
            
            const allNodes = flattenNodes(form?.structure || []);
            const pinField = allNodes.flatMap((n) => n.fields || []).find((f) => /pincode/i.test(f.label));
            const stateField = allNodes.flatMap((n) => n.fields || []).find((f) => /state/i.test(f.label));
            
            setValues((p) => ({
                ...p,
                ...(pinField && pincode && !p[pinField.id] ? { [pinField.id]: pincode } : {}),
                ...(stateField && state && !p[stateField.id] ? { [stateField.id]: state } : {})
            }));
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (!form) return;
    const allNodes = flattenNodes(form.structure || []);
    allNodes.forEach((node) => {
      (node.fields || []).forEach((field) => {
        const pattern = field.validation?.pattern;
        const label = field.label?.toLowerCase() || "";
        
        if (pattern !== "gst" && pattern !== "ifsc" && !label.includes("pincode") && !label.includes("city")) return;

        const current = String(values[field.id] || "").trim().toUpperCase();
        const previous = String(previousAutofillValuesRef.current[field.id] || "").trim().toUpperCase();

        if (!current || current === previous) return;

        let isValid = false;
        if (pattern === "gst") isValid = GST_REGEX.test(current);
        else if (pattern === "ifsc") isValid = IFSC_REGEX.test(current);
        else if (label.includes("pincode")) isValid = PINCODE_REGEX.test(current);
        else if (label.includes("city")) isValid = current.length > 3;

        if (!isValid) return;

        if (requestedAutofillValuesRef.current[field.id] === current) return;
        requestedAutofillValuesRef.current[field.id] = current;
        autoFillFromApi(field, current);
      });
    });

    const snapshot = {};
    allNodes.forEach((node) => {
      (node.fields || []).forEach((field) => {
        if (field.validation?.pattern === "gst" || field.validation?.pattern === "ifsc") {
          snapshot[field.id] = values[field.id];
        }
      });
    });
    previousAutofillValuesRef.current = snapshot;
  }, [values, form]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("formId", id);
      formData.append("payload", JSON.stringify({ values }));
      Object.entries(files).forEach(([fieldId, file]) => {
        if (file) formData.append(`file_${fieldId}`, file);
      });

      const res = await axios.post(`${apiBase}/form/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.removeItem(draftStorageKey);
      setSuccess(`Submitted successfully. ID: ${res.data.data._id}`);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs?.join(" | ") || err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          formId: id,
          updatedAt: new Date().toISOString(),
          values,
        })
      );
      setError("");
      setSuccess("Draft saved.");
    } catch {
      setError("Could not save draft.");
    }
  };

  if (loading) return <div className="p-6">Loading form...</div>;
  if (!form) return <div className="p-6 text-rose-600">{error || "Form not found"}</div>;

  const currentSection = topSections[step];
  const progress = topSections.length ? Math.round(((step + 1) / topSections.length) * 100) : 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-sky-50/40 p-2 md:p-4">
      <div className="mx-auto w-full max-w-[1680px] space-y-4 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl shadow-slate-200/60 backdrop-blur md:p-4">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-sm backdrop-blur">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{form.name}</h1>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 md:text-sm">Complete all required details to submit your vendor registration.</p>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Step {step + 1} of {topSections.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topSections.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setStep(idx)}
              className={`rounded-xl border px-3 py-2 text-left transition ${
                idx === step
                  ? "border-sky-500 bg-sky-600 text-white shadow-md shadow-sky-200"
                  : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60"
              }`}
            >
              <div className={`text-xs ${idx === step ? "text-sky-100" : "text-slate-500"}`}>Section {idx + 1}</div>
              <div className="text-sm font-semibold leading-snug">{s.title}</div>
            </button>
          ))}
        </div>

        {currentSection ? (
          <TreeNodeRenderer
            node={currentSection}
            number={`${step + 1}`}
            values={values}
            files={files}
            setValues={setValues}
            setFiles={setFiles}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        ) : null}

        <div className="sticky bottom-2 z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <button
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Save Draft
            </button>
            {step < topSections.length - 1 ? (
              <button
                onClick={() => setStep((v) => Math.min(topSections.length - 1, v + 1))}
                className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="rounded-xl bg-sky-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-800 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>

        {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">{success}</p> : null}
      </div>
    </div>
  );
}
