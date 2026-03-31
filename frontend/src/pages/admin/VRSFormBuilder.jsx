import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const SECTION_PRESETS = ["General Info", "Company Details", "Bank Details", "Documents"];

const defaultField = (section = "General Info") => ({
  fieldId: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  label: "",
  type: "text",
  required: false,
  optionsText: "",
  section,
  validationPattern: "none",
  min: "",
  max: "",
  allowedFileTypes: "pdf,png,jpg,jpeg",
  maxFileSizeMB: 5,
});

export default function VRSFormBuilder() {
  const [forms, setForms] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [status, setStatus] = useState("draft");
  const [sections, setSections] = useState(SECTION_PRESETS);
  const [fields, setFields] = useState([defaultField()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingFormId, setEditingFormId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const canSave = useMemo(() => {
    if (!name.trim() || !sections.length || !fields.length) return false;
    return fields.every((f) => f.label.trim() && f.section);
  }, [name, sections, fields]);

  const loadForms = async () => {
    try {
      const res = await api.get("/forms/builder/all");
      setForms(res.data.data || []);
    } catch {
      setForms([]);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const resetBuilder = () => {
    setEditingFormId(null);
    setName("");
    setDescription("");
    setCategoryName("");
    setStatus("draft");
    setSections(SECTION_PRESETS);
    setFields([defaultField()]);
  };

  const addSection = () => {
    const s = window.prompt("Section name", "Compliance");
    if (!s || !s.trim()) return;
    if (sections.includes(s.trim())) return;
    setSections((prev) => [...prev, s.trim()]);
  };

  const removeSection = (section) => {
    if (fields.some((f) => f.section === section)) {
      setError(`Remove or reassign fields from "${section}" before deleting it.`);
      return;
    }
    setSections((prev) => prev.filter((s) => s !== section));
  };

  const addField = (section) => setFields((prev) => [...prev, defaultField(section || sections[0] || "General Info")]);
  const removeField = (idx) => setFields((prev) => prev.filter((_, i) => i !== idx));

  const updateField = (idx, key, value) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  };

  const onDragStart = (idx) => setDragIndex(idx);
  const onDropAt = (idx) => {
    if (dragIndex === null || dragIndex === idx) return;
    const next = [...fields];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setFields(next);
    setDragIndex(null);
  };

  const toApiPayload = () => ({
    name: name.trim(),
    description: description.trim(),
    categoryName: categoryName.trim() || undefined,
    status,
    sections: sections.map((s, index) => ({
      key: s.toLowerCase().replace(/\s+/g, "-"),
      title: s,
      order: index,
    })),
    fields: fields.map((f, index) => ({
      fieldId: f.fieldId,
      label: f.label.trim(),
      type: f.type,
      required: f.required,
      section: f.section,
      order: index,
      options: ["dropdown", "multiselect"].includes(f.type)
        ? f.optionsText
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [],
      validation: {
        pattern: f.validationPattern || "none",
        min: f.min === "" ? undefined : Number(f.min),
        max: f.max === "" ? undefined : Number(f.max),
        allowedFileTypes: f.type === "file"
          ? f.allowedFileTypes
              .split(",")
              .map((o) => o.trim().toLowerCase())
              .filter(Boolean)
          : [],
        maxFileSizeMB: Number(f.maxFileSizeMB || 5),
      },
    })),
  });

  const saveForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!canSave) {
      setError("Please fill form name, sections and all field labels.");
      return;
    }

    setSaving(true);
    try {
      if (editingFormId) {
        await api.put(`/forms/builder/${editingFormId}`, toApiPayload());
        setMessage("Form updated successfully.");
      } else {
        await api.post("/forms/builder", toApiPayload());
        setMessage("Form created successfully.");
      }
      await loadForms();
      resetBuilder();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save form.");
    } finally {
      setSaving(false);
    }
  };

  const editForm = async (formId) => {
    setError("");
    setMessage("");
    try {
      const res = await api.get(`/forms/builder/${formId}`);
      const form = res.data.data;
      setEditingFormId(form._id);
      setName(form.name || "");
      setDescription(form.description || "");
      setCategoryName(form.categoryName || "");
      setStatus(form.status || "draft");
      setSections((form.sections || []).sort((a, b) => a.order - b.order).map((s) => s.title));
      setFields(
        (form.fields || []).map((f) => ({
          fieldId: f.fieldId,
          label: f.label,
          type: f.type,
          required: !!f.required,
          optionsText: (f.options || []).join(", "),
          section: f.section || "General Info",
          validationPattern: f.validation?.pattern || "none",
          min: f.validation?.min ?? "",
          max: f.validation?.max ?? "",
          allowedFileTypes: (f.validation?.allowedFileTypes || []).join(",") || "pdf,png,jpg,jpeg",
          maxFileSizeMB: f.validation?.maxFileSizeMB || 5,
        }))
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Unable to load form for editing.");
    }
  };

  const changeFormStatus = async (formId, nextStatus) => {
    try {
      await api.post(`/forms/builder/${formId}/${nextStatus === "published" ? "publish" : "unpublish"}`);
      setMessage(`Form moved to ${nextStatus}.`);
      loadForms();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed.");
    }
  };

  const copyForm = async (formId) => {
    try {
      await api.post(`/forms/builder/${formId}/copy`);
      setMessage("Form copied.");
      loadForms();
    } catch {
      setError("Copy failed.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Enterprise Form Builder</h1>
        <p className="mt-1 text-sm text-slate-500">Build section-wise onboarding forms with validation and document rules.</p>
      </div>

      <form onSubmit={saveForm} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <input className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" placeholder="Form Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Category (optional)" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          <select className="rounded-xl border border-slate-300 px-4 py-3" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <textarea className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Sections</h2>
            <button type="button" onClick={addSection} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              Add Section
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <span key={section} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm">
                {section}
                <button type="button" onClick={() => removeSection(section)} className="text-rose-600">
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.fieldId}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropAt(idx)}
              className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Field Label" value={field.label} onChange={(e) => updateField(idx, "label", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2" value={field.type} onChange={(e) => updateField(idx, "type", e.target.value)}>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="multiselect">Multi-select</option>
                  <option value="date">Date</option>
                  <option value="file">File Upload</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2" value={field.section} onChange={(e) => updateField(idx, "section", e.target.value)}>
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2" value={field.validationPattern} onChange={(e) => updateField(idx, "validationPattern", e.target.value)}>
                  <option value="none">No Pattern</option>
                  <option value="pan">PAN Format</option>
                  <option value="gst">GST Format</option>
                </select>
              </div>
              <label className="md:col-span-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, "required", e.target.checked)} />
                Req
              </label>
              <button type="button" onClick={() => removeField(idx)} className="md:col-span-2 rounded-lg border border-rose-300 px-3 py-2 text-rose-600">
                Delete
              </button>

              {["dropdown", "multiselect"].includes(field.type) ? (
                <div className="md:col-span-12">
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Options (comma separated)" value={field.optionsText} onChange={(e) => updateField(idx, "optionsText", e.target.value)} />
                </div>
              ) : null}

              {field.type === "number" ? (
                <>
                  <div className="md:col-span-2">
                    <input type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Min" value={field.min} onChange={(e) => updateField(idx, "min", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <input type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Max" value={field.max} onChange={(e) => updateField(idx, "max", e.target.value)} />
                  </div>
                </>
              ) : null}

              {field.type === "file" ? (
                <>
                  <div className="md:col-span-4">
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Allowed types (pdf,png,jpg)" value={field.allowedFileTypes} onChange={(e) => updateField(idx, "allowedFileTypes", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <input type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Max MB" value={field.maxFileSizeMB} onChange={(e) => updateField(idx, "maxFileSizeMB", e.target.value)} />
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => addField()} className="rounded-xl border border-slate-300 px-4 py-2">
            Add Field
          </button>
          <button type="submit" disabled={saving || !canSave} className="rounded-xl bg-slate-900 px-5 py-2 text-white disabled:opacity-60">
            {saving ? "Saving..." : editingFormId ? "Update Form" : "Create Form"}
          </button>
          {editingFormId ? (
            <button type="button" onClick={resetBuilder} className="rounded-xl border border-slate-300 px-4 py-2">
              Cancel Edit
            </button>
          ) : null}
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Form Management</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Form</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Public Link</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f._id} className="border-t">
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3">{f.categoryName}</td>
                  <td className="px-4 py-3 capitalize">{f.status}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{window.location.origin}/form/{f._id}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => editForm(f._id)} className="rounded-lg border px-3 py-1.5 text-sm">Edit</button>
                      <button onClick={() => copyForm(f._id)} className="rounded-lg border px-3 py-1.5 text-sm">Copy</button>
                      <button
                        onClick={() => changeFormStatus(f._id, f.status === "published" ? "draft" : "published")}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                      >
                        {f.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <Link to={`/admin/vrs/form-preview/${f._id}`} className="rounded-lg border px-3 py-1.5 text-sm">
                        Preview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
