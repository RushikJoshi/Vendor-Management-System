import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Copy, ExternalLink, GripVertical, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const cleanTitle = (t) => String(t || "").replace(/^\d+(\.\d+)*\s*/, "").trim();

const makeSection = (title = "New Section") => ({
  id: `section_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  title,
  subsections: [],
});

const makeSubsection = (title = "New Subsection") => ({
  id: `subsection_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  title,
  collapsed: false,
  repeatable: false,
  repeatSourceFieldId: "",
  fields: [],
});

const makeField = () => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  label: "",
  type: "text",
  required: false,
  optionsText: "",
});

const mapFieldFromApi = (f) => ({
  id: f.id,
  label: f.label || "",
  type: f.type || "text",
  required: !!f.required,
  optionsText: (f.options || []).join(", "),
});

const mapSectionFromApi = (node) => {
  const children = Array.isArray(node.children) ? node.children : [];
  let subsections = children.map((child, idx) => ({
    id: child.id,
    title: cleanTitle(child.title) || `Subsection ${idx + 1}`,
    collapsed: idx !== 0,
    repeatable: !!child.repeatable,
    repeatSourceFieldId: child.repeatSourceFieldId || "",
    fields: (child.fields || []).map(mapFieldFromApi),
  }));

  // Backward compatibility: if old section had fields directly, keep them under a generated subsection.
  if (subsections.length === 0 && Array.isArray(node.fields) && node.fields.length > 0) {
    subsections = [
      {
        id: `gen_${node.id}_${Math.random().toString(36).slice(2, 6)}`,
        title: "General",
        collapsed: false,
        fields: node.fields.map(mapFieldFromApi),
      },
    ];
  }

  return {
    id: node.id,
    title: cleanTitle(node.title),
    subsections,
  };
};

