import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";

// Plain axios (no auth headers) for public endpoints
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
import {
    Search,
    Activity,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Upload,
    FileText,
    ShieldCheck,
    Building2,
    Package,
    Globe,
    Users,
    Briefcase,
    AlertCircle,
    X,
    Edit2,
    FileStack,
    CheckSquare,
    CreditCard
} from "lucide-react";

const LoadingSpinner = () => (
    <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-indigo-50">
                <ShieldCheck className="text-indigo-600" size={24} />
            </div>
        </div>
        <div className="text-center">
            <p className="mb-1 text-lg font-bold text-slate-900">Preparing Registration</p>
            <p className="text-sm font-medium text-slate-500">Please wait while we load the available setup.</p>
        </div>
    </div>
);

const FileUploadField = ({ label, file, onChange, required, fieldId }) => {
    const fileInputRef = useRef(null);

    return (
        <div className="flex flex-col gap-1 w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => onChange(fieldId || label, e.target.files[0])}
                className="hidden"
            />
            <div
                onClick={() => fileInputRef.current.click()}
                className={`
                    flex items-center gap-2 h-11 px-4 border-2 border-dashed rounded-sm transition-all cursor-pointer bg-slate-50/30
                    ${file ? 'border-blue-700 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-100'}
                `}
            >
                <div className={`flex h-6 w-6 items-center justify-center rounded-sm ${file ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {file ? <CheckCircle size={14} strokeWidth={3} /> : <Upload size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-bold truncate ${file ? 'text-blue-900' : 'text-slate-500'}`}>
                        {file ? file.name : "ATTACH REQUIRED DOCUMENT"}
                    </p>
                </div>
                {file && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(fieldId, null); }}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>
                )}
            </div>
        </div>
    );
};

const hasRenderableSections = (formTemplate) =>
    Array.isArray(formTemplate?.sections) &&
    formTemplate.sections.some(
        (section) => Array.isArray(section?.fields) && section.fields.length > 0
    );

