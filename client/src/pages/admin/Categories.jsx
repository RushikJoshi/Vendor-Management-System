import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Tag, Layout, ArrowLeft, Save, Check, XCircle } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data);
        } catch (err) {
            toast.error("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editing ? "Updating category..." : "Creating category...");
        try {
            if (editing) {
                await api.put(`/categories/${editing._id}`, formData);
                toast.success("Category updated successfully", { id: toastId });
            } else {
                await api.post("/categories", formData);
                toast.success("Category created successfully", { id: toastId });
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ name: "", description: "", status: "active" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save category", { id: toastId });
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setFormData({
            name: cat.name,
            description: cat.description || "",
            status: cat.status || "active",
        });
        setShowModal(true);
    };

    if (showModal) {
        return (
            <div className="space-y-4 pb-20 fade-in">
                {/* COMPACT HEADER (Matches AddVendor Template) */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                                <Tag className="text-indigo-600" size={18} />
                                {editing ? 'Edit Vendor Category' : 'Register New Vendor Category'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500">
                                <div className="flex items-center gap-1 text-[12px] font-medium">
                                    <Tag size={12} className="text-slate-400" />
                                    Please fill out the category definition exactly as per official logic.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Category"} <Save size={12} />
                        </button>
                    </div>
                </motion.div>

                {/* CONTENT SECTIONS: Compact Grid matching AddVendor */}
                <div className="grid gap-4">
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                    >
                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                            <Tag size={13} className="text-indigo-600" />
                            <h2 className="text-[12px] font-bold text-slate-800 tracking-wide">1.1 Category Core Details</h2>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                            <InputGroup 
                                label="Official Category Name" 
                                name="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter full category name"
                                required
                            />

                            <div className="flex flex-col gap-1 md:col-span-2">
                                <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                    Operational Description
                                </p>
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300 min-h-[42px]"
                                    placeholder="Enter operational definition..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                                    Status
                                </p>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 outline-none transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active Classification</option>
                                    <option value="inactive">Inactive / Deprecated</option>
                                </select>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* COMPACT HEADER (Matches AddVendor style) */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                        <Layout className="text-indigo-600" size={20} />
                        Vendor Categories
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Manage global vendor categories for onboarding operations
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            setEditing(null);
                            setFormData({ name: "", description: "", status: "active" });
                            setShowModal(true);
                        }}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-sm shadow-indigo-200"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </motion.div>

            {/* TABLE SECTION */}
            <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
                <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                        <Tag size={16} className="text-indigo-500" />
                        <span>Registry: {categories.length} Categories</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">Category Name</th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-6"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                                        <td className="p-6"><div className="h-4 w-64 bg-slate-100 rounded"></div></td>
                                        <td className="p-6"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                                        <td className="p-6 text-right"><div className="h-8 w-20 bg-slate-100 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                                                <Tag size={14} />
                                            </div>
                                            <span className="text-[14px] font-bold text-slate-900">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[13px] font-medium text-slate-500 max-w-md line-clamp-1">{cat.description || 'No description provided'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={cat.status || "inactive"} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(cat)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                                                title="Edit Category"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm("Are you sure you want to delete this category?")) {
                                                        const toastId = toast.loading("Deleting...");
                                                        api.delete(`/categories/${cat._id}`).then(() => {
                                                            toast.success("Deleted", { id: toastId });
                                                            fetchData();
                                                        }).catch(() => toast.error("Failed to delete", { id: toastId }));
                                                    }
                                                }}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                                                title="Delete Category"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-[13px] font-medium">
                                        No categories found. Click 'Add Category' to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", required = false, disabled = false }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none mb-1">
                {label} {required && <span className="text-rose-500">*</span>}
            </p>
            <input
                required={required}
                disabled={disabled}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
            />
        </div>
    );
}
