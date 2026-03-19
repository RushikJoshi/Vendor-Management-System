import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Users, 
  Calendar, 
  ShieldCheck, 
  CloudUpload,
  Check,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
                toast.error('Failed to load initial data');
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
                toast.error('Please fill in title and description');
                return false;
            }
        }
        if (step === 2) {
            const invalidItems = formData.items.some(item => !item.name || !item.quantity);
            if (invalidItems) {
                toast.error('Please fill in all item details');
                return false;
            }
        }
        if (step === 3) {
            if (!formData.quoteDeadline) {
                toast.error('Submission deadline is required');
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
        const toastId = toast.loading(`${status === 'draft' ? 'Saving draft' : 'Publishing RFQ'}...`);
        try {
            const finalData = { ...formData, status };
            await api.post('/rfqs', finalData);
            toast.success(`RFQ ${status === 'draft' ? 'saved' : 'published'} successfully`, { id: toastId });
            navigate('/admin/rfqs');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const ProgressIndicator = () => (
        <div className="flex justify-between items-center mb-12 max-w-4xl mx-auto px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center flex-1 relative">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 z-10 ${
                        step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-400'
                    }`}>
                        {step > i ? <Check size={20} /> : i}
                    </div>
                    {i < 6 && (
                        <div className={`absolute left-1/2 w-full h-1 top-5 transition-all duration-500 -z-0 ${
                            step > i ? 'bg-indigo-600' : 'bg-gray-100'
                        }`}></div>
                    )}
                    <span className={`text-[10px] font-black uppercase mt-3 tracking-widest ${step >= i ? 'text-indigo-600' : 'text-gray-300'}`}>
                        {['Basic', 'Items', 'Timeline', 'Vendors', 'Terms', 'Approv'][i-1]}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-10 bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-gray-100 font-sans min-h-[700px] flex flex-col">
            <div className="text-center mb-12">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">New Procurement</span>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Request for <span className="text-indigo-600">Quotation</span></h1>
                <p className="text-gray-400 text-sm font-medium mt-2">Generate a professional RFQ and invite vendors for bidding</p>
            </div>

            <ProgressIndicator />

            <div className="flex-1">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RFQ Title</label>
                                <input 
                                    name="title" value={formData.title} onChange={handleInputChange}
                                    placeholder="e.g., Annual Server Infrastructure Upgrade" className="saas-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                                <select 
                                    name="departmentId" value={formData.departmentId} onChange={handleInputChange}
                                    className="saas-input appearance-none"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
                            <textarea 
                                name="description" value={formData.description} onChange={handleInputChange}
                                rows="5" placeholder="Specify the core objective of this procurement..." className="saas-input resize-none"
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Step 2: Requirement Details */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Bill of Materials (BOM)</h3>
                            <button onClick={addItem} className="text-indigo-600 text-[10px] font-black uppercase flex items-center gap-1 hover:underline">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all group relative">
                                    {formData.items.length > 1 && (
                                        <button onClick={() => removeItem(index)} className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <input 
                                                name="name" value={item.name} onChange={(e) => handleItemChange(index, e)}
                                                placeholder="Item/Service Name" className="w-full bg-white border-none rounded-xl py-2 px-4 shadow-sm text-sm" 
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, e)}
                                                placeholder="Qty" className="w-full bg-white border-none rounded-xl py-2 px-4 shadow-sm text-sm" 
                                            />
                                        </div>
                                        <div>
                                            <select 
                                                name="unit" value={item.unit} onChange={(e) => handleItemChange(index, e)}
                                                className="w-full bg-white border-none rounded-xl py-2 px-4 shadow-sm text-sm"
                                            >
                                                <option>Nos</option><option>Ton</option><option>Kg</option><option>Litre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <textarea 
                                        name="specifications" value={item.specifications} onChange={(e) => handleItemChange(index, e)}
                                        placeholder="Detailed specifications, brand requirements, etc."
                                        className="w-full mt-4 bg-white border-none rounded-xl py-2 px-4 shadow-sm text-sm resize-none"
                                    ></textarea>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Timeline */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="text-indigo-600" size={18} />
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Quote Submission Deadline</h3>
                                </div>
                                <input 
                                    type="date" name="quoteDeadline" value={formData.quoteDeadline} onChange={handleInputChange}
                                    className="saas-input bg-white" 
                                />
                            </div>
                            <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="text-emerald-600" size={18} />
                                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Expected Delivery Date</h3>
                                </div>
                                <input 
                                    type="date" name="deliveryDeadline" value={formData.deliveryDeadline} onChange={handleInputChange}
                                    className="saas-input bg-white" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estimated Budget (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                                    <input 
                                        name="amount" type="number" 
                                        value={formData.budget.amount} 
                                        onChange={(e) => handleInputChange(e, 'budget')}
                                        placeholder="0.00" className="saas-input pl-10" 
                                    />
                                </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Vendor Selection */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                                onClick={() => setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, type: 'open' }}))}
                                className={`p-8 rounded-3xl border-2 cursor-pointer transition-all ${
                                    formData.vendorSelection.type === 'open' ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-100 hover:border-indigo-200 bg-white'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                                    <Globe size={24} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Open Tendering</h3>
                                <p className="text-xs text-gray-400 mt-2 font-medium">Any eligible vendor in the system can bid on this RFQ.</p>
                            </div>
                            <div 
                                onClick={() => setFormData(p => ({ ...p, vendorSelection: { ...p.vendorSelection, type: 'targeted' }}))}
                                className={`p-8 rounded-3xl border-2 cursor-pointer transition-all ${
                                    formData.vendorSelection.type === 'targeted' ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-100 hover:border-indigo-200 bg-white'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Targeted Bidding</h3>
                                <p className="text-xs text-gray-400 mt-2 font-medium">Only specifically selected vendors can see and bid.</p>
                            </div>
                        </div>
                        
                        {formData.vendorSelection.type === 'targeted' && (
                            <div className="animate-in fade-in duration-300 space-y-4 pt-4 border-t border-dashed border-gray-200">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Vendors</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vendors.map(vendor => (
                                        <label key={vendor._id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
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
                                                className="w-5 h-5 rounded-lg border-gray-200 text-indigo-600 focus:ring-indigo-500" 
                                            />
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{vendor.name}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">{vendor.companyName}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 5: Terms & Attachments */}
                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px] text-center group hover:border-indigo-300 hover:bg-indigo-50/10 transition-all cursor-pointer">
                            <div className="w-20 h-20 bg-white rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50 group-hover:scale-110 transition-transform">
                                <CloudUpload className="text-indigo-600" size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Upload Attachments</h3>
                            <p className="text-sm text-gray-400 font-medium mt-2">Drop your PDFs, Images or Specs here</p>
                            <p className="text-[10px] text-indigo-400 font-black tracking-widest mt-4 uppercase">Max 10MB per file</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Terms & Conditions</label>
                            <textarea 
                                name="termsAndConditions" value={formData.termsAndConditions} onChange={handleInputChange}
                                rows="6" placeholder="Specify any contractual terms, warranty requirements, or site rules..." className="saas-input resize-none"
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Step 6: Approval */}
                {step === 6 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 flex flex-col items-center justify-center p-12">
                         <div className="w-24 h-24 bg-emerald-100 rounded-[40px] flex items-center justify-center text-emerald-600 mb-8 animate-bounce transition-all">
                                <ShieldCheck size={48} />
                            </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center">Finalizing Submission</h2>
                        <p className="text-gray-400 text-sm font-medium text-center max-w-md">The RFQ will be saved and can be triggered for internal approvals before going live to vendors.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mt-8">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Manager Approval</span>
                                <input 
                                    type="checkbox" 
                                    checked={formData.approvals.manager.required}
                                    onChange={(e) => setFormData(p => ({ ...p, approvals: { ...p.approvals, manager: { required: e.target.checked }}}))}
                                    className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 transition-all cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5" 
                                />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Finance Approval</span>
                                <input 
                                    type="checkbox" 
                                    checked={formData.approvals.finance.required}
                                    onChange={(e) => setFormData(p => ({ ...p, approvals: { ...p.approvals, finance: { required: e.target.checked }}}))}
                                    className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 transition-all cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:left-5" 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-12 mt-auto flex justify-between items-center border-t border-dashed border-gray-100">
                <div>
                    {step > 1 && (
                        <button onClick={prevStep} className="flex items-center gap-2 text-gray-500 font-bold uppercase text-xs hover:text-gray-900 transition-colors">
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleSubmit('draft')} 
                        disabled={loading}
                        className="saas-btn-secondary px-6 text-xs"
                    >
                        Save as Draft
                    </button>
                    {step < 6 ? (
                        <button onClick={nextStep} className="saas-btn-primary px-10 text-xs">
                            Continue <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleSubmit('published')} 
                            disabled={loading}
                            className="bg-emerald-600 text-white font-black px-12 py-3 rounded-2xl hover:bg-emerald-700 transition-all text-xs tracking-widest uppercase shadow-lg shadow-emerald-100"
                        >
                            {loading ? 'Processing...' : 'Publish RFQ'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Globe = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);

export default CreateRFQ;
