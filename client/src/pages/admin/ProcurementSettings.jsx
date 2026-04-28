import { useState, useEffect, useRef, useMemo } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import Draggable from "react-draggable";
import { 
    Settings, Save, Building, FileText, List, 
    Palette, Type, Layout, Eye, Image as ImageIcon,
    CheckCircle2, AlertCircle, Maximize2, MoveVertical, Droplets, Shield,
    GripVertical, MousePointer2, RefreshCcw, Trash2,
    Square, Circle, Minus, Star, Award, PenTool, ShieldCheck, Box,
    Heart, Bell, Flag, MapPin, Phone, Mail, Globe, Lock, Unlock,
    CheckSquare, Info, AlertTriangle, Layers, Copy, Trash, Plus,
    IndianRupee, Hash, ReceiptText, User, UserCheck, Building2, Calendar, 
    Monitor, Smartphone, Undo2, Redo2, RotateCcw, AlignLeft, CreditCard, PlusCircle, X, Upload, ChevronRight, Stamp
} from "lucide-react";

export default function ProcurementSettings() {
    const [settings, setSettings] = useState({
        companyName: "GITAKSHMI TECHNOLOGIES PRIVATE LIMITED",
        companyAddress: "OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX, OFF C.G. ROAD, AMBAWADI, AHMEDABAD GJ 380006",
        gstNumber: "24AAICG0391B1Z2",
        cinNumber: "U72900GJ2019PTC110363",
        panNumber: "",
        contactEmail: "accounts@gitakshmi.com",
        contactPhone: "",
        jurisdiction: "MUNDRA",
        logo: "",
        stampTopText: "GITAKSHMI TECHNOLOGIES PVT. LTD.",
        stampMiddleText: "STAMP",
        stampBottomText: "AHMEDABAD",
        poTerms: [
            { term: 'AGAINST FORM NO', desc: 'NOT APPLICABLE' },
            { term: 'TEST CERTIFICATE', desc: 'REQUIRED' },
            { term: 'TRANSPORTATION', desc: 'Included' },
            { term: 'BRAND / SUPPORT / WARRANTY', desc: 'SONY / Yes / As and when Required' }
        ],
        generalTerms: [
            "(1) Order Acceptance: Supplier should send order acceptance within three days of receipt of P.O. If the same is not received within the stipulated period it is understood that Supplier has accepted the order in totality.",
            "(2) Taxes & Duties: Supplier shall furnish to the Purchaser, GST Invoice to enable Purchaser to avail input tax credit. Supplier shall fulfill its liability of depositing GST &/or other taxes as per provision of latest notification of the Central/State Government without waiting for due payment to be received from the Purchaser.",
            "(3) Warranty: Supplier expressly warrants that all goods/ equipments/services ordered to specifications will confirm to the descriptions furnished by the Purchaser or if not ordered to specifications will be fit & sufficient for the purpose intended. All goods/ equipment/services are of good quality & workmanship and free of defects. Warranty period shall be minimum 12 months from the date of receipt at the Purchaser's Works/Plant.",
            "(4) Packing & Transport: Goods/equipment should be properly packed to avoid damage during transit and should be dispatched along with packing list giving details of Purchase Order number, Invoice Number. The cost of damaged Goods/equipment because of transit damage due to poor / faulty packing will be debited to the Supplier."
        ],
        specialInstructions: "Please send us your order acceptance immediately and in case of non- receipt of order confirmation within 3 working days, we presume that all terms & conditions mentioned in our purchase order is acceptable to you. Please send us material dispatch details on accounts@gitakshmi.com . Please mention our purchase order number & date while placing tax invoice.",
        remarks: "Please provide Serial Number in billing",
        billingAddress: "CORP. OFFICE, OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX, OFF C.G. ROAD, AMBAWADI, AHMEDABAD GJ 380006",
        deliveryAddress: "CORP. OFFICE, OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX, OFF C.G. ROAD, AMBAWADI, AHMEDABAD GJ 380006",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountName: "",
        branch: "",
        themeColor: "#1e3a8a",
        fontFamily: "Inter",
        logoSize: 64,
        authorizedSignatory: { name: "Authorized Desk", designation: "Procurement Manager" },
        showWatermark: false,
        watermarkText: "DRAFT",
        poPrefix: "PO",
        poStartNumber: 1,
        poSuffix: "",
        layoutPositions: {},
        customElements: [],
        elementStyles: {}
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState("branding"); 
    const [activeTemplate, setActiveTemplate] = useState("PO"); 
    const [canvasScale, setCanvasScale] = useState(0.7);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/procurement-settings?type=${activeTemplate}`);
                const data = res.data.data;
                if (data) {
                  const merged = { ...settings, ...data.PO || data };
                  setSettings(merged);
                }
            } catch (err) {
                toast.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [activeTemplate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/procurement-settings", { ...settings, type: activeTemplate });
            toast.success("All Document Settings Saved!");
        } catch (err) {
            toast.error("Save failed.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, logo: reader.result });
                toast.success("Logo uploaded to preview!");
            };
            reader.readAsDataURL(file);
        }
    };

    const updateTerm = (index, field, value) => {
        const newTerms = [...settings.poTerms];
        newTerms[index][field] = value;
        setSettings({ ...settings, poTerms: newTerms });
    };

    const addTerm = () => {
        setSettings({ ...settings, poTerms: [...settings.poTerms, { term: '', desc: '' }] });
    };

    const removeTerm = (index) => {
        const newTerms = settings.poTerms.filter((_, i) => i !== index);
        setSettings({ ...settings, poTerms: newTerms });
    };

    const updateGeneralTerm = (index, value) => {
        const newTerms = [...settings.generalTerms];
        newTerms[index] = value;
        setSettings({ ...settings, generalTerms: newTerms });
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-500 animate-pulse uppercase tracking-[4px]">Designer Initializing...</div>;

    return (
        <div className="h-full min-h-[calc(100vh-120px)] w-full max-w-full flex flex-col overflow-hidden bg-slate-50 border border-slate-200 rounded-[32px] shadow-sm">
            {/* TOP FIXED NAVBAR */}
            <div className="bg-white border-b border-slate-200 px-3 py-2.5 sticky top-0 z-50 w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2 w-full max-w-full">
                    <div className="flex items-center gap-2 min-w-0 flex-shrink">
                        <div className="p-1.5 bg-indigo-600 rounded-lg text-white flex-shrink-0">
                            <Settings size={16} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[12px] font-black text-slate-900 uppercase tracking-tight truncate">
                                Designer
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                         <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                             <span className="text-[8px] font-black text-slate-400 uppercase">Scale</span>
                             <input 
                                type="range" 
                                min="0.4" 
                                max="1.5" 
                                step="0.1" 
                                value={canvasScale} 
                                onChange={e => setCanvasScale(parseFloat(e.target.value))} 
                                className="w-12 lg:w-20 h-1 accent-indigo-600 appearance-none bg-slate-200 rounded-full cursor-pointer" 
                             />
                             <span className="text-[8px] font-black text-indigo-600 w-6 text-center">
                                {Math.round(canvasScale * 100)}%
                             </span>
                         </div>
                         <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                         >
                            <Save size={12} />
                            <span>{saving ? "..." : "SAVE ALL"}</span>
                         </button>
                    </div>
                </div>
            </div>

             <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR: CONFIGURATION */}
                <aside className="w-[320px] bg-white border-r border-slate-200 overflow-y-auto p-5 no-scrollbar flex flex-col gap-5 shrink-0">
                    <div className="flex w-full gap-1 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                        {['Branding', 'Document', 'Finance', 'Terms', 'Visuals', 'System'].map(m => (
                            <button 
                                key={m}
                                onClick={() => setActiveSection(m.toLowerCase())}
                                className={`px-3 py-2 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSection === m.toLowerCase() ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {activeSection === 'branding' && (
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity & Logo</label>
                                <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-[32px] h-44 bg-slate-50/50 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-white transition-all overflow-hidden shadow-inner">
                                    {settings.logo ? (
                                        <img src={settings.logo} className="h-full w-full object-contain p-8 animate-in zoom-in-95" />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-indigo-600 transition-all transform group-hover:scale-110"><Upload size={28} /></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Upload Entity Logo</p>
                                        </>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                                    {settings.logo && (
                                        <button onClick={(e) => { e.stopPropagation(); setSettings({...settings, logo: ''}); }} className="absolute top-5 right-5 p-2 bg-white text-rose-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-4 p-6 bg-indigo-50/50 border border-indigo-100 rounded-[28px]">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <Stamp size={14} /> Round Stamp Details
                                </label>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Stamp Top Text</label>
                                        <input value={settings.stampTopText} onChange={e => setSettings({...settings, stampTopText: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Middle</label>
                                            <input value={settings.stampMiddleText} onChange={e => setSettings({...settings, stampMiddleText: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Bottom</label>
                                            <input value={settings.stampBottomText} onChange={e => setSettings({...settings, stampBottomText: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Entity Details</label>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Company Name</label>
                                        <input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Contact Email</label>
                                            <input value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Contact Phone</label>
                                            <input value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Registered Address</label>
                                        <textarea value={settings.companyAddress} onChange={e => setSettings({...settings, companyAddress: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black min-h-[80px] outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'document' && (
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                            <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Addresses</label>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Billing Address</label>
                                        <textarea value={settings.billingAddress} onChange={e => setSettings({...settings, billingAddress: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black min-h-[70px] outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Delivery Address</label>
                                        <textarea value={settings.deliveryAddress} onChange={e => setSettings({...settings, deliveryAddress: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black min-h-[70px] outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Messaging</label>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Special Instructions (Page 2)</label>
                                        <textarea value={settings.specialInstructions} onChange={e => setSettings({...settings, specialInstructions: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black min-h-[100px] outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Footer Remarks (Page 1)</label>
                                        <input value={settings.remarks} onChange={e => setSettings({...settings, remarks: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'finance' && (
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                             <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tax Registrations</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">GST NO</label>
                                        <input value={settings.gstNumber} onChange={e => setSettings({...settings, gstNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">CIN NO</label>
                                        <input value={settings.cinNumber} onChange={e => setSettings({...settings, cinNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5 bg-slate-50 border border-slate-200 rounded-[24px]">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <CreditCard size={14} /> Bank Disbursement Details
                                </label>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Account Name</label>
                                        <input value={settings.accountName} onChange={e => setSettings({...settings, accountName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Bank Name</label>
                                        <input value={settings.bankName} onChange={e => setSettings({...settings, bankName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Account Number</label>
                                        <input value={settings.accountNumber} onChange={e => setSettings({...settings, accountNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">IFSC Code</label>
                                            <input value={settings.ifscCode} onChange={e => setSettings({...settings, ifscCode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Branch</label>
                                            <input value={settings.branch} onChange={e => setSettings({...settings, branch: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'visuals' && (
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                             <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aesthetic Controls</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Theme Color</label>
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                                            <input type="color" value={settings.themeColor} onChange={e => setSettings({...settings, themeColor: e.target.value})} className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer" />
                                            <span className="text-[10px] font-black uppercase">{settings.themeColor}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Font Family</label>
                                        <select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-50">
                                            <option value="Inter">Inter (Default)</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Outfit">Outfit</option>
                                            <option value="Montserrat">Montserrat</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-slate-900 rounded-2xl text-white">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <UserCheck size={12} className="text-indigo-400" /> Authorized Signatory
                                </label>
                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-slate-500 px-1">Full Name</label>
                                        <input value={settings.authorizedSignatory?.name} onChange={e => setSettings({...settings, authorizedSignatory: {...settings.authorizedSignatory, name: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-slate-500 px-1">Designation</label>
                                        <input value={settings.authorizedSignatory?.designation} onChange={e => setSettings({...settings, authorizedSignatory: {...settings.authorizedSignatory, designation: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                </div>
                            </div>

                             <div className="space-y-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-1">Watermark Configuration</label>
                                    <button onClick={() => setSettings({...settings, showWatermark: !settings.showWatermark})} className={`w-8 h-4 rounded-full transition-all relative ${settings.showWatermark ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.showWatermark ? 'left-4.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                {settings.showWatermark && (
                                    <div className="space-y-1.5 animate-in slide-in-from-top duration-300">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Watermark Text</label>
                                        <input value={settings.watermarkText} onChange={e => setSettings({...settings, watermarkText: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-100 uppercase" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'system' && (
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                             <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Sequencing</label>
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-600 rounded-2xl text-white"><Hash size={18} /></div>
                                        <div>
                                            <h4 className="text-[11px] font-black uppercase text-slate-900">PO Number Format</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Current: {settings.poPrefix}{settings.poStartNumber}{settings.poSuffix}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Prefix</label>
                                            <input value={settings.poPrefix} onChange={e => setSettings({...settings, poPrefix: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-100" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Start From</label>
                                            <input type="number" value={settings.poStartNumber} onChange={e => setSettings({...settings, poStartNumber: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-100" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Suffix</label>
                                            <input value={settings.poSuffix} onChange={e => setSettings({...settings, poSuffix: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-100" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'terms' && (
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                             <div className="space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sr. No Table Terms</label>
                                        <button onClick={addTerm} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase shadow-sm">
                                            <PlusCircle size={14} /> Add New Point
                                        </button>
                                    </div>
                                    <div className="space-y-5">
                                        {settings.poTerms.map((term, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50/50 border border-slate-200 rounded-[28px] space-y-4 relative group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all">
                                                <button onClick={() => removeTerm(idx)} className="absolute top-5 right-5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white rounded-full shadow-sm">
                                                    <X size={16} />
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-100">{idx + 1}</div>
                                                    <input value={term.term} onChange={e => updateTerm(idx, 'term', e.target.value)} className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-100" placeholder="e.g. TRANSPORTATION" />
                                                </div>
                                                <input value={term.desc} onChange={e => updateTerm(idx, 'desc', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-100" placeholder="e.g. Included" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">General Terms (Page 2)</label>
                                    <div className="space-y-4">
                                        {settings.generalTerms.map((term, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[9px] font-black text-indigo-600 uppercase">Section {idx + 1}</span>
                                                </div>
                                                <textarea 
                                                    value={term} 
                                                    onChange={e => updateGeneralTerm(idx, e.target.value)} 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-[20px] px-5 py-4 text-[10px] font-bold outline-none min-h-[80px] focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all leading-relaxed"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* CENTRAL PREVIEW CANVAS */}
                <main className="flex-1 overflow-auto bg-slate-100/30 p-12 flex flex-col items-center no-scrollbar">
                     <div className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-200 w-[210mm] min-h-[297mm] h-fit origin-top transition-all duration-500 rounded-sm relative overflow-hidden" style={{ transform: `scale(${canvasScale})`, fontFamily: settings.fontFamily }}>
                          {/* WATERMARK */}
                          {settings.showWatermark && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-0">
                                  <div className="text-[180px] font-black text-slate-100 uppercase -rotate-45 opacity-40 tracking-[20px]">{settings.watermarkText}</div>
                              </div>
                          )}

                          <div className="p-10 text-[11px] text-black leading-tight relative z-10">
                             <div className="border border-black">
                                 <div className="flex justify-between p-6 border-b border-black" style={{ borderTop: `6px solid ${settings.themeColor}` }}>
                                     <div className="flex-1">
                                         <h1 className="text-[15px] font-black uppercase mb-1" style={{ color: settings.themeColor }}>{settings.companyName}</h1>
                                         <p className="max-w-[350px] font-bold opacity-70 leading-tight uppercase text-[10px]">{settings.companyAddress}</p>
                                         <div className="mt-3 flex flex-wrap gap-4 text-[8px] font-black uppercase opacity-60">
                                             {settings.gstNumber && <span>GST: {settings.gstNumber}</span>}
                                             {settings.cinNumber && <span>CIN: {settings.cinNumber}</span>}
                                         </div>
                                     </div>
                                     <div className="text-right shrink-0">
                                         {settings.logo ? (
                                             <img src={settings.logo} className="h-16 w-36 object-contain animate-in fade-in duration-500" />
                                         ) : (
                                             <div className="h-16 w-32 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-300 uppercase text-[9px]">ENTITY LOGO</div>
                                         )}
                                     </div>
                                 </div>
                                 <div className="border-b border-black py-1.5 text-center font-black uppercase tracking-[4px] text-[10px]" style={{ backgroundColor: `${settings.themeColor}10`, color: settings.themeColor }}>Purchase Order</div>
                                 <div className="h-24 border-b border-black grid grid-cols-10">
                                     <div className="col-span-6 border-r border-black p-3 flex flex-col justify-between">
                                          <div className="text-[8px] font-black uppercase opacity-40 mb-1">To: (Supplier Details)</div>
                                          <div className="h-full border border-dashed border-slate-100 rounded bg-slate-50/50"></div>
                                     </div>
                                     <div className="col-span-4 p-3 flex flex-col gap-2">
                                          <div className="flex justify-between">
                                               <span className="font-black uppercase text-[8px] opacity-40">PO Number</span>
                                               <span className="font-black uppercase">{settings.poPrefix}{settings.poStartNumber}{settings.poSuffix}</span>
                                          </div>
                                          <div className="flex justify-between">
                                               <span className="font-black uppercase text-[8px] opacity-40">PO Date</span>
                                               <span className="font-black uppercase">27-04-2026</span>
                                          </div>
                                     </div>
                                 </div>
                                 <div className="h-[400px] border-b border-black p-10 flex items-center justify-center font-black text-slate-100 uppercase italic text-6xl select-none opacity-20 transform -rotate-12">Items Grid Container</div>
                                 
                                 <div className="grid grid-cols-2 border-b border-black min-h-[120px]">
                                     <div className="border-r border-black p-4 bg-slate-50/10">
                                          <h4 className="font-black uppercase mb-1.5 text-[9px] tracking-widest" style={{ color: settings.themeColor }}>Bank Details for Payment</h4>
                                          <div className="space-y-1 text-[9px]">
                                              <div className="flex justify-between"><span className="opacity-50">A/C NAME:</span> <span className="font-black">{settings.accountName || '---'}</span></div>
                                              <div className="flex justify-between"><span className="opacity-50">BANK:</span> <span className="font-black">{settings.bankName || '---'}</span></div>
                                              <div className="flex justify-between"><span className="opacity-50">A/C NO:</span> <span className="font-black">{settings.accountNumber || '---'}</span></div>
                                              <div className="flex justify-between"><span className="opacity-50">IFSC:</span> <span className="font-black">{settings.ifscCode || '---'}</span></div>
                                          </div>
                                     </div>
                                     <div className="p-4">
                                          <h4 className="font-black uppercase mb-1.5 text-[9px] tracking-widest text-rose-600">Remarks / Notes</h4>
                                          <p className="font-bold opacity-70 uppercase leading-tight text-[10px]">{settings.remarks}</p>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 border-b border-black min-h-[100px]">
                                     <div className="border-r border-black p-4"><h4 className="font-black uppercase mb-1.5 text-[9px] tracking-widest" style={{ color: settings.themeColor }}>Billing Address</h4><p className="font-bold opacity-70 uppercase leading-tight text-[10px]">{settings.billingAddress}</p></div>
                                     <div className="p-4"><h4 className="font-black uppercase mb-1.5 text-[9px] tracking-widest" style={{ color: settings.themeColor }}>Delivery Address</h4><p className="font-bold opacity-70 uppercase leading-tight text-[10px]">{settings.deliveryAddress}</p></div>
                                 </div>
                                 
                                 <div className="overflow-hidden">
                                     <table className="w-full border-collapse">
                                         <thead>
                                             <tr className="bg-slate-50 border-b border-black text-[10px] font-black uppercase" style={{ backgroundColor: `${settings.themeColor}05` }}>
                                                 <th className="border-r border-black p-2 w-12 text-center">Sr</th>
                                                 <th className="border-r border-black p-2 w-44 text-left">Term / Condition</th>
                                                 <th className="p-2 text-left">Description / Value</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {settings.poTerms.map((t, i) => (
                                                 <tr key={i} className="border-b border-black last:border-b-0">
                                                     <td className="border-r border-black p-2 text-center font-black">{i + 1}</td>
                                                     <td className="border-r border-black p-2 uppercase font-black">{t.term || '---'}</td>
                                                     <td className="p-2 font-bold uppercase">: {t.desc || '---'}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>

                                 {/* STAMP & SIGNATURE PREVIEW */}
                                 <div className="p-6 flex items-center justify-between border-t border-black bg-slate-50/20 h-40">
                                      <div className="relative h-24 w-24 border-2 border-indigo-600 rounded-full flex items-center justify-center opacity-40 border-dotted">
                                         <div className="h-20 w-20 border border-indigo-600 rounded-full flex flex-col items-center justify-center text-[6px] text-indigo-900 font-black uppercase text-center p-1 leading-none">
                                             <p className="mb-0.5 tracking-tighter">{settings.stampTopText}</p>
                                             <div className="h-5 w-5 border border-indigo-600 rounded-full flex items-center justify-center text-[5px] my-0.5 font-black">BOX</div>
                                             <p className="mt-0.5">{settings.stampBottomText}</p>
                                         </div>
                                      </div>

                                      <div className="text-right flex flex-col items-end justify-end h-full">
                                           <div className="mb-8 font-black uppercase text-[8px] opacity-30">Authorized Signatory</div>
                                           <div className="border-b border-black w-40 mb-2"></div>
                                           <div className="font-black uppercase text-[10px]">{settings.authorizedSignatory?.name}</div>
                                           <div className="font-bold uppercase text-[8px] opacity-60">{settings.authorizedSignatory?.designation}</div>
                                      </div>
                                 </div>
                             </div>
                             <div className="mt-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                                 <span>Official Document Management System</span>
                                 <span>Page 1 of 2</span>
                             </div>
                          </div>
                     </div>
                </main>
             </div>

             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                input[type='range'] {
                    height: 4px;
                    border-radius: 6px;
                    background: #e2e8f0;
                    appearance: none;
                }
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: white;
                    border: 3px solid #4f46e5;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }
             `}</style>
        </div>
    );
}
