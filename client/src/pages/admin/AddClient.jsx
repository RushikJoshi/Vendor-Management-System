import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    Layout, ArrowLeft, Save, Info, Building2, User, MapPin, Search, LoaderCircle, Users
} from "lucide-react";
import { motion } from "framer-motion";
import useGstAutofill, { normalizeGstNumber } from "../../hooks/useGstAutofill";

export default function AddClient() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        gstin: "",
        address: {
            line: "",
            city: "",
            state: "",
            pincode: ""
        }
    });
    const { gstLookup, lookupGst, handleGstBlur, resetGstLookup } = useGstAutofill(setFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = name === "gstin" ? normalizeGstNumber(value) : value;

        if (name === "gstin") {
            resetGstLookup();
        }

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: nextValue
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: nextValue }));
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.companyName || !formData.name || !formData.email || !formData.phone) {
            return toast.error("Please fill out all required fields.");
        }

        setLoading(true);
        const toastId = toast.loading("Creating client profile...");

        try {
            // Combine address parts into a single string for the Client model
            const addressParts = [
                formData.address.line, 
                formData.address.city, 
                formData.address.state, 
                formData.address.pincode
            ].filter(Boolean).join(", ");

            const payload = {
                ...formData,
                address: addressParts
            };

            await api.post("/clients", payload);
            toast.success("Client added successfully", { id: toastId });
            navigate("/admin/sales/clients");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add client", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 pb-20 fade-in">
            {/* COMPACT HEADER */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        type="button"
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                            <Users className="text-indigo-600" size={18} />
                            Add New Client
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500">
                            <div className="flex items-center gap-1 text-[12px] font-medium">
                                <Info size={12} className="text-slate-400" />
                                Create a new client profile for sales and CRM.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Client"} <Save size={12} />
                    </button>
                </div>
            </motion.div>

            {/* CONTENT SECTIONS */}
            <form onSubmit={handleSubmit} className="grid gap-4">
                {/* Section 1: Company Details */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <Building2 size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide">1.1 Company Basic Details</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        <InputGroup 
                            label="Company / Trade Name" 
                            name="companyName" 
                            value={formData.companyName} 
                            onChange={handleChange} 
                            placeholder="Enter full trade name"
                            required
                        />

                        <div className="space-y-2 lg:col-span-2">
                            <div className="flex items-end gap-3 max-w-md">
                                <div className="flex-1">
                                    <InputGroup 
                                        label="GSTIN (Optional but Recommended)" 
                                        name="gstin" 
                                        value={formData.gstin} 
                                        onChange={handleChange}
                                        onBlur={() => handleGstBlur(formData.gstin)}
                                        placeholder="Enter 15-digit GSTIN"
                                        className="uppercase"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => lookupGst(formData.gstin, { force: true })}
                                    disabled={gstLookup.loading || !formData.gstin}
                                    className="h-10 shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-4 text-[12px] font-bold text-indigo-700 transition-all hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="flex items-center gap-2">
                                        {gstLookup.loading ? <LoaderCircle size={14} className="animate-spin" /> : <Search size={14} />}
                                        Fetch GST
                                    </span>
                                </button>
                            </div>
                            {gstLookup.message ? (
                                <p className={`text-[11px] font-semibold ${
                                    gstLookup.tone === "error"
                                        ? "text-rose-600"
                                        : gstLookup.tone === "success"
                                            ? "text-emerald-600"
                                            : "text-amber-600"
                                }`}>
                                    {gstLookup.message}
                                </p>
                            ) : (
                                <p className="text-[11px] font-medium text-slate-400">
                                    Fetching GST will auto-fill the address and verify company details.
                                </p>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Section 2: Contact Details */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <User size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide">1.2 Primary Contact Details</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                        <InputGroup 
                            label="Contact Person Name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="Enter full name"
                            required
                        />

                        <InputGroup 
                            label="Email Address" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="Enter email address"
                            type="email"
                            required
                        />

                        <InputGroup 
                            label="Phone Number" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="Enter mobile number"
                            required
                        />
                    </div>
                </motion.section>

                {/* Section 3: Address Details */}
                <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2">
                        <MapPin size={13} className="text-indigo-600" />
                        <h2 className="text-[12px] font-bold text-slate-800 tracking-wide">1.3 Address Details</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                        <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                            <InputGroup 
                                label="Street Address / Line 1" 
                                name="address.line" 
                                value={formData.address.line} 
                                onChange={handleChange} 
                                placeholder="123 Business Rd..."
                            />
                        </div>
                        <InputGroup 
                            label="City/District" 
                            name="address.city" 
                            value={formData.address.city} 
                            onChange={handleChange} 
                            placeholder="Enter city"
                        />
                        <InputGroup 
                            label="State" 
                            name="address.state" 
                            value={formData.address.state} 
                            onChange={handleChange} 
                            placeholder="Enter state"
                        />
                        <InputGroup 
                            label="Postal Pincode" 
                            name="address.pincode" 
                            value={formData.address.pincode} 
                            onChange={handleChange} 
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                        />
                    </div>
                </motion.section>
                
                {/* Hidden submit button to allow Enter to submit */}
                <button type="submit" className="hidden">Submit</button>
            </form>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, onBlur, placeholder, type = "text", maxLength, className = "", required = false, disabled = false }) {
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
                onBlur={onBlur}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-medium text-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
            />
        </div>
    );
}
