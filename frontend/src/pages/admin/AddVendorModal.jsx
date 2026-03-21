import { useState } from "react";
import Modal from "../../components/Modal";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Building2, User, Mail, Phone, MapPin, ShieldCheck, Save, X } from "lucide-react";

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
        const toastId = toast.loading("Registering new vendor...");

        try {
            await api.post("/vendors", formData);
            toast.success("Vendor registered successfully", { id: toastId });
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
            toast.error(err.response?.data?.message || "Failed to register vendor", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={<span className="text-xl font-black text-[#0F172A] tracking-tighter uppercase italic">Register_New_Service_Node</span>} size="2xl">
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-2 px-1">Primary_Liaison</h3>
                            <label className="block group">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Full Identity</span>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10B981] transition-colors" />
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Authorized Personnel Name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </div>
                            </label>

                            <label className="block group">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Secure Email</span>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10B981] transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="official@enterprise.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </div>
                            </label>

                            <label className="block group">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Operational Hotline</span>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10B981] transition-colors" />
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 [10-Digits]"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </div>
                            </label>
                        </div>

                        {/* Company Info */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-2 px-1">Organization_Baseline</h3>
                            <label className="block group">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Legal Entity Name</span>
                                <div className="relative">
                                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10B981] transition-colors" />
                                    <input
                                        required
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Full Registered Name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </div>
                            </label>

                            <label className="block group">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">GST Identification</span>
                                <div className="relative">
                                    <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10B981] transition-colors" />
                                    <input
                                        required
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="22AAAAA0000A1Z5"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all uppercase placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </div>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block group">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">City</span>
                                    <input
                                        required
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        placeholder="Ex: Mumbai"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </label>
                                <label className="block group">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">State</span>
                                    <input
                                        required
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        placeholder="Ex: MH"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <label className="block group">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Security Postal Code</span>
                        <input
                            required
                            name="address.pincode"
                            value={formData.address.pincode}
                            onChange={handleChange}
                            placeholder="6-Digit Code"
                            maxLength={6}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] font-black text-[#0F172A] focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
                        />
                    </label>

                    <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 items-center">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-12 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#0F172A] transition-colors"
                        >
                            Abort_Operation
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0F172A] text-white h-12 px-10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 disabled:opacity-50"
                        >
                            <Save size={16} /> {loading ? "Syncing..." : "Provision_Authorized_Vendor"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
