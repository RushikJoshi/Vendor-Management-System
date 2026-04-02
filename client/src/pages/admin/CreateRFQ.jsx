import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronRight, ChevronLeft, FileText, Users, Calendar, ShieldCheck, CloudUpload, Check, Clock, Globe, Briefcase, Info, Settings, Lock, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CreateRFQ = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [departments, setDepartments] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        departmentId: '',
        description: '',
        items: [{ name: '', quantity: 1, unit: 'Nos', specifications: '' }],
        budget: { amount: '', currency: 'USD' },
        quoteDeadline: '',
        deliveryDeadline: '',
        vendorSelection: { type: 'open', targetedVendors: [] },
        termsAndConditions: '',
        approvals: { manager: { required: false }, finance: { required: false } },
        status: 'draft'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, vendorRes] = await Promise.all([
                    api.get('/departments'),
                    api.get('/vendors')
                ]);
                setDepartments(deptRes.data.data);
                setVendors(vendorRes.data.data);
            } catch (err) {
                toast.error('Protocol sync failure');
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: 1, unit: 'Nos', specifications: '' }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.title || !formData.description) {
                toast.error('Validation Error: Mission title and description required');
                return false;
            }
        }
        if (step === 2) {
            const invalidItems = formData.items.some(item => !item.name || !item.quantity);
            if (invalidItems) {
                toast.error('Validation Error: Item matrix incomplete');
                return false;
            }
        }
        if (step === 3) {
            if (!formData.quoteDeadline) {
                toast.error('Validation Error: Temporal deadline required');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (status) => {
        setLoading(true);
        const toastId = toast.loading(`Committing Asset: ${status === 'draft' ? 'Draft Registry' : 'Active Transmission'}...`);
        try {
            const finalData = { ...formData, status };
            await api.post('/rfqs', finalData);
            toast.success(`Protocol ${status === 'draft' ? 'comitted' : 'published'} successfully`, { id: toastId });
            navigate('/admin/rfqs');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Procurement Initiative</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sourcing Protocol Genesis</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4 font-sans">Initialize <span className="text-slate-400">RFQ</span></h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6 lowercase tracking-tight">Constructing a multidimensional sourcing request. Define operational parameters, material requirements, and vendor invitation levels.</p>
                    </div>
                </div>

                <div className="hidden xl:flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* ── SIDEBAR NAVIGATION ─────────────────────────────────────── */ }
                <div className="lg:col-span-1 space-y-6">
                    {[
                        { step: 1, label: 'Asset Parameters', icon: Info, desc: 'Title & description core' },
                        { step: 2, label: 'Material Matrix', icon: Layers, desc: 'BOM & specifications' },
                        { step: 3, label: 'Temporal Nodes', icon: Clock, desc: 'Deadlines & currency' },
                        { step: 4, label: 'Vendor Vector', icon: Users, desc: 'Audience selection' },
                        { step: 5, label: 'Protocol Terms', icon: ShieldCheck, desc: 'Legal & attachments' },
                        { step: 6, label: 'Commit Protocol', icon: Lock, desc: 'Finalize & transmit' },
                    ].map((item) => (
                        <div 
                            key={item.step}
                            className={`p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${
                                step === item.step ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 
                                step > item.step ? 'bg-white border-slate-100 text-slate-400' : 'bg-slate-50 border-transparent text-slate-300'
                            }`}
                        >
                             <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    step === item.step ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {step > item.step ? <Check size={18} /> : <item.icon size={18} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                    <p className={`text-[8px] font-bold uppercase mt-1 tracking-widest italic transition-colors ${step === item.step ? 'text-white/50' : 'text-slate-300'}`}>{item.desc}</p>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN CONFIGURATION CONTEXT ───────────────────────────── */ }
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium p-12 lg:p-16 min-h-[600px] flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: PARAMETERS */}
                            {step === 1 && (
                                <motion.div 
                                    key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Initiative Identity</label>
                                            <input 
                                                name="title" value={formData.title} onChange={handleInputChange}
                                                placeholder="Unified Infrastructure Cluster..." className="vms-input"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Organizational Sector</label>
                                            <select 
                                                name="departmentId" value={formData.departmentId} onChange={handleInputChange}
                                                className="vms-input appearance-none bg-slate-50 cursor-pointer"
                                            >
                                                <option value="">ALLOCATE SECTOR</option>
                                                {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Contextual Synthesis (Description)</label>
                                        <textarea 
                                            name="description" value={formData.description} onChange={handleInputChange}
                                            rows="8" placeholder="Summarize the core procurement logic, objectives, and high-level requirements..." className="vms-input resize-none py-6"
                                        ></textarea>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: MATERIAL MATRIX */}
                            {step === 2 && (
                                <motion.div 
                                    key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10 flex-1"
                                >
                                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <Layers size={20} className="text-slate-900" />
                                            <div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Bill of Materials</h3>
                                                <p className="text-[9px] text-slate-400 uppercase font-black italic tracking-widest mt-1">Total Nodes: {formData.items.length}</p>
                                            </div>
                                        </div>
                                        <button onClick={addItem} className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                            + Append Node
                                        </button>
                                    </div>

                                    <div className="space-y-6 h-[400px] pr-4 overflow-y-auto no-scrollbar">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-slate-300 transition-all group relative active:scale-[0.99] shadow-subtle">
                                                <div className="flex items-center justify-between mb-8">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Node_{index + 1}</span>
                                                    {formData.items.length > 1 && (
                                                        <button onClick={() => removeItem(index)} className="p-2 text-slate-200 hover:text-rose-600 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="md:col-span-2">
                                                        <input 
                                                            name="name" value={item.name} onChange={(e) => handleItemChange(index, e)}
                                                            placeholder="Asset Identification..." className="vms-input-small"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input 
                                                            name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, e)}
                                                            placeholder="Quantity" className="vms-input-small text-center"
                                                        />
                                                    </div>
                                                    <div>
                                                        <select 
                                                            name="unit" value={item.unit} onChange={(e) => handleItemChange(index, e)}
                                                            className="vms-input-small appearance-none bg-slate-50 text-center"
                                                        >
                                                            <option>NOS</option><option>UNITS</option><option>MT</option><option>HR</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <textarea 
                                                    name="specifications" value={item.specifications} onChange={(e) => handleItemChange(index, e)}
                                                    placeholder="Detailed technical constraints, brand protocols, and compliance requirements..."
                                                    className="w-full mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-900 transition-all resize-none shadow-inner"
                                                ></textarea>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: TEMPORAL NODES */}
                            {step === 3 && (
                                <motion.div 
                                    key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={20} className="text-slate-900" />
                                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Submission Deadline</h3>
                                            </div>
                                            <input 
                                                type="date" name="quoteDeadline" value={formData.quoteDeadline} onChange={handleInputChange}
                                                className="vms-input bg-white shadow-xl shadow-slate-100"
                                            />
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 italic ml-2">
                                                <Info size={10} /> Point of no bid ingress
                                            </p>
                                        </div>
                                        <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Clock size={20} className="text-slate-900" />
                                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Target Delivery</h3>
                                            </div>
                                            <input 
                                                type="date" name="deliveryDeadline" value={formData.deliveryDeadline} onChange={handleInputChange}
                                                className="vms-input bg-white shadow-xl shadow-slate-100"
                                            />
                                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 italic ml-2">
                                                <Info size={10} /> Expected fulfillment horizon
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-6 p-10 bg-slate-900 rounded-[2.5rem] shadow-2xl">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Estimated Capital Commitment (Optional)</label>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1 relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black group-hover:text-emerald-400 transition-colors">$</span>
                                                <input 
                                                    name="amount" type="number" 
                                                    value={formData.budget.amount} 
                                                    onChange={(e) => handleInputChange(e, 'budget')}
                                                    placeholder="0.00" className="w-full pl-12 pr-6 py-6 bg-white/5 border border-white/10 rounded-2xl text-lg font-black text-white focus:border-emerald-500 outline-none transition-all placeholder-white/20"
                                                />
                                            </div>
                                            <div className="w-24 px-4 py-6 bg-white/5 border border-white/10 rounded-2xl text-center text-white font-black text-xs uppercase tracking-widest shadow-inner">
                                                USD_ARCH
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: VENDOR VECTOR */}
                            {step === 4 && (
                                <motion.div 
                                    key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10 flex-1"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div 
                                            onClick={() => setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, type: 'open' }}))}
                                            className={`p-10 rounded-[3rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden relative group active:scale-[0.98] ${
                                                formData.vendorSelection.type === 'open' ? 'border-slate-900 bg-slate-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                                <Globe size={80} />
                                            </div>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors shadow-subtle ${
                                                formData.vendorSelection.type === 'open' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                                <Globe size={24} />
                                            </div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-3">Open Ingress</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Broadcast to the global registry nodes. All verified vendors with matching capabilities may submit bids.</p>
                                        </div>
                                        <div 
                                            onClick={() => setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, type: 'targeted' }}))}
                                            className={`p-10 rounded-[3rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden relative group active:scale-[0.98] ${
                                                formData.vendorSelection.type === 'targeted' ? 'border-slate-900 bg-slate-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                                <Users size={80} />
                                            </div>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors shadow-subtle ${
                                                formData.vendorSelection.type === 'targeted' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                                <Users size={24} />
                                            </div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-3">Targeted Link</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Direct synchronization with selected entities. Invitation-only bidding channel for specific partners.</p>
                                        </div>
                                    </div>

                                    {formData.vendorSelection.type === 'targeted' && (
                                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-8 h-[350px] overflow-auto no-scrollbar shadow-inner">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center border-b border-slate-200 pb-6">Entity Selection Matrix</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {vendors.map(vendor => (
                                                    <label 
                                                        key={vendor._id} 
                                                        className={`flex items-center gap-6 p-6 rounded-2xl cursor-pointer transition-all border group relative active:scale-[0.99] ${
                                                            formData.vendorSelection.targetedVendors.includes(vendor._id) 
                                                                ? 'bg-slate-900 border-slate-900 shadow-xl' 
                                                                : 'bg-white border-slate-100 hover:border-slate-900'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.vendorSelection.targetedVendors.includes(vendor._id)}
                                                            onChange={() => {
                                                                const current = formData.vendorSelection.targetedVendors;
                                                                const updated = current.includes(vendor._id) 
                                                                    ? current.filter(id => id !== vendor._id)
                                                                    : [...current, vendor._id];
                                                                setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, targetedVendors: updated }}));
                                                            }}
                                                            className="hidden" 
                                                        />
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${
                                                            formData.vendorSelection.targetedVendors.includes(vendor._id) ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'
                                                        }`}>
                                                            {vendor.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs font-black uppercase tracking-tight transition-colors ${formData.vendorSelection.targetedVendors.includes(vendor._id) ? 'text-white' : 'text-slate-900'}`}>{vendor.name}</p>
                                                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 italic transition-colors ${formData.vendorSelection.targetedVendors.includes(vendor._id) ? 'text-white/40' : 'text-slate-300'}`}>{vendor.companyName}</p>
                                                        </div>
                                                        {formData.vendorSelection.targetedVendors.includes(vendor._id) && (
                                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-400"><Check size={18} /></div>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                             {/* STEP 5: TERMS & ATTACHMENTS */}
                             {step === 5 && (
                                <motion.div 
                                    key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                    <div className="p-16 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center group hover:border-slate-900 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                                            <CloudUpload size={120} />
                                        </div>
                                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform relative z-10">
                                            <CloudUpload className="text-slate-900" size={36} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight relative z-10">Upload Protocol Assets</h3>
                                        <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest relative z-10">Inject PDFs, blueprints, or technical spec artifacts</p>
                                        <div className="mt-8 flex justify-center gap-2 relative z-10">
                                             <span className="px-4 py-1.5 bg-white rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-subtle border border-slate-50">MAX_10MB_NODES</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Protocol Terms & Structural Conditions</label>
                                        <textarea 
                                            name="termsAndConditions" value={formData.termsAndConditions} onChange={handleInputChange}
                                            rows="8" placeholder="Specify global contractual terms, regional warranty requirements, and operational site rules..." className="vms-input resize-none py-6 shadow-inner"
                                        ></textarea>
                                    </div>
                                </motion.div>
                            )}

                             {/* STEP 6: COMMIT PROTOCOL */}
                             {step === 6 && (
                                <motion.div 
                                    key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1 flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-32 h-32 bg-slate-900 rounded-[3rem] flex items-center justify-center text-white mb-10 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] relative">
                                        <div className="absolute inset-2 border border-white/20 rounded-[2.5rem] border-dashed animate-spin-slow"></div>
                                        <ShieldCheck size={56} />
                                    </div>
                                    <div className="space-y-4 max-w-xl">
                                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Authorization Hub</h2>
                                        <p className="text-sm font-medium text-slate-500 italic lowercase tracking-tight">The sourcing initiative is constructed. Define the internal approval vectors required before global transmission.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mt-8">
                                        <div onClick={() => setFormData(p => ({ ...p, approvals: { ...p.approvals, manager: { required: !p.approvals.manager.required }}}))} className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all cursor-pointer group active:scale-[0.98] ${formData.approvals.manager.required ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${formData.approvals.manager.required ? 'text-white' : 'text-slate-400'}`}>Department Lead</span>
                                                <span className={`text-[8px] font-bold uppercase tracking-[0.1em] ${formData.approvals.manager.required ? 'text-white/40' : 'text-slate-300'}`}>Manager_Approval_V1</span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full transition-all relative ${formData.approvals.manager.required ? 'bg-emerald-500' : 'bg-slate-200'} `}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.approvals.manager.required ? 'left-7 shadow-xl shadow-emerald-900' : 'left-1'} `}></div>
                                            </div>
                                        </div>
                                        <div onClick={() => setFormData(p => ({ ...p, approvals: { ...p.approvals, finance: { required: !p.approvals.finance.required }}}))} className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all cursor-pointer group active:scale-[0.98] ${formData.approvals.finance.required ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${formData.approvals.finance.required ? 'text-white' : 'text-slate-400'}`}>Finance Control</span>
                                                <span className={`text-[8px] font-bold uppercase tracking-[0.1em] ${formData.approvals.finance.required ? 'text-white/40' : 'text-slate-300'}`}>Capital_Check_V1</span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full transition-all relative ${formData.approvals.finance.required ? 'bg-emerald-500' : 'bg-slate-200'} `}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.approvals.finance.required ? 'left-7 shadow-xl shadow-emerald-900' : 'left-1'} `}></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── NAVIGATION CORE ─────────────────────────────────────────── */ }
                        <div className="mt-auto pt-12 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {step > 1 && (
                                    <button onClick={prevStep} className="flex items-center gap-3 text-slate-300 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all">
                                        <ChevronLeft size={18} /> Protocol Prev
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => handleSubmit('draft')} 
                                    disabled={loading}
                                    className="px-10 py-5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-subtle active:scale-95 disabled:opacity-30"
                                >
                                    Registry Draft
                                </button>
                                {step < 6 ? (
                                    <button onClick={nextStep} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 flex items-center gap-3 group">
                                        Advance Protocol <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleSubmit('published')} 
                                        disabled={loading}
                                        className="h-[64px] px-16 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] hover:bg-black transition-all active:scale-95 disabled:opacity-50 relative group overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-4">
                                            {loading ? 'Transmitting...' : 'Transmit Protocol'} <Check size={18} />
                                        </div>
                                        <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between px-10">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encryption Terminal Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 font-black text-[9px] uppercase tracking-widest">
                            <Activity size={12} /> Sync_Freq: 12ms
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .vms-input {
                    width: 100%;
                    padding: 1.25rem 1.5rem;
                    background-color: #F8FAFC;
                    border: 1px solid #F1F5F9;
                    border-radius: 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 900;
                    color: #0F172A;
                    transition: all 0.3s;
                    outline: none;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                }
                .vms-input:focus {
                    background-color: #FFFFFF;
                    border-color: #0F172A;
                    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
                }
                .vms-input-small {
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    background-color: #F8FAFC;
                    border: 1px solid #F1F5F9;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: #0F172A;
                    transition: all 0.3s;
                    outline: none;
                    text-transform: uppercase;
                }
                .vms-input-small:focus {
                    background-color: #FFFFFF;
                    border-color: #0F172A;
                    box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.03);
                }
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .shadow-subtle {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default CreateRFQ;
