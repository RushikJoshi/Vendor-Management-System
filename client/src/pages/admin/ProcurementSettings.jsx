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
    Monitor, Smartphone, Undo2, Redo2, RotateCcw
} from "lucide-react";

const IconMap = {
    Square, Circle, Minus, Star, Award, PenTool, ShieldCheck, Box,
    Heart, Bell, Flag, MapPin, Phone, Mail, Globe, Lock, Unlock,
    CheckSquare, Info, AlertTriangle, Layers,
};

// Sub-component to handle refs for dynamic draggable elements
const DraggableElement = ({ el, onDrag, onUpdate, onRemove, isSelected, onSelect }) => {
    const nodeRef = useRef(null);

    const renderContent = () => {
        const style = {
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            color: el.color,
            letterSpacing: el.letterSpacing || 'normal',
            opacity: el.opacity !== undefined ? el.opacity : 1,
            transition: 'all 0.2s ease'
        };

        if (el.type === 'text') {
            return (
                <div 
                    contentEditable 
                    onBlur={(e) => onUpdate(el.id, { text: e.target.innerText })}
                    style={{ 
                        ...style,
                        minWidth: '50px',
                        padding: '4px',
                        cursor: 'text'
                    }}
                    className="outline-none bg-transparent"
                    suppressContentEditableWarning={true}
                >
                    {el.text}
                </div>
            );
        }

        if (el.type === 'square') return <div style={{ ...style, width: el.width || '100px', height: el.height || '100px', backgroundColor: el.color }} />;
        if (el.type === 'circle') return <div style={{ ...style, width: el.width || '100px', height: el.height || '100px', backgroundColor: el.color, borderRadius: '9999px' }} />;
        if (el.type === 'line' || el.type === 'divider') return <div style={{ ...style, width: el.width || '200px', height: el.height || '2px', backgroundColor: el.color }} />;
        
        if (el.type === 'icon' || el.type === 'star') {
            const IconComp = IconMap[el.iconName || (el.type === 'star' ? 'Star' : 'Award')] || Box;
            return <IconComp size={el.width || 24} style={{ color: el.color, opacity: el.opacity }} />;
        }

        return null;
    };

    return (
        <Draggable 
            nodeRef={nodeRef}
            position={{ x: el.x || 0, y: el.y || 0 }} 
            onStop={(e, data) => onDrag(`custom-${el.id}`, e, data)}
            handle=".drag-handle"
        >
            <div 
                ref={nodeRef} 
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(el.id);
                }}
                className={`absolute z-[100] group cursor-default p-2 transition-all ${isSelected ? "ring-4 ring-indigo-500 bg-white/60 shadow-2xl scale-[1.02]" : "hover:bg-slate-50/50"}`}
                style={{ left: 0, top: 0, borderRadius: '8px' }}
            >
                <div className="drag-handle absolute -top-4 -left-4 p-2 bg-indigo-600 rounded-full text-white opacity-0 group-hover:opacity-100 cursor-move shadow-lg transition-all z-[110] hover:scale-110">
                    <Maximize2 size={12} />
                </div>

                {renderContent()}

                <button 
                    onClick={() => onRemove(el.id)}
                    className="absolute -top-4 -right-4 p-2 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg border border-slate-100 z-[110]"
                >
                    <Trash2 size={10} />
                </button>
            </div>
        </Draggable>
    );
};

