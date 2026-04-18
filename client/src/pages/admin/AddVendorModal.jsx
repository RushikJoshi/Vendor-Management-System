import { useState } from "react";
import Modal from "../../components/Modal";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    Building2, User, Mail, Phone, ShieldCheck, Save, X, Globe, 
    Landmark, Target, MapPin, Briefcase, Plus, Layout, Info, Search, LoaderCircle
} from "lucide-react";
import useGstAutofill, { normalizeGstNumber } from "../../hooks/useGstAutofill";

export default function AddVendorModal({ open, onClose, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        gstNumber: "",
        address: {
            city: "",
            state: "",
            pincode: ""
        }
    });
    const { gstLookup, lookupGst, handleGstBlur, resetGstLookup } = useGstAutofill(setFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = name === "gstNumber" ? normalizeGstNumber(value) : value;

        if (name === "gstNumber") {
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
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Processing vendor registration...");

        try {
            await api.post("/vendors", formData);
            toast.success("Vendor successfully registered", { id: toastId });
            onRefresh();
            onClose();
            setFormData({
                name: "",
                email: "",
                phone: "",
                companyName: "",
                gstNumber: "",
                address: { city: "", state: "", pincode: "" }
            });
            resetGstLookup();
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <Plus size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Onboard New Vendor</h2>
                        <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Secure Partner Provisioning</p>
                    </div>
                </div>
            } 
            size="3xl"
        >
            <div className="p-0">
                <form onSubmit={handleSubmit}>
                    {/* Information Alert */}
                    <div className="mx-6 mt-6 mb-8 flex items-center gap-4 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50 text-indigo-700">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-indigo-100">
                            <Info size={18} />
                        </div>
                        <p className="text-[13px] font-medium leading-relaxed">
                            Initialize a new vendor node in the master registry. Ensure all fiscal and contact details match official documents for immediate verification.
                        </p>
                    </div>

                    <div className="px-6 space-y-10 pb-10">
                        {/* Section 1: Company Profile */}
                        <section>
                            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Building2 size={16} className="text-indigo-600" />
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Company & Fiscal Profile</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup 
                                    label="Legal Company Name" 
                                    icon={Building2} 
                                    name="companyName" 
                                    value={formData.companyName} 
                                    onChange={handleChange} 
                                    placeholder="Registered Trade Name"
                                    required
                                />

                                <div className="space-y-2">
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <InputGroup 
                                                label="Tax Identification (GST)" 
                                                icon={ShieldCheck} 
                                                name="gstNumber" 
                                                value={formData.gstNumber} 
                                                onChange={handleChange}
                                                onBlur={() => handleGstBlur(formData.gstNumber)}
                                                placeholder="GSTIN - 15 Characters"
                                                className="uppercase"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => lookupGst(formData.gstNumber, { force: true })}
                                            disabled={gstLookup.loading}
                                            className="h-12 shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-[12px] font-bold uppercase tracking-wide text-indigo-700 transition-all hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                                            API key ho to legal name/address auto-fill hoga. Warna GSTIN se state jaise basics milenge.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Contact Liaison */}
                        <section>
                            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User size={16} className="text-emerald-600" />
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Primary Contact Liaison</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <InputGroup 
                                        label="Full Name" 
                                        icon={User} 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        placeholder="Contact Person"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <InputGroup 
                                        label="Email Address" 
                                        icon={Mail} 
                                        name="email" 
                                        type="email"
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <InputGroup 
                                        label="Phone Number" 
                                        icon={Phone} 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="+91-0000000000"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Geographic Node */}
                        <section>
                            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <MapPin size={16} className="text-blue-600" />
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Service Location Detail</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup 
                                    label="Operating City" 
                                    name="address.city" 
                                    value={formData.address.city} 
                                    onChange={handleChange} 
                                    placeholder="Ex: Mumbai"
                                    required
                                />
                                <InputGroup 
                                    label="Region / State" 
                                    name="address.state" 
                                    value={formData.address.state} 
                                    onChange={handleChange} 
                                    placeholder="Ex: MH"
                                    required
                                />
                                <InputGroup 
                                    label="Postal Pincode" 
                                    name="address.pincode" 
                                    value={formData.address.pincode} 
                                    onChange={handleChange} 
                                    placeholder="6-Digit Code"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/80 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white border border-slate-200 px-6 h-12 rounded-xl text-[12px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white h-12 px-10 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Save size={16} /> 
                                    Create Vendor
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function InputGroup({ label, icon: Icon, name, value, onChange, onBlur, placeholder, type = "text", maxLength, className = "", required = false }) {
    return (
        <label className="block group">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">{label} {required && <span className="text-rose-500">*</span>}</span>
            <div className="relative">
                {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />}
                <input
                    required={required}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className={`w-full bg-white border border-slate-200 rounded-xl py-3 ${Icon ? 'pl-11' : 'px-4'} pr-4 text-[14px] font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:font-semibold placeholder:text-slate-300 ${className}`}
                />
            </div>
        </label>
    );
}
