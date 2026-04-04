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
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        fetchCategories();
        fetchForms();
    }, []);

    useEffect(() => {
        if (!categoryId && categories.length > 0) {
            setCategoryId(categories[0]._id);
        }
    }, [categories, categoryId]);

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

    const handleSelectCategory = async (cat) => {
        setSelectedCategory(cat);
        setCategoryId(cat._id);
        setLoading(true);
        const tid = toast.loading(`Fetching protocol for ${cat.name}...`);
        
        try {
            // New strategy: Explicitly fetch the published form for this category
            const res = await api.get(`/forms/public/${cat._id}`);
            const existingForm = res.data.data;
            
            if (existingForm) {
                loadForm(existingForm, cat._id);
                toast.success("Existing protocol loaded", { id: tid });
            } else {
                // Initialize fresh form if none exists
                setActiveFormId(null);
                setFormName(`${cat.name} Registration Form`);
                setDescription(`Standard onboarding protocol for ${cat.name} vendors.`);
                setSections([{ sectionTitle: "Basic Information", fields: [], order: 0 }]);
                setActiveSectionIdx(0);
                setActiveFieldIdx(null);
                toast.success("New protocol initialized", { id: tid });
            }
        } catch (err) {
            // If 404, item not found, it's fine - start fresh
            setActiveFormId(null);
            setFormName(`${cat.name} Registration Form`);
            setDescription(`Standard onboarding protocol for ${cat.name} vendors.`);
            setSections([{ sectionTitle: "Basic Information", fields: [], order: 0 }]);
            setActiveSectionIdx(0);
            setActiveFieldIdx(null);
            toast.dismiss(tid);
        } finally {
            setLoading(false);
            setStep("build-form");
        }
    };

    const copyShareLink = (formId) => {
        const link = `${window.location.origin}/register/${formId}`;
        navigator.clipboard.writeText(link);
        toast.success("Public link copied to clipboard!");
    };

    const loadForm = (form, forceCategoryId) => {
        setActiveFormId(form._id);
        setFormName(form.name);
        setDescription(form.description || "");
        setCategoryId(forceCategoryId || form.categoryId?._id || form.categoryId || "");
        setSections(form.sections || []);
        setActiveSectionIdx(0);
        setActiveFieldIdx(null);
        setStep("build-form");
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
        if (!categoryId && !isNewCategory) return toast.error("Category required");
        if (isNewCategory && !newCategoryName) return toast.error("Category Name required");

        setLoading(true);
        const id = toast.loading(statusOverride === "published" ? "Deploying form..." : "Saving draft...");
        try {
            const payload = {
                _id: activeFormId,
                name: formName,
                description,
                categoryId: isNewCategory ? undefined : categoryId,
                categoryName: isNewCategory ? newCategoryName : undefined,
                sections,
                status: statusOverride || "draft"
            };
            const res = await api.post("/forms", payload);
            setActiveFormId(res.data.data._id);
            await fetchForms();
            await fetchCategories();
            toast.success(statusOverride === "published" ? "Form deployed successfully" : "Draft saved", { id });
            
            if (statusOverride === "published") {
                setStep("select-category");
                setIsNewCategory(false);
                setNewCategoryName("");
            }
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to save form", { id });
        }
        setLoading(false);
    };

    if (step === "select-category") {
        const activeCategory = categories.find(c => c._id === categoryId) || categories[0];
        const filteredForms = existingForms.filter(f => f.categoryId?._id === categoryId || f.categoryId === categoryId);

        return (
            <div className="space-y-8 pb-10 fade-in">
                {/* ── HEADER ─────────────────────────────────────────── */}
                <section className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/20">
                    <div className="p-8 md:p-12">
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-700 shadow-sm">
                                <Layout size={14} /> System Blueprint
                            </span>
                            <div className="h-1 w-8 bg-slate-100 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Architect</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <h1 className="text-5xl font-black leading-none tracking-[-0.05em] text-slate-900 uppercase">
                                    Form <span className="text-slate-400">Builder</span>
                                </h1>
                                <p className="mt-6 text-[15px] font-medium leading-relaxed text-slate-500 italic border-l-4 border-slate-900/10 pl-6">
                                    Architect specialized onboarding protocols. Map data collection fields to vendor categories to ensure precise qualification and compliance.
                                </p>
                            </div>
                            <button 
                                onClick={() => activeCategory && handleSelectCategory(activeCategory)}
                                className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 active:scale-95 group"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
                                {activeCategory ? `New ${activeCategory.name} Form` : "Create New Form"}
                            </button>
                        </div>
                    </div>

                    {/* ── CATEGORY TABS ─────────────────────────────────── */}
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex flex-wrap gap-2 no-scrollbar overflow-x-auto items-center">
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => { setCategoryId(cat._id); setIsNewCategory(false); }}
                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        categoryId === cat._id && !isNewCategory
                                        ? "bg-white text-slate-900 shadow-lg shadow-slate-200 border border-slate-200" 
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            <button
                                onClick={() => { setIsNewCategory(true); setCategoryId(""); }}
                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${
                                    isNewCategory 
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-400" 
                                    : "border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                }`}
                            >
                                <Plus size={14} /> New Category
                            </button>
                        </div>
                    </div>
                </section>

                {isNewCategory && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mt-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Layout size={20} className="text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-900">Create New Vendor Category</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">Initialize a fresh registration protocol for a new vendor domain.</p>
                        
                        <div className="flex flex-col sm:flex-row items-end gap-4 max-w-xl">
                            <div className="w-full flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-slate-600">Category Name</label>
                                <input 
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. IT Services, Raw Materials"
                                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => newCategoryName ? setStep("build-form") : toast.error("Category name required")}
                                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
                            >
                                Start Building Form
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── FORMS GRID ───────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Empty State / Create Action */}
                    <div
                        onClick={() => activeCategory && handleSelectCategory(activeCategory)}
                        className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/30 p-10 flex flex-col items-center justify-center text-center transition-all hover:border-slate-400 hover:bg-white hover:shadow-2xl"
                    >
                        <div className="mb-6 h-20 w-20 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-all shadow-inner border border-slate-100">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900">Initialize Fresh Version</h3>
                        <p className="mt-2 text-[10px] font-bold text-slate-400 italic">Start from scratch for this category</p>
                    </div>

                    {/* Form Cards */}
                    {filteredForms.map((form) => (
                        <div
                            key={form._id}
                            onClick={() => loadForm(form, categoryId)}
                            className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-slate-900 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col"
                        >
                            <div className="mb-8 flex items-start justify-between">
                                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-slate-100 bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner shadow-slate-100">
                                    <FileText size={28} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {form.status === 'published' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); copyShareLink(form._id); }}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm group/share"
                                            title="Copy Public Link"
                                        >
                                            <Globe size={18} />
                                        </button>
                                    )}
                                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                        form.status === 'published' 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                        {form.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Protocol v{form.version || 1}</p>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-none mb-4 group-hover:text-slate-900 truncate">{form.name}</h3>
                                <p className="line-clamp-2 text-[13px] font-bold text-slate-400 italic leading-relaxed">
                                    {form.description || "Vendor requirement profile and data collection architecture."}
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-slate-900 transition-all"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-all">Edit Component</span>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all rotate-45 group-hover:rotate-0">
                                    <Plus size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && filteredForms.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300 grayscale opacity-40 italic">
                        <p className="font-black uppercase tracking-[0.3em] text-[10px]">No templates established for this category</p>
                    </div>
                )}
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
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">
                                Category: {isNewCategory ? (newCategoryName || "Unnamed New Category") : categories.find(c => c._id === categoryId)?.name || "Not Selected"}
                            </span>
                        </div>
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
