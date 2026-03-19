import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, ShieldCheck, Tag, FileText, Sparkles, Loader2 } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import axios from "axios";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formTemplates, setFormTemplates] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        formTemplate: "",
        isActive: true,
    });

    const fetchData = async () => {
        try {
            const [catRes, tempRes] = await Promise.all([
                api.get("/categories"),
                api.get("/forms/published"),
            ]);
            setCategories(catRes.data.data);
            setFormTemplates(tempRes.data.data);
        } catch (err) {
            toast.error("Resource acquisition failure");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ✨ AI Auto-fill Handler
    const handleAIGenerate = async () => {
        if (!formData.name.trim()) {
            toast.error("Please enter a Segment Name first to generate with AI.");
            return;
        }
        setAiLoading(true);
        const toastId = toast.loading("AI is generating category details...");
        try {
            const response = await axios.post(
                "http://localhost:5000/api/category/generate-ai",
                { segmentName: formData.name.trim() },
                { headers: { "Content-Type": "application/json" } }
            );

            const aiData = response.data?.data;

            if (!aiData) {
                toast.error("AI returned empty data.", { id: toastId });
                return;
            }

            setFormData(prev => ({
                ...prev,
                code: aiData.uniqueCode || prev.code,
                description: aiData.description || prev.description,
            }));

            toast.success("AI auto-fill complete!", { id: toastId });
        } catch (err) {
            console.error("[AI Error]:", err);
            toast.error(err.response?.data?.message || "AI generation failed.", { id: toastId });
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Updating taxonomy...");
        try {
            if (editing) {
                await api.put(`/categories/${editing._id}`, formData);
                toast.success("Strategic category updated", { id: toastId });
            } else {
                await api.post("/categories", formData);
                toast.success("New category registered", { id: toastId });
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ name: "", code: "", description: "", formTemplate: "", isActive: true });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Configuration error", { id: toastId });
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setFormData({
            name: cat.name,
            code: cat.code,
            description: cat.description,
            formTemplate: cat.formTemplate?._id || "",
            isActive: cat.isActive,
        });
        setShowModal(true);
    };

    const headers = ["Category Definition", "Asset Code", "Assigned Protocol", "Operational Status", "Actions"];

    return (
        <div className="space-y-6 fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-corp-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tighter">Operational Segments</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Management of Infrastructure Procurement Categories</p>
                </div>

                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: "", code: "", description: "", formTemplate: "", isActive: true });
                        setShowModal(true);
                    }}
                    className="btn-enterprise-primary flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} /> Define Segment
                </button>
            </header>

            <Table
                headers={headers}
                data={categories}
                loading={loading}
                renderRow={(cat) => (
                    <>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 border border-gray-200 rounded-[4px] text-corp-secondary">
                                    <Tag size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-900 font-bold text-xs uppercase tracking-tight">{cat.name}</p>
                                    <p className="text-gray-400 text-[10px] font-medium mt-0.5 line-clamp-1 italic">{cat.description}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-[4px] text-[10px] font-bold border border-gray-200 shadow-sm">
                                {cat.code}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-corp-dark font-bold text-[11px] uppercase tracking-wider">
                                <FileText size={14} className="text-gray-300" />
                                {cat.formTemplate?.name || cat.formTemplate?.title || "No Assigned Form"}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <StatusBadge status={cat.isActive ? "active" : "locked"} />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(cat)}
                                    className="p-2 bg-white border border-gray-200 rounded-[4px] text-gray-400 hover:text-corp-dark hover:border-corp-dark transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 bg-white border border-gray-200 rounded-[4px] text-gray-200 hover:text-rose-600 hover:border-rose-600 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </>
                )}
            />

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editing ? "Update Segment Logic" : "Configure New Category"}
                size="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ✨ AI Auto-fill Strip */}
                    <div style={{
                        background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%)",
                        border: "1.5px solid #bfdbfe",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px"
                    }}>
                        <div>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                                ✨ AI Auto-Fill
                            </p>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
                                Enter Segment Name above → click to auto-fill Code & Description
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={aiLoading}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: aiLoading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "12px",
                                cursor: aiLoading ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                fontFamily: "inherit",
                            }}
                        >
                            {aiLoading
                                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                                : <Sparkles size={13} />
                            }
                            {aiLoading ? "Generating..." : "Generate with AI"}
                        </button>
                    </div>

                    {/* Segment Name + Code */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Segment Name</label>
                            <input
                                type="text"
                                required
                                className="input-enterprise font-bold"
                                placeholder="e.g. Electrical Infra"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Unique Identification Code
                                {formData.code && (
                                    <span style={{ marginLeft: "6px", color: "#16a34a", fontSize: "9px" }}>✓ AI Filled</span>
                                )}
                            </label>
                            <input
                                type="text"
                                required
                                className="input-enterprise font-bold uppercase"
                                placeholder="e.g. ELEC-01"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Technical Scope Description
                            {formData.description && (
                                <span style={{ marginLeft: "6px", color: "#16a34a", fontSize: "9px" }}>✓ AI Filled</span>
                            )}
                        </label>
                        <textarea
                            className="input-enterprise font-medium min-h-[80px]"
                            placeholder="Briefly define segment responsibilities..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Form Template */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mandatory Registration Protocol</label>
                        <select
                            required
                            className="input-enterprise font-bold appearance-none bg-white"
                            value={formData.formTemplate}
                            onChange={(e) => setFormData({ ...formData, formTemplate: e.target.value })}
                        >
                            <option value="">Select a form protocol...</option>
                            {formTemplates.map((t) => (
                                <option key={t._id} value={t._id}>{t.name || t.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-3 py-2 bg-gray-50 px-4 rounded-[6px] border border-gray-100">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 accent-corp-dark"
                        />
                        <label htmlFor="isActive" className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Set as Active Operational Segment</label>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button type="submit" className="w-full btn-enterprise-primary py-3 flex items-center justify-center gap-3">
                            <ShieldCheck size={18} /> Commit Configuration to Registry
                        </button>
                    </div>
                </form>

                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </Modal>
        </div>
    );
}
