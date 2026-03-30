import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    GripVertical, Plus, Trash2, Settings, FileText, CheckSquare, List,
    AlignLeft, Hash, Mail, Calendar, Upload, Save, CheckCircle, ArrowLeft, Globe, MousePointer2, Settings2, Layout
} from "lucide-react";

const FIELD_TYPES = [
    { type: "text", label: "Short Text", icon: AlignLeft, color: "text-blue-600", bg: "bg-blue-50" },
    { type: "textarea", label: "Long Text", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { type: "number", label: "Number", icon: Hash, color: "text-emerald-600", bg: "bg-emerald-50" },
    { type: "email", label: "Email", icon: Mail, color: "text-rose-600", bg: "bg-rose-50" },
    { type: "date", label: "Date", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
    { type: "dropdown", label: "Dropdown", icon: List, color: "text-cyan-600", bg: "bg-cyan-50" },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
    { type: "file", label: "File Upload", icon: Upload, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function FormBuilder() {
    const [step, setStep] = useState("select-category");
    const [formName, setFormName] = useState("New Form");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]);
    const [activeSectionIdx, setActiveSectionIdx] = useState(null);
    const [activeFieldIdx, setActiveFieldIdx] = useState(null);
    const [loading, setLoading] = useState(false);
    const [existingForms, setExistingForms] = useState([]);
    const [activeFormId, setActiveFormId] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchForms();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data || []);
        } catch (e) {
            toast.error("Failed to load categories");
        }
    };

    const fetchForms = async () => {
        try {
            const res = await api.get("/forms/templates");
            setExistingForms(res.data.data || []);
        } catch (e) {
            toast.error("Failed to fetch forms");
        }
    };

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        setCategoryId(cat._id);
        const existingForm = cat.formTemplate;
        const formCatId = existingForm?.categoryId?._id || existingForm?.categoryId || "";
        const isOwnForm = formCatId === cat._id;

        if (existingForm && existingForm._id && isOwnForm) {
            loadForm(existingForm, cat._id);
        } else if (existingForm && existingForm._id && !isOwnForm) {
            setActiveFormId(null);
            setFormName(`${cat.name} Registration Form`);
            setDescription("");
            setSections(existingForm.sections ? JSON.parse(JSON.stringify(existingForm.sections)) : [{ sectionTitle: "General Information", fields: [], order: 0 }]);
            setActiveSectionIdx(0);
            setActiveFieldIdx(null);
        } else {
            setActiveFormId(null);
            setFormName(`${cat.name} Information`);
            setSections([{ sectionTitle: "Basic Details", fields: [], order: 0 }]);
            setActiveSectionIdx(0);
            setActiveFieldIdx(null);
        }
        setStep("build-form");
    };

    const loadForm = (form, forceCategoryId) => {
        setActiveFormId(form._id);
        setFormName(form.name);
        setDescription(form.description || "");
        setCategoryId(forceCategoryId || form.categoryId?._id || form.categoryId || "");
        setSections(form.sections || []);
        setActiveSectionIdx(0);
        setActiveFieldIdx(null);
    };

    const addSection = () => {
        setSections([...sections, { sectionTitle: "New Section", fields: [], order: sections.length }]);
        setActiveSectionIdx(sections.length);
    };

    const addField = (fieldType) => {
        if (activeSectionIdx === null) setActiveSectionIdx(0);
        const newSections = [...sections];
        if (newSections.length === 0) {
            newSections.push({ sectionTitle: "General Information", fields: [], order: 0 });
            setActiveSectionIdx(0);
        }
        const newField = {
            fieldId: `f_${Date.now()}`,
            label: `New ${fieldType.label}`,
            type: fieldType.type,
            placeholder: `Enter ${fieldType.label.toLowerCase()}...`,
            required: false,
            validation: { minLength: "", maxLength: "", regex: "", min: "", max: "" },
            options: fieldType.type === "dropdown" ? ["Option 1", "Option 2"] : [],
            order: newSections[activeSectionIdx].fields.length
        };
        newSections[activeSectionIdx].fields.push(newField);
        setSections(newSections);
        setActiveFieldIdx(newSections[activeSectionIdx].fields.length - 1);
    };

    const updateActiveField = (key, value) => {
        const newSections = [...sections];
        if (key.includes("validation.")) {
            const vKey = key.split(".")[1];
            newSections[activeSectionIdx].fields[activeFieldIdx].validation[vKey] = value;
        } else {
            newSections[activeSectionIdx].fields[activeFieldIdx][key] = value;
        }
        setSections(newSections);
    };

    const handleSave = async (statusOverride = null) => {
        if (!categoryId) return toast.error("Category required");
        setLoading(true);
        const id = toast.loading(statusOverride === "published" ? "Deploying form..." : "Saving draft...");
        try {
            const payload = {
                _id: activeFormId,
                name: formName,
                description,
                categoryId,
                sections,
                status: statusOverride || "draft"
            };
            const res = await api.post("/forms", payload);
            setActiveFormId(res.data.data._id);
            await fetchForms();
            await fetchCategories();
            toast.success(statusOverride === "published" ? "Form deployed successfully" : "Draft saved", { id });
            if (statusOverride === "published") setStep("select-category");
        } catch (e) {
            toast.error("Failed to save form", { id });
        }
        setLoading(false);
    };

    if (step === "select-category") {
        return (
            <div className="space-y-4 pb-10 fade-in">
                <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                    <div className="p-6 md:p-8">
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                                </span>
                                Form configuration
                            </span>
                            <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                                <Layout size={12} className="text-slate-400" />
                                Registration Blueprint
                            </span>
                        </div>

                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                                Form Templates.
                            </h1>
                            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
                                Select a vendor category below to configure or create its onboarding form layout and fields.
                            </p>
                        </div>
                    </div>
                </section>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((cat) => (
                        <div
                            key={cat._id}
                            onClick={() => handleSelectCategory(cat)}
                            className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
                        >
                            <div className="mb-6 flex items-start justify-between">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 transition-colors duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                    <Layout size={24} />
                                </div>
                                {cat.formTemplate?.status === "published" ? (
                                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-100/50 bg-emerald-50/50 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-emerald-700 shadow-sm">
                                        <span className="relative flex h-1.5 w-1.5">
                                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                        </span>
                                        Active
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
                                        Draft
                                    </span>
                                )}
                            </div>
                            <h3 className="mb-1 text-2xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-900 truncate">{cat.name}</h3>
                            <p className="mb-5 font-mono text-[12px] font-bold uppercase tracking-widest text-slate-400">UUID: {cat.code}</p>
                            <p className="line-clamp-2 text-[15px] font-medium leading-relaxed text-slate-500">{cat.description || "Vendor requirement profile and data collection architecture."}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="-mx-8 -mb-8 mt-0 flex h-[calc(100vh-6rem)] flex-col overflow-hidden bg-slate-50/50">
            {/* Header */}
            <header className="flex h-16 flex-none items-center justify-between border-b border-slate-200 bg-white px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep("select-category")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-6 w-px bg-slate-200 hidden md:block" />
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400">{selectedCategory?.name} Template</span>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full border-none bg-transparent p-0 text-xl font-bold tracking-tight text-slate-900 placeholder-slate-400 focus:ring-0 md:w-96"
                            placeholder="Form Title"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => handleSave("draft")} disabled={loading} className="flex flex-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50">
                        <Save size={18} /> Save Draft
                    </button>
                    <button onClick={() => handleSave("published")} disabled={loading} className="flex flex-none items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 tracking-wide">
                        <Globe size={18} /> Publish Form
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Fields */}
                <aside className="w-72 flex-none overflow-y-auto border-r border-slate-200 bg-white p-5">
                    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Add Field</h3>
                    <div className="grid gap-2">
                        {FIELD_TYPES.map((f) => (
                            <button
                                key={f.type}
                                onClick={() => addField(f)}
                                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                            >
                                <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${f.bg} ${f.color} transition-colors group-hover:shadow-sm`}>
                                    <f.icon size={16} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-800">{f.label}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Canvas */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
                    <div className="mx-auto max-w-3xl space-y-8 pb-32">
                        {sections.map((section, sIdx) => (
                            <div
                                key={sIdx}
                                onClick={() => setActiveSectionIdx(sIdx)}
                                className={`relative rounded-2xl border bg-white p-6 transition-all ${activeSectionIdx === sIdx ? "border-indigo-400 shadow-md ring-4 ring-indigo-50" : "border-slate-200 shadow-sm"}`}
                            >
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex flex-1 items-center gap-3">
                                        <div className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors">
                                            <GripVertical size={16} />
                                        </div>
                                        <div className="w-full">
                                            <input
                                                type="text"
                                                value={section.sectionTitle}
                                                onChange={(e) => {
                                                    const ns = [...sections];
                                                    ns[sIdx].sectionTitle = e.target.value;
                                                    setSections(ns);
                                                }}
                                                className="w-full border-none bg-transparent p-0 text-lg font-semibold text-slate-900 placeholder-slate-300 focus:ring-0"
                                                placeholder="Section Title"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const ns = [...sections];
                                            ns.splice(sIdx, 1);
                                            setSections(ns);
                                            setActiveSectionIdx(null);
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {section.fields.map((field, fIdx) => (
                                        <div
                                            key={field.fieldId}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveSectionIdx(sIdx);
                                                setActiveFieldIdx(fIdx);
                                            }}
                                            className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${activeSectionIdx === sIdx && activeFieldIdx === fIdx ? "border-indigo-300 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                                        >
                                            <div className="mt-1 flex cursor-grab text-slate-300 hover:text-slate-500">
                                                <GripVertical size={16} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[14px] font-semibold text-slate-800">{field.label}</span>
                                                    {field.required && <span className="text-xl leading-none text-rose-500">*</span>}
                                                </div>
                                                <div className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-[13px] text-slate-400">
                                                    {field.placeholder || "Enter text..."}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const ns = [...sections];
                                                    ns[sIdx].fields.splice(fIdx, 1);
                                                    setSections(ns);
                                                    if (activeFieldIdx === fIdx) setActiveFieldIdx(null);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {section.fields.length === 0 && (
                                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                                            <MousePointer2 size={24} className="mb-2 text-slate-300" />
                                            <p className="text-[13px] font-medium text-slate-500">No fields inside this section yet.<br/>Click a field type from the left sidebar to add.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addSection}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-transparent py-6 text-[14px] font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-all"
                        >
                            <Plus size={18} /> Add New Section
                        </button>
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 flex-none overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.02)]">
                    {activeSectionIdx !== null && activeFieldIdx !== null && sections[activeSectionIdx]?.fields[activeFieldIdx] ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <Settings2 size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-slate-900">Field Settings</h3>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-semibold text-slate-600">Field Label</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                        value={sections[activeSectionIdx].fields[activeFieldIdx].label}
                                        onChange={(e) => updateActiveField("label", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-semibold text-slate-600">Placeholder Text</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                        value={sections[activeSectionIdx].fields[activeFieldIdx].placeholder}
                                        onChange={(e) => updateActiveField("placeholder", e.target.value)}
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                                    <span className="text-[13px] font-semibold text-slate-700">Required Field</span>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={sections[activeSectionIdx].fields[activeFieldIdx].required}
                                        onChange={(e) => updateActiveField("required", e.target.checked)}
                                    />
                                </label>

                                {sections[activeSectionIdx].fields[activeFieldIdx].type === "dropdown" && (
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-slate-600">Dropdown Options</label>
                                        <textarea
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all outline-none min-h-[120px]"
                                            value={sections[activeSectionIdx].fields[activeFieldIdx].options?.join("\n") || ""}
                                            onChange={(e) => updateActiveField("options", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                                            placeholder={"Option 1\nOption 2\n..."}
                                        />
                                        <p className="text-[11px] text-slate-400">Put each option on a new line.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                            <Settings2 size={40} className="mb-4 text-slate-300" strokeWidth={1.5} />
                            <h4 className="text-[14px] font-semibold text-slate-700">No Field Selected</h4>
                            <p className="mt-1 text-[12px] text-slate-500">Click on any field in the canvas to view and edit its settings here.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
