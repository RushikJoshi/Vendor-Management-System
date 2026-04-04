import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Layout, 
    ArrowLeft, 
    Save, 
    User, 
    ShieldCheck, 
    Mail, 
    Lock, 
    Info, 
    Settings,
    CheckCircle2
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { motion } from "framer-motion";
import {
  PERMISSION_GROUPS,
  ROLE_OPTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  normalizePermissionKey,
  sanitizePermissions,
} from "../../config/permissions";

const DEFAULT_USER = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
  permissions: [],
  status: "active"
};

export default function CreateUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState(DEFAULT_USER);

    useEffect(() => {
        if (id) {
            const fetchUser = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/v1/users/${id}`);
                    if (res.data?.success) {
                        const u = res.data.data;
                        setForm({
                            name: u.name || "",
                            email: u.email || "",
                            password: "",
                            role: String(u.role || "viewer").toLowerCase(),
                            permissions: sanitizePermissions(Array.isArray(u.permissions) ? u.permissions : []),
                            status: u.status || "active"
                        });
                    }
                } catch (err) {
                    toast.error("Failed to load user details");
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const togglePermission = (permissionKey) => {
        setForm((prev) => {
            const exists = prev.permissions.includes(permissionKey);
            return {
                ...prev,
                permissions: exists ? prev.permissions.filter((item) => item !== permissionKey) : [...prev.permissions, permissionKey],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading(id ? "Updating user profile..." : "Enforcing new user registry...");
        
        const payload = {
            ...form,
            name: form.name.trim(),
            email: form.email.trim(),
        };

        if (id && !payload.password) delete payload.password;

        try {
            if (id) {
                await api.put(`/v1/users/${id}`, payload);
                toast.success("User profile updated successfully", { id: toastId });
            } else {
                await api.post("/v1/users", payload);
                toast.success("User successfully registered in the system", { id: toastId });
            }
            navigate("/admin/users");
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20 fade-in">
            {/* COMPACT HEADER (Standard Admin Page Style) */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/admin/users")}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                            <Layout className="text-indigo-600" size={18} />
                            {id ? "User Profile Governance" : "System User Registration"}
                        </h1>
                        <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-slate-500">
                             <Info size={12} className="text-slate-400" />
                             {id ? "Review and update enterprise access control and profile identifiers." : "Register a new institutional user with granular permission schema."}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => navigate("/admin/users")}
                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                        {saving ? "Processing..." : (id ? "Save Profile" : "Register User")} <Save size={12} />
                    </button>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                
                {/* LEFT CONTENT: IDENTITY & PERMISSIONS */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Section 1: Identity & Credentials */}
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                    >
                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
                             <User size={13} className="text-indigo-600" />
                            <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.1 Identity & Credentials</h2>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <InputGroup 
                                label="Full Legal Name" 
                                name="name" 
                                value={form.name} 
                                onChange={handleChange} 
                                placeholder="Enter full name"
                                required
                            />

                            <InputGroup 
                                label="Official Email ID" 
                                name="email" 
                                type="email"
                                value={form.email} 
                                onChange={handleChange} 
                                placeholder="name@company.com"
                                required
                            />

                            <div className="md:col-span-2">
                                <InputGroup 
                                    label={id ? "Access Password Re-Initialization (Optional)" : "System Access Password"} 
                                    name="password" 
                                    type="password"
                                    value={form.password} 
                                    onChange={handleChange} 
                                    placeholder={id ? "Leave blank to maintain current credentials" : "Minimum 8 characters"}
                                    required={!id}
                                />
                                {id && <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 italic">
                                    <Info size={10} /> Password modification will override the current system registry.
                                </p>}
                            </div>
                        </div>
                    </motion.section>

                    {/* Section 3: Granular Permissions */}
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                    >
                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={13} className="text-indigo-600" />
                                <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">1.2 Operational Permissions</h2>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">Dynamic RBAC</span>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {PERMISSION_GROUPS.filter((group) =>
                                form.role === "vendor" ? group.title === "Vendor Portal" : group.title !== "Vendor Portal"
                            ).map((group) => (
                                <div key={group.title} className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                         {group.title}
                                         <span className="h-[1px] flex-1 bg-slate-50"></span>
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                        {group.items.map((permission) => {
                                            const normalizedKey = normalizePermissionKey(permission.key);
                                            const checked = form.permissions.includes(normalizedKey);
                                            return (
                                                <label 
                                                    key={normalizedKey} 
                                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all cursor-pointer ${
                                                        checked ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => togglePermission(normalizedKey)}
                                                        className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <span className={`text-[11px] font-bold leading-none ${checked ? 'text-indigo-900' : 'text-slate-600'}`}>{permission.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                <div className="space-y-4 lg:sticky lg:top-5">
                    {/* Section 2: Access & Governance */}
                    <motion.section 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                    >
                        <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
                            <Settings size={13} className="text-indigo-600" />
                            <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">Governance</h2>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Assigned Role</p>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-[13px] font-bold text-slate-900 focus:border-indigo-400 focus:bg-white outline-none transition-all shadow-sm"
                                >
                                    {ROLE_OPTIONS.map((roleOption) => (
                                        <option key={roleOption.value} value={roleOption.value}>
                                            {roleOption.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Lifecycle Status</p>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg py-2.5 px-3 text-[13px] font-extrabold outline-none transition-all shadow-sm ${
                                        form.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                                    }`}
                                >
                                    <option value="active">Active (Full Access)</option>
                                    <option value="inactive">Inactive (Restricted)</option>
                                </select>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <div className="flex items-center gap-2">
                                     <CheckCircle2 size={14} className="text-indigo-600" />
                                     <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Access Control</p>
                                </div>
                                <p className="text-[12px] text-slate-500 leading-relaxed italic">
                                    The selected role and permissions will govern the user's registry access and system capabilities.
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>

            </form>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", maxLength, className = "", required = false, disabled = false }) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                {label} {required && <span className="text-rose-500">*</span>}
            </p>
            <input
                required={required}
                disabled={disabled}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-[13px] font-bold text-slate-900 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
            />
        </div>
    );
}