export default function ProcurementSettings() {
    const [settings, setSettings] = useState({
        companyName: "",
        companyAddress: "",
        gstNumber: "",
        poTerms: [],
        soTerms: [],
        themeColor: "#1e3a8a",
        secondaryColor: "#64748b",
        fontFamily: "Inter",
        headerHeight: 80,
        logoSize: 48,
        tableHeaderColor: "#f8fafc",
        isWatermarkEnabled: false,
        layoutTemplate: "ProfessionalV2",
        layoutPositions: {},
        customElements: [],
        elementStyles: {},
        // Professional V2 Content Data
        shippingTerms: "Cost, Insurance & Freight",
        shippingMethod: "FEDEX",
        deliveryDate: "As per Site Requirement",
        paymentMode: "Bank Transfer / LC",
        contactEmail: "procurement@comp.com",
        contactPhone: "+91 99999 88888",
        comments: "This document is subject to standard procurement terms.",
        footerMessage: "Thank you for your valued partnership.",
        items: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState("branding"); 
    const [viewMode, setViewMode] = useState("desktop");
    const [activeTemplate, setActiveTemplate] = useState("PO"); 
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [canvasScale, setCanvasScale] = useState(1.0); // Set default to 100% as requested
    const [isPreviewMode, setIsPreviewMode] = useState(false); // Toggle for live data preview

    // Draggable Node Refs
    const logoRef = useRef(null);
    const companyNameRef = useRef(null);
    const docTitleRef = useRef(null);
    const vendorNameRef = useRef(null);
    const vendorAddressRef = useRef(null);
    const vendorGstRef = useRef(null);
    const paymentMetaRef = useRef(null);
    const shippingMetaRef = useRef(null);
    const tableRef = useRef(null);
    const signatoryLeftRef = useRef(null);
    const signatoryRightRef = useRef(null);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get("/procurement-settings/history");
            setHistory(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load history.");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/procurement-settings?type=${activeTemplate}`);
                const data = res.data.data;
                if (!data.layoutPositions) data.layoutPositions = {};
                if (!data.customElements) data.customElements = [];
                if (!data.elementStyles) data.elementStyles = {};
                setSettings(data);
            } catch (err) {
                toast.error("Failed to load designer config.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [activeTemplate]);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const updateElementStyle = (field, value) => {
        if (!selectedElementId) return;

        // Check if it's a custom element
        const isCustom = selectedElementId.toString().startsWith('custom-');
        
        if (isCustom) {
            const elementId = selectedElementId.replace('custom-', '');
            setSettings(prev => ({
                ...prev,
                customElements: prev.customElements.map(el => 
                    el.id === elementId ? { ...el, [field]: value } : el
                )
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                elementStyles: {
                    ...(prev.elementStyles || {}),
                    [selectedElementId]: {
                        ...(prev.elementStyles?.[selectedElementId] || {}),
                        [field]: value
                    }
                }
            }));
        }
    };

    const getElementStyle = (id) => {
        if (id.toString().startsWith('custom-')) {
            const elementId = id.replace('custom-', '');
            return settings.customElements?.find(el => el.id === elementId) || {};
        }
        return settings.elementStyles?.[id] || {};
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put("/procurement-settings", { ...settings, type: activeTemplate });
            setSettings(res.data.data);
            await loadHistory();
            toast.success("Design Published!");
        } catch (err) {
            toast.error("Deployment failed.");
        } finally {
            setSaving(false);
        }
    };

    const handleRestoreHistory = async (historyId) => {
        setRestoringId(historyId);
        try {
            const res = await api.post(`/procurement-settings/restore/${historyId}`);
            setSettings(res.data.data.settings);
            setActiveTemplate(res.data.data.type);
            await loadHistory();
            toast.success("Template restored.");
        } catch (err) {
            toast.error("Restoration failed.");
        } finally {
            setRestoringId(null);
        }
    };

    const handleDrag = (name, e, data) => {
        const { x, y } = data;
        setSettings(prev => {
            if (name.startsWith('custom-')) {
                const elementId = name.replace('custom-', '');
                return {
                    ...prev,
                    customElements: prev.customElements.map(el => 
                        el.id === elementId ? { ...el, x, y } : el
                    )
                };
            }
            return {
                ...prev,
                layoutPositions: { ...prev.layoutPositions, [name]: { x, y } }
            };
        });
    };

    const addCustomElement = (type) => {
        const newId = `custom-${Date.now()}`;
        const newEl = {
            id: newId,
            type: type,
            x: 50,
            y: 300,
            text: type === 'text' ? 'New Dynamic Text' : (type === 'signatory' ? 'Authorized Signature' : 'Custom Block'),
            fontSize: '14px',
            fontWeight: '600',
            color: '#000000'
        };
        setSettings(prev => ({
            ...prev,
            customElements: [...(prev.customElements || []), newEl]
        }));
        setSelectedElementId(newId);
        setActiveSection('elements');
        toast.success(`${type.toUpperCase()} added to canvas`);
    };

    const updateCustomElement = (id, updates) => {
        setSettings(prev => ({
            ...prev,
            customElements: prev.customElements.map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const removeCustomElement = (id) => {
        setSettings(prev => ({
            ...prev,
            customElements: prev.customElements.filter(el => el.id !== id)
        }));
        setSelectedElementId(null);
        toast.success("Element removed");
    };

    const addCustomTextBox = () => {
        const newBox = {
            id: `box-${Date.now()}`,
            text: "Double-click to Edit",
            type: "text",
            x: 0,
            y: 0,
            fontSize: 14,
            fontWeight: "bold",
            color: "#000000"
        };
        setSettings(prev => ({ ...prev, customElements: [...(prev.customElements || []), newBox] }));
    };

    const addCustomShape = (shapeType, iconName = null) => {
        const newShape = {
            id: `shape-${Date.now()}`,
            type: shapeType,
            iconName: iconName,
            x: 0,
            y: 0,
            width: shapeType === 'line' ? 200 : 60,
            height: shapeType === 'line' ? 2 : 60,
            color: settings.themeColor,
            opacity: 1
        };
        setSettings(prev => ({ ...prev, customElements: [...(prev.customElements || []), newShape] }));
    };

    const resetPositions = () => {
        setSettings({ ...settings, layoutPositions: {} });
        toast.success("Layout Reset!");
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-500 animate-pulse uppercase tracking-[.3em]">Designer Initializing...</div>;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-slate-100 -m-6 border-t border-slate-200">
            {/* 1. TOP NAVBAR */}
            <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200"><Settings size={20} /></div>
                        <div>
                            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">Document Visual Composer</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Premium Edition v3.5</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-indigo-50 px-5 py-2.5 rounded-2xl border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-all select-none shadow-sm shadow-indigo-50" onClick={() => setIsPreviewMode(!isPreviewMode)}>
                        <div className={`h-5 w-10 rounded-full relative transition-all flex items-center px-1 ${isPreviewMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`h-3 w-3 bg-white rounded-full shadow-sm transition-all transform ${isPreviewMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[.2em] leading-none">{isPreviewMode ? 'Live Preview ON' : 'Draft View'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                     <button onClick={resetPositions} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Reset Design">
                        <RefreshCcw size={20} />
                     </button>
                     <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-slate-950 hover:bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                     >
                        {saving ? "Publishing..." : "Publish Design"}
                     </button>
                 </div>
             </div>

             {/* 2. MAIN 3-COLUMN WORKSTATION */}
             <div className="flex flex-1 overflow-hidden">
                
                {/* COLUMN 1: OUTLINE SIDEBAR */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-2xl relative z-[100] shrink-0">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <Layout size={16} className="text-indigo-600" />
                             <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[.2em]">Outline</h2>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        {[
                            { id: "header", label: "Company Header", sub: "COMPANY-HEADER" },
                            { id: "docTitle", label: "Document Title", sub: "DOC-TITLE" },
                            { id: "body", label: "Vendor Details", sub: "VENDOR-INFO-GRID" },
                            { id: "table", label: "Itemized Table", sub: "ITEM-LIST-CONTAINER" },
                            { id: "signatory", label: "Approval Block", sub: "SIGNATURE-PAD" }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setSelectedElementId(item.id); setActiveSection('elements'); }}
                                className={`w-full text-left p-4 rounded-2xl transition-all group ${selectedElementId === item.id ? "bg-indigo-50 border border-indigo-100 shadow-sm" : "hover:bg-slate-50 border border-transparent"}`}
                            >
                                <p className={`text-[11px] font-black uppercase tracking-tight ${selectedElementId === item.id ? "text-indigo-600" : "text-slate-700"}`}>{item.label}</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{item.sub}</p>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* COLUMN 2: CENTRAL CANVAS AREA */}
                <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-100/50 z-0">
                     <div className="flex-1 overflow-auto p-10 flex flex-col items-center">
                         <div className="flex items-center gap-4 mb-10 bg-white/90 backdrop-blur-xl px-10 py-3 rounded-[32px] shadow-2xl shadow-indigo-100/50 border border-white sticky top-0 group hover:scale-[1.02] transition-transform z-40">
                          <button onClick={() => setViewMode('desktop')} className={`px-4 py-1.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'desktop' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                             <Monitor size={14}/> Desktop
                          </button>
                          <button onClick={() => setViewMode('mobile')} className={`px-4 py-1.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'mobile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                             <Smartphone size={14}/> Mobile
                          </button>

                          <div className="h-4 w-px bg-slate-200 mx-2" />

                          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                              <button 
                                onClick={() => { setActiveTemplate("PO"); setShowHistory(false); }}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTemplate === "PO" && !showHistory ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                              >
                                Purchase Order
                              </button>
                              <button 
                                onClick={() => { setActiveTemplate("SO"); setShowHistory(false); }}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTemplate === "SO" && !showHistory ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                              >
                                Service Order
                              </button>
                          </div>

                          <div className="h-4 w-px bg-slate-200 mx-2" />
                          
                          <div className="flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Zoom</span>
                              <input 
                                type="range" min="0.4" max="1.5" step="0.1"
                                value={canvasScale}
                                onChange={(e) => setCanvasScale(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-slate-200 rounded-full accent-indigo-600 appearance-none cursor-pointer"
                              />
                              <span className="text-[10px] font-black text-indigo-600 min-w-[30px]">{Math.round(canvasScale * 100)}%</span>
                          </div>

                          <div className="h-4 w-px bg-slate-200 mx-2" />
                          <button onClick={() => setShowHistory(!showHistory)} className={`px-4 py-1.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showHistory ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}>
                             <RefreshCcw size={14}/> History
                          </button>
                     </div>

                     {showHistory ? (
                        <div className="w-full max-w-[900px] bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500">
                             <div className="flex justify-between items-center mb-10">
                                 <div>
                                     <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Version Control</h2>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select a snapshot to restore</p>
                                 </div>
                                 <button onClick={() => setShowHistory(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full transition-all"><RefreshCcw size={18} /></button>
                             </div>
                             {historyLoading ? (
                                 <div className="py-20 text-center animate-pulse"><p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading snapshots...</p></div>
                             ) : (
                                 <div className="grid grid-cols-2 gap-6">
                                     {history.map(item => (
                                         <div key={item.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-indigo-400 hover:bg-white transition-all shadow-sm hover:shadow-xl">
                                              <div className="flex justify-between items-start mb-4">
                                                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-indigo-600 uppercase">{item.type}</span>
                                                  <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                                              </div>
                                              <p className="text-sm font-black text-slate-900 uppercase mb-4">{item.action || "Design Snapshot"}</p>
                                              <button 
                                                onClick={() => handleRestoreHistory(item.id)}
                                                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-100"
                                              >
                                                Restore This Version
                                              </button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                     ) : (
                        <div className="flex-1 w-full flex justify-center p-20 min-w-max">
                            <div 
                                className={`relative bg-white shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-200 transition-all duration-300 ${viewMode === 'mobile' ? 'w-[400px]' : 'w-[210mm]'}`}
                                style={{ 
                                    height: viewMode === 'mobile' ? 'auto' : '297mm', 
                                    minHeight: viewMode === 'mobile' ? '100vh' : '297mm',
                                    fontFamily: settings.fontFamily,
                                    transform: `scale(${canvasScale})`,
                                    transformOrigin: 'top center',
                                    zIndex: 10,
                                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            >
                                {/* Watermark Overlay */}
                                {settings.isWatermarkEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center rotate-[-35deg] pointer-events-none opacity-[0.03] select-none z-0">
                                        <span className="text-[120px] font-black uppercase text-slate-950 text-center leading-tight">
                                            OFFICIAL<br/>DOCUMENT
                                        </span>
                                    </div>
                                )}

                                {/* DOCUMENT CONTENT ENGINE */}
                                <div className="flex flex-col h-full bg-white relative">
                                    
                                    {/* 1. LOGO & COMPANY NAME */}
                                    <Draggable nodeRef={logoRef} position={settings.layoutPositions.logo || { x: 48, y: 48 }} onStop={(e, data) => handleDrag('logo', e, data)} handle=".grip">
                                        <div ref={logoRef} onClick={() => setSelectedElementId('logo')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'logo' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <div 
                                                className="bg-white overflow-hidden rounded-2xl flex items-center justify-center shadow-2xl border border-slate-50"
                                                style={{ height: settings.logoSize, width: settings.logoSize }}
                                            >
                                                {settings.logo ? <img src={settings.logo} className="h-full w-full object-contain" /> : <div className="h-full w-full flex items-center justify-center font-black text-white text-3xl" style={{ backgroundColor: settings.themeColor }}>{settings.companyName?.charAt(0) || "G"}</div>}
                                            </div>
                                        </div>
                                    </Draggable>

                                    <Draggable nodeRef={companyNameRef} position={settings.layoutPositions.companyName || { x: 120, y: 55 }} onStop={(e, data) => handleDrag('companyName', e, data)} handle=".grip">
                                        <div ref={companyNameRef} onClick={() => setSelectedElementId('companyName')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'companyName' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <h2 
                                                className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap"
                                                style={{ 
                                                    color: getElementStyle('companyName').color || '#000',
                                                    fontSize: getElementStyle('companyName').fontSize || '24px',
                                                    fontWeight: getElementStyle('companyName').fontWeight || '900',
                                                    letterSpacing: getElementStyle('companyName').letterSpacing || 'normal',
                                                    opacity: getElementStyle('companyName').opacity !== undefined ? getElementStyle('companyName').opacity : 1
                                                }}
                                            >
                                                {settings.companyName || "COMPANY NAME"}
                                            </h2>
                                        </div>
                                    </Draggable>

                                    {/* 1.1 INDEPENDENT DOCUMENT TITLE */}
                                    <Draggable 
                                        nodeRef={docTitleRef}
                                        position={settings.layoutPositions.docTitle || { x: 500, y: 48 }} 
                                        onStop={(e, data) => handleDrag('docTitle', e, data)} 
                                        handle=".grip"
                                    >
                                        <div 
                                            ref={docTitleRef}
                                            onClick={() => setSelectedElementId('docTitle')} 
                                            className={`absolute z-20 group transition-all cursor-pointer p-4 ${selectedElementId === 'docTitle' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}
                                        >
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <h1 
                                                className="text-4xl font-black uppercase tracking-tighter whitespace-nowrap" 
                                                style={{ 
                                                    color: getElementStyle('docTitle').color || settings.themeColor,
                                                    fontSize: getElementStyle('docTitle').fontSize || '36px',
                                                    fontWeight: getElementStyle('docTitle').fontWeight || '900',
                                                    letterSpacing: getElementStyle('docTitle').letterSpacing || 'normal',
                                                    opacity: getElementStyle('docTitle').opacity !== undefined ? getElementStyle('docTitle').opacity : 1
                                                }}
                                            >
                                                {activeTemplate === "PO" ? "Purchase Order" : "Service Order"}
                                            </h1>
                                        </div>
                                    </Draggable>

                                    {/* 2. VENDOR INFO - BROKEN DOWN */}
                                    <Draggable nodeRef={vendorNameRef} position={settings.layoutPositions.vendorName || { x: 48, y: 150 }} onStop={(e, data) => handleDrag('vendorName', e, data)} handle=".grip">
                                        <div ref={vendorNameRef} onClick={() => setSelectedElementId('vendorName')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'vendorName' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <p className="text-sm border-b border-indigo-100 pb-2 underline decoration-2 decoration-indigo-200 underline-offset-4 whitespace-nowrap uppercase font-black" style={{ color: getElementStyle('vendorName').color || '#000' }}>
                                                {isPreviewMode ? "Global Tech Solutions Ltd" : "Valued Business Partner"}
                                            </p>
                                        </div>
                                    </Draggable>

                                    <Draggable nodeRef={vendorAddressRef} position={settings.layoutPositions.vendorAddress || { x: 48, y: 190 }} onStop={(e, data) => handleDrag('vendorAddress', e, data)} handle=".grip">
                                        <div ref={vendorAddressRef} onClick={() => setSelectedElementId('vendorAddress')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'vendorAddress' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <p className="text-slate-400 lowercase font-medium tracking-wide max-w-[300px]" style={{ fontSize: getElementStyle('vendorAddress').fontSize || '11px' }}>
                                                {isPreviewMode ? "123 Industrial Estate, Phase 4, Mumbai - 400001" : "Registered Office Address Line 1, Corporate State Hub, ZIP-001"}
                                            </p>
                                        </div>
                                    </Draggable>

                                    <Draggable nodeRef={vendorGstRef} position={settings.layoutPositions.vendorGst || { x: 48, y: 230 }} onStop={(e, data) => handleDrag('vendorGst', e, data)} handle=".grip">
                                        <div ref={vendorGstRef} onClick={() => setSelectedElementId('vendorGst')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'vendorGst' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <p className="text-indigo-600 font-black uppercase text-[10px]">GST: {isPreviewMode ? "27AAACG1234F1Z5" : (settings.gstNumber || "VERIFIED")}</p>
                                        </div>
                                    </Draggable>

                                    {/* 2.1 META DETAILS */}
                                    <Draggable nodeRef={paymentMetaRef} position={settings.layoutPositions.paymentMeta || { x: 500, y: 150 }} onStop={(e, data) => handleDrag('paymentMeta', e, data)} handle=".grip">
                                        <div ref={paymentMetaRef} onClick={() => setSelectedElementId('paymentMeta')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'paymentMeta' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Payment Mode</span>
                                                <span className="text-xs font-black text-slate-900 uppercase underline decoration-emerald-300 decoration-2 underline-offset-4">{settings.paymentMode}</span>
                                            </div>
                                        </div>
                                    </Draggable>

                                    <Draggable nodeRef={shippingMetaRef} position={settings.layoutPositions.shippingMeta || { x: 500, y: 190 }} onStop={(e, data) => handleDrag('shippingMeta', e, data)} handle=".grip">
                                        <div ref={shippingMetaRef} onClick={() => setSelectedElementId('shippingMeta')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'shippingMeta' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Fulfillment</span>
                                                <span className="text-xs font-black text-slate-900 uppercase">{settings.shippingMethod}</span>
                                            </div>
                                        </div>
                                    </Draggable>

                                    {/* 3. TABLE AREA */}
                                    <Draggable nodeRef={tableRef} position={settings.layoutPositions.table || { x: 48, y: 300 }} onStop={(e, data) => handleDrag('table', e, data)} handle=".grip">
                                        <div ref={tableRef} onClick={() => setSelectedElementId('table')} className={`absolute z-10 group transition-all cursor-pointer ${selectedElementId === 'table' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`} style={{ width: 'calc(100% - 96px)' }}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-20">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-white">
                                                <div className="grid grid-cols-[1fr_80px_120px_150px] bg-slate-900 text-white py-4 px-6 text-[9px] font-black uppercase tracking-widest" style={{ backgroundColor: settings.themeColor }}>
                                                    <span>Item Description</span>
                                                    <span className="text-center">Qty</span>
                                                    <span className="text-right">Rate</span>
                                                    <span className="text-right bg-white/10 -mx-6 px-6">Net Value</span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="grid grid-cols-[1fr_80px_120px_150px] py-6 px-6 text-[11px] font-black uppercase text-slate-700 hover:bg-slate-50 transition-colors">
                                                            <div>
                                                                <p className="text-slate-950 mb-1">Core Industrial Module V{i}</p>
                                                                <p className="text-[8px] font-medium text-slate-400 tracking-wider">Technical deployment phase unit specification</p>
                                                            </div>
                                                            <div className="text-center">{i * 5}</div>
                                                            <div className="text-right text-slate-400">₹ {(i * 4500).toLocaleString()}</div>
                                                            <div className="text-right text-slate-950 px-2 bg-slate-50/50">₹ {(i * 5 * i * 4500).toLocaleString()}.00</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 flex justify-end">
                                                <div className="w-80 space-y-2 pt-4 border-t-2 border-slate-950">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-300">
                                                        <span>Sub Total</span>
                                                        <span className="text-slate-900">₹ 1,32,500.00</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[18px] font-black uppercase tracking-tighter" style={{ color: settings.themeColor }}>
                                                        <span className="text-slate-950">Grand Net</span>
                                                        <span>₹ 1,56,350</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Draggable>

                                    {/* 4. SIGNATORIES - BROKEN DOWN */}
                                    <Draggable nodeRef={signatoryLeftRef} position={settings.layoutPositions.signatoryLeft || { x: 48, y: 800 }} onStop={(e, data) => handleDrag('signatoryLeft', e, data)} handle=".grip">
                                        <div ref={signatoryLeftRef} onClick={() => setSelectedElementId('signatoryLeft')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'signatoryLeft' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-14 w-48 border-b border-slate-200 relative mb-1 flex items-center justify-center italic text-slate-200 text-[10px]">Partner Seal</div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase">Received By</p>
                                            </div>
                                        </div>
                                    </Draggable>

                                    <Draggable nodeRef={signatoryRightRef} position={settings.layoutPositions.signatoryRight || { x: 480, y: 800 }} onStop={(e, data) => handleDrag('signatoryRight', e, data)} handle=".grip">
                                        <div ref={signatoryRightRef} onClick={() => setSelectedElementId('signatoryRight')} className={`absolute z-20 group p-4 transition-all cursor-pointer ${selectedElementId === 'signatoryRight' ? 'ring-4 ring-indigo-500 rounded-2xl bg-indigo-50/5' : ''}`}>
                                            <div className="grip absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition-all border border-indigo-200 shadow-sm z-30">
                                                <GripVertical size={14} className="text-indigo-600"/>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className="h-14 w-48 border-b-2 border-slate-200 relative mb-1 flex items-center justify-center opacity-30 italic font-black text-indigo-400 transform -rotate-6 text-[10px]">Verified Digital Desk</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-900 uppercase">{settings.authorizedSignatory?.name || "Authorized Desk"}</p>
                                                    <p className="text-[8px] font-black uppercase text-indigo-600 tracking-widest">Official Signatory</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Draggable>

                                    {/* 5. BOTTOM ART */}
                                    <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-900 z-0" style={{ backgroundColor: settings.themeColor }} />
                                    
                                    {/* Dynamic Custom Elements */}
                                    {settings.customElements?.map(el => (
                                        <DraggableElement 
                                            key={el.id}
                                            el={el}
                                            isSelected={selectedElementId === el.id}
                                            onSelect={setSelectedElementId}
                                            onDrag={handleDrag}
                                            onUpdate={updateCustomElement}
                                            onRemove={removeCustomElement}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                     )}
                     </div>
                </main>

                <aside className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-8 no-scrollbar flex flex-col gap-10 shadow-2xl relative z-[100] shrink-0">
                    <div className="flex w-full gap-2 p-2 bg-slate-50 rounded-[22px] shadow-inner mb-4">
                        {['Branding', 'Layout', 'Elements', 'Data'].map(m => (
                            <button 
                                key={m}
                                onClick={() => setActiveSection(m.toLowerCase())}
                                className={`flex-1 py-3 rounded-xl text-[8.5px] font-black uppercase tracking-tight transition-all ${activeSection === m.toLowerCase() ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {activeSection === 'data' ? (
                        <div className="space-y-10 animate-in slide-in-from-right">
                            <div className="space-y-1.5 px-2">
                                <h2 className="text-[11px] font-black text-slate-950 uppercase tracking-tighter">Data Dictionary</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Context Tokens</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "Vendor Name", val: "{{VENDOR_NAME}}", icon: User },
                                    { label: "Date Ref", val: "{{PO_DATE}}", icon: Calendar },
                                    { label: "Grand Total", val: "{{TOTAL}}", icon: IndianRupee },
                                    { label: "PO Number", val: "{{PO_NUM}}", icon: Hash }
                                ].map(field => (
                                    <div key={field.label} className="p-5 bg-white border border-slate-100 rounded-[24px] flex flex-col gap-3 group hover:border-indigo-400 transition-all cursor-copy shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50"><field.icon size={16} /></div>
                                            <span className="text-[10px] font-black text-slate-950 uppercase">{field.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black py-2 px-4 bg-slate-50 rounded-xl text-indigo-600 border border-dashed border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">{field.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : selectedElementId ? (
                        <div className="space-y-10 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 transform scale-105 shadow-sm">
                                    <Type size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black text-slate-950 uppercase tracking-tighter">Properties</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {selectedElementId}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Element Color</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {["#000000", settings.themeColor, "#64748b", "#ef4444", "#22c55e", "#ffffff"].map(c => (
                                            <button key={c} onClick={() => updateElementStyle('color', c)} className={`h-7 w-7 rounded-full border-2 border-white shadow-md transition-all hover:scale-125 ${getElementStyle(selectedElementId).color === c ? "ring-2 ring-indigo-500 ring-offset-4" : "ring-1 ring-slate-100"}`} style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Font Size</label>
                                        <span className="text-[10px] font-black text-indigo-600">{getElementStyle(selectedElementId).fontSize || "16px"}</span>
                                    </div>
                                    <input type="range" min="8" max="140" value={parseInt(getElementStyle(selectedElementId).fontSize) || 16} onChange={e => updateElementStyle('fontSize', `${e.target.value}px`)} className="w-full h-2 rounded-lg bg-slate-100 accent-indigo-600 cursor-pointer" />
                                </div>
                                <div className="space-y-3">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</label>
                                     <div className="grid grid-cols-2 gap-2">
                                         {["400", "600", "800", "900"].map(w => (
                                             <button key={w} onClick={() => updateElementStyle('fontWeight', w)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${getElementStyle(selectedElementId).fontWeight === w ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{w === "400" ? "Regular" : "Bold"}</button>
                                         ))}
                                     </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Letter Spacing</label>
                                        <span className="text-[10px] font-black text-indigo-600">{(getElementStyle(selectedElementId).letterSpacing || "0").replace('px', '')}px</span>
                                    </div>
                                    <input type="range" min="-2" max="20" step="0.5" value={parseFloat(getElementStyle(selectedElementId).letterSpacing) || 0} onChange={e => updateElementStyle('letterSpacing', `${e.target.value}px`)} className="w-full h-2 rounded-lg bg-slate-100 accent-indigo-600 cursor-pointer" />
                                </div>

                                <div className="pt-6 border-t border-slate-50 space-y-4">
                                     <p className="text-[10px] font-black text-slate-950 uppercase tracking-tighter">Spacing & Layout</p>
                                     <div className="space-y-4">
                                         <div className="space-y-2">
                                             <div className="flex justify-between items-center"><label className="text-[9px] font-bold text-slate-400 uppercase">Opacity</label><span className="text-[9px] font-black text-indigo-600">{Math.round((getElementStyle(selectedElementId).opacity || 1) * 100)}%</span></div>
                                             <input type="range" min="0" max="1" step="0.1" value={getElementStyle(selectedElementId).opacity || 1} onChange={e => updateElementStyle('opacity', parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 accent-indigo-600 cursor-pointer" />
                                         </div>
                                         <div className="space-y-2">
                                             <div className="flex justify-between items-center"><label className="text-[9px] font-bold text-slate-400 uppercase">Vertical Padding</label><span className="text-[9px] font-black text-indigo-600">{getElementStyle(selectedElementId).padding || "0px"}</span></div>
                                             <input type="range" min="0" max="100" value={parseInt(getElementStyle(selectedElementId).padding) || 0} onChange={e => updateElementStyle('padding', `${e.target.value}px`)} className="w-full h-1 bg-slate-100 accent-indigo-600 cursor-pointer" />
                                         </div>
                                         <div className="space-y-2">
                                             <div className="flex justify-between items-center"><label className="text-[9px] font-bold text-slate-400 uppercase">Top Margin</label><span className="text-[9px] font-black text-rose-500">{getElementStyle(selectedElementId).marginTop || "0px"}</span></div>
                                             <input type="range" min="0" max="100" value={parseInt(getElementStyle(selectedElementId).marginTop) || 0} onChange={e => updateElementStyle('marginTop', `${e.target.value}px`)} className="w-full h-1 bg-slate-100 accent-rose-500 cursor-pointer" />
                                         </div>
                                     </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedElementId(null)} className="w-full py-4 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-[.3em] rounded-2xl hover:bg-rose-100 transition-all border border-rose-100">Deselect Element</button>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in slide-in-from-right">
                            {activeSection === 'branding' && (
                                <div className="space-y-10 animate-in slide-in-from-right">
                                    <div className="space-y-4 px-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Elite Theme Presets</label>
                                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 pt-2">
                                            {[
                                                { name: "Sapphire", color: "#4f46e5", font: "'Inter', sans-serif" },
                                                { name: "Emerald", color: "#10b981", font: "'Roboto', sans-serif" },
                                                { name: "Crimson", color: "#ef4444", font: "'Outfit', sans-serif" },
                                                { name: "Midnight", color: "#1e293b", font: "'Inter', sans-serif" }
                                            ].map(theme => (
                                                <button 
                                                    key={theme.name}
                                                    onClick={() => setSettings({...settings, themeColor: theme.color, fontFamily: theme.font})}
                                                    className="flex-shrink-0 w-24 h-24 rounded-[28px] bg-white border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-50 transition-all group shadow-sm shadow-slate-100/50"
                                                >
                                                    <div className="w-10 h-10 rounded-full shadow-lg transform group-hover:scale-110 transition-transform" style={{ backgroundColor: theme.color }} />
                                                    <span className="text-[8px] font-black text-slate-900 uppercase tracking-tighter">{theme.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-2">
                                        <div className="h-48 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 group hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden shadow-inner">
                                            {settings.logo ? <img src={settings.logo} className="h-full w-full object-contain p-8" /> : (
                                                <>
                                                    <div className="p-4 bg-white rounded-2xl shadow-lg shadow-slate-100 text-slate-300 group-hover:text-indigo-600 transition-all"><ImageIcon size={32} /></div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo (PNG/JPG)</p>
                                                </>
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Accent</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {["#1e3a8a", "#f97316", "#0d9488", "#e11d48", "#16a34a", "#7c3aed", "#4f46e5", "#000000"].map(c => (
                                                    <button key={c} onClick={() => setSettings({ ...settings, themeColor: c })} className={`h-10 w-10 rounded-[14px] border-2 border-white shadow-sm ring-1 ring-slate-100 transition-all hover:scale-110 ${settings.themeColor === c ? 'ring-4 ring-indigo-500 scale-110 shadow-xl' : ''}`} style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6 pt-4 border-t border-slate-50">
                                         <div className="space-y-2">
                                              <label className="text-[9px] font-black text-slate-400 uppercase">Entity Name</label>
                                              <input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black shadow-inner outline-none focus:ring-4 focus:ring-indigo-50" />
                                         </div>
                                         <div className="space-y-2">
                                              <label className="text-[9px] font-black text-slate-400 uppercase">Fiscal ID (GST)</label>
                                              <input value={settings.gstNumber} onChange={e => setSettings({...settings, gstNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black shadow-inner outline-none focus:ring-4 focus:ring-indigo-50" />
                                         </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === 'layout' && (
                                <div className="space-y-8 animate-in slide-in-from-right">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Engine</label>
                                        <select value={settings.layoutTemplate} onChange={e => setSettings({...settings, layoutTemplate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all">
                                            <option value="Modern">Standard Modern</option>
                                            <option value="ProfessionalV2">Professional V2 (Ultimate)</option>
                                        </select>
                                     </div>
                                     <div className="space-y-4 pt-6 border-t border-slate-50">
                                         <button onClick={() => setSettings({...settings, isWatermarkEnabled: !settings.isWatermarkEnabled})} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all shadow-sm ${settings.isWatermarkEnabled ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>{settings.isWatermarkEnabled ? "Watermark Active" : "Add Watermark"}</button>
                                     </div>
                                </div>
                            )}

                            {activeSection === 'elements' && (
                                <div className="space-y-10 animate-in slide-in-from-right">
                                    <div className="space-y-1.5 px-2">
                                        <h2 className="text-[11px] font-black text-slate-950 uppercase tracking-tighter">Component Library</h2>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Drag to Canvas</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: "Text Block", desc: "Custom paragraph element", type: "text", icon: Type },
                                            { label: "Signature Pad", desc: "Authorized signatory block", type: "signatory", icon: UserCheck },
                                            { label: "Divider Line", desc: "Section separator", type: "divider", icon: Layout },
                                            { label: "Fiscal Table", desc: "Itemized billing grid", type: "table", icon: Hash }
                                        ].map(item => (
                                            <div 
                                                key={item.label}
                                                onClick={() => addCustomElement(item.type)} 
                                                className="p-6 bg-white border border-slate-100 rounded-[28px] flex items-center gap-5 group hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-50 transition-all cursor-pointer"
                                            >
                                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                    <item.icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-950 uppercase mb-1">{item.label}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
             </div>

             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                input[type='range'] {
                    height: 6px;
                    border-radius: 6px;
                    background: #f1f5f9;
                    appearance: none;
                }
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: white;
                    border: 4px solid #4f46e5;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
                }
                .grip:hover { background: #4f46e5 !important; color: white !important; border-color: #4f46e5 !important; }
                .grip:hover svg { color: white !important; }
             `}</style>
        </div>
    );
}
