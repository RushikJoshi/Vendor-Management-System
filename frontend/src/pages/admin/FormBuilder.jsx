import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    GripVertical, Plus, Trash2, Settings, FileText, CheckSquare, List,
    AlignLeft, Hash, Mail, Calendar, Upload, Save, Archive, CheckCircle,
    Tag, ArrowLeft, ChevronRight, Layers, Layout, MousePointer2, Settings2,
    Monitor, Globe, Info, Clock, AlertCircle
} from "lucide-react";

// Modern Field Types with rich meta
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
    const [step, setStep] = useState("select-category"); // "select-category" | "build-form"
    const [formName, setFormName] = useState("New Vendor Registration Form");
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
    const [catLoading, setCatLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchForms();
    }, []);

    const fetchCategories = async () => {
        setCatLoading(true);
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data || []);
        } catch (e) {
            toast.error("Failed to load categories");
        } finally {
            setCatLoading(false);
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
            setFormName(`${cat.name} Portfolio Form`);
            setDescription("");
            setSections(existingForm.sections ? JSON.parse(JSON.stringify(existingForm.sections)) : [{ sectionTitle: "Identification Logistics", fields: [], order: 0 }]);
            setActiveSectionIdx(0);
            setActiveFieldIdx(null);
        } else {
            setActiveFormId(null);
            setFormName(`${cat.name} Registration Dossier`);
            setSections([{ sectionTitle: "Identification & Contact", fields: [], order: 0 }]);
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
        setSections([...sections, { sectionTitle: "New Operational Section", fields: [], order: sections.length }]);
        setActiveSectionIdx(sections.length);
        toast.success("New section initialized");
    };

    const addField = (fieldType) => {
        if (activeSectionIdx === null) {
            setActiveSectionIdx(0);
        }
        const newSections = [...sections];
        if (newSections.length === 0) {
            newSections.push({ sectionTitle: "General Details", fields: [], order: 0 });
            setActiveSectionIdx(0);
        }
        const newField = {
            fieldId: `f_${Date.now()}`,
            label: `New ${fieldType.label}`,
            type: fieldType.type,
            placeholder: `Enter ${fieldType.label.toLowerCase()}...`,
            required: false,
            validation: { minLength: "", maxLength: "", regex: "", min: "", max: "" },
            options: fieldType.type === "dropdown" ? ["Option One", "Option Two"] : [],
            order: newSections[activeSectionIdx].fields.length
        };
        newSections[activeSectionIdx].fields.push(newField);
        setSections(newSections);
        setActiveFieldIdx(newSections[activeSectionIdx].fields.length - 1);
        toast.success(`${fieldType.label} field synthesized`);
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
        if (!categoryId) return toast.error("Taxonomy target (Category) required");
        setLoading(true);
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
            toast.success(statusOverride === "published" ? "🚀 Form Deployment Successful!" : "💾 Component Draft Stored");
            if (statusOverride === "published") setStep("select-category");
        } catch (e) {
            toast.error("Registry sync failed");
        }
        setLoading(false);
    };

    // ─────────────────────────────────────────────
    // UI COMPONENTS
    // ─────────────────────────────────────────────

    if (step === "select-category") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 max-w-7xl mx-auto py-4"
            >
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">Protocol Architect</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Registration Blueprinting</h1>
                        <p className="text-sm font-medium text-slate-500 mt-2">Select an operational segment to configure its acquisition protocol.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <motion.button
                            key={cat._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => handleSelectCategory(cat)}
                            className="bg-white border border-slate-200 rounded-3xl p-8 text-left transition-all shadow-sm hover:shadow-2xl hover:border-emerald-500 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                {cat.formTemplate?.status === "published" ? (
                                    <span className="flex items-center gap-1.5 text-[9px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full shadow-lg shadow-emerald-200">
                                        <CheckCircle size={10} strokeWidth={3} /> ACTIVE
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">Idle</span>
                                )}
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors shadow-inner">
                                <Layout size={24} className="text-emerald-600 group-hover:text-white transition-colors" />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2 group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
                            <p className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase mb-4">{cat.code}</p>
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 italic">{cat.description || "No sector scope defined for this repository category."}</p>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">Configure Protocol <ArrowLeft className="rotate-180" size={14} strokeWidth={3} /></span>
                                <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col -m-8 overflow-hidden bg-slate-50 font-sans">
            {/* Top SaaS Header */}
            <header className="flex-none h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shadow-subtle relative">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ x: -2 }}
                        onClick={() => setStep("select-category")}
                        className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </motion.button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Architect</span>
                            <span className="text-slate-300 text-lg">/</span>
                            <span className="text-emerald-600 font-black text-xs uppercase tracking-tighter">{selectedCategory?.name}</span>
                        </div>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 text-xl font-black tracking-tighter text-slate-900 placeholder-slate-300 w-80"
                            placeholder="Enter Protocol Title..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-10 w-px bg-slate-100 hidden md:block" />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSave("draft")}
                        disabled={loading}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Save size={16} strokeWidth={2.5} /> Save Fragment
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSave("published")}
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#0F7B4D] text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2"
                    >
                        <Globe size={16} strokeWidth={2.5} /> Deploy Protocol
                    </motion.button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Elements Panel */}
                <aside className="w-72 flex-none bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 z-20">
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Components</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {FIELD_TYPES.map((f, idx) => (
                                <motion.button
                                    key={f.type}
                                    whileHover={{ x: 4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addField(f)}
                                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 text-left transition-all active:bg-slate-50 group font-bold"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center group-hover:bg-emerald-500 transition-colors`}>
                                        <f.icon size={18} className={`${f.color} group-hover:text-white transition-colors`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 text-[13px] tracking-tight">{f.label}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Standard Element</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <Monitor size={48} className="mx-auto text-slate-200 mb-4" />
                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">Dynamic Logic Aware</h4>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Elements adapt to category specific taxonomies.</p>
                    </div>
                </aside>

                {/* Center: Canvas */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-10 relative scroll-smooth no-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-12 pb-32">
                        <AnimatePresence>
                            {sections.map((section, sIdx) => (
                                <motion.div
                                    key={sIdx}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative bg-white rounded-[2rem] border-2 transition-all duration-500 p-8 shadow-premium ${activeSectionIdx === sIdx ? "border-emerald-500 ring-8 ring-emerald-50" : "border-slate-100"}`}
                                    onClick={() => setActiveSectionIdx(sIdx)}
                                >
                                    <div className="flex items-center justify-between mb-8 group/header">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all cursor-grab active:cursor-grabbing shadow-inner">
                                                <GripVertical size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">SECTION PHASE {sIdx + 1}</span>
                                                <input
                                                    type="text"
                                                    value={section.sectionTitle}
                                                    onChange={(e) => {
                                                        const ns = [...sections];
                                                        ns[sIdx].sectionTitle = e.target.value;
                                                        setSections(ns);
                                                    }}
                                                    className="bg-transparent border-none focus:ring-0 p-0 text-xl font-black text-slate-900 w-full placeholder-slate-200"
                                                    placeholder="Operational Phase Title..."
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const ns = [...sections];
                                                    ns.splice(sIdx, 1);
                                                    setSections(ns);
                                                    setActiveSectionIdx(null);
                                                }}
                                                className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 border border-rose-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {section.fields.map((field, fIdx) => (
                                                <motion.div
                                                    key={field.fieldId}
                                                    layout
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveSectionIdx(sIdx);
                                                        setActiveFieldIdx(fIdx);
                                                    }}
                                                    className={`group/field relative p-5 bg-[#FDFDFD] border-2 rounded-2xl transition-all duration-300 cursor-pointer ${activeSectionIdx === sIdx && activeFieldIdx === fIdx
                                                        ? "border-emerald-400 bg-white ring-8 ring-emerald-50/50 shadow-xl scale-[1.01] z-10"
                                                        : "border-slate-50 hover:border-slate-200 hover:shadow-soft"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 opacity-0 group-hover/field:opacity-100 transition-opacity cursor-grab shadow-inner">
                                                            <GripVertical size={14} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-sm font-black text-slate-800 tracking-tight h-5 flex items-center">{field.label}</span>
                                                                {field.required && <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Required</span>}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                                {FIELD_TYPES.find(v => v.type === field.type)?.icon({ size: 10 })}
                                                                {field.type} Logic
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/field:text-emerald-500 transition-colors">
                                                                <Settings2 size={14} />
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const ns = [...sections];
                                                                    ns[sIdx].fields.splice(fIdx, 1);
                                                                    setSections(ns);
                                                                    setActiveFieldIdx(null);
                                                                }}
                                                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover/field:opacity-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Quick Preview Placeholder */}
                                                    <div className="mt-4 h-11 w-full border border-slate-100 rounded-xl bg-slate-50/50 flex items-center px-4">
                                                        <span className="text-xs text-slate-300 font-medium">{field.placeholder || "Enter protocol data..."}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {section.fields.length === 0 && (
                                            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center space-y-3 grayscale opacity-40">
                                                <MousePointer2 size={32} className="text-slate-300" />
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Empty Workspace Layer</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.01, borderStyle: 'solid' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={addSection}
                            className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
                        >
                            <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-center group-hover:shadow-2xl group-hover:scale-110 transition-all shadow-subtle group-hover:border-emerald-200">
                                <Plus size={32} strokeWidth={2.5} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-black text-sm uppercase tracking-[0.2em] leading-none mb-1">Synthesize Phase</span>
                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500/60 uppercase">Add Next Operational Section</span>
                            </div>
                        </motion.button>
                    </div>
                </main>

                {/* Right: Properties Panel */}
                <aside className="w-80 flex-none bg-white border-l border-slate-200 p-8 space-y-10 overflow-y-auto z-20 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.03)]">
                    <AnimatePresence mode="wait">
                        {activeSectionIdx !== null && activeFieldIdx !== null && sections[activeSectionIdx]?.fields[activeFieldIdx] ? (
                            <motion.div
                                key={`${activeSectionIdx}-${activeFieldIdx}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-2">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                        <Settings size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 tracking-tighter text-lg leading-none">Logic Config</h3>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Field Level Settings</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Primary Details */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><FileText size={12} /> Component Title</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all shadow-inner"
                                                value={sections[activeSectionIdx].fields[activeFieldIdx].label}
                                                onChange={(e) => updateActiveField("label", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Globe size={12} /> Placeholder</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all shadow-inner"
                                                value={sections[activeSectionIdx].fields[activeFieldIdx].placeholder}
                                                onChange={(e) => updateActiveField("placeholder", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="p-1 bg-slate-100 rounded-2xl">
                                        <button
                                            onClick={() => updateActiveField("required", !sections[activeSectionIdx].fields[activeFieldIdx].required)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${sections[activeSectionIdx].fields[activeFieldIdx].required ? "bg-white shadow-xl text-emerald-700" : "bg-transparent text-slate-400"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${sections[activeSectionIdx].fields[activeFieldIdx].required ? "bg-emerald-100" : "bg-slate-200/50"}`}>
                                                    <AlertCircle size={16} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest">Mandatory</span>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full transition-colors relative ${sections[activeSectionIdx].fields[activeFieldIdx].required ? "bg-emerald-500" : "bg-slate-300"}`}>
                                                <motion.div
                                                    animate={{ x: sections[activeSectionIdx].fields[activeFieldIdx].required ? 22 : 2 }}
                                                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                                                />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Deep Options */}
                                    {sections[activeSectionIdx].fields[activeFieldIdx].type === "dropdown" && (
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><List size={12} /> Options (Registry)</label>
                                            <textarea
                                                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-4 text-xs font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all shadow-inner leading-relaxed"
                                                rows="4"
                                                value={sections[activeSectionIdx].fields[activeFieldIdx].options?.join("\n") || ""}
                                                onChange={(e) => updateActiveField("options", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                                                placeholder="Enter one option per line..."
                                            />
                                        </div>
                                    )}

                                    {/* Advanced Logic Strip */}
                                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Layers size={80} />
                                        </div>
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Clock size={14} className="text-emerald-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Advanced Matrix</span>
                                            </div>
                                            <h4 className="text-sm font-black tracking-tight mb-2">Cross-Field Validation</h4>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Dynamic validation logic is auto-injected based on category sector requirements.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6 grayscale grayscale-[50%]"
                            >
                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center text-slate-200">
                                    <Settings2 size={48} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-slate-900 tracking-tighter uppercase text-sm">No Fragment Locked</h4>
                                    <p className="text-[10px] font-bold text-slate-400 max-w-[160px] leading-relaxed uppercase tracking-wider">Select a field on the architecture canvas to configure its logic layers.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>
            </div>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                }
                .shadow-subtle {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                }
                .shadow-soft {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
