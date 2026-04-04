import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronRight, ChevronLeft, FileText, Users, Calendar, ShieldCheck, CloudUpload, Check, Clock, Globe, Briefcase, Info, Settings, Lock, Activity, ArrowLeft
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
    const [collapsed, setCollapsed] = useState({
        s1: false,
        s2: true,
        s3: true,
        s4: true,
        s5: true,
        s6: true
    });

    const toggleCollapse = (section) => {
        setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, catRes, vendorRes] = await Promise.allSettled([
                    api.get('/departments'),
                    api.get('/categories'),
                    api.get('/vendors')
                ]);
                
                let mergedDepts = [];
                if (deptRes.status === 'fulfilled') mergedDepts = [...mergedDepts, ...deptRes.value.data.data];
                if (catRes.status === 'fulfilled') mergedDepts = [...mergedDepts, ...catRes.value.data.data];
                
                // dedupe by ID if needed
                const uniqueDepts = Array.from(new Map(mergedDepts.map(item => [item._id, item])).values());
                
                setDepartments(uniqueDepts);
                if (vendorRes.status === 'fulfilled') setVendors(vendorRes.value.data.data);
            } catch (err) {
                toast.error('Registry sync failure');
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/rfqs')}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
                        title="Return to Protocol Registry"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-black tracking-tight text-[#1e1e1e] uppercase">Sourcing Protocol Genesis</h1>
                        <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">Initialize New Request for Quotation (RFQ)</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-widest text-[#1e1e1e] uppercase">Portal Active</span>
                    <span className="h-4 w-px bg-slate-300"></span>
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">V3.0</span>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
                    
                    {/* SECTION 1: Parameters */}
                    <div className="w-full overflow-hidden transition-all rounded-2xl border border-slate-200 bg-white">
                        <div onClick={() => toggleCollapse('s1')} className="flex items-center justify-between cursor-pointer px-5 py-4 border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">{collapsed.s1 ? "→" : "↓"}</span>
                                <span className="font-semibold tracking-tight text-lg text-slate-900">1. Asset Parameters</span>
                            </div>
                        </div>
                        {!collapsed.s1 && (
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Initiative Identity (Title) <span className="text-rose-500">*</span></label>
                                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="E.g. Unified Infrastructure Cluster" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Strategic Category / Department <span className="text-rose-500">*</span></label>
                                    <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                                        <option value="">Select Classification</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Contextual Synthesis (Description) <span className="text-rose-500">*</span></label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Summarize the core procurement logic..." className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* SECTION 2: Material Matrix */}
                    <div className="w-full overflow-hidden transition-all rounded-2xl border border-slate-200 bg-white mt-4">
                        <div onClick={() => toggleCollapse('s2')} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">{collapsed.s2 ? "→" : "↓"}</span>
                                <span className="font-semibold tracking-tight text-lg text-slate-900">2. Material Matrix (Items)</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); addItem(); }} className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors border border-blue-200">
                                + Add Item Node
                            </button>
                        </div>
                        {!collapsed.s2 && (
                            <div className="p-5 space-y-4">
                                {formData.items.map((item, index) => (
                                <div key={index} className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 relative">
                                    {formData.items.length > 1 && (
                                        <button onClick={() => removeItem(index)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pr-8">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[11px] font-semibold text-slate-600">Item Name</label>
                                            <input name="name" value={item.name} onChange={(e) => handleItemChange(index, e)} placeholder="Asset identification" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-slate-600">Quantity</label>
                                            <input name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, e)} placeholder="Qty" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-slate-600">Unit</label>
                                            <select name="unit" value={item.unit} onChange={(e) => handleItemChange(index, e)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400">
                                                <option value="Nos">Nos</option>
                                                <option value="Ton">Ton</option>
                                                <option value="Kg">Kg</option>
                                                <option value="Litre">Litre</option>
                                                <option value="Meter">Meter</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-4 space-y-1">
                                            <label className="text-[11px] font-semibold text-slate-600">Specifications</label>
                                            <textarea name="specifications" value={item.specifications} onChange={(e) => handleItemChange(index, e)} placeholder="Detailed technical specifications..." rows="2" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* SECTION 3: Temporal Nodes */}
                    <div className="w-full overflow-hidden transition-all rounded-2xl border border-slate-200 bg-white mt-4">
                        <div onClick={() => toggleCollapse('s3')} className="flex items-center justify-between cursor-pointer px-5 py-4 border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">{collapsed.s3 ? "→" : "↓"}</span>
                                <span className="font-semibold tracking-tight text-lg text-slate-900">3. Temporal & Financial Targets</span>
                             </div>
                        </div>
                        {!collapsed.s3 && (
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Submission Deadline <span className="text-rose-500">*</span></label>
                                    <input type="date" name="quoteDeadline" value={formData.quoteDeadline} onChange={handleInputChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Target Delivery Date <span className="text-rose-500">*</span></label>
                                    <input type="date" name="deliveryDeadline" value={formData.deliveryDeadline} onChange={handleInputChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Estimated Budget (USD)</label>
                                    <input name="amount" type="number" value={formData.budget.amount} onChange={(e) => handleInputChange(e, 'budget')} placeholder="0.00" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
                                </div>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* SECTION 4: Vendor Vector */}
                    <div className="w-full overflow-hidden transition-all rounded-2xl border border-slate-200 bg-white mt-4">
                        <div onClick={() => toggleCollapse('s4')} className="flex items-center justify-between cursor-pointer px-5 py-4 border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">{collapsed.s4 ? "→" : "↓"}</span>
                                <span className="font-semibold tracking-tight text-lg text-slate-900">4. Vendor Selection</span>
                             </div>
                        </div>
                        {!collapsed.s4 && (
                            <div className="p-5 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.vendorSelection.type === 'open' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <input type="radio" name="vendorType" className="hidden" checked={formData.vendorSelection.type === 'open'} onChange={() => setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, type: 'open' }}))} />
                                    <div className="font-bold text-slate-900 mb-1">Open Ingress</div>
                                    <div className="text-xs text-slate-500">Broadcast to all verified global registry nodes.</div>
                                </label>
                                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.vendorSelection.type === 'targeted' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <input type="radio" name="vendorType" className="hidden" checked={formData.vendorSelection.type === 'targeted'} onChange={() => setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, type: 'targeted' }}))} />
                                    <div className="font-bold text-slate-900 mb-1">Targeted Link</div>
                                    <div className="text-xs text-slate-500">Directly invite specific registered vendors only.</div>
                                </label>
                            </div>

                            {formData.vendorSelection.type === 'targeted' && (
                                <div className="p-5 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                                    <label className="text-xs font-semibold tracking-wide text-slate-700">Select Vendors</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                                        {vendors.map(vendor => (
                                            <label key={vendor._id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                                                <input 
                                                    type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                    checked={formData.vendorSelection.targetedVendors.includes(vendor._id)}
                                                    onChange={() => {
                                                        const current = formData.vendorSelection.targetedVendors;
                                                        const updated = current.includes(vendor._id) ? current.filter(id => id !== vendor._id) : [...current, vendor._id];
                                                        setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, targetedVendors: updated }}));
                                                    }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{vendor.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{vendor.companyName}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>

                    {/* SECTION 5: Protocols & Attachments */}
                    <div className="w-full overflow-hidden transition-all rounded-2xl border border-slate-200 bg-white mt-4">
                        <div onClick={() => toggleCollapse('s5')} className="flex items-center justify-between cursor-pointer px-5 py-4 border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">{collapsed.s5 ? "→" : "↓"}</span>
                                <span className="font-semibold tracking-tight text-lg text-slate-900">5. Protocol Terms</span>
                             </div>
                        </div>
                        {!collapsed.s5 && (
                            <div className="p-5">
                                <div className="space-y-1 mb-6">
                                <label className="text-xs font-semibold tracking-wide text-slate-700">File Attachments</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                                    <CloudUpload size={32} className="mb-2" />
                                    <span className="text-sm font-semibold">Click or drag files to upload</span>
                                    <span className="text-xs">Supports PDF, DOCX, ZIP (Max 10MB)</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold tracking-wide text-slate-700">Terms & Conditions</label>
                                <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handleInputChange} rows="5" placeholder="Specify global contractual terms..." className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 resize-none"></textarea>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* SECTION 6: Commitment */}
                    <div className="w-full overflow-hidden transition-all rounded-2xl border border-slate-200 bg-white mt-4">
                        <div onClick={() => toggleCollapse('s6')} className="flex items-center justify-between cursor-pointer px-5 py-4 border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">{collapsed.s6 ? "→" : "↓"}</span>
                                <span className="font-semibold tracking-tight text-lg text-slate-900">6. Required Approvals</span>
                             </div>
                        </div>
                        {!collapsed.s6 && (
                            <div className="p-5">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.approvals.manager.required ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <div>
                                        <div className="font-bold text-slate-900 mb-1">Department Lead Approval</div>
                                        <div className="text-xs text-slate-500">Requires line manager sign-off.</div>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" checked={formData.approvals.manager.required} onChange={() => setFormData(p => ({ ...p, approvals: { ...p.approvals, manager: { required: !p.approvals.manager.required }}}))} />
                                </label>
                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.approvals.finance.required ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <div>
                                        <div className="font-bold text-slate-900 mb-1">Finance Control Approval</div>
                                        <div className="text-xs text-slate-500">Requires capital check clearance.</div>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" checked={formData.approvals.finance.required} onChange={() => setFormData(p => ({ ...p, approvals: { ...p.approvals, finance: { required: !p.approvals.finance.required }}}))} />
                                </label>
                            </div>
                        </div>
                        )}
                    </div>

                </div>
            </main>

            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-8 sticky bottom-0 z-40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                    <button onClick={() => handleSubmit('draft')} disabled={loading} className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50">
                        Registry Draft
                    </button>
                    <button onClick={() => handleSubmit('published')} disabled={loading} className="w-full sm:w-auto rounded-lg bg-blue-700 px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-700/30 transition-all hover:bg-blue-800 disabled:opacity-60 flex items-center gap-2">
                        {loading ? 'Transmitting...' : 'Transmit Protocol'} <Check size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRFQ;
