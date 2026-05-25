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
        soPrefix: "SO",
        soStartNumber: 1,
        soSuffix: "",
        soTerms: [
            { term: 'SERVICE PERIOD', desc: 'AS PER SCOPE' }
        ],
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
        const termsKey = activeTemplate === "SO" ? "soTerms" : "poTerms";
        const newTerms = [...settings[termsKey]];
        newTerms[index][field] = value;
        setSettings({ ...settings, [termsKey]: newTerms });
    };

    const addTerm = () => {
        const termsKey = activeTemplate === "SO" ? "soTerms" : "poTerms";
        setSettings({ ...settings, [termsKey]: [...(settings[termsKey] || []), { term: '', desc: '' }] });
    };

    const removeTerm = (index) => {
        const termsKey = activeTemplate === "SO" ? "soTerms" : "poTerms";
        const newTerms = (settings[termsKey] || []).filter((_, i) => i !== index);
        setSettings({ ...settings, [termsKey]: newTerms });
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

                    <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200 absolute left-1/2 -translate-x-1/2">
                        <button 
                            onClick={() => setActiveTemplate("PO")}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${activeTemplate === "PO" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Purchase Order (PO)
                        </button>
                        <button 
                            onClick={() => setActiveTemplate("SO")}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${activeTemplate === "SO" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Service Order (SO)
                        </button>
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
                                            <h4 className="text-[11px] font-black uppercase text-slate-900">{activeTemplate === "SO" ? "SO Number Format" : "PO Number Format"}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Current: {activeTemplate === "SO" ? settings.soPrefix : settings.poPrefix}{activeTemplate === "SO" ? settings.soStartNumber : settings.poStartNumber}{activeTemplate === "SO" ? settings.soSuffix : settings.poSuffix}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Prefix</label>
                                            <input value={activeTemplate === "SO" ? settings.soPrefix : settings.poPrefix} onChange={e => activeTemplate === "SO" ? setSettings({...settings, soPrefix: e.target.value}) : setSettings({...settings, poPrefix: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-100" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Start From</label>
                                            <input type="number" value={activeTemplate === "SO" ? settings.soStartNumber : settings.poStartNumber} onChange={e => activeTemplate === "SO" ? setSettings({...settings, soStartNumber: parseInt(e.target.value)}) : setSettings({...settings, poStartNumber: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-100" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Suffix</label>
                                            <input value={activeTemplate === "SO" ? settings.soSuffix : settings.poSuffix} onChange={e => activeTemplate === "SO" ? setSettings({...settings, soSuffix: e.target.value}) : setSettings({...settings, poSuffix: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-100" />
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
                                        {(activeTemplate === "SO" ? (settings.soTerms || []) : (settings.poTerms || [])).map((term, idx) => (
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
                       <div className="origin-top transition-all duration-500 flex flex-col gap-8 pb-32" style={{ transform: `scale(${canvasScale})`, fontFamily: settings.fontFamily }}>
                           <div className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-200 w-[210mm] min-h-[297mm] h-fit relative overflow-hidden">
                          {/* WATERMARK */}
                          {settings.showWatermark && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-0">
                                  <div className="text-[180px] font-black text-slate-100 uppercase -rotate-45 opacity-40 tracking-[20px]">{settings.watermarkText}</div>
                              </div>
                          )}

                          <div className="p-10 text-[11px] text-black leading-tight relative z-10">
                             <div className="flex flex-col gap-0 border-black">
                                 {/* HEADER */}
                                 <div className="flex justify-between items-start border-b border-black pb-2">
                                     <div className="flex-1">
                                         <h1 className="text-xl font-black uppercase mb-1">{settings.companyName || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED'}</h1>
                                         <div className="text-[10px] space-y-0.5 font-normal uppercase text-slate-700">
                                             {settings.companyAddress ? (
                                                 settings.companyAddress.split('\n').map((line, index) => (
                                                     <p key={index}>{line}</p>
                                                 ))
                                             ) : (
                                                 <>
                                                     <p>OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,</p>
                                                     <p>OFF C.G. ROAD, AMBAWADI,</p>
                                                     <p>AHMEDABAD GJ 380006</p>
                                                 </>
                                             )}
                                             <p className="text-indigo-600 normal-case">www.gitakshmi.com</p>
                                         </div>
                                     </div>
                                     <div className="text-right flex flex-col items-end">
                                         {settings.logo ? (
                                             <img src={settings.logo} alt="Logo" className="h-16 w-auto object-contain" />
                                         ) : (
                                             <img src="/logo.png" alt="Logo" className="h-16" onError={(e) => e.target.style.display='none'} />
                                         )}
                                     </div>
                                 </div>
                                 <div className="border-b border-black py-1.5 text-center font-black uppercase tracking-[4px] text-[10px]" style={{ backgroundColor: `${settings.themeColor}10`, color: settings.themeColor }}>{activeTemplate === "SO" ? "Service Work Order" : "Purchase Order"}</div>
                                 <div className="h-24 border-b border-black grid grid-cols-10">
                                     <div className="col-span-6 border-r border-black p-3 flex flex-col justify-between">
                                          <div className="text-[8px] font-black uppercase opacity-40 mb-1">To: (Supplier Details)</div>
                                          <div className="h-full border border-dashed border-slate-100 rounded bg-slate-50/50"></div>
                                     </div>
                                     <div className="col-span-4 p-3 flex flex-col gap-2">
                                          <div className="flex justify-between">
                                               <span className="font-black uppercase text-[8px] opacity-40">{activeTemplate === "SO" ? "SO Number" : "PO Number"}</span>
                                               <span className="font-black uppercase">{activeTemplate === "SO" ? settings.soPrefix : settings.poPrefix}{activeTemplate === "SO" ? settings.soStartNumber : settings.poStartNumber}{activeTemplate === "SO" ? settings.soSuffix : settings.poSuffix}</span>
                                          </div>
                                          <div className="flex justify-between">
                                               <span className="font-black uppercase text-[8px] opacity-40">Date</span>
                                               <span className="font-black uppercase">{new Date().toLocaleDateString()}</span>
                                          </div>
                                     </div>
                                 </div>

                                 {/* INFO GRID */}
                                 <div className="flex border-x border-b border-black">
                                     <div className="flex-1 border-r border-black p-2 min-h-[120px]">
                                         <div className="grid grid-cols-6 gap-y-1 text-[10px]">
                                             <span className="col-span-1 font-bold uppercase">Supplier</span><span className="col-span-5 font-bold text-indigo-900">: [SUPPLIER NAME PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Address</span><span className="col-span-5 uppercase">: [ADDRESS PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">City</span><span className="col-span-2 uppercase">: [CITY PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">PAN</span><span className="col-span-2 uppercase">: [PAN PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Contact</span><span className="col-span-2 uppercase">: [CONTACT PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Contact No</span><span className="col-span-2">: [PHONE PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">State</span><span className="col-span-2 uppercase">: [STATE PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">GST</span><span className="col-span-2 uppercase">: [GST PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Pincode</span><span className="col-span-2 uppercase">: [PINCODE PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">MSME Status</span><span className="col-span-2 uppercase">: [MSME PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Email</span><span className="col-span-5 uppercase break-all">: [EMAIL PLACEHOLDER]</span>
                                         </div>
                                     </div>
                                     <div className="w-[25%] shrink-0 p-2 text-[10px]">
                                         <div className="grid grid-cols-5 gap-y-1">
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order No</span><span className="col-span-3 font-bold">: {activeTemplate === "SO" ? (settings.soPrefix || "SO") : (settings.poPrefix || "PO")}-1234</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order Date</span><span className="col-span-3">: [DATE]</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Quote No</span><span className="col-span-3 uppercase">: By Mail</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Quote Date</span><span className="col-span-3">: [DATE]</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Vendor Code</span><span className="col-span-3 uppercase">: [CODE]</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Project Ref</span><span className="col-span-3">: -</span>
                                         </div>
                                     </div>
                                 </div>

                                 {/* ITEMS GRID */}
                                 <div className="border-x border-b border-black flex flex-col">
                                     <table className="w-full text-[9px] uppercase table-fixed border-collapse">
                                         <thead>
                                             <tr className="font-bold text-[10px] uppercase border-b border-black">
                                                 <th className="border-r border-black p-1.5 w-[6%] text-center align-middle">Sl No</th>
                                                 <th className="border-r border-black p-1.5 px-2 text-left align-middle">Description</th>
                                                 <th className="border-r border-black p-1.5 text-center w-[12%] align-middle">HSN / SAC</th>
                                                 <th className="border-r border-black p-1.5 text-center w-[10%] align-middle">UOM</th>
                                                 <th className="border-r border-black p-1.5 text-center w-[12%] align-middle">QTY</th>
                                                 <th className="border-r border-black p-1.5 text-right w-[12%] px-2 align-middle">Unit Price</th>
                                                 <th className="p-1.5 text-right w-[13%] px-2 align-middle">Amount</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             <tr className="min-h-[150px] text-[10px] border-b border-black">
                                                 <td className="border-r border-black p-2 text-center align-top font-bold">1</td>
                                                 <td className="border-r border-black p-2 align-top px-2">
                                                     <div className="flex flex-col gap-[1px]">
                                                         <div className="font-bold text-[11px] text-slate-900 leading-tight">[ITEM NAME PLACEHOLDER 1]</div>
                                                         <div className="text-[8.5px] text-slate-500 font-medium leading-tight">[ITEM SPECIFICATIONS AND DETAILS PLACEHOLDER]</div>
                                                     </div>
                                                 </td>
                                                 <td className="border-r border-black p-2 text-center align-top">[HSN]</td>
                                                 <td className="border-r border-black p-2 text-center align-top">[UOM]</td>
                                                 <td className="border-r border-black p-2 text-center align-top">[QTY]</td>
                                                 <td className="border-r border-black p-2 text-right px-2 align-top">[UNIT PRICE]</td>
                                                 <td className="p-2 text-right px-2 align-top">[TOTAL AMOUNT]</td>
                                             </tr>
                                             <tr className="min-h-[150px] text-[10px]">
                                                 <td className="border-r border-black p-2 text-center align-top font-bold">2</td>
                                                 <td className="border-r border-black p-2 align-top px-2">
                                                     <div className="flex flex-col gap-[1px]">
                                                         <div className="font-bold text-[11px] text-slate-900 leading-tight">[ITEM NAME PLACEHOLDER 2]</div>
                                                         <div className="text-[8.5px] text-slate-500 font-medium leading-tight">[ITEM SPECIFICATIONS AND DETAILS PLACEHOLDER]</div>
                                                     </div>
                                                 </td>
                                                 <td className="border-r border-black p-2 text-center align-top">[HSN]</td>
                                                 <td className="border-r border-black p-2 text-center align-top">[UOM]</td>
                                                 <td className="border-r border-black p-2 text-center align-top">[QTY]</td>
                                                 <td className="border-r border-black p-2 text-right px-2 align-top">[UNIT PRICE]</td>
                                                 <td className="p-2 text-right px-2 align-top">[TOTAL AMOUNT]</td>
                                             </tr>
                                             {activeTemplate === "SO" && (
                                                 <>
                                                     <tr className="text-[10px]">
                                                         <td className="border-r border-black p-1 text-center font-bold"></td>
                                                         <td className="border-r border-black p-2 font-bold text-slate-800">Note: All Responsibilities as Sow to Deliverable</td>
                                                         <td className="border-r border-black p-1 text-center"></td>
                                                         <td className="border-r border-black p-1 text-center"></td>
                                                         <td className="border-r border-black p-1 text-center"></td>
                                                         <td className="border-r border-black p-1 text-right px-2"></td>
                                                         <td className="p-1 text-right px-2"></td>
                                                     </tr>
                                                     <tr className="h-[30px]">
                                                         <td className="border-r border-black p-1"></td>
                                                         <td className="border-r border-black p-1"></td>
                                                         <td className="border-r border-black p-1"></td>
                                                         <td className="border-r border-black p-1"></td>
                                                         <td className="border-r border-black p-1"></td>
                                                         <td className="border-r border-black p-1"></td>
                                                         <td className="p-1"></td>
                                                     </tr>
                                                 </>
                                             )}
                                         </tbody>
                                     </table>
                                     <div className="w-full">
                                         <div className="grid grid-cols-2 text-[10px] border-t border-black">
                                             <div className="border-r border-black p-2 leading-relaxed">
                                                 <div className="flex gap-4"><span className="font-bold uppercase w-24">CIN</span><span>: {settings.cinNumber || '---'}</span></div>
                                                 <div className="flex gap-4"><span className="font-bold uppercase w-24">GST NO</span><span>: {settings.gstNumber || '---'}</span></div>
                                                 <div className="flex gap-4"><span className="font-bold uppercase w-24">JURISDICTION</span><span>: {settings.jurisdiction || '---'}</span></div>
                                             </div>
                                             <div className="p-2 flex flex-col justify-end">
                                                 <div className="flex justify-between font-bold"><span className="uppercase">Basic Price :</span><span>[SUBTOTAL]</span></div>
                                                 <div className="flex justify-between font-bold"><span className="uppercase">Add: Input CGST 9% :</span><span>[CGST AMOUNT]</span></div>
                                                 <div className="flex justify-between font-bold"><span className="uppercase">Add: Input SGST 9% :</span><span>[SGST AMOUNT]</span></div>
                                                 <div className="flex justify-between font-black mt-1"><span className="uppercase">Grand Total :</span><span>[GRAND TOTAL]</span></div>
                                             </div>
                                         </div>
                                         <div className="p-2 border-t border-black text-[10px]">
                                             <span className="font-bold uppercase">In words: </span>
                                             <span>**** INR [AMOUNT IN WORDS PLACEHOLDER] ONLY</span>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 border-x border-b border-black text-[10px]">
                                     <div className="border-r border-black p-2"><div className="font-bold uppercase mb-1">Billing Address</div><div className="uppercase leading-tight text-slate-700 whitespace-pre-wrap">{settings.billingAddress}</div></div>
                                     <div className="p-2"><div className="font-bold uppercase mb-1">Delivery Address</div><div className="uppercase leading-tight text-slate-700 whitespace-pre-wrap">{settings.deliveryAddress}</div></div>
                                 </div>

                                 <div className="border-x border-b border-black text-[10px]">
                                     <div className="p-2 font-bold border-b border-black uppercase">Indent No: -</div>
                                     <div className="flex border-b border-black bg-slate-200">
                                         <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 font-bold text-[9px] uppercase">Payment Term</div>
                                         <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 font-bold text-[9px] uppercase">Credit</div>
                                         <div className="w-[25%] shrink-0 p-1.5 font-bold text-[9px] uppercase">Delivery Details</div>
                                     </div>
                                     <div className="flex">
                                         <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 text-[10px] uppercase">AFTER DELIVERY</div>
                                         <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 text-[10px] uppercase">WITHIN 30 DAYS</div>
                                         <div className="w-[25%] shrink-0 p-1.5 text-[10px] uppercase">IMMEDIATE</div>
                                     </div>
                                 </div>
                                 
                                 <div className="border-x border-b border-black overflow-hidden text-[11px]">
                                     <table className="w-full text-left border-collapse table-fixed">
                                         <thead>
                                             <tr className="font-bold text-[10px] uppercase border-b border-black bg-slate-200">
                                                 <th className="border-r border-black p-1.5 text-center whitespace-nowrap text-[11px]" style={{ width: '6%' }}>Sr No</th>
                                                 <th className="border-r border-black p-1.5 px-2 text-[11px]" style={{ width: '31.5%' }}>Term</th>
                                                 <th className="p-1.5 px-2 text-[11px]" style={{ width: '62.5%' }}>Description</th>
                                             </tr>
                                         </thead>
                                         <tbody className="uppercase">
                                             {(activeTemplate === "SO" ? (settings.soTerms || []) : (settings.poTerms || [])).filter(t => !(activeTemplate === "SO" && t.term === "TRANSPORTATION")).map((t, i) => (
                                                 <tr key={i}>
                                                     <td className="py-0.5 text-center font-bold align-top text-[12px]">{i + 1}</td>
                                                     <td className="py-0.5 px-2 font-normal align-top text-[12px]">{t.term || '---'}</td>
                                                     <td className="py-0.5 px-2 align-top text-[12px] whitespace-pre-wrap">: {t.desc || '---'}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>

                                 <div className="border-x border-b border-black p-2 text-[11px]">
                                     <div className="font-bold uppercase mb-1">Remarks:</div>
                                     <div className="italic leading-tight whitespace-pre-wrap">{settings.remarks}</div>
                                 </div>

                                 {/* STAMP & SIGNATURE PREVIEW */}
                                 <div className="border-x border-b border-black p-2 min-h-[140px] flex flex-col justify-end text-[10px]">
                                      <div className="text-right flex flex-col items-end">
                                           <div className="mb-10 font-bold uppercase">For, {settings.companyName || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED'}</div>
                                           <div className="font-bold uppercase text-[11px]">Authorized Signatory</div>
                                      </div>
                                 </div>
                             </div>
                               <div className="mt-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 absolute bottom-[10px] left-0 right-0">
                                   <span className="pl-10">Official Document Management System</span>
                                   <span className="pr-10">Page 1 of 2</span>
                               </div>
                            </div>
                       </div>
                       
                       {/* PAGE 2 */}
                       <div className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-200 w-[210mm] min-h-[297mm] h-fit relative overflow-hidden">
                            <div className="p-10 text-[11px] text-black leading-tight relative z-10 min-h-[1050px]">
                                <div className="flex justify-between items-start border-b border-black pb-2 mb-4">
                                    <div className="font-black uppercase text-[11px]">{settings.companyName || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED'}</div>
                                    <div className="text-[10px] font-black uppercase">{activeTemplate === "SO" ? "SO number/date" : "PO number/date"} &nbsp;&nbsp;&nbsp;&nbsp; {activeTemplate === "SO" ? (settings.soPrefix || "SO") : (settings.poPrefix || "PO")}-1234 / {new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                </div>
                                <div className="mb-4">
                                    <h2 className="font-black uppercase text-[11px] underline mb-4">Special Terms & Conditions</h2>
                                    <div className="flex flex-col gap-2 text-[9.9px] font-bold">
                                        <div className="flex items-center">
                                            <div className="w-[140px] shrink-0 font-bold uppercase tracking-tighter">VENDOR BANK DETAILS</div>
                                            <div className="flex gap-6 text-blue-900 items-center">
                                                <div className="flex gap-1 font-bold"><span>: BANK NAME :</span> <span className="underline font-bold">IDFC FIRST Bank</span></div>
                                                <div className="flex gap-1 font-bold"><span>A/C NO :</span> <span className="underline font-bold">10160248172</span></div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-[140px] shrink-0 font-bold uppercase tracking-tighter">SPECIAL INSTRUCTIONS</div>
                                            <div className="flex-1 flex text-justify font-normal text-slate-800 leading-tight">
                                                <span className="font-bold text-[9.9px] mr-1 shrink-0">:</span>
                                                <div className="flex-1 text-justify whitespace-pre-wrap">{settings.specialInstructions}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {activeTemplate !== "SO" && (
                                    <div className="space-y-2">
                                        <h2 className="font-black uppercase text-[11px] underline">GENERAL TERMS & CONDITIONS</h2>
                                        <p className="text-[9.9px] leading-tight uppercase font-bold">Following are the General Terms & Conditions applicable to this PO. In case of contradictions, Terms & Conditions mentioned in the main body of the PO shall take precedence over Terms & Conditions mentioned here.</p>
                                        <div className="space-y-1 text-[9px] leading-tight text-slate-800 font-medium">
                                           {settings.generalTerms?.map((term, idx) => {
                                              const splitIdx = term.indexOf(':');
                                              const hasColon = splitIdx !== -1;
                                              return (
                                                 <div key={idx} className="flex gap-2 text-justify">
                                                    {hasColon ? (
                                                      <>
                                                        <span className="font-bold shrink-0">{term.substring(0, splitIdx + 1)}</span>
                                                        <span>{term.substring(splitIdx + 1).trim()}</span>
                                                      </>
                                                    ) : (
                                                      <span>{term}</span>
                                                    )}
                                                 </div>
                                              );
                                           })}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Dual Signature Block on Page 2 */}
                                <div className="flex flex-col justify-end p-2 min-h-[110px] mt-8">
                                    <div className="flex justify-between w-full mb-1">
                                        <p className="font-bold text-[10px] uppercase">for, HOTLINESYSTEM</p>
                                    </div>
                                    <div className="relative h-20 w-full flex justify-between items-end">
                                        <div className="relative h-20 flex items-center justify-start">
                                            <div className="h-16 flex items-end">
                                                <div className="w-40 border-b border-dashed border-slate-300 pb-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                                    Sign & Stamp
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 absolute bottom-[10px] left-0 right-0">
                                   <span className="pl-10">Official Document Management System</span>
                                   <span className="pr-10">Page 2 of 2</span>
                                </div>
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
