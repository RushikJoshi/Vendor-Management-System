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

const STATUTORY_SECTION_PATTERN = /statutory compliances/i;
const PAN_DEPENDENCY_FIELD = "panStatus";
const PAN_DEPENDENCY_VALUE = "Available";
const TURNOVER_DEPENDENCY_FIELD = "eInvoiceApplicable";
const TURNOVER_DEPENDENCY_VALUE = "Yes";
const TURNOVER_FIELD_IDS = ["ly1Turnover", "ly2Turnover", "ly3Turnover", "ly4Turnover", "ly5Turnover", "ly6Turnover"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\d{10}$/;
const STATUTORY_FIELD_CODES = {
    panStatus: "1.1.1.3.1.1",
    panNum: "1.1.1.3.1.2",
    panHolderName: "1.1.1.3.1.3",
    aadhaarCardNo: "1.1.1.3.1.5",
    tanStatus: "1.1.1.3.1.6",
    tanNo: "1.1.1.3.1.7",
    tanHolderName: "1.1.1.3.1.8",
    msmeRegistrationStatus: "1.1.1.3.1.9",
    msmeNo: "1.1.1.3.1.10",
    gstRegistrationStatus: "1.1.1.3.1.14",
    gstState: "1.1.1.3.1.15",
    gstStatus: "1.1.1.3.1.55",
    gstRegisteredEmail: "1.1.1.3.1.56",
    gstRegisteredMobile: "1.1.1.3.1.57",
    gstFilingStatus: "1.1.1.3.1.58",
    pfStatus: "1.1.1.3.1.59",
    pfNo: "1.1.1.3.1.60",
    esiStatus: "1.1.1.3.1.61",
    esiNo: "1.1.1.3.1.62",
    eInvoiceApplicable: "1.1.1.3.1.63",
    turnoverHeading: "1.1.1.3.1.65",
    ly1Turnover: "1.1.1.3.1.65.1",
    ly2Turnover: "1.1.1.3.1.65.2",
    ly3Turnover: "1.1.1.3.1.65.3",
    ly4Turnover: "1.1.1.3.1.65.4",
    ly5Turnover: "1.1.1.3.1.65.5",
    ly6Turnover: "1.1.1.3.1.65.6",
};

const REQUIRED_STATUTORY_FIELDS = [
    {
        fieldId: "panStatus",
        label: "PAN Status",
        type: "dropdown",
        required: true,
        options: ["Available", "Not Available"],
        order: 1,
    },
    {
        fieldId: "panNum",
        label: "PAN No.",
        type: "text",
        required: true,
        order: 2,
        dependsOn: PAN_DEPENDENCY_FIELD,
        dependsOnValue: PAN_DEPENDENCY_VALUE,
    },
    {
        fieldId: "panHolderName",
        label: "PAN Holder Name",
        type: "text",
        required: true,
        order: 3,
        dependsOn: PAN_DEPENDENCY_FIELD,
        dependsOnValue: PAN_DEPENDENCY_VALUE,
    },
    {
        fieldId: "aadhaarCardNo",
        label: "Aadhaar Card No",
        type: "text",
        required: false,
        order: 4,
        dependsOn: PAN_DEPENDENCY_FIELD,
        dependsOnValue: PAN_DEPENDENCY_VALUE,
    },
    {
        fieldId: "tanStatus",
        label: "TAN Status",
        type: "dropdown",
        required: true,
        options: ["Available", "Not Available"],
        order: 5,
        dependsOn: PAN_DEPENDENCY_FIELD,
        dependsOnValue: PAN_DEPENDENCY_VALUE,
    },
    {
        fieldId: "msmeRegistrationStatus",
        label: "MSME Registration Status",
        type: "dropdown",
        required: true,
        options: ["Registered", "Not Registered"],
        order: 8,
        dependsOn: PAN_DEPENDENCY_FIELD,
        dependsOnValue: PAN_DEPENDENCY_VALUE,
    },
    {
        fieldId: "gstRegistrationStatus",
        label: "GST Registration Status",
        type: "dropdown",
        required: true,
        options: ["Registered", "Not Registered"],
        order: 10,
        dependsOn: PAN_DEPENDENCY_FIELD,
        dependsOnValue: PAN_DEPENDENCY_VALUE,
    },
    {
        fieldId: "tanNo",
        label: "Enter TAN No.",
        type: "text",
        required: true,
        order: 6,
        dependsOn: "tanStatus",
        dependsOnValue: "Available",
    },
    {
        fieldId: "tanHolderName",
        label: "TAN Holder Name",
        type: "text",
        required: true,
        order: 7,
        dependsOn: "tanStatus",
        dependsOnValue: "Available",
    },
    {
        fieldId: "msmeNo",
        label: "Enter MSME No.",
        type: "text",
        required: true,
        order: 9,
        dependsOn: "msmeRegistrationStatus",
        dependsOnValue: "Registered",
    },
    {
        fieldId: "gstState",
        label: "State",
        type: "dropdown",
        required: true,
        options: [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Andaman and Nicobar Islands",
            "Chandigarh",
            "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi",
            "Jammu and Kashmir",
            "Ladakh",
            "Lakshadweep",
            "Puducherry",
        ],
        order: 11,
        dependsOn: "gstRegistrationStatus",
        dependsOnValue: "Registered",
    },
    {
        fieldId: "gstStatus",
        label: "GST Status",
        type: "dropdown",
        required: false,
        options: ["Active", "Inactive", "Cancelled", "Suspended"],
        order: 12,
        dependsOn: "gstRegistrationStatus",
        dependsOnValue: "Registered",
    },
    {
        fieldId: "gstRegisteredEmail",
        label: "Email ID Registered with GST No.",
        type: "email",
        required: false,
        order: 13,
        dependsOn: "gstRegistrationStatus",
        dependsOnValue: "Registered",
    },
    {
        fieldId: "gstRegisteredMobile",
        label: "Mobile No. Registered with GST No.",
        type: "text",
        required: false,
        order: 14,
        dependsOn: "gstRegistrationStatus",
        dependsOnValue: "Registered",
    },
    {
        fieldId: "gstFilingStatus",
        label: "GST Filling Status",
        type: "dropdown",
        required: false,
        options: ["Regular", "Composition", "Nil Filing", "Inactive"],
        order: 15,
        dependsOn: "gstRegistrationStatus",
        dependsOnValue: "Registered",
    },
    {
        fieldId: "pfStatus",
        label: "PF Status",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 16,
    },
    {
        fieldId: "pfNo",
        label: "PF No.",
        type: "text",
        required: true,
        order: 17,
        dependsOn: "pfStatus",
        dependsOnValue: "Yes",
    },
    {
        fieldId: "esiStatus",
        label: "ESI Status",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 18,
    },
    {
        fieldId: "esiNo",
        label: "ESI No.",
        type: "text",
        required: true,
        order: 19,
        dependsOn: "esiStatus",
        dependsOnValue: "Yes",
    },
    {
        fieldId: "eInvoiceApplicable",
        label: "Is E-Invoice applicable to you?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 20,
    },
    {
        fieldId: "ly1Turnover",
        label: "LY1",
        type: "number",
        required: true,
        order: 21,
        dependsOn: TURNOVER_DEPENDENCY_FIELD,
        dependsOnValue: TURNOVER_DEPENDENCY_VALUE,
    },
    {
        fieldId: "ly2Turnover",
        label: "LY2",
        type: "number",
        required: true,
        order: 22,
        dependsOn: TURNOVER_DEPENDENCY_FIELD,
        dependsOnValue: TURNOVER_DEPENDENCY_VALUE,
    },
    {
        fieldId: "ly3Turnover",
        label: "LY3",
        type: "number",
        required: true,
        order: 23,
        dependsOn: TURNOVER_DEPENDENCY_FIELD,
        dependsOnValue: TURNOVER_DEPENDENCY_VALUE,
    },
    {
        fieldId: "ly4Turnover",
        label: "LY4",
        type: "number",
        required: true,
        order: 24,
        dependsOn: TURNOVER_DEPENDENCY_FIELD,
        dependsOnValue: TURNOVER_DEPENDENCY_VALUE,
    },
    {
        fieldId: "ly5Turnover",
        label: "LY5",
        type: "number",
        required: true,
        order: 25,
        dependsOn: TURNOVER_DEPENDENCY_FIELD,
        dependsOnValue: TURNOVER_DEPENDENCY_VALUE,
    },
    {
        fieldId: "ly6Turnover",
        label: "LY6",
        type: "number",
        required: true,
        order: 26,
        dependsOn: TURNOVER_DEPENDENCY_FIELD,
        dependsOnValue: TURNOVER_DEPENDENCY_VALUE,
    },
];

const enrichStatutoryComplianceSection = (section) => {
    if (!STATUTORY_SECTION_PATTERN.test(section?.sectionTitle || "")) {
        return section;
    }

    const existingFields = Array.isArray(section.fields) ? section.fields : [];
    const existingById = new Map(existingFields.map((field) => [field.fieldId || field.name, field]));
    const reservedIds = new Set(REQUIRED_STATUTORY_FIELDS.map((field) => field.fieldId));

    const mergedPriorityFields = REQUIRED_STATUTORY_FIELDS
        .map((field) => {
            const existing = existingById.get(field.fieldId);
            return existing ? { ...existing, ...field } : { ...field };
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const remainingFields = existingFields
        .filter((field) => !reservedIds.has(field.fieldId || field.name))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((field, index) => ({
            ...field,
            order: mergedPriorityFields.length + index + 1,
        }));

    return {
        ...section,
        fields: [...mergedPriorityFields, ...remainingFields],
    };
};

const enrichRegistrationTemplate = (formTemplate) => ({
    ...formTemplate,
    sections: Array.isArray(formTemplate?.sections)
        ? formTemplate.sections.map(enrichStatutoryComplianceSection)
        : [],
});

const SuggestSearchField = ({ value, onChange, required, mockData, placeholder }) => {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (query.length > 0) {
            const matches = mockData.filter(c => c.toLowerCase().includes(query.toLowerCase()));
            setResults(matches);
            setShowResults(true);
        } else {
            setResults(mockData);
            setShowResults(true);
        }
    }, [query, mockData]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setShowResults(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative group w-full" ref={containerRef}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    required={required}
                    value={query}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => { setQuery(e.target.value); if (!e.target.value) onChange(""); }}
                    placeholder={placeholder}
                    className="w-full h-12 border border-slate-300 bg-white pl-5 pr-12 text-[12px] font-bold text-slate-900 outline-none transition-all focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />
                <div className="absolute right-0 h-full w-12 flex items-center justify-center border-l border-slate-200 bg-slate-50 group-hover:bg-slate-100 cursor-pointer">
                    <Search size={16} className="text-slate-400 group-hover:text-blue-700 transition-colors" />
                </div>
            </div>
            
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 w-full md:w-[150%] bg-white border border-slate-300 shadow-2xl z-[1000] max-h-[400px] overflow-y-auto mt-1 animate-in fade-in slide-in-from-top-1">
                    {results.map((res, idx) => {
                        const parts = res.split(' > ');
                        const mainPath = parts.slice(0, -1).join(' > ');
                        const endTerm = parts[parts.length - 1];

                        return (
                            <div 
                                key={idx}
                                onClick={() => { setQuery(res); onChange(res); setShowResults(false); }}
                                className="px-5 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors group flex flex-col gap-0.5"
                            >
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    {mainPath} {parts.length > 1 ? '>' : ''}
                                </p>
                                <p className="text-[12px] font-black text-blue-700 uppercase tracking-tight">
                                    {endTerm}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

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
    const [expanded, setExpanded] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

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
                    setCategoryDetails({ formTemplate: enrichRegistrationTemplate(formRes.data.data) });
                } else if (catIdToFetch) {
                    const formRes = await publicApi.get(`/forms/public/${catIdToFetch}`);
                    if (formRes.data.data && hasRenderableSections(formRes.data.data)) {
                        setCategoryDetails({ formTemplate: enrichRegistrationTemplate(formRes.data.data) });
                    } else {
                        // Fallback logic
                        const formResMaster = await publicApi.get(`/forms/master/public`);
                        if (!hasRenderableSections(formResMaster.data.data)) {
                            throw new Error("Master registration form is not published yet.");
                        }
                        setCategoryDetails({ formTemplate: enrichRegistrationTemplate(formResMaster.data.data) });
                    }
                } else {
                    const formRes = await publicApi.get(`/forms/master/public`);
                    if (!hasRenderableSections(formRes.data.data)) {
                        throw new Error("Master registration form is not published yet.");
                    }
                    setCategoryDetails({ formTemplate: enrichRegistrationTemplate(formRes.data.data) });
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
            <div className="registration-readable registration-page min-h-screen font-sans">
                 <header className="registration-header sticky top-0 z-40">
                    <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-2 md:px-0">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">Registry Portal</h1>
                                <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-blue-700">GT VENDOR MANAGEMENT</p>
                            </div>
                        </div>
                        <div className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[12px] font-medium text-slate-500 md:block">
                            Vendor onboarding directory
                        </div>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
                   <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
                        <div className="registration-surface p-6 md:p-8">
                            <span className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                                Registration Directory
                            </span>
                            <h1 className="mb-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                                Select your onboarding vertical and start the supplier registration flow.
                            </h1>
                            <p className="max-w-2xl text-[15px] font-medium leading-7 text-slate-600 md:text-lg">
                                Choose the most relevant business category below. We&apos;ll open the matching registration journey and required compliance details for that vertical.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                            <p className="text-[12px] font-semibold tracking-[0.14em] text-slate-500">AVAILABLE CATEGORIES</p>
                            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{allCategories.length}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Pick an active category to continue. Customized forms apply where available; otherwise, the master enterprise form is utilized.
                            </p>
                            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                Review tip: keep your business profile, email, mobile number, and statutory details ready before entering the form.
                            </div>
                        </div>
                   </section>

                   {catLoading ? (
                        <div className="registration-surface flex justify-center py-24"><LoadingSpinner /></div>
                    ) : (
                        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {allCategories.map(cat => (
                                <button
                                    key={cat._id}
                                    onClick={() => { setSelectedCat(cat); setPublicStep("category-detail"); }}
                                    className={`group flex min-h-[320px] flex-col justify-between rounded-[28px] border p-7 text-left transition-all duration-300 border-slate-200 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_50px_rgba(37,99,235,0.12)] cursor-pointer`}
                                >
                                    <div>
                                        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all border-blue-100 bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white`}>
                                            <Building2 size={28} />
                                        </div>

                                        <div className="mb-5 flex items-center justify-between gap-3">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                                                {cat.code || "Category"}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700`}>
                                                Active
                                            </span>
                                        </div>

                                        <h3 className="mb-3 text-[28px] font-bold leading-tight tracking-tight text-slate-900">{cat.name}</h3>
                                        <p className="text-[15px] font-medium leading-7 text-slate-600 line-clamp-4">
                                            {cat.description || "Establish your business credentials within our strategic procurement network."}
                                        </p>
                                    </div>

                                    <div className="mt-8 border-t border-slate-100 pt-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {cat.hasPublishedForm ? "Enter Portal" : "Portal Locked"}
                                            </span>
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </section>
                    )}
                </main>
            </div>
        );
    }

    if (publicStep === "category-detail" && selectedCat) {
        return (
            <div className="registration-readable registration-page min-h-screen flex flex-col">
                <header className="registration-header">
                    <button onClick={() => setPublicStep("pick-category")} className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                        <ArrowLeft size={16} /> Back to Directory
                    </button>
                </header>
                <main className="mx-auto flex w-full max-w-[1180px] flex-1 items-center px-4 py-8 md:px-6 md:py-12">
                    <div className="grid w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.10)] md:grid-cols-[minmax(0,1.4fr)_420px]">
                        <div className="p-8 md:p-12">
                            <span className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                                {selectedCat.code || "Onboarding Vertical"}
                            </span>
                            <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-slate-900">{selectedCat.name}</h2>
                            <p className="max-w-2xl text-[16px] font-medium leading-8 text-slate-600">
                                {selectedCat.description || "Initiate the official verification process for this strategic vertical."}
                            </p>

                            <div className="mt-8 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                    <p className="text-[12px] font-semibold tracking-[0.14em] text-slate-500">WHAT YOU&apos;LL NEED</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">Company details, primary contact info, and mandatory statutory information.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                    <p className="text-[12px] font-semibold tracking-[0.14em] text-slate-500">PROCESS</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">Fill the required sections, validate the form, and submit for admin review.</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center border-t border-slate-100 bg-slate-50/80 p-8 md:border-l md:border-t-0 md:p-10">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Ready to begin?</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Open the registration form for this vertical and continue with the onboarding process.
                            </p>
                            <button
                                onClick={() => setPublicStep("form")}
                                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-800"
                            >
                                Start Registration <ArrowRight size={18} />
                            </button>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
                                You can review and edit your details before the final submission step.
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (loading) return <div className="registration-readable min-h-screen flex items-center justify-center bg-[#f8fafc]"><LoadingSpinner /></div>;

    const MOCK_CATEGORIES = [
        "ALL (ALL) > Material (Material) > GENERAL CONSUMABLES (ZCON) > IT CONSUMABLE (120004) > CABLE MANAGER (13004011)",
        "ALL (ALL) > Material (Material) > ASSET MATERIAL (ZAST) > IT EQUIPMENT (130002) > MANAGED SWITCH 24 PORT (12000935)",
        "ALL (ALL) > Material (Material) > ASSET MATERIAL (ZAST) > IT EQUIPMENT (130002) > MANAGED SWITCH 48 PORT (12000936)",
        "ALL (ALL) > Material (Material) > GENERAL CONSUMABLES (ZCON) > IT CONSUMABLE (120004) > WIRE MANAGEMENT BOX (13006717)",
        "ALL (ALL) > Civil (Civil) > ROAD UTILITY > PAVEMENT > BITUMINOUS MIX",
        "ALL (ALL) > Civil (Civil) > ROAD UTILITY > EARTHWORK > EMBANKMENT",
        "ALL (ALL) > Civil (Civil) > ROAD UTILITY > DRAINAGE > RCC PIPES",
        "ALL (ALL) > Civil (Civil) > INFRASTRUCTURE > BRIDGE > STEEL STRUCTURES",
        "ALL (ALL) > Civil (Civil) > INFRASTRUCTURE > BRIDGE > EXPANSION JOINT",
        "ALL (ALL) > Civil (Civil) > BULK MATERIAL > AGGREGATES > CRUSHED STONE",
        "ALL (ALL) > Civil (Civil) > BULK MATERIAL > REINFORCEMENT > TMT BARS",
        "ALL (ALL) > Mechanical (Mech) > PLANT & MACHINERY > SPARES > HYDRAULIC PUMP",
        "ALL (ALL) > Mechanical (Mech) > PLANT & MACHINERY > CONSUMABLES > ENGINE OIL",
        "ALL (ALL) > Electrical (Elec) > SUBSTATION > SWITCHGEAR > TRANSFORMER",
        "ALL (ALL) > Electrical (Elec) > WIRING > CABLES > ARMOURED CABLE",
        "ALL (ALL) > Services (Services) > CONSULTANCY > DESIGN > ARCHITECTURAL",
        "ALL (ALL) > Services (Services) > LOGISTICS > FREIGHT > INTERNATIONAL",
        "ALL (ALL) > Services (Services) > LOGISTICS > TRANSPORT > LOCAL TRUCKING",
        "ALL (ALL) > Services (Services) > MANPOWER > SKILLED > ROAD CONSTRUCTION",
        "ALL (ALL) > Services (Services) > TESTING > LAB > SOIL TESTING",
        "ALL (ALL) > Material (Material) > FUEL & LUBRICANTS > DIESEL > BULK SUPPLY",
        "ALL (ALL) > Material (Material) > CONSTRUCTION MATERIAL > CEMENT > OPC 43 GRADE",
        "ALL (ALL) > Material (Material) > CONSTRUCTION MATERIAL > CEMENT > PPC GRADE",
        "ALL (ALL) > Safety (HSE) > PPE > FOOTWEAR > SAFETY SHOES",
        "ALL (ALL) > Safety (HSE) > FIRE FIGHTING > EXTINGUISHER > CO2 TYPE"
    ];

    const MOCK_REGIONS = [
        "INDIA (IN) > Rajasthan > Jaipur",
        "INDIA (IN) > Rajasthan > Udaipur",
        "INDIA (IN) > Rajasthan > Jodhpur",
        "INDIA (IN) > Rajasthan > Ajmer",
        "INDIA (IN) > Rajasthan > Kota",
        "INDIA (IN) > Maharashtra > Mumbai",
        "INDIA (IN) > Maharashtra > Pune",
        "INDIA (IN) > Maharashtra > Nagpur",
        "INDIA (IN) > Maharashtra > Nashik",
        "INDIA (IN) > Gujarat > Ahmedabad",
        "INDIA (IN) > Gujarat > Surat",
        "INDIA (IN) > Gujarat > Vadodara",
        "INDIA (IN) > Delhi > NCR",
        "INDIA (IN) > Haryana > Gurugram",
        "INDIA (IN) > Haryana > Faridabad",
        "INDIA (IN) > Haryana > Panipat",
        "INDIA (IN) > Uttar Pradesh > Noida",
        "INDIA (IN) > Uttar Pradesh > Ghaziabad",
        "INDIA (IN) > Uttar Pradesh > Lucknow",
        "INDIA (IN) > Uttar Pradesh > Kanpur",
        "INDIA (IN) > Karnataka > Bengaluru",
        "INDIA (IN) > Karnataka > Mysuru",
        "INDIA (IN) > Telangana > Hyderabad",
        "INDIA (IN) > Tamil Nadu > Chennai",
        "INDIA (IN) > Tamil Nadu > Coimbatore",
        "INDIA (IN) > West Bengal > Kolkata",
        "INDIA (IN) > Madhya Pradesh > Indore",
        "INDIA (IN) > Madhya Pradesh > Bhopal",
        "INDIA (IN) > Punjab > Ludhiana",
        "INDIA (IN) > Punjab > Mohali",
        "INDIA (IN) > Andhra Pradesh > Vijayawada",
        "INDIA (IN) > Bihar > Patna"
    ];

    const MOCK_DEPARTMENTS = [
        "Operations > Site Engineering",
        "Operations > Project Management",
        "Operations > Surveying",
        "Procurement > Bulk Material",
        "Procurement > Plant & Machinery",
        "Procurement > IT & Assets",
        "Finance > Accounts Payable",
        "Finance > Taxation & Audit",
        "Quality (QA/QC) > Lab Testing",
        "Quality (QA/QC) > Field Inspection",
        "HR & Admin > Personnel Management",
        "HR & Admin > Industrial Relations",
        "HSE & Safety > Site Safety",
        "HSE & Safety > Environmental Compliance",
        "Legal > Contract Management",
        "IT > Infrastructure & Support"
    ];

    const sections = categoryDetails?.formTemplate?.sections || [];

    const handleInputChange = (name, value) => {
        setValidationErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name, file) => {
        setValidationErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    const getStatutoryFieldCode = (section, field) => {
        const fieldName = field?.name || field?.fieldId;
        if (fieldName && STATUTORY_FIELD_CODES[fieldName]) {
            return STATUTORY_FIELD_CODES[fieldName];
        }
        const sectionPrefix = (section?.sectionTitle || "").match(/^(\d+(?:\.\d+)*)/)?.[1];
        if (!sectionPrefix) return null;
        return `${sectionPrefix}.1.${field.order ?? 0}`;
    };

    const isTurnoverField = (fieldName) => TURNOVER_FIELD_IDS.includes(fieldName);
    const isEmailField = (field, fieldName) =>
        field?.type === "email" || /email/i.test(fieldName || "") || /email/i.test(field?.label || "");
    const isMobileField = (field, fieldName) =>
        /mobile|phone/i.test(fieldName || "") || /mobile|phone/i.test(field?.label || "");

    const isFieldVisible = (section, field) => {
        const fieldName = field?.name || field?.fieldId;
        if (STATUTORY_SECTION_PATTERN.test(section?.sectionTitle || "") &&
            isTurnoverField(fieldName) &&
            formValues[TURNOVER_DEPENDENCY_FIELD] !== TURNOVER_DEPENDENCY_VALUE) {
            return false;
        }

        if (field?.dependsOn && formValues[field.dependsOn] !== field.dependsOnValue) {
            return false;
        }

        return true;
    };

    const sanitizeFieldValue = (field, fieldName, value) => {
        if (typeof value !== "string") return value;
        if (isMobileField(field, fieldName)) {
            return value.replace(/\D/g, "").slice(0, 10);
        }
        return value;
    };

    const isSectionVisible = (section) => {
        if (section?.dependsOn && formValues[section.dependsOn] !== section.dependsOnValue) {
            return false;
        }
        return true;
    };

    const isFieldFilled = (field, fieldName) => {
        if (field.type === "file") {
            return !!files[fieldName];
        }

        const value = formValues[fieldName];
        if (value === undefined || value === null) return false;
        if (typeof value === "boolean") return value;
        return String(value).trim() !== "";
    };

    const getFieldValidationIssue = (field, fieldName) => {
        const value = formValues[fieldName];
        const normalizedValue = typeof value === "string" ? value.trim() : value;

        if (!isFieldFilled(field, fieldName)) return null;

        if (isEmailField(field, fieldName) && !EMAIL_REGEX.test(String(normalizedValue))) {
            return "Please enter a valid email address";
        }

        if (isMobileField(field, fieldName) && !MOBILE_REGEX.test(String(normalizedValue))) {
            return "Mobile number must be exactly 10 digits";
        }

        return null;
    };

    const collectValidationIssues = (sectionsToValidate) => {
        const issues = [];

        sectionsToValidate.forEach((section, sectionIndex) => {
            if (!isSectionVisible(section)) return;

            (section.fields || []).forEach((field) => {
                const fieldName = field?.name || field?.fieldId;
                if (!fieldName || !field.required) return;
                if (!isFieldVisible(section, field)) return;
                if (!isFieldFilled(field, fieldName)) {
                    issues.push({
                        fieldName,
                        label: field.label,
                        sectionIndex,
                        sectionTitle: section.sectionTitle,
                        message: `Please fill required field: ${field.label}`,
                    });
                    return;
                }

                const fieldValidationIssue = getFieldValidationIssue(field, fieldName);
                if (fieldValidationIssue) {
                    issues.push({
                        fieldName,
                        label: field.label,
                        sectionIndex,
                        sectionTitle: section.sectionTitle,
                        message: fieldValidationIssue,
                    });
                }
            });
        });

        sectionsToValidate.forEach((section, sectionIndex) => {
            if (!isSectionVisible(section)) return;

            (section.fields || []).forEach((field) => {
                const fieldName = field?.name || field?.fieldId;
                if (!fieldName || field.required) return;
                if (!isFieldVisible(section, field)) return;

                const fieldValidationIssue = getFieldValidationIssue(field, fieldName);
                if (fieldValidationIssue) {
                    issues.push({
                        fieldName,
                        label: field.label,
                        sectionIndex,
                        sectionTitle: section.sectionTitle,
                        message: fieldValidationIssue,
                    });
                }
            });
        });

        return issues;
    };

    const focusOnFirstInvalidSection = (issues) => {
        if (!issues.length) return;
        const firstInvalid = issues[0];
        setExpanded(prev => ({ ...prev, [`section-${firstInvalid.sectionIndex}`]: true }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const applyValidationErrors = (issues) => {
        setValidationErrors(
            issues.reduce((acc, item) => {
                acc[item.fieldName] = true;
                return acc;
            }, {})
        );
    };

    const validateSections = (sectionsToValidate) => {
        const issues = collectValidationIssues(sectionsToValidate);
        if (!issues.length) {
            setValidationErrors({});
            return true;
        }

        applyValidationErrors(issues);
        focusOnFirstInvalidSection(issues);
        toast.error(issues[0].message);
        return false;
    };

    const renderFieldControl = (field, fieldName, compact = false) => {
        const hasError = !!validationErrors[fieldName];
        const isEmailLike = isEmailField(field, fieldName);
        const isMobileLike = isMobileField(field, fieldName);
        const effectiveType = isEmailLike ? "email" : isMobileLike ? "tel" : field.type;
        const controlClass = compact
            ? `w-full h-10 rounded-xl border px-4 text-[13px] font-semibold text-slate-900 outline-none transition-all ${hasError ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"}`
            : `w-full h-12 rounded-xl border px-4 text-[14px] font-semibold text-slate-900 outline-none transition-all ${hasError ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"}`;

        const textareaClass = compact
            ? `w-full h-28 rounded-xl border px-4 py-3 text-[13px] font-semibold text-slate-900 outline-none transition-all ${hasError ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"}`
            : `w-full h-32 rounded-xl border px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none transition-all ${hasError ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"}`;

        if (fieldName === "serviceCategory" || fieldName === "region" || fieldName === "department") {
            return (
                <SuggestSearchField
                    value={formValues[fieldName] || ""}
                    onChange={(val) => handleInputChange(fieldName, val)}
                    required={field.required}
                    mockData={fieldName === "serviceCategory" ? MOCK_CATEGORIES : fieldName === "region" ? MOCK_REGIONS : MOCK_DEPARTMENTS}
                    placeholder={fieldName === "serviceCategory" ? "Search Category..." : fieldName === "region" ? "Search Region..." : "Search Department..."}
                />
            );
        }

        if (field.type === "text" || field.type === "number" || field.type === "date" || field.type === "email") {
            return (
                <input
                    type={effectiveType}
                    required={field.required}
                    value={formValues[fieldName] || ""}
                    inputMode={isMobileLike ? "numeric" : undefined}
                    maxLength={isMobileLike ? 10 : undefined}
                    autoComplete={isEmailLike ? "email" : isMobileLike ? "tel" : undefined}
                    placeholder={isEmailLike ? "name@company.com" : isMobileLike ? "10 digit mobile number" : undefined}
                    onChange={(e) => handleInputChange(fieldName, sanitizeFieldValue(field, fieldName, e.target.value))}
                    className={controlClass}
                />
            );
        }

        if (field.type === "textarea") {
            return (
                <textarea
                    required={field.required}
                    value={formValues[fieldName] || ""}
                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                    className={textareaClass}
                />
            );
        }

        if (field.type === "dropdown") {
            return (
                <select
                    required={field.required}
                    value={formValues[fieldName] || ""}
                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                    className={`${controlClass} appearance-none cursor-pointer`}
                >
                    <option value=""></option>
                    {field.options?.map((opt, oIdx) => <option key={oIdx} value={opt}>{opt}</option>)}
                </select>
            );
        }

        if (field.type === "radio") {
            return (
                <div className={`flex items-center gap-6 ${compact ? "h-10" : "h-12"}`}>
                    {field.options?.map((opt) => (
                        <label key={opt} className={`inline-flex items-center gap-2 cursor-pointer ${compact ? "text-[11px] font-bold text-slate-700" : "text-[10px] font-medium text-slate-700"}`}>
                            <input
                                type="radio"
                                name={fieldName}
                                value={opt}
                                checked={(formValues[fieldName] || "") === opt}
                                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500"
                                required={field.required && !formValues[fieldName]}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            );
        }

        if (field.type === "file") {
            return (
                <FileUploadField
                    label={field.label}
                    required={field.required}
                    file={files[fieldName]}
                    fieldId={fieldName}
                    onChange={handleFileChange}
                />
            );
        }

        return null;
    };

    const handleSubmit = async () => {
        if (!validateSections(sections)) return;
        setSubmitting(true);
        const toastId = toast.loading("Executing final transmission...");
        try {
            const resolvedEmail = formValues.email || Object.values(formValues).find(v => typeof v === 'string' && v.includes('@'));
            if (!resolvedEmail) throw new Error("A valid Email address is required for submission.");

            const formData = new FormData();
            if (token) formData.append("invitationToken", token);
            if (selectedCat?._id) formData.append("categoryId", selectedCat._id);
            formData.append("email", resolvedEmail);
            const resolvedCompanyName = formValues.companyName || formValues.vendorName || formValues.company_name || formValues.fullTradeName || formValues.co_name || formValues.legalName || formValues.legal_name || formValues.tradeName || formValues.trade_name || formValues.supplierName || formValues.organizationName || "Vendor Submission";
            formData.append("companyName", resolvedCompanyName);
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
        <div className="registration-readable registration-page min-h-screen font-sans">
            {/* Ariba Style UI Structure */}
            <main className="w-full flex flex-col min-h-screen">
                
                {/* Header Bar */}
                <header className="registration-header sticky top-0 z-50">
                    <div className="flex items-center gap-6">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Supplier Self-Registration Request Form</h2>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Portal Active • v3.0</span>
                    </div>
                </header>

                <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6 md:py-10 flex-1">
                    
                    {/* Main Container */}
                    <div className="registration-surface mb-10 overflow-hidden">
                        
                        {/* Section 1 Header */}
                        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100/90 px-5 py-4 md:px-6">
                            <ArrowRight size={18} className="text-slate-500 rotate-90" />
                            <span className="text-[16px] font-bold text-slate-900 tracking-tight">1 Supplier Information</span>
                        </div>

                        <div className="bg-slate-50/80 p-4 md:p-6">
                             {/* Section 1.1 Header */}
                             <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 md:px-6">
                                    <ArrowRight size={16} className="text-slate-500 rotate-90" />
                                    <span className="text-[15px] font-semibold text-slate-800 tracking-tight">1.1 Please Fill Below Supplier Information</span>
                                </div>

                                <div className="space-y-4 p-4 md:p-6">
                                    {!isReviewStep ? (
                                        sections.map((section, sIdx) => {
                                            // Section Visibility Logic
                                            if (!isSectionVisible(section)) {
                                                return null;
                                            }

                                            const sectionKey = `section-${sIdx}`;
                                            const isOpen = !!expanded[sectionKey];
                                            const isStatutorySection = STATUTORY_SECTION_PATTERN.test(section.sectionTitle || "");

                                            return (
                                                <div key={sectionKey} className="registration-subsection-card overflow-hidden transition-all duration-300">
                                                    <div 
                                                        onClick={() => {
                                                            if (!isOpen && sIdx > 0 && !validateSections(sections.slice(0, sIdx))) {
                                                                return;
                                                            }
                                                            setExpanded(prev => {
                                                            const willBeOpen = !prev[sectionKey];
                                                            const newState = { ...prev, [sectionKey]: willBeOpen };
                                                            
                                                            // Master Toggle: If toggling 1.1.1.1 (sIdx 0), apply same state to 1-6
                                                            if (sIdx === 0) {
                                                                for (let i = 1; i <= 6; i++) {
                                                                    newState[`section-${i}`] = willBeOpen;
                                                                }
                                                            }
                                                            return newState;
                                                        });
                                                        }}
                                                        className="registration-subsection-header cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`transition-all duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                                                                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600" />
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{section.sectionTitle.split(' ')[0]}</span>
                                                                <h3 className="border-l border-slate-200 pl-3 text-[14px] font-semibold text-slate-800 tracking-tight">{section.sectionTitle.split(' ').slice(1).join(' ')}</h3>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isOpen && (
                                                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 p-5 md:p-8">
                                                            <div className={isStatutorySection
                                                                ? "grid grid-cols-1 gap-y-6"
                                                                : "grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                                            }>
                                                                {section.fields.map((field, fIdx) => {
                                                                    const fieldName = field.name || field.fieldId;

                                                                    // Dynamic Visibility Logic
                                                                    if (!isFieldVisible(section, field)) {
                                                                        return null;
                                                                    }

                                                                    let colSpan = "col-span-1";
                                                                    if (field.type === 'textarea') colSpan = "col-span-full";
                                                                    else if (field.label.toLowerCase().includes('email') || field.label.toLowerCase().includes('name')) colSpan = "md:col-span-1 lg:col-span-2";

                                                                    if (isStatutorySection) {
                                                                        const fieldCode = getStatutoryFieldCode(section, field);
                                                                        const showTurnoverHeading =
                                                                            fieldName === "ly1Turnover" &&
                                                                            formValues[TURNOVER_DEPENDENCY_FIELD] === TURNOVER_DEPENDENCY_VALUE;

                                                                return (
                                                                            <div key={fIdx} className="contents">
                                                                                {showTurnoverHeading && (
                                                                                    <div className="mx-0 grid grid-cols-1 items-center gap-x-8 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:grid-cols-[260px_minmax(0,1fr)]">
                                                                                        <div>
                                                                                            <p className="mb-1 text-[11px] font-semibold text-blue-700">{STATUTORY_FIELD_CODES.turnoverHeading}</p>
                                                                                            <p className="text-[14px] font-semibold text-slate-800">Please enter Previous Years Turnover</p>
                                                                                        </div>
                                                                                        <div></div>
                                                                                    </div>
                                                                                )}
                                                                                <div className="grid grid-cols-1 items-start gap-x-8 gap-y-2 border-b border-slate-100 py-3 last:border-b-0 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
                                                                                    <label className="block">
                                                                                        {fieldCode && <span className="mb-1 block text-[11px] font-semibold text-blue-700">{fieldCode}</span>}
                                                                                        <span className={`text-[13px] font-medium leading-5 ${validationErrors[fieldName] ? "text-rose-700" : "text-slate-700"}`}>
                                                                                            {field.label} {field.required && <span className={validationErrors[fieldName] ? "text-rose-600" : "text-blue-700"}>*</span>}
                                                                                        </span>
                                                                                    </label>
                                                                                    <div className="min-w-0">
                                                                                        {isTurnoverField(fieldName) ? (
                                                                                            <div className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-4">
                                                                                                {renderFieldControl(field, fieldName, true)}
                                                                                                <span className="whitespace-nowrap text-right text-[11px] font-medium text-slate-500">Indian Rupee</span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            renderFieldControl(field, fieldName, true)
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <div key={fIdx} className={colSpan}>
                                                                            <label className={`mb-2 block text-[12px] font-medium tracking-normal ${validationErrors[fieldName] ? "text-rose-600" : "text-slate-600"}`}>
                                                                                {field.label} {field.required && <span className={validationErrors[fieldName] ? "text-rose-600" : "text-blue-700"}>*</span>}
                                                                            </label>
                                                                            {renderFieldControl(field, fieldName)}
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
                                        <div className="p-12 text-center md:p-16">
                                            <CheckCircle size={80} className="mx-auto text-blue-700 mb-8" />
                                            <h3 className="mb-3 text-3xl font-bold text-slate-900 tracking-tight">Verification Phase Success</h3>
                                            <p className="mb-10 text-sm font-medium text-slate-500">Submit the form below to complete enrollment.</p>
                                            <button onClick={() => setIsReviewStep(false)} className="rounded-xl border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50">Modify Details</button>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="registration-action-bar">
                        <button 
                            onClick={() => navigate(-1)}
                            className="rounded-xl px-6 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-rose-600"
                        >
                            Abort Process
                        </button>
                        <button 
                            onClick={isReviewStep ? handleSubmit : () => {
                                if (!validateSections(sections)) return;
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setIsReviewStep(true);
                            }}
                            disabled={submitting}
                            className="flex items-center gap-3 rounded-xl bg-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Transmitting..." : isReviewStep ? "Execute Submission" : "Validate & Review"}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
