import { useState } from "react";
import Modal from "../../components/Modal";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Building2, User, Mail, Phone, ShieldCheck, Save, X, Globe, Landmark, Target } from "lucide-react";

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Executing security handshake...");

        try {
            await api.post("/vendors", formData);
            toast.success("Authorized Vendor Synchronized", { id: toastId });
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
        } catch (err) {
            toast.error(err.response?.data?.message || "Data Synchronization Failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                        <Plus size={18} />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest leading-none">Initialize Registry Node</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic leading-none">Secure Authorized Partner Provisioning</p>
                    </div>
                </div>
            } 
            size="3xl"
        >
            <div className="p-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        {/* Liaison Section */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Target size={12} /> Primary_Liaison_Handshake
                            </h3>
                            
                            <InputGroup 
                                label="Authorized Identity" 
                                icon={User} 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="Full Personnel Name"
                                required
                            />

                            <InputGroup 
                                label="Secure Communication" 
                                icon={Mail} 
                                name="email" 
                                type="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="official@enterprise.com"
                                required
                            />

                            <InputGroup 
                                label="Operational Hotline" 
                                icon={Phone} 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="+91 [10-Digits]"
                                required
                            />
                        </div>

                        {/* Organization Section */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Landmark size={12} /> Organization_Baseline_Validation
                            </h3>

                            <InputGroup 
                                label="Legal Entity Matrix" 
                                icon={Building2} 
                                name="companyName" 
                                value={formData.companyName} 
                                onChange={handleChange} 
                                placeholder="Full Registered Name"
                                required
                            />

                            <InputGroup 
                                label="Tax Authentication" 
                                icon={ShieldCheck} 
                                name="gstNumber" 
                                value={formData.gstNumber} 
                                onChange={handleChange} 
                                placeholder="GSTIN Identifier"
                                className="uppercase"
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup 
                                    label="Node City" 
                                    name="address.city" 
                                    value={formData.address.city} 
                                    onChange={handleChange} 
                                    placeholder="Ex: Mumbai"
                                    required
                                />
                                <InputGroup 
                                    label="Regional Segment" 
                                    name="address.state" 
                                    value={formData.address.state} 
                                    onChange={handleChange} 
                                    placeholder="Ex: MH"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex-1 max-w-sm">
                            <InputGroup 
                                label="Registry Postal Code" 
                                name="address.pincode" 
                                value={formData.address.pincode} 
                                onChange={handleChange} 
                                placeholder="6-Digit Auth Code"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div className="flex gap-4 items-center">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                            >
                                Abort_Operation
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 text-white h-12 px-10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 disabled:opacity-50"
                            >
                                <Save size={16} /> 
                                {loading ? "Syncing Logic..." : "Commit_Authorized_Node"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function InputGroup({ label, icon: Icon, name, value, onChange, placeholder, type = "text", maxLength, className = "", required = false }) {
    return (
        <label className="block group">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">{label} {required && "*"}</span>
            <div className="relative">
                {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />}
                <input
                    required={required}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className={`w-full bg-white border border-slate-200 rounded-xl py-3 ${Icon ? 'pl-10' : 'px-4'} pr-4 text-[13px] font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-200 ${className}`}
                />
            </div>
        </label>
    );
}

const Plus = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14m-7-7v14" />
    </svg>
);