export default function RegistrationWizard() {
    const { categoryId: urlCategoryId, formId: urlFormId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const token = searchParams.get("token");
    const shouldOpenDirectForm = location.pathname.includes("/onboarding") || urlFormId;

    const [publicStep, setPublicStep] = useState(
        urlCategoryId || urlFormId || token || shouldOpenDirectForm ? "form" : "pick-category"
    );
    const [allCategories, setAllCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [catLoading, setCatLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState(null);

    const [categoryDetails, setCategoryDetails] = useState(null);
    const [loading, setLoading] = useState(
        urlCategoryId || urlFormId || token || shouldOpenDirectForm ? true : false
    );
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState({});
    const [files, setFiles] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isReviewStep, setIsReviewStep] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [collapsed, setCollapsed] = useState({});

    // Fetch categories for Step 1
    useEffect(() => {
        if (publicStep === "pick-category") {
            publicApi.get("/categories/public-list")
                .then(r => setAllCategories(r.data.data || []))
                .catch(() => toast.error("Could not load categories"))
                .finally(() => setCatLoading(false));
        }
    }, [publicStep]);

    // Fetch form when entering form step
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                let catIdToFetch = urlCategoryId || selectedCat?._id;
                let specificFormToFetch = urlFormId;

                if (token) {
                    const res = await api.get(`/invitations/verify/${token}`);
                    catIdToFetch = res.data.data.categoryId || res.data.data.category._id;
                    setFormValues({ email: res.data.data.email });
                }

                if (specificFormToFetch) {
                    const formRes = await publicApi.get(`/forms/single/public/${specificFormToFetch}`);
                    if (!hasRenderableSections(formRes.data.data)) {
                        throw new Error("This registration link is not currently active.");
                    }
                    setCategoryDetails({ formTemplate: formRes.data.data });
                } else if (catIdToFetch) {
                    const formRes = await publicApi.get(`/forms/public/${catIdToFetch}`);
                    if (!hasRenderableSections(formRes.data.data)) {
                        throw new Error("Selected registration form is not published yet.");
                    }
                    setCategoryDetails({ formTemplate: formRes.data.data });
                } else {
                    const formRes = await publicApi.get(`/forms/master/public`);
                    if (!hasRenderableSections(formRes.data.data)) {
                        throw new Error("Master registration form is not published yet.");
                    }
                    setCategoryDetails({ formTemplate: formRes.data.data });
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.message || "Registration form not available.";
                toast.error(msg);
                setPublicStep("pick-category");
            } finally {
                setLoading(false);
            }
        };

        if (publicStep === "form") {
            fetchDetails();
        }
    }, [publicStep, token, urlCategoryId, selectedCat]);

    if (publicStep === "pick-category") {
        return (
            <div className="min-h-screen bg-[#f8fafc] font-sans">
                 <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-3">
                        <div className="flex items-center gap-6">
                            <img src="/hgiel_logo.png" alt="HGIEL Logo" className="h-11 w-auto object-contain" />
                            <div className="h-7 w-[1px] bg-slate-200" />
                            <div>
                                <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">REGISTRY PORTAL</h1>
                                <p className="text-[10px] font-bold text-blue-700 tracking-[0.2em] mt-1">H.G. INFRA ENGINEERING LTD.</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1800px] px-6 py-12">
                   <div className="mb-12">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Select Your <span className="text-blue-700">Onboarding Vertical.</span></h1>
                        <p className="max-w-2xl text-slate-600 font-medium text-lg leading-relaxed">Initiate your partnership by choosing the most relevant business category below.</p>
                   </div>

                   {catLoading ? (
                        <div className="flex justify-center py-32"><LoadingSpinner /></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {allCategories.map(cat => (
                                <button
                                    key={cat._id}
                                    disabled={!cat.hasPublishedForm}
                                    onClick={() => { setSelectedCat(cat); setPublicStep("category-detail"); }}
                                    className={`group flex flex-col justify-between rounded-3xl border bg-white p-8 text-left transition-all duration-300
                                        ${cat.hasPublishedForm ? "border-slate-200 hover:border-slate-900 hover:shadow-2xl cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all mb-8">
                                        <Building2 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{cat.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">{cat.code}</p>
                                        <p className="text-[14px] font-medium text-slate-500 leading-relaxed italic line-clamp-3">{cat.description || "Establish your business credentials within our strategic procurement network."}</p>
                                    </div>
                                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{cat.hasPublishedForm ? "Enter Portal" : "Portal Locked"}</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    if (publicStep === "category-detail" && selectedCat) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col">
                <header className="border-b border-slate-100 bg-white px-8 py-6">
                    <button onClick={() => setPublicStep("pick-category")} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">
                        <ArrowLeft size={16} /> Back to Directory
                    </button>
                </header>
                <main className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 grid md:grid-cols-2">
                        <div className="p-12 border-r border-slate-50">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">{selectedCat.name}</h2>
                            <div className="h-1 w-20 bg-blue-700 mb-8" />
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">{selectedCat.description || "Initiate the official verification process for this strategic vertical."}</p>
                        </div>
                        <div className="p-12 bg-slate-50/50 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Ready to Begin?</h3>
                            <button
                                onClick={() => setPublicStep("form")}
                                className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all hover:-translate-y-1 active:translate-y-0 shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                            >
                                START REGISTRATION <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><LoadingSpinner /></div>;

    const sections = categoryDetails?.formTemplate?.sections || [];

    const handleInputChange = (name, value) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name, file) => {
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const toastId = toast.loading("Executing final transmission...");
        try {
            const resolvedEmail = formValues.email || Object.values(formValues).find(v => typeof v === 'string' && v.includes('@'));
            if (!resolvedEmail) throw new Error("A valid Email address is required for submission.");

            const formData = new FormData();
            if (token) formData.append("invitationToken", token);
            if (selectedCat?._id) formData.append("categoryId", selectedCat._id);
            formData.append("email", resolvedEmail);
            formData.append("companyName", formValues.companyName || formValues.vendorName || "Dossier Submission");
            formData.append("formTemplateId", categoryDetails.formTemplate._id);
            formData.append("data", JSON.stringify(formValues));

            Object.keys(files).forEach(key => { if (files[key]) formData.append(key, files[key]); });

            await api.post("/applications/submit", formData, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Application successfully registered!", { id: toastId });
            navigate("/success", { state: { email: resolvedEmail } });
        } catch (err) {
            toast.error(err.message || "Transmission error.", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans">
            {/* Ariba Style UI Structure */}
            <main className="w-full flex flex-col min-h-screen">
                
                {/* Header Bar */}
                <header className="bg-white border-b border-slate-300 py-3 px-8 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-6">
                        <img src="/hgiel_logo.png" alt="HGIEL Logo" className="h-12 w-auto object-contain" />
                        <div className="h-8 w-[1px] bg-slate-200" />
                        <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Supplier Self-Registration Request Form</h2>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Portal Active • v3.0</span>
                    </div>
                </header>

                <div className="mx-auto w-full max-w-[1240px] px-6 py-12 flex-1">
                    
                    {/* Main Container */}
                    <div className="bg-white border border-slate-300 shadow-sm mb-12">
                        
                        {/* Section 1 Header */}
                        <div className="bg-[#e5e7eb] px-6 py-4 flex items-center gap-4 border-b border-slate-300 cursor-pointer">
                            <ArrowRight size={18} className="text-slate-600 rotate-90" />
                            <span className="text-[15px] font-black text-slate-800 uppercase tracking-tight">1 Supplier Information</span>
                        </div>

                        <div className="p-6 bg-[#f9fafb]">
                             {/* Section 1.1 Header */}
                             <div className="bg-white border border-slate-300 shadow-sm mb-4">
                                <div className="bg-[#f3f4f6] px-6 py-4 flex items-center gap-4 border-b border-slate-300 cursor-pointer">
                                    <ArrowRight size={16} className="text-slate-600 rotate-90" />
                                    <span className="text-[14px] font-bold text-slate-700 uppercase tracking-tight">1.1 Please fill Below Supplier Information</span>
                                </div>

                                <div className="p-6 space-y-4">
                                    {!isReviewStep ? (
                                        sections.map((section, sIdx) => {
                                            const sectionKey = `section-${sIdx}`;
                                            const isOpen = !collapsed[sectionKey];

                                            const toggleSection = (idx) => {
                                                setCollapsed(prev => {
                                                    const willBeOpen = !prev[`section-${idx}`];
                                                    const newState = { ...prev, [`section-${idx}`]: willBeOpen };
                                                    
                                                    // Expansion Shortcut: If opening section 1.1.1.1, also open up to 1.1.1.4.2
                                                    if (idx === 0 && willBeOpen) {
                                                        for (let i = 1; i <= 6; i++) {
                                                            newState[`section-${i}`] = true; // Use true if true=open in this logic
                                                        }
                                                    }
                                                    return newState;
                                                });
                                            };
                                            
                                            // Ensure we use the correct boolean convention for collapsed vs isOpen
                                            // In our state: collapsed[key] = true means it's closed.
                                            // So !collapsed[key] = true means it's open.
                                            // Wait, let's just use the current 'isOpen' variable from state for consistency.
                                            
                                            return (
                                                <div key={sectionKey} className="bg-white border border-slate-200 overflow-hidden transition-all duration-300">
                                                    <div 
                                                        onClick={() => setCollapsed(prev => {
                                                            const willBeOpen = prev[sectionKey]; // if previously true (collapsed), it will be open (false)
                                                            const newState = { ...prev, [sectionKey]: !prev[sectionKey] };
                                                            if (sIdx === 0 && willBeOpen) {
                                                                for (let i = 1; i <= 6; i++) { newState[`section-${i}`] = false; }
                                                            }
                                                            return newState;
                                                        })}
                                                        className="bg-[#fcfdfe] px-6 py-5 flex items-center justify-between border-b border-slate-100 cursor-pointer group hover:bg-slate-50"
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`transition-all duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                                                                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-700" />
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[11px] font-black text-blue-700 tracking-[0.2em]">{section.sectionTitle.split(' ')[0]}</span>
                                                                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest border-l border-slate-200 pl-4">{section.sectionTitle.split(' ').slice(1).join(' ')}</h3>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isOpen && (
                                                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-10">
                                                                 {section.fields.map((field, fIdx) => {
                                                                    const fieldName = field.name || field.fieldId;

                                                                    // Dynamic Visibility Logic
                                                                    if (field.dependsOn && formValues[field.dependsOn] !== field.dependsOnValue) {
                                                                        return null;
                                                                    }

                                                                    let colSpan = "col-span-1";
                                                                    if (field.type === 'textarea') colSpan = "col-span-full";
                                                                    else if (field.label.toLowerCase().includes('email') || field.label.toLowerCase().includes('name')) colSpan = "md:col-span-1 lg:col-span-2";

                                                                    return (
                                                                        <div key={fIdx} className={colSpan}>
                                                                            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                                                                                {field.label} {field.required && <span className="text-blue-700">*</span>}
                                                                            </label>
                                                                            
                                                                            {field.type === "text" || field.type === "number" || field.type === "date" || field.type === "textarea" || field.type === "email" ? (
                                                                                field.type === "textarea" ? (
                                                                                    <textarea
                                                                                        required={field.required}
                                                                                        value={formValues[fieldName] || ""}
                                                                                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                                                        className="w-full h-32 border border-slate-200 bg-slate-50/50 px-5 py-4 text-[13px] font-bold text-slate-900 outline-none transition-all focus:border-blue-700 focus:bg-white focus:ring-8 focus:ring-blue-50/50"
                                                                                    />
                                                                                ) : (
                                                                                    <input
                                                                                        type={field.type}
                                                                                        required={field.required}
                                                                                        value={formValues[fieldName] || ""}
                                                                                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                                                        className="w-full h-12 border border-slate-200 bg-slate-50/50 px-5 text-[13px] font-bold text-slate-900 outline-none transition-all focus:border-blue-700 focus:bg-white focus:ring-8 focus:ring-blue-50/50"
                                                                                    />
                                                                                )
                                                                            ) : field.type === "dropdown" ? (
                                                                                <select
                                                                                    required={field.required}
                                                                                    value={formValues[fieldName] || ""}
                                                                                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                                                    className="w-full h-12 border border-slate-200 bg-slate-50/50 px-5 text-[13px] font-bold text-slate-900 outline-none transition-all focus:border-blue-700 focus:bg-white focus:ring-8 focus:ring-blue-50/50 appearance-none cursor-pointer"
                                                                                >
                                                                                    <option value="">SELECT OPTION</option>
                                                                                    {field.options?.map((opt, oIdx) => <option key={oIdx} value={opt}>{opt}</option>)}
                                                                                </select>
                                                                            ) : field.type === "file" ? (
                                                                                <FileUploadField
                                                                                    label={field.label}
                                                                                    required={field.required}
                                                                                    file={files[fieldName]}
                                                                                    fieldId={fieldName}
                                                                                    onChange={handleFileChange}
                                                                                />
                                                                            ) : null}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="p-20 text-center">
                                            <CheckCircle size={80} className="mx-auto text-blue-700 mb-8" />
                                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Verification Phase Success</h3>
                                            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-12">Submit dossier below to complete enrollment.</p>
                                            <button onClick={() => setIsReviewStep(false)} className="px-10 py-5 border-2 border-slate-900 font-black text-xs uppercase tracking-[0.25em] hover:bg-slate-900 hover:text-white transition-all">Modify Details</button>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-8 pt-12 pb-24 border-t-2 border-slate-200">
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-12 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-600 transition-all"
                        >
                            Abort Process
                        </button>
                        <button 
                            onClick={isReviewStep ? handleSubmit : () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsReviewStep(true); }}
                            disabled={submitting}
                            className="px-24 py-6 bg-blue-700 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-blue-100 hover:bg-blue-800 hover:-translate-y-2 active:translate-y-0 transition-all flex items-center gap-6"
                        >
                            {submitting ? "Transmitting..." : isReviewStep ? "Execute Submission" : "Validate & Review"}
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