export default function TreeFormBuilder() {
  const [editingFormId, setEditingFormId] = useState(null);
  const [name, setName] = useState("Supplier Registration");
  const [categoryName, setCategoryName] = useState("General Vendors");
  const [status, setStatus] = useState("draft");
  const [sections, setSections] = useState([makeSection("Supplier Information")]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragField, setDragField] = useState(null);
  const [publicLink, setPublicLink] = useState("");
  const [allCollapsed, setAllCollapsed] = useState(false);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) || sections[0] || null,
    [sections, selectedSectionId]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const created = await api.post("/form/create-default");
        const form = created.data?.data;
        if (!form) return;

        const mappedSections = (form.structure || []).map(mapSectionFromApi);
        setEditingFormId(form._id);
        setName(form.name || "Supplier Registration");
        setCategoryName(form.categoryName || "General Vendors");
        setStatus(form.status || "draft");
        setPublicLink(form._id ? `${window.location.origin}/tree-form/${form._id}` : "");
        setSections(mappedSections.length ? mappedSections : [makeSection("Supplier Information")]);
        setSelectedSectionId(mappedSections[0]?.id || "");
      } catch {
        setSections([makeSection("Supplier Information")]);
      }
    };

    init();
  }, []);


  useEffect(() => {
    if (!selectedSectionId && sections[0]?.id) setSelectedSectionId(sections[0].id);
  }, [sections, selectedSectionId]);

  const updateSection = (sectionId, updater) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? updater(section) : section)));
  };

  const updateSubsection = (sectionId, subsectionId, updater) => {
    updateSection(sectionId, (section) => ({
      ...section,
      subsections: section.subsections.map((sub) => (sub.id === subsectionId ? updater(sub) : sub)),
    }));
  };

  const addSection = () => {
    const title = window.prompt("Section title", "New Section");
    if (!title) return;
    const next = makeSection(title);
    setSections((prev) => [...prev, next]);
    setSelectedSectionId(next.id);
  };

  const removeSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
    if (selectedSectionId === sectionId) setSelectedSectionId("");
  };

  const addSubsection = () => {
    if (!selectedSection) return;
    const title = window.prompt("Subsection title", "New Subsection");
    if (!title) return;
    updateSection(selectedSection.id, (section) => ({
      ...section,
      subsections: [...section.subsections, makeSubsection(title)],
    }));
  };

  const removeSubsection = (subsectionId) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, (section) => ({
      ...section,
      subsections: section.subsections.filter((sub) => sub.id !== subsectionId),
    }));
  };

  const toggleCollapseAll = () => {
    if (!selectedSection) return;
    const nextState = !allCollapsed;
    updateSection(selectedSection.id, (section) => ({
      ...section,
      subsections: section.subsections.map((sub) => ({ ...sub, collapsed: nextState })),
    }));
    setAllCollapsed(nextState);
  };

  const addField = (subsectionId) => {
    if (!selectedSection) return;
    updateSubsection(selectedSection.id, subsectionId, (sub) => ({
      ...sub,
      fields: [...sub.fields, makeField()],
      collapsed: false,
    }));
  };

  const updateField = (subsectionId, fieldId, key, value) => {
    if (!selectedSection) return;
    updateSubsection(selectedSection.id, subsectionId, (sub) => ({
      ...sub,
      fields: sub.fields.map((field) => (field.id === fieldId ? { ...field, [key]: value } : field)),
    }));
  };

  const deleteField = (subsectionId, fieldId) => {
    if (!selectedSection) return;
    updateSubsection(selectedSection.id, subsectionId, (sub) => ({
      ...sub,
      fields: sub.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const onDropField = (subsectionId, targetIndex) => {
    if (!selectedSection || !dragField) return;
    if (dragField.subsectionId !== subsectionId) return;
    if (dragField.fromIndex === targetIndex) return;

    updateSubsection(selectedSection.id, subsectionId, (sub) => {
      const next = [...sub.fields];
      const [moved] = next.splice(dragField.fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      return { ...sub, fields: next };
    });
    setDragField(null);
  };

  const toPayloadField = (field) => {
    if (!field) return null;
    return {
      id: field.id,
      label: field.label || "Untitled Field",
      type: field.type || "text",
      required: !!field.required,
      options: (field.optionsText || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      validation: {
        pattern: "none",
        min: undefined,
        max: undefined,
        allowedFileTypes: ["pdf", "png", "jpg", "jpeg"],
        maxFileSizeMB: 5,
      },
    };
  };

  const toPayloadSection = (section) => {
    if (!section) return null;
    return {
      id: section.id,
      title: section.title || "Untitled Section",
      fields: [],
      children: (section.subsections || []).map((subsection) => ({
        id: subsection.id,
        title: subsection.title || "Untitled Subsection",
        repeatable: !!subsection.repeatable,
        repeatSourceFieldId: subsection.repeatSourceFieldId || "",
        fields: (subsection.fields || []).map(toPayloadField).filter(Boolean),
        children: [],
      })),
    };
  };

  const saveForm = async (nextStatus = status) => {
    setMessage("");
    setError("");
    try {
      const payload = {
        name,
        categoryName,
        status: nextStatus,
        structure: sections.map(toPayloadSection),
      };

      const res = editingFormId 
        ? await api.put(`/form/${editingFormId}`, payload) 
        : await api.post("/form/create", payload);

      setEditingFormId(res.data.data._id);
      setStatus(res.data.data.status || nextStatus);
      const link = `${window.location.origin}/tree-form/${res.data.data._id}`;
      setPublicLink(link);
      setMessage(nextStatus === "published" ? "Form published successfully." : "Form saved.");
    } catch (err) {
      console.error("[SaveForm Error]:", err);
      setError(err.response?.data?.message || err.message || "Failed to save form.");
    }
  };

  const publishForm = async () => saveForm("published");

  const copyLink = async () => {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setMessage("Public link copied.");
    } catch {
      setError("Could not copy link.");
    }
  };


  return (
    <div className="mx-auto max-w-[1520px] space-y-3 p-3 md:p-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Vendor Form Builder</h1>
        <p className="mt-1 text-sm text-slate-500">Build section, subsection, and field hierarchy in a clean SaaS interface.</p>
        {editingFormId ? <p className="mt-1 text-xs text-slate-500">Editing: {editingFormId}</p> : null}
      </section>

      <section className="sticky top-[4.8rem] z-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input className="rounded-lg border border-slate-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Form Name" />
          <input className="rounded-lg border border-slate-300 px-3 py-2" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category Name" />
          <select className="rounded-lg border border-slate-300 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button type="button" onClick={() => saveForm()} className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Save Form
          </button>
          <button type="button" onClick={() => publishForm()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <CheckCircle2 size={15} />
            Publish
          </button>
        </div>
        {publicLink ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
            <span className="text-xs font-medium text-emerald-700">Public Link</span>
            <input readOnly value={publicLink} className="min-w-[280px] flex-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-xs text-slate-700" />
            <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
              <Copy size={13} />
              Copy
            </button>
            <a href={publicLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
              <ExternalLink size={13} />
              Open
            </a>
          </div>
        ) : null}
        {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:h-[calc(100vh-240px)] lg:overflow-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Sections</h2>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus size={14} />
              Add Section
            </button>
          </div>

          <div className="space-y-2">
            {sections.map((section, idx) => {
              const active = selectedSection?.id === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    active ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{idx + 1}. {section.title}</span>
                    <span className="text-xs text-slate-500">{section.subsections.length}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{section.subsections.reduce((sum, sub) => sum + sub.fields.length, 0)} fields</div>
                </button>
              );
            })}
          </div>

          {sections.length > 1 && selectedSection ? (
            <button
              type="button"
              onClick={() => removeSection(selectedSection.id)}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} />
              Delete Selected Section
            </button>
          ) : null}
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:h-[calc(100vh-240px)] lg:overflow-auto">
          {!selectedSection ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Select a section to edit.</div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <input
                  className="min-w-[260px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={selectedSection.title}
                  onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, title: e.target.value }))}
                  placeholder="Section title"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCollapseAll}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {allCollapsed ? "Expand All" : "Collapse All"}
                  </button>
                  <button
                    type="button"
                    onClick={addSubsection}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={15} />
                    Add Subsection
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {selectedSection.subsections.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No subsections. Click <span className="font-medium">Add Subsection</span>.
                  </div>
                ) : (
                  selectedSection.subsections.map((subsection, idx) => (
                    <div key={subsection.id} className="rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateSubsection(selectedSection.id, subsection.id, (sub) => ({ ...sub, collapsed: !sub.collapsed }))
                          }
                          className="grid h-7 w-7 place-items-center rounded-md border border-slate-300 bg-white text-slate-600"
                        >
                          <ChevronDown size={14} className={`transition-transform ${subsection.collapsed ? "-rotate-90" : ""}`} />
                        </button>
                        <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm">
                           <span className="text-[10px] font-black text-blue-600 mr-2">{sections.indexOf(selectedSection) + 1}.{idx + 1}</span>
                           <input
                             className="min-w-[200px] flex-1 border-none bg-transparent p-0 text-sm outline-none"
                             value={subsection.title}
                             onChange={(e) => updateSubsection(selectedSection.id, subsection.id, (sub) => ({ ...sub, title: e.target.value }))}
                             placeholder="Subsection title"
                           />
                        </div>

                        {/* REPEATABLE CONTROLS */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200">
                           <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <input 
                                type="checkbox" 
                                checked={!!subsection.repeatable} 
                                onChange={(e) => updateSubsection(selectedSection.id, subsection.id, sub => ({ ...sub, repeatable: e.target.checked }))}
                             />
                             Repeatable
                           </label>
                           {subsection.repeatable && (
                             <select 
                                className="text-[10px] font-bold border-none bg-slate-50 rounded px-1 outline-none"
                                value={subsection.repeatSourceFieldId}
                                onChange={(e) => updateSubsection(selectedSection.id, subsection.id, sub => ({ ...sub, repeatSourceFieldId: e.target.value }))}
                             >
                                <option value="">Select Count Field</option>
                                {sections.flatMap(s => s.subsections.flatMap(ss => ss.fields)).map(f => (
                                  <option key={f.id} value={f.id}>{f.label || f.id}</option>
                                ))}
                             </select>
                           )}
                        </div>
                        <span className="rounded bg-white px-2 py-1 text-[11px] text-slate-500">{subsection.fields.length} fields</span>
                        <button
                          type="button"
                          onClick={() => addField(subsection.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          <Plus size={13} />
                          Add Field
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSubsection(subsection.id)}
                          className="rounded-lg border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>

                      {!subsection.collapsed ? (
                        <div className="space-y-2 p-2.5">
                          {subsection.fields.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                              No fields yet in this subsection.
                            </div>
                          ) : (
                            subsection.fields.map((field, fieldIndex) => (
                              <div
                                key={field.id}
                                draggable
                                onDragStart={() => setDragField({ subsectionId: subsection.id, fromIndex: fieldIndex })}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => onDropField(subsection.id, fieldIndex)}
                                className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-[34px_1.35fr_1fr_1fr_auto_auto]"
                              >
                                <div className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
                                  <GripVertical size={14} />
                                </div>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                                  placeholder="Field label"
                                  value={field.label}
                                  onChange={(e) => updateField(subsection.id, field.id, "label", e.target.value)}
                                />
                                <select
                                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                                  value={field.type}
                                  onChange={(e) => updateField(subsection.id, field.id, "type", e.target.value)}
                                >
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                  <option value="file">File</option>
                                  <option value="dropdown">Dropdown</option>
                                </select>
                                {field.type === "dropdown" ? (
                                  <input
                                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    placeholder="Option 1, Option 2"
                                    value={field.optionsText}
                                    onChange={(e) => updateField(subsection.id, field.id, "optionsText", e.target.value)}
                                  />
                                ) : (
                                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">No options</div>
                                )}
                                <label className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(subsection.id, field.id, "required", e.target.checked)}
                                  />
                                  Required
                                </label>
                                <button
                                  type="button"
                                  onClick={() => deleteField(subsection.id, field.id)}
                                  className="rounded-md border border-rose-300 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

      </section>
    </div>
  );
}
