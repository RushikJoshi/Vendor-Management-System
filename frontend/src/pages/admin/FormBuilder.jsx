import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
    GripVertical, Plus, Trash2, Settings, FileText, CheckSquare, List,
    AlignLeft, Hash, Mail, Calendar, Upload, Save, Archive, CheckCircle,
    Tag, ArrowLeft, ChevronRight, LayersIcon, Layers
} from "lucide-react";

const FIELD_TYPES = [
    { type: "text", label: "Short Text", icon: AlignLeft },
    { type: "textarea", label: "Long Text", icon: FileText },
    { type: "number", label: "Number", icon: Hash },
    { type: "email", label: "Email", icon: Mail },
    { type: "date", label: "Date", icon: Calendar },
    { type: "dropdown", label: "Dropdown", icon: List },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "file", label: "File Upload", icon: Upload },
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

    // Step 1 → Step 2: Category selected
    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        setCategoryId(cat._id);

        const existingForm = cat.formTemplate;

        // Only load existing form if it truly belongs to THIS category
        // (i.e., form.categoryId matches cat._id)
        const formCatId = existingForm?.categoryId?._id || existingForm?.categoryId || "";
        const isOwnForm = formCatId === cat._id;

        if (existingForm && existingForm._id && isOwnForm) {
            // Load the category's own form
            loadForm(existingForm, cat._id);
        } else if (existingForm && existingForm._id && !isOwnForm) {
            // Category points to a shared/master form — start fresh for this category
            setActiveFormId(null);
            setFormName(`${cat.name} — Vendor Registration Form`);
            setDescription("");
            setSections(existingForm.sections ? JSON.parse(JSON.stringify(existingForm.sections)) : [{ sectionTitle: "General Details", fields: [], order: 0 }]);
            setActiveSectionIdx(null);
            setActiveFieldIdx(null);
        } else {
            // No form at all — blank form
            setActiveFormId(null);
            setFormName(`${cat.name} — Vendor Registration Form`);
            setDescription("");
            setSections([{ sectionTitle: "General Details", fields: [], order: 0 }]);
            setActiveSectionIdx(0);
            setActiveFieldIdx(null);
        }
        setStep("build-form");
    };

    const loadForm = (form, forceCategoryId) => {
        setActiveFormId(form._id);
        setFormName(form.name);
        setDescription(form.description || "");
        // Always use forceCategoryId if provided (from selected category)
        setCategoryId(forceCategoryId || form.categoryId?._id || form.categoryId || "");
        setSections(form.sections || []);
        setActiveSectionIdx(null);
        setActiveFieldIdx(null);
    };

    const handleBackToCategories = () => {
        setStep("select-category");
        setSelectedCategory(null);
        setCategoryId("");
        setActiveFormId(null);
        setSections([]);
        fetchForms(); // Refresh to show updated form status
        fetchCategories();
    };

    const addSection = () => {
        setSections([...sections, { sectionTitle: "New Section", fields: [], order: sections.length }]);
        setActiveSectionIdx(sections.length);
    };

    const addField = (fieldType) => {
        if (activeSectionIdx === null) {
            toast.error("Please select a section first");
            return;
        }
        const newSections = [...sections];
        const newField = {
            fieldId: `field_${Date.now()}`,
            label: `New ${fieldType.label}`,
            type: fieldType.type,
            placeholder: "",
            required: false,
            validation: { minLength: "", maxLength: "", regex: "", min: "", max: "" },
            options: [],
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

    const updateSectionTitle = (val, sIdx) => {
        const newSections = [...sections];
        newSections[sIdx].sectionTitle = val;
        setSections(newSections);
    };

    const removeField = (sIdx, fIdx) => {
        const newSections = [...sections];
        newSections[sIdx].fields.splice(fIdx, 1);
        setSections(newSections);
        setActiveFieldIdx(null);
    };

    const removeSection = (sIdx) => {
        const newSections = [...sections];
        newSections.splice(sIdx, 1);
        setSections(newSections);
        setActiveSectionIdx(null);
        setActiveFieldIdx(null);
    };

    const handleDragStart = (e, index, type) => {
        e.dataTransfer.setData("dragIndex", index);
        e.dataTransfer.setData("dragType", type);
    };

    const handleDropField = (e, targetSectionIdx, targetFieldIdx) => {
        e.preventDefault();
        const sourceIdx = e.dataTransfer.getData("dragIndex");
        const dragType = e.dataTransfer.getData("dragType");
        if (dragType !== "field" || sourceIdx === "") return;
        if (activeSectionIdx !== targetSectionIdx) return;
        const newSections = [...sections];
        const fields = newSections[targetSectionIdx].fields;
        const [draggedItem] = fields.splice(sourceIdx, 1);
        fields.splice(targetFieldIdx, 0, draggedItem);
        fields.forEach((f, i) => f.order = i);
        setSections(newSections);
    };

    const allowDrop = (e) => e.preventDefault();

    const handleSave = async (statusOverride = null) => {
        if (!categoryId) return toast.error("Category is required");
        if (!formName) return toast.error("Form name is required");
        if (sections.length === 0) return toast.error("At least one section is required");

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

            if (statusOverride === "published") {
                toast.success("✅ Form Published! Category updated.");
                // Go back to category list so user sees ✓ Published badge
                setStep("select-category");
                setSelectedCategory(null);
                setCategoryId("");
                setActiveFormId(null);
                setSections([]);
            } else {
                toast.success("💾 Draft saved successfully!");
            }
        } catch (e) {
            toast.error("Failed to save form");
        }
        setLoading(false);
    };

    const handlePublish = () => handleSave("published");

    const handleArchive = async () => {
        if (!activeFormId) return;
        try {
            await api.patch(`/forms/${activeFormId}/archive`);
            toast.success("Archived successfully");
            fetchForms();
            handleBackToCategories();
        } catch (e) {
            toast.error("Failed to archive");
        }
    };

    // Category already has populated formTemplate from backend
    const getFormForCategory = (cat) => cat.formTemplate || null;

    // ─────────────────────────────────────────────
    // STEP 1 — Category Selection Cards
    // ─────────────────────────────────────────────
    if (step === "select-category") {
        return (
            <div className="space-y-6 fade-in">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-corp-border pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tighter">Form Builder</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                            Step 1 of 2 — Select a Category to Build Its Registration Form
                        </p>
                    </div>
                </header>

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 bg-corp-dark text-white px-4 py-2 rounded-full text-xs font-bold">
                        <span className="w-5 h-5 rounded-full bg-white text-corp-dark flex items-center justify-center font-black">1</span>
                        Select Category
                    </div>
                    <div className="h-px w-8 bg-gray-300" />
                    <div className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-full text-xs font-bold">
                        <span className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center font-black">2</span>
                        Build Form
                    </div>
                </div>

                {catLoading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400 font-semibold">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="font-bold mb-2">No categories found.</p>
                        <p className="text-sm">Create categories first from the Categories page.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {categories.map((cat) => {
                            const existingForm = getFormForCategory(cat);
                            const hasPublished = existingForm?.status === "published";
                            const hasDraft = existingForm?.status === "draft";

                            return (
                                <button
                                    key={cat._id}
                                    onClick={() => handleSelectCategory(cat)}
                                    className="text-left group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-corp-dark hover:shadow-lg transition-all duration-200 focus:outline-none"
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        {hasPublished ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                <CheckCircle size={10} /> Published
                                            </span>
                                        ) : hasDraft ? (
                                            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                                Draft
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-1 rounded-full">
                                                No Form
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 group-hover:bg-corp-dark group-hover:border-corp-dark flex items-center justify-center mb-4 transition-all">
                                        <Tag size={20} className="text-corp-secondary group-hover:text-white transition-colors" />
                                    </div>

                                    {/* Category Name */}
                                    <p className="font-black text-gray-900 text-sm uppercase tracking-tight mb-1">{cat.name}</p>
                                    <p className="text-[11px] text-gray-400 font-mono font-semibold mb-2">{cat.code}</p>

                                    {/* Description */}
                                    {cat.description && (
                                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-4">{cat.description}</p>
                                    )}

                                    {/* Form Info */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                                            <Layers size={12} />
                                            {existingForm ? existingForm.name : "No form assigned"}
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-corp-dark group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // STEP 2 — Form Builder Canvas
    // ─────────────────────────────────────────────
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col -m-8 overflow-hidden bg-gray-50 text-gray-900 border-t border-gray-200">

            {/* Top Action Bar */}
            <div className="flex-none bg-white px-6 py-3 border-b flex items-center justify-between shadow-sm z-10">
                <div className="flex gap-3 items-center">
                    {/* Back Button */}
                    <button
                        onClick={handleBackToCategories}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-corp-dark border border-gray-200 hover:border-corp-dark rounded-lg px-3 py-1.5 transition-all"
                    >
                        <ArrowLeft size={15} /> Categories
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-300">/</span>
                        <div className="flex items-center gap-1.5 bg-corp-dark/5 border border-corp-dark/20 text-corp-dark px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wide">
                            <Tag size={12} />
                            {selectedCategory?.name || "Category"}
                        </div>
                        <span className="text-gray-300">/</span>
                        <input
                            type="text"
                            className="text-base font-bold border-none bg-transparent focus:ring-0 placeholder-gray-400 p-0 w-72"
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            placeholder="Form Title"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Existing Forms Dropdown */}
                    <select
                        className="text-sm rounded-lg border-gray-300 text-gray-600"
                        onChange={e => {
                            if (e.target.value === "new") {
                                setActiveFormId(null);
                                setFormName(`${selectedCategory?.name} — Vendor Registration Form`);
                                setSections([{ sectionTitle: "General Details", fields: [], order: 0 }]);
                                setActiveSectionIdx(0);
                            } else {
                                const f = existingForms.find(x => x._id === e.target.value);
                                if (f) loadForm(f);
                            }
                        }}
                        value={activeFormId || "new"}
                    >
                        <option value="new">+ New Form</option>
                        <optgroup label="Existing Forms">
                            {existingForms.map(f => (
                                <option key={f._id} value={f._id}>{f.name} ({f.status})</option>
                            ))}
                        </optgroup>
                    </select>

                    <button
                        onClick={() => handleSave("draft")}
                        disabled={loading}
                        className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <Save size={15} /> Save Draft
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="bg-green-600 text-white flex items-center gap-2 rounded-lg px-4 py-2 text-sm hover:bg-green-700 shadow-sm transition-colors font-semibold"
                    >
                        <CheckCircle size={15} /> Publish
                    </button>
                    {activeFormId && (
                        <button
                            onClick={handleArchive}
                            title="Archive Form"
                            className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-200"
                        >
                            <Archive size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Elements Panel */}
                <div className="w-56 flex-none bg-white border-r overflow-y-auto p-4">
                    <h3 className="font-bold text-gray-700 tracking-wide mb-3 text-xs uppercase">Elements</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {FIELD_TYPES.map((field) => (
                            <button
                                key={field.type}
                                onClick={() => addField(field)}
                                className="flex items-center gap-3 p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all text-left shadow-sm"
                            >
                                <field.icon size={16} className="text-green-700" />
                                {field.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center Builder Canvas */}
                <div className="flex-1 overflow-y-auto bg-[#F4F7F6] p-8 no-scrollbar relative">
                    <div className="max-w-3xl mx-auto space-y-6 pb-20">
                        {sections.length === 0 ? (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-2xl">
                                <p className="text-gray-500 mb-4">No sections exist in this form.</p>
                                <button onClick={addSection} className="btn-enterprise-primary max-w-xs mx-auto">Add First Section</button>
                            </div>
                        ) : ""}

                        {sections.map((section, sIdx) => (
                            <div
                                key={sIdx}
                                className={`bg-white rounded-2xl shadow-sm border ${activeSectionIdx === sIdx ? "border-green-500 ring-1 ring-green-500" : "border-gray-200"} transition-all overflow-hidden`}
                                onClick={() => setActiveSectionIdx(sIdx)}
                            >
                                <div className={`p-4 flex items-center gap-3 border-b ${activeSectionIdx === sIdx ? "bg-green-50/50" : "bg-gray-50"} group`}>
                                    <GripVertical className="text-gray-400 cursor-move" size={20} />
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-bold text-lg text-gray-800 placeholder-gray-400"
                                        value={section.sectionTitle}
                                        onChange={e => updateSectionTitle(e.target.value, sIdx)}
                                        placeholder="Section Title..."
                                    />
                                    <button onClick={() => removeSection(sIdx)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-3 min-h-[100px]">
                                    {section.fields.map((field, fIdx) => (
                                        <div
                                            key={field.fieldId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, fIdx, "field")}
                                            onDragOver={allowDrop}
                                            onDrop={(e) => handleDropField(e, sIdx, fIdx)}
                                            onClick={(e) => { e.stopPropagation(); setActiveSectionIdx(sIdx); setActiveFieldIdx(fIdx); }}
                                            className={`flex items-center gap-4 py-3 px-4 rounded-xl border transition-all cursor-move bg-white shadow-sm ${activeSectionIdx === sIdx && activeFieldIdx === fIdx
                                                ? "border-green-400 ring-2 ring-green-100"
                                                : "border-gray-100 hover:border-gray-300"
                                                }`}
                                        >
                                            <GripVertical className="text-gray-300" size={18} />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 text-sm flex gap-2 items-center">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{field.type}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">{field.placeholder || "No placeholder"}</div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeField(sIdx, fIdx); }}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {activeSectionIdx === sIdx && (
                                        <div className="pt-4 flex justify-center border-t border-dashed mt-4">
                                            <span className="text-xs font-bold text-green-600/50 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
                                                + Select element from left panel to add
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {sections.length > 0 && (
                            <button onClick={addSection} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:border-green-400 hover:text-green-700 transition-all">
                                <Plus size={18} /> Add New Section
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Properties Panel */}
                <div className="w-72 flex-none bg-white border-l overflow-y-auto p-6 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    {activeSectionIdx !== null && activeFieldIdx !== null && sections[activeSectionIdx]?.fields[activeFieldIdx] ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Settings className="text-gray-400" size={20} />
                                <h3 className="font-bold text-gray-800 tracking-tight text-lg">Field Settings</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Field Label</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500 shadow-sm"
                                        value={sections[activeSectionIdx].fields[activeFieldIdx].label}
                                        onChange={(e) => updateActiveField("label", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Placeholder</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500 shadow-sm"
                                        value={sections[activeSectionIdx].fields[activeFieldIdx].placeholder}
                                        onChange={(e) => updateActiveField("placeholder", e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="req"
                                        className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                                        checked={sections[activeSectionIdx].fields[activeFieldIdx].required}
                                        onChange={(e) => updateActiveField("required", e.target.checked)}
                                    />
                                    <label htmlFor="req" className="text-sm font-semibold text-gray-700 cursor-pointer">Required Field</label>
                                </div>
                                {sections[activeSectionIdx].fields[activeFieldIdx].type === "dropdown" && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Options (Comma separated)</label>
                                        <textarea
                                            className="w-full border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500 shadow-sm"
                                            rows="3"
                                            value={sections[activeSectionIdx].fields[activeFieldIdx].options?.join(", ") || ""}
                                            onChange={(e) => updateActiveField("options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                            placeholder="Option 1, Option 2, Option 3"
                                        />
                                    </div>
                                )}
                                <div className="pt-4 border-t">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Validation Rules</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["text", "textarea"].includes(sections[activeSectionIdx].fields[activeFieldIdx].type) && (
                                            <>
                                                <input type="number" placeholder="Min Length" className="w-full border-gray-200 rounded-lg text-sm"
                                                    value={sections[activeSectionIdx].fields[activeFieldIdx].validation?.minLength || ""}
                                                    onChange={e => updateActiveField("validation.minLength", e.target.value)} />
                                                <input type="number" placeholder="Max Length" className="w-full border-gray-200 rounded-lg text-sm"
                                                    value={sections[activeSectionIdx].fields[activeFieldIdx].validation?.maxLength || ""}
                                                    onChange={e => updateActiveField("validation.maxLength", e.target.value)} />
                                            </>
                                        )}
                                        {sections[activeSectionIdx].fields[activeFieldIdx].type === "number" && (
                                            <>
                                                <input type="number" placeholder="Min Value" className="w-full border-gray-200 rounded-lg text-sm"
                                                    value={sections[activeSectionIdx].fields[activeFieldIdx].validation?.min || ""}
                                                    onChange={e => updateActiveField("validation.min", e.target.value)} />
                                                <input type="number" placeholder="Max Value" className="w-full border-gray-200 rounded-lg text-sm"
                                                    value={sections[activeSectionIdx].fields[activeFieldIdx].validation?.max || ""}
                                                    onChange={e => updateActiveField("validation.max", e.target.value)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                            <Settings size={48} className="opacity-20" />
                            <div>
                                <p className="font-semibold text-gray-500 mb-1">No Field Selected</p>
                                <p className="text-sm">Click on any field on the canvas to edit its properties.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
