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

const FloatingLabelInput = ({ label, name, value, onChange, onBlur, type = "text", required, placeholder, icon: Icon }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative group">
            <div className={`
                absolute left-4 transition-all duration-200 pointer-events-none flex items-center gap-2
                ${(focused || value) ? '-top-2.5 z-10 bg-white px-2 text-xs font-bold text-indigo-600' : 'top-4 text-slate-400'}
            `}>
                {focused && Icon && <Icon size={12} />}
                {label} {required && <span className="text-indigo-600">*</span>}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
                className={`
                    w-full rounded-xl border bg-white px-4 py-4 font-medium text-slate-700 outline-none transition-all
                    ${focused ? 'border-indigo-300 ring-4 ring-indigo-100 shadow-sm' : 'border-slate-200'}
                    ${value && !focused ? 'border-slate-200' : ''}
                `}
                placeholder={focused ? placeholder : ""}
                required={required}
            />
            {value && !focused && (
                <div className="absolute right-4 top-4 animate-in fade-in zoom-in text-indigo-600 duration-300">
                    <CheckCircle size={18} />
                </div>
            )}
        </div>
    );
};

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
                    flex items-center gap-2 h-9 px-2 border-2 border-dashed rounded-sm transition-all cursor-pointer bg-slate-50
                    ${file ? 'border-blue-700 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-100'}
                `}
            >
                <div className={`flex h-5 w-5 items-center justify-center rounded-sm ${file ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {file ? <CheckCircle size={12} strokeWidth={3} /> : <Upload size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold truncate ${file ? 'text-blue-900' : 'text-slate-500'}`}>
                        {file ? file.name : "ATTACH DOCUMENT"}
                    </p>
                </div>
                {file && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(fieldId, null); }}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                        <X size={12} strokeWidth={3} />
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
    const { categoryId: urlCategoryId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const token = searchParams.get("token");
    const shouldOpenDirectForm = location.pathname === "/onboarding";

    // ── Public 3-step state ──────────────────────────
    const [publicStep, setPublicStep] = useState(
        urlCategoryId || token || shouldOpenDirectForm ? "form" : "pick-category"
    ); // "pick-category" | "category-detail" | "form"
    const [allCategories, setAllCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [catLoading, setCatLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState(null);
    // ─────────────────────────────────────────────────

    const [categoryDetails, setCategoryDetails] = useState(null);
    const [loading, setLoading] = useState(
        urlCategoryId || token || shouldOpenDirectForm ? true : false
    );
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState({});
    const [files, setFiles] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isReviewStep, setIsReviewStep] = useState(false);
    const [emailWarning, setEmailWarning] = useState("");
    const [emailError, setEmailError] = useState("");

    const STEPS = [
        { name: "Basic Info", desc: "General information", icon: Building2 },
        { name: "Business Details", desc: "Organization & ownership", icon: CheckSquare },
        { name: "Financial Details", desc: "Banking & financial info", icon: CreditCard },
        { name: "Documents", desc: "Upload required files", icon: FileStack },
        { name: "Review & Submit", desc: "Verify & finalize", icon: ShieldCheck },
    ];

    // Fetch all active categories for Step 1 — public endpoint (NO auth token)
    useEffect(() => {
        if (publicStep === "pick-category") {
            publicApi.get("/categories/public-list")
                .then(r => setAllCategories(r.data.data || []))
                .catch(() => toast.error("Could not load categories"))
                .finally(() => setCatLoading(false));
        }
    }, [publicStep]);

    // Fetch form when entering form step — public endpoints use publicApi (no auth)
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                let catIdToFetch = urlCategoryId || selectedCat?._id;

                if (token) {
                    // Invitation token verification IS authenticated
                    const res = await api.get(`/invitations/verify/${token}`);
                    catIdToFetch = res.data.data.categoryId || res.data.data.category._id;
                    setFormValues({ email: res.data.data.email });
                }

                if (catIdToFetch) {
                    // Use publicApi — no auth header, won't trigger 401 redirect
                    const formRes = await publicApi.get(`/forms/public/${catIdToFetch}`);
                    if (!hasRenderableSections(formRes.data.data)) {
                        throw new Error("Selected registration form is not published yet.");
                    }
                    setCategoryDetails({ formTemplate: formRes.data.data });
                } else {
                    try {
                        const formRes = await publicApi.get(`/forms/master/public`);
                        if (!hasRenderableSections(formRes.data.data)) {
                            throw new Error("Master registration form is not published yet.");
                        }
                        setCategoryDetails({ formTemplate: formRes.data.data });
                    } catch (masterErr) {
                        if (shouldOpenDirectForm) {
                            const categoriesRes = await publicApi.get("/categories/public-list");
                            const openCategories = (categoriesRes.data.data || []).filter(
                                (category) => category.hasPublishedForm
                            );

                            let fallbackCategory = null;
                            let fallbackTemplate = null;

                            for (const category of openCategories) {
                                try {
                                    const fallbackFormRes = await publicApi.get(
                                        `/forms/public/${category._id}`
                                    );

                                    if (hasRenderableSections(fallbackFormRes.data.data)) {
                                        fallbackCategory = category;
                                        fallbackTemplate = fallbackFormRes.data.data;
                                        break;
                                    }
                                } catch {
                                    // Try the next open category until we find a usable form.
                                }
                            }

                            if (!fallbackCategory || !fallbackTemplate) {
                                throw masterErr;
                            }

                            setSelectedCat(fallbackCategory);
                            setCategoryDetails({ formTemplate: fallbackTemplate });
                        } else {
                            throw masterErr;
                        }
                    }
                }
            } catch (err) {
                const msg =
                    err.response?.data?.message ||
                    err.message ||
                    "Registration form not available for this category.";
                if (token || urlCategoryId || selectedCat || shouldOpenDirectForm) {
                    toast.error(msg);
                }
                setCategoryDetails(null);
                setCurrentStep(0);
                setIsReviewStep(false);
                setPublicStep("pick-category");
            } finally {
                setLoading(false);
            }
        };

        if (publicStep === "form") {
            fetchDetails();
        }
    }, [publicStep, token, urlCategoryId, selectedCat, shouldOpenDirectForm]);

    // ── STEP 1: Category Card Selection (REDESIGNED) ──────────────
    if (publicStep === "pick-category") {
        return (
            <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-900">
                {/* Refined Header */}
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                                <ShieldCheck size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">VMS PRO</h1>
                                <p className="text-[12px] font-semibold text-slate-500 mt-1">Enterprise Registry</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1800px] px-6 py-6 lg:py-8">
                    {/* Minimal Section Header */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                                Selection Portal
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:leading-[1.1]">
                            Select Your <span className="text-indigo-600">Onboarding Vertical.</span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
                            Our architecture uses specialized workflows for different industry domains. Select your business vertical below to initiate the secure registration process.
                        </p>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-700 border border-slate-100 shadow-inner">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Portals</p>
                                <p className="text-lg font-bold text-slate-900">{(allCategories || []).length} Categories</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-inner">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Published Status</p>
                                <p className="text-lg font-bold text-slate-900">{(allCategories || []).filter(c => c.hasPublishedForm).length} Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-6">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-900">Strategic Business Portals</h3>
                            </div>
                            <div className="flex-1 max-w-sm">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Search size={16} strokeWidth={2.5} />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Search portals by name or code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-6 text-[13px] font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {catLoading ? (
                            <div className="flex justify-center py-32"><LoadingSpinner /></div>
                        ) : (allCategories || []).filter(c => 
                            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.code?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center">
                                <Search size={48} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-2xl font-bold text-slate-900">No matching categories found.</h3>
                                <p className="mt-2 text-slate-500 text-lg font-medium italic">Try checking the spelling or contact administration.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
                                {(allCategories || [])
                                    .filter(c => 
                                        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        c.code?.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((cat) => {
                                    if (!cat) return null;
                                    const hasForm = cat.hasPublishedForm;
                                    return (
                                        <button
                                            key={cat._id}
                                            disabled={!hasForm}
                                            onClick={() => {
                                                setSelectedCat(cat);
                                                setPublicStep("category-detail");
                                            }}
                                            className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-7 text-left transition-all duration-200
                                                ${hasForm
                                                    ? "border-slate-200 hover:border-slate-900 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer"
                                                    : "border-slate-100 opacity-60 cursor-not-allowed shadow-none"
                                                }`}
                                        >
                                            <div className="relative z-10 w-full">
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all
                                                        ${hasForm ? "bg-slate-50 text-slate-900 border-slate-200 group-hover:bg-slate-900 group-hover:text-white" : "bg-slate-50 text-slate-300 border-slate-100"}`}>
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all
                                                        ${hasForm 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' 
                                                            : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                        {hasForm ? (
                                                            <>
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </span>
                                                                <span className="tracking-[0.1em]">ACTIVE PORTAL</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldCheck size={10} strokeWidth={3} />
                                                                <span className="tracking-[0.1em]">LOCKED</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-black tracking-tight text-slate-900">
                                                    {cat.name}
                                                </h3>
                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    Code: {cat.code || "REG-X"}
                                                </p>
                                                
                                                <p className="mt-6 line-clamp-3 text-[13px] font-medium leading-relaxed text-slate-500 italic">
                                                    {cat.description || "Established vertical protocol for industrial procurement and vendor management registry."}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                                {!hasForm ? (
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Registration Locked</span>
                                                ) : (
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Select Portal</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <footer className="mt-auto py-12 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                            <ShieldCheck size={22} strokeWidth={2.5} className="text-slate-900" />
                            <p className="text-sm font-bold tracking-tight text-slate-800">
                                GT Global Procurement Registry &copy; 2026
                            </p>
                        </div>
                        <div className="flex items-center gap-10">
                            <p className="text-sm font-bold text-slate-600">
                                Already registered?
                            </p>
                            <a href="/login" className="px-6 py-3 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                                Sign In Portal
                            </a>
                        </div>
                    </footer>
                </main>
            </div>
        );
    }

    // ── STEP 2: Category Detail ────────────────────────
    if (publicStep === "category-detail" && selectedCat) {
        return (
            <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
                {/* Simple Header */}
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
                    <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                                <ShieldCheck size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">VMS PRO</h1>
                                <p className="text-[12px] font-semibold text-slate-500 mt-1">Enterprise Registry</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPublicStep("pick-category")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <ArrowLeft size={16} /> Back to Portals
                        </button>
                    </div>
                </header>

                <main className="mx-auto max-w-[1200px] w-full px-6 py-12 lg:py-20 flex-1 flex flex-col items-center justify-center">
                    <div className="w-full bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left: Info */}
                            <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white border border-slate-900 shadow-sm">
                                        Registry Selection
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                    {selectedCat.name}
                                </h2>
                                <p className="mt-4 text-[12px] font-black uppercase tracking-widest text-slate-400">
                                    Official Index: {selectedCat.code}
                                </p>
                                
                                <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-200/60">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Service Scope</p>
                                    <p className="text-[15px] font-semibold text-slate-600 leading-relaxed italic">
                                        {selectedCat.description || "This portal facilitates the formal onboarding of business entities within this industrial category."}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="p-8 lg:p-12 bg-slate-50/50 flex flex-col justify-center">
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Initiate Official Enrollment</h3>
                                    <p className="mt-3 text-[14px] font-medium text-slate-500 leading-relaxed">
                                        By proceeding, you will begin the official onboarding process. Please ensure you have all legal and financial credentials ready for submission.
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {['Electronic Document Submission', 'Compliance Validation (SLA)', 'Departmental Review Cycle'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                                                <CheckCircle size={12} />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        setLoading(true);
                                        setPublicStep("form");
                                    }}
                                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-slate-900 py-5 text-[12px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 hover:bg-black transition-all hover:-translate-y-1 active:translate-y-0"
                                >
                                    Proceed to Enrollment dossier
                                    <ArrowRight size={18} />
                                </button>
                                
                                <p className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Processing time: 10-15 Minutes
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-auto py-10 border-t border-slate-200 bg-white flex justify-center">
                     <p className="text-sm font-bold tracking-tight text-slate-800">
                        GT Global Procurement Registry &copy; 2026
                    </p>
                </footer>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <LoadingSpinner />
        </div>
    );

    const sections = categoryDetails?.formTemplate?.sections || [];
    const hasVisibleSections = hasRenderableSections(categoryDetails?.formTemplate);

    if (!hasVisibleSections) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
                <div className="max-w-xl w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-10 md:p-14 text-center">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center shadow-inner">
                        <AlertCircle size={40} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                        Status Unavailable
                    </p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                        Official form is not yet published.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 italic">
                        The registration portal for this category is under configuration. Please select another vertical.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setPublicStep("pick-category")}
                            className="w-full rounded-2xl bg-slate-900 px-6 py-5 text-[12px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Back to portal directory
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full rounded-2xl border border-slate-200 px-6 py-5 text-[12px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentSection = sections[currentStep] || { sectionTitle: "Loading...", fields: [] };

    const mapSectionToStepIndex = (section, idx) => {
        if (!section || sections.length === 0) return 0;
        const title = (section.sectionTitle || "").toLowerCase();
        if (title.includes("bank") || title.includes("financial") || title.includes("tax") || title.includes("payment") || title.includes("accounting") || title.includes("recon")) return 2;
        if (idx === sections.length - 1 && sections.length > 3) {
            // If it's the last section and has many, check if it fits in documents
            if (section.fields.some(f => f.type === 'file')) return 3;
        }
        if (title.includes("attachment") || title.includes("document") || title.includes("upload") || title.includes("signature") || title.includes("stamp")) return 3;
        if (title.includes("business") || title.includes("classification") || title.includes("statutory") || title.includes("industry") || title.includes("msme")) return 1;
        if (title.includes("contact") || title.includes("identification") || title.includes("address") || title.includes("location") || title.includes("vendor")) return 0;

        // Dynamic distribution if no keywords match
        const progress = idx / Math.max(sections.length, 1);
        if (progress < 0.25) return 0;
        if (progress < 0.5) return 1;
        if (progress < 0.75) return 2;
        return 3;
    };

    const activeMajorStep = isReviewStep ? 4 : mapSectionToStepIndex(currentSection, currentStep);

    const handleInputChange = (name, value) => {
        setFormValues(prev => {
            const updatedValues = { ...prev, [name]: value };

            // Auto-fetch City and State if pincode is exactly 6 digits (Indian Pincode format)
            if ((name === 'pincode' || name === 'co_pincode') && value.length === 6) {
                fetchPincodeDetails(value, updatedValues);
            }

            return updatedValues;
        });
    };

    const fetchPincodeDetails = async (pincode, currentFormValues) => {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data && data[0] && data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                const cityField = Object.prototype.hasOwnProperty.call(currentFormValues, 'city') ? 'city' : 'co_city';
                const stateField = Object.prototype.hasOwnProperty.call(currentFormValues, 'state') ? 'state' : 'co_state';
                const countryField = Object.prototype.hasOwnProperty.call(currentFormValues, 'country') ? 'country' : 'co_country';

                setFormValues(prev => ({
                    ...prev,
                    [cityField]: postOffice.District || postOffice.Block,
                    [stateField]: postOffice.State,
                    [countryField]: postOffice.Country || "India"
                }));
                toast.success("Location details auto-filled successfully!");
            }
        } catch (error) {
            console.error("Error fetching pincode details:", error);
        }
    };

    const handleFileChange = (name, file) => {
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    // Email validation and duplicate check
    const validateEmailFormat = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailBlur = async (fieldName, value) => {
        if (!value) return;
        if (!validateEmailFormat(value)) {
            setEmailError("Please enter a valid email address.");
            setEmailWarning("");
            return;
        }
        setEmailError("");
        try {
            const res = await api.get(`/applications/check-email?email=${encodeURIComponent(value)}`);
            if (res.data.data.exists) {
                setEmailWarning("This email has already submitted a registration. You may update your existing application.");
            } else {
                setEmailWarning("");
            }
        } catch {
            // Silently ignore duplicate check errors
        }
    };

    const nextStep = () => {
        if (currentStep < sections.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else if (!isReviewStep) {
            setIsReviewStep(true);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (isReviewStep) {
            setIsReviewStep(false);
            window.scrollTo(0, 0);
        } else if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const toastId = toast.loading("Processing your application dossier...");
        try {
            // Extract email from all possible field names the master form may use
            const resolvedEmail =
                formValues.email ||
                formValues.co_email ||
                formValues.contactEmail ||
                formValues.businessEmail ||
                formValues.vendorEmail ||
                formValues.emailAddress ||
                "";

            if (!resolvedEmail) {
                toast.error("Please fill in your Email address before submitting.", { id: toastId });
                setSubmitting(false);
                return;
            }

            // Merge the resolved email back into formValues so the backend always finds it
            const enrichedFormValues = { ...formValues, email: resolvedEmail, co_email: resolvedEmail };

            const formData = new FormData();
            if (token) formData.append("invitationToken", token);
            const catId = urlCategoryId || selectedCat?._id;
            if (catId) formData.append("categoryId", catId);
            formData.append("email", resolvedEmail);
            formData.append("companyName",
                formValues.companyName ||
                formValues.co_name ||
                formValues.vendorName ||
                formValues.company_name ||
                "Dynamic Vendor"
            );
            formData.append("formTemplateId", categoryDetails.formTemplate._id);
            formData.append("formVersion", categoryDetails.formTemplate.version || 1);
            formData.append("data", JSON.stringify(enrichedFormValues));

            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            const res = await api.post("/applications/submit", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const appId = res.data.data._id;
            if (appId) {
                await api.post(`/applications/${appId}/finalize`);
            }

            toast.success("Application submitted successfully!", { id: toastId });
            navigate("/success", { state: { appId, email: resolvedEmail } });
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed. Please try again.", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
            {/* Main Content Area - Now Full Width */}
            <main className="min-h-screen flex flex-col items-center">
                
                {/* Horizontal Top Stepper - Edge to Edge */}
                <div className="w-full bg-white border-b border-slate-200 py-4 px-2 sticky top-0 z-20 shadow-sm">
                    <div className="w-full mx-auto">
                        <div className="flex items-center justify-between gap-1">
                            {STEPS.map((step, idx) => {
                                const isCompleted = idx < activeMajorStep;
                                const isActive = idx === activeMajorStep;
                                const Icon = step.icon;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                        {/* Horizontal Progress Line */}
                                        {idx !== STEPS.length - 1 && (
                                            <div className="absolute left-[50%] right-[-50%] top-5 h-0.5 border-t-2 border-dotted border-slate-200 z-0">
                                            </div>
                                        )}

                                        {/* Icon Circle */}
                                        <div className={`
                                            relative z-10 w-10 min-w-[40px] h-10 rounded-full flex items-center justify-center transition-all border-2
                                            ${isActive ? 'bg-blue-700 border-blue-700 text-white shadow shadow-blue-100 scale-105' : ''}
                                            ${isCompleted ? 'bg-white border-blue-700 text-blue-700' : ''}
                                            ${!isActive && !isCompleted ? 'bg-slate-50 border-slate-200 text-slate-300' : ''}
                                        `}>
                                            {isCompleted ? <CheckCircle size={16} strokeWidth={3} /> : <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />}
                                        </div>

                                        {/* Text Labels */}
                                        <div className="mt-2 text-center hidden md:block">
                                            <p className={`text-[10px] font-black uppercase tracking-tight leading-none ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>
                                                {step.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Form Workspace - Zero Space Left */}
                <div className="w-full p-2 lg:p-3 flex flex-col">
                    <div className="w-full py-2">
                        {/* Form Header */}
                        <header className="mb-4 pb-3 border-b border-slate-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 bg-slate-200 border border-slate-300 rounded-sm text-[9px] font-bold uppercase tracking-wider text-slate-700">
                                {isReviewStep ? "REVIEW" : `PHASE ${currentStep + 1}/${sections.length}`}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1 uppercase">
                            {isReviewStep ? "Verify registry" : currentSection.sectionTitle}
                        </h2>
                    </header>

                    {/* Max Density Form Content */}
                    <div className="bg-white border border-slate-200 p-3 shadow-none rounded-none">
                        {!isReviewStep ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-3 items-end">
                                    {currentSection.fields.map((field, fIdx) => {
                                        const fieldName = field.name || field.fieldId;
                                        
                                        // Dynamic Column Spans for Ultimate High Density
                                        let colSpan = "col-span-1";
                                        if (field.type === 'textarea') {
                                            colSpan = "col-span-full"; // Full width for comments
                                        } else if (field.type === 'file' || field.label.toLowerCase().includes('email')) {
                                            colSpan = "sm:col-span-2"; // Double wide for files/emails
                                        }

                                        return (
                                            <div key={fIdx} className={`${colSpan}`}>
                                                <label className="block text-[9px] font-bold uppercase tracking-tight text-slate-500 mb-[1px] leading-none">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                
                                                {field.type === "text" || field.type === "number" || field.type === "date" || field.type === "textarea" || field.type === "email" ? (
                                                    <div className="relative">
                                                        {field.type === "textarea" ? (
                                                            <textarea
                                                                required={field.required}
                                                                placeholder={field.placeholder}
                                                                value={formValues[fieldName] || ""}
                                                                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                                className="w-full h-24 rounded-sm border border-slate-300 bg-white p-2 text-[13px] font-medium text-slate-900 outline-none focus:border-blue-700 focus:ring-0 placeholder:text-slate-300 shadow-none mx-0"
                                                            />
                                                        ) : (
                                                            <input
                                                                type={field.type}
                                                                required={field.required}
                                                                placeholder={field.placeholder}
                                                                value={formValues[fieldName] || ""}
                                                                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                                onBlur={field.type === "email" ? (e) => handleEmailBlur(fieldName, e.target.value) : undefined}
                                                                className="w-full h-9 rounded-sm border border-slate-300 bg-white px-2 text-[13px] font-medium text-slate-900 outline-none focus:border-blue-700 focus:ring-0 placeholder:text-slate-300 shadow-none"
                                                            />
                                                        )}
                                                        {field.type === "email" && emailError && (
                                                            <p className="mt-1 text-[9px] font-bold text-red-600 uppercase flex items-center gap-1">
                                                                <AlertCircle size={10} /> {emailError}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : field.type === "dropdown" ? (
                                                    <div className="relative">
                                                        <select
                                                            required={field.required}
                                                            className="w-full h-9 rounded-sm border border-slate-300 bg-white px-2 text-[13px] font-medium text-slate-900 outline-none focus:border-blue-700 focus:ring-0 cursor-pointer shadow-none appearance-none"
                                                            value={formValues[fieldName] || ""}
                                                            onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                        >
                                                            <option value="">SELECT</option>
                                                            {field.options && field.options.map((opt, oIdx) => (
                                                                <option key={oIdx} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : field.type === "file" ? (
                                                    <FileUploadField
                                                        label={field.label}
                                                        required={field.required}
                                                        fieldId={fieldName}
                                                        file={files[fieldName]}
                                                        onChange={handleFileChange}
                                                    />
                                                ) : field.type === "checkbox" ? (
                                                    <div className="flex items-center gap-2 p-1 pt-3">
                                                        <input
                                                            type="checkbox"
                                                            required={field.required}
                                                            checked={formValues[fieldName] || false}
                                                            onChange={(e) => handleInputChange(fieldName, e.target.checked)}
                                                            className="h-4 w-4 rounded-sm border-slate-400 text-blue-700 focus:ring-0"
                                                        />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{field.label}</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {sections.map((section, sIdx) => (
                                    <div key={sIdx} className="border-b last:border-0 border-slate-200 pb-8 last:pb-0">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-300">
                                                {sIdx + 1}
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{section.sectionTitle}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {section.fields.map((field, fIdx) => {
                                                const fieldName = field.name || field.fieldId;
                                                const value = formValues[fieldName];

                                                return (
                                                    <div key={fIdx} className="p-3 border border-slate-300 bg-white">
                                                        <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500 mb-1">{field.label}</p>
                                                        {field.type === "file" ? (
                                                            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-tight">
                                                                <FileText size={14} />
                                                                <span>{files[fieldName] ? files[fieldName].name : "No file attached"}</span>
                                                            </div>
                                                        ) : (
                                                            <p className="font-bold text-slate-900 text-sm uppercase tracking-tight break-words">{value === true ? "YES" : value === false ? "NO" : (value ? value.toString() : "-")}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <div className="col-span-full mt-6 p-4 border border-blue-200 bg-blue-50/30 rounded-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-blue-700 text-white shadow-sm">
                                            <ShieldCheck size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-black text-blue-900 tracking-wider uppercase mb-1 flex items-center gap-2">
                                                Official Declaration of Accuracy
                                            </h4>
                                            <p className="text-[10px] font-bold text-blue-800/70 leading-relaxed uppercase tracking-tight mb-4 max-w-3xl">
                                                I hereby certify that the information provided in this registration dossier is true, complete, and accurate. I understand that any deliberate omissions or falsifications may result in disqualification.
                                            </p>
                                            <label className="inline-flex items-center gap-3 cursor-pointer group bg-white border border-blue-200 px-4 py-2 hover:bg-blue-50 transition-colors">
                                                <input type="checkbox" required className="h-4 w-4 rounded-sm border-blue-400 text-blue-700 focus:ring-0 cursor-pointer" />
                                                <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Acknowledge & Verify Registry</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-300 gap-4">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0 && !isReviewStep}
                                className={`
                                    flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider px-6 py-3 rounded-sm transition-colors border
                                    ${(currentStep === 0 && !isReviewStep) ? 'opacity-30 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-50' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100'}
                                `}
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>

                            <button
                                onClick={nextStep}
                                disabled={submitting}
                                className="flex-1 max-w-[240px] flex items-center justify-center gap-2 rounded-sm bg-blue-700 px-8 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-none hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50"
                            >
                                {submitting ? "Processing..." : isReviewStep ? "Finalize Submission" : currentStep === sections.length - 1 ? "Review Entry" : "Continue Phase"}
                                {!submitting && <ArrowRight size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Footer Progress Bar for Mobile */}
                    <div className="lg:hidden mt-8 grid grid-cols-5 gap-2 px-2">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 rounded-sm transition-all duration-500 ${i <= activeMajorStep ? 'bg-blue-700' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>
                </div>
                </div>
            </main>
        </div>
    );
}
