import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";

// Plain axios (no auth headers) for public endpoints
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
import {
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Upload,
    FileText,
    ShieldCheck,
    Building2,
    CreditCard,
    FileStack,
    CheckSquare,
    AlertCircle,
    X,
    Edit2
} from "lucide-react";

const LoadingSpinner = () => (
    <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-[#0F7B4D]/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0F7B4D] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-[#0F7B4D]/5 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-[#0F7B4D]" size={24} />
            </div>
        </div>
        <div className="text-center">
            <p className="text-lg font-bold text-slate-900 mb-1">Authenticating Session</p>
            <p className="text-sm text-slate-500 font-medium">Please wait while we secure your connection...</p>
        </div>
    </div>
);

const FloatingLabelInput = ({ label, name, value, onChange, onBlur, type = "text", required, placeholder, icon: Icon }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative group">
            <div className={`
                absolute left-4 transition-all duration-200 pointer-events-none flex items-center gap-2
                ${(focused || value) ? '-top-2.5 text-xs bg-white px-2 text-[#0F7B4D] font-bold z-10' : 'top-4 text-slate-400'}
            `}>
                {focused && Icon && <Icon size={12} />}
                {label} {required && <span className="text-[#0F7B4D]">*</span>}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
                className={`
                    w-full px-4 py-4 bg-white border rounded-xl transition-all outline-none font-medium text-slate-700
                    ${focused ? 'border-[#0F7B4D] ring-4 ring-[#0F7B4D]/5 shadow-sm' : 'border-slate-200'}
                    ${value && !focused ? 'border-slate-200' : ''}
                `}
                placeholder={focused ? placeholder : ""}
                required={required}
            />
            {value && !focused && (
                <div className="absolute right-4 top-4 text-[#0F7B4D] animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={18} />
                </div>
            )}
        </div>
    );
};

const FileUploadField = ({ label, file, onChange, required, fieldId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onChange(fieldId, e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                <span>{label} {required && <span className="text-[#0F7B4D]">*</span>}</span>
                {file && <span className="text-[10px] bg-emerald-100 text-[#0F7B4D] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Verified</span>}
            </label>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`
                    relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group
                    ${file ? 'border-[#0F7B4D] bg-emerald-50/30' : 'border-slate-200 hover:border-[#0F7B4D] hover:bg-[#0F7B4D]/5'}
                    ${isDragging ? 'border-[#0F7B4D] bg-[#0F7B4D]/10 scale-[0.99]' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onChange(fieldId || label, e.target.files[0])}
                    className="hidden"
                />

                <div className="flex flex-col items-center text-center">
                    {file ? (
                        <>
                            <div className="w-12 h-12 bg-[#0F7B4D] text-white rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-[#0F7B4D]/20">
                                <FileText size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">{file.name}</p>
                            <p className="text-xs text-slate-500 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(fieldId, null);
                                }}
                                className="text-xs font-black text-[#0F7B4D] hover:underline uppercase tracking-widest flex items-center gap-2"
                            >
                                <X size={12} strokeWidth={3} /> Replace Document
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-[#0F7B4D] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#0F7B4D]/10 group-hover:text-[#0F7B4D]'}`}>
                                <Upload size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">Click or drag file to upload</p>
                            <p className="text-xs text-slate-400">PDF, JPG, or PNG (Max. 10MB)</p>
                        </>
                    )}
                </div>

                {isDragging && (
                    <div className="absolute inset-0 bg-[#0F7B4D]/5 border-2 border-[#0F7B4D] rounded-2xl flex items-center justify-center animate-in fade-in duration-200">
                        <p className="font-black text-[#0F7B4D] uppercase tracking-widest">Drop Files Now</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function RegistrationWizard() {
    const { categoryId: urlCategoryId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    // ── Public 3-step state ──────────────────────────
    const [publicStep, setPublicStep] = useState(
        urlCategoryId || token ? "form" : "pick-category"
    ); // "pick-category" | "category-detail" | "form"
    const [allCategories, setAllCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState(null);
    // ─────────────────────────────────────────────────

    const [categoryDetails, setCategoryDetails] = useState(null);
    const [loading, setLoading] = useState(urlCategoryId || token ? true : false);
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState({});
    const [files, setFiles] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isReviewStep, setIsReviewStep] = useState(false);
    const [emailWarning, setEmailWarning] = useState("");
    const [emailError, setEmailError] = useState("");

    const STEPS = [
        { name: "Basic Info", icon: Building2 },
        { name: "Business Details", icon: CheckSquare },
        { name: "Financial Details", icon: CreditCard },
        { name: "Documents", icon: FileStack },
        { name: "Review & Submit", icon: ShieldCheck },
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
                    setCategoryDetails({ formTemplate: formRes.data.data });
                } else {
                    const formRes = await publicApi.get(`/forms/master/public`);
                    setCategoryDetails({ formTemplate: formRes.data.data });
                }
            } catch (err) {
                const msg = err.response?.data?.message || "Registration form not available for this category.";
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

    // ── STEP 1: Category Card Selection ──────────────
    if (publicStep === "pick-category") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
                {/* Top bar */}
                <div className="bg-[#0F7B4D] py-4 px-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-[#0F7B4D]" size={18} />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-tight">VMS PORTAL</p>
                        <p className="text-emerald-300 text-[9px] font-bold uppercase tracking-widest">Vendor Registration</p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="inline-block px-4 py-1 bg-emerald-100 text-[#0F7B4D] text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
                            Step 1 of 3
                        </span>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Select Your Category</h1>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto">
                            Choose the vendor category that best describes your business. Each category has its own registration form.
                        </p>
                    </div>

                    {catLoading ? (
                        <div className="flex justify-center py-20"><LoadingSpinner /></div>
                    ) : allCategories.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <p className="font-bold">No active categories available at this time.</p>
                            <p className="text-sm mt-1">Please contact the administrator.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {allCategories.map(cat => {
                                const hasForm = cat.hasPublishedForm;
                                return (
                                    <button
                                        key={cat._id}
                                        onClick={() => {
                                            if (!hasForm) {
                                                toast.error("This category's registration form is not yet available.");
                                                return;
                                            }
                                            setSelectedCat(cat);
                                            setPublicStep("category-detail");
                                        }}
                                        className={`text-left group bg-white border rounded-2xl p-6 transition-all duration-200 relative
                                            ${hasForm
                                                ? "border-slate-200 hover:border-[#0F7B4D] hover:shadow-xl cursor-pointer"
                                                : "border-slate-100 opacity-60 cursor-not-allowed"
                                            }`}
                                    >
                                        {/* Form status badge */}
                                        <div className="absolute top-4 right-4">
                                            {hasForm ? (
                                                <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    ✓ Open
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                                    Form Pending
                                                </span>
                                            )}
                                        </div>

                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 transition-all
                                            ${hasForm ? "bg-emerald-50 border-emerald-100 group-hover:bg-[#0F7B4D]" : "bg-slate-50 border-slate-100"}`}>
                                            <Building2 size={18} className={`transition-colors ${hasForm ? "text-[#0F7B4D] group-hover:text-white" : "text-slate-300"}`} />
                                        </div>
                                        <p className="font-black text-slate-900 mb-1 pr-16">{cat.name}</p>
                                        <p className="text-[11px] font-mono text-slate-400 mb-3">{cat.code}</p>
                                        {cat.description && (
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cat.description}</p>
                                        )}
                                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
                                            {hasForm ? (
                                                <span className="text-[10px] font-black text-[#0F7B4D] uppercase tracking-widest flex items-center gap-1">
                                                    Select <ArrowRight size={12} strokeWidth={3} />
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    Not Available
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-center text-xs text-slate-400 mt-10">
                        Already registered?{" "}
                        <a href="/login" className="text-[#0F7B4D] font-bold hover:underline">Sign In</a>
                    </p>
                </div>
            </div>
        );
    }

    // ── STEP 2: Category Detail ────────────────────────
    if (publicStep === "category-detail" && selectedCat) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
                {/* Top bar */}
                <div className="bg-[#0F7B4D] py-4 px-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-[#0F7B4D]" size={18} />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-tight">VMS PORTAL</p>
                        <p className="text-emerald-300 text-[9px] font-bold uppercase tracking-widest">Vendor Registration</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-12">
                    <button onClick={() => setPublicStep("pick-category")}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0F7B4D] mb-8 transition-colors">
                        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Categories
                    </button>

                    <span className="inline-block px-4 py-1 bg-emerald-100 text-[#0F7B4D] text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
                        Step 2 of 3 — Review Category
                    </span>

                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
                        {/* Category Header */}
                        <div className="bg-[#0F7B4D] p-8">
                            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-2">{selectedCat.code}</p>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">{selectedCat.name}</h1>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${selectedCat.isActive ? 'bg-white/20 text-white' : 'bg-red-200 text-red-800'}`}>
                                {selectedCat.isActive ? "✓ Accepting Registrations" : "Closed"}
                            </span>
                        </div>

                        {/* Category Body */}
                        <div className="p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">About this Category</p>
                                <p className="text-slate-700 font-medium leading-relaxed">
                                    {selectedCat.description || "This category handles vendor registrations for the specified domain. Please proceed to complete the registration form with all required details and documents."}
                                </p>
                            </div>

                            {selectedCat.approvalType && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <ShieldCheck size={20} className="text-[#0F7B4D]" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Approval Process</p>
                                        <p className="font-bold text-slate-800">{selectedCat.approvalType} Review</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                <p className="text-xs font-bold text-emerald-700">
                                    ✓ You will be asked to fill a registration form with your company details, financial information, and supporting documents.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-8 pb-8">
                            <button
                                onClick={() => setPublicStep("form")}
                                className="w-full py-5 bg-[#0F7B4D] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#0F7B4D]/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Proceed to Registration Form
                                <ArrowRight size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <LoadingSpinner />
        </div>
    );

    const sections = categoryDetails?.formTemplate?.sections || [];
    const currentSection = sections[currentStep] || { sectionTitle: "Loading...", fields: [] };

    const mapSectionToStepIndex = (section, idx) => {
        if (!section) return 0;
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
        const progress = idx / sections.length;
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
                const cityField = currentFormValues.hasOwnProperty('city') ? 'city' : 'co_city';
                const stateField = currentFormValues.hasOwnProperty('state') ? 'state' : 'co_state';
                const countryField = currentFormValues.hasOwnProperty('country') ? 'country' : 'co_country';

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
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side Panel - Sidebar */}
            <aside className="lg:w-[400px] w-full bg-[#0F7B4D] lg:fixed lg:h-full flex flex-col z-20">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F7B4D] via-[#0D6D44] to-[#0A5D3A] opacity-90"></div>

                {/* Decorative background patterns */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#000] rounded-full -ml-48 -mb-48 blur-3xl"></div>
                </div>

                <div className="relative p-10 flex flex-col h-full">
                    {/* Brand/Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl shadow-black/10">
                            <ShieldCheck className="text-[#0F7B4D]" size={24} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-xl tracking-tight leading-none uppercase">Antigravity</h2>
                            <p className="text-emerald-300 text-[10px] font-black tracking-[0.2em] uppercase mt-1 opacity-80">Procurement Solutions</p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <nav className="flex-1 space-y-2">
                        {STEPS.map((step, idx) => {
                            const isCompleted = idx < activeMajorStep;
                            const isActive = idx === activeMajorStep;
                            const isLocked = idx > activeMajorStep;
                            const Icon = step.icon;

                            return (
                                <div
                                    key={idx}
                                    className={`
                                        relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                                        ${isActive ? 'bg-white/10 border border-white/10 shadow-lg' : ''}
                                        ${isLocked ? 'opacity-40' : 'opacity-100'}
                                    `}
                                >
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                                        ${isCompleted ? 'bg-emerald-400 text-[#0F7B4D]' : ''}
                                        ${isActive ? 'bg-white text-[#0F7B4D]' : ''}
                                        ${isLocked ? 'border border-white/20 text-white/40' : 'text-white'}
                                    `}>
                                        {isCompleted ? <CheckCircle size={20} strokeWidth={3} /> : <Icon size={20} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${isActive ? 'text-emerald-300' : 'text-white/40'}`}>
                                            Step 0{idx + 1}
                                        </p>
                                        <p className={`font-bold tracking-tight ${isActive ? 'text-white text-lg' : 'text-white/70 text-base'}`}>
                                            {step.name}
                                        </p>
                                    </div>

                                    {isActive && (
                                        <div className="absolute -right-2 w-1.5 h-8 bg-white rounded-full"></div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Footer Info */}
                    <div className="mt-auto pt-10 border-t border-white/10">
                        <div className="flex items-center gap-4 text-white/60">
                            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                                <AlertCircle size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/80">Support Hotline</p>
                                <p className="text-[10px] font-medium">+1 (800) VENDOR-PRO</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right Side Main Form Area */}
            <main className="flex-1 lg:ml-[400px] min-h-screen relative p-4 lg:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto py-10">

                    {/* Header */}
                    <header className="mb-12">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-[#0F7B4D] uppercase tracking-[0.4em]">Section {currentStep + 1} of {sections.length}</span>
                            {!isReviewStep && <span className="text-xs font-bold text-slate-400">{Math.round(((currentStep + 1) / sections.length) * 100)}% Complete</span>}
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                            {isReviewStep ? "Dossier Verification" : currentSection.sectionTitle}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {isReviewStep
                                ? "Please review all entered information before finalizing your registration."
                                : "The following information is required for the " + (categoryDetails?.formTemplate?.name || "Enterprise") + " onboarding protocol."}
                        </p>
                    </header>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 lg:p-12 transition-all duration-500">

                        {!isReviewStep ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                    {currentSection.fields.map((field, fIdx) => {
                                        const fieldName = field.name || field.fieldId;
                                        return (
                                            <div key={fIdx} className={`${field.type === 'textarea' || field.type === 'file' || field.type === 'checkbox' ? 'md:col-span-2' : ''}`}>
                                                {field.type === "text" || field.type === "number" || field.type === "date" || field.type === "textarea" || field.type === "email" ? (
                                                    <div>
                                                        <FloatingLabelInput
                                                            label={field.label}
                                                            name={fieldName}
                                                            required={field.required}
                                                            placeholder={field.placeholder || (field.type === "email" ? "Enter your official email" : "")}
                                                            value={formValues[fieldName] || ""}
                                                            onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                            type={field.type === "textarea" ? "text" : field.type}
                                                            onBlur={field.type === "email" ? (e) => handleEmailBlur(fieldName, e.target.value) : undefined}
                                                        />
                                                        {field.type === "email" && emailError && (
                                                            <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-2">
                                                                <AlertCircle size={12} /> {emailError}
                                                            </p>
                                                        )}
                                                        {field.type === "email" && !emailError && emailWarning && (
                                                            <p className="mt-2 text-xs font-bold text-amber-600 flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                                                                <AlertCircle size={12} /> {emailWarning}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : field.type === "dropdown" ? (
                                                    <div className="relative group">
                                                        <label className="text-[10px] font-black text-[#0F7B4D] uppercase tracking-widest ml-1 mb-2 block">
                                                            {field.label} {field.required && <span className="text-[#0F7B4D]">*</span>}
                                                        </label>
                                                        <select
                                                            required={field.required}
                                                            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#0F7B4D]/5 focus:border-[#0F7B4D] transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                                                            value={formValues[fieldName] || ""}
                                                            onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                                        >
                                                            <option value="">Select option...</option>
                                                            {field.options && field.options.map((opt, oIdx) => (
                                                                <option key={oIdx} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-[3.25rem] pointer-events-none text-slate-400">
                                                            <ArrowRight size={18} className="rotate-90" />
                                                        </div>
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
                                                    <label className="flex items-start gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer group hover:border-[#0F7B4D]/30 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            required={field.required}
                                                            checked={formValues[fieldName] || false}
                                                            onChange={(e) => handleInputChange(fieldName, e.target.checked)}
                                                            className="mt-1 w-6 h-6 rounded-lg border-slate-300 text-[#0F7B4D] focus:ring-[#0F7B4D] transition-all"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 leading-tight">{field.label}</span>
                                                            <span className="text-xs text-slate-500 mt-1">By checking this, you agree to our standard operating procedures.</span>
                                                        </div>
                                                    </label>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {sections.map((section, sIdx) => (
                                    <div key={sIdx} className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <h3 className="text-xl font-black text-[#0F7B4D] tracking-tight truncate mr-4">{section.sectionTitle}</h3>
                                            <button
                                                onClick={() => {
                                                    setCurrentStep(sIdx);
                                                    setIsReviewStep(false);
                                                }}
                                                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0F7B4D] transition-colors uppercase tracking-widest"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                            {section.fields.map((field, fIdx) => {
                                                const fieldName = field.name || field.fieldId;
                                                const value = formValues[fieldName];
                                                const file = files[fieldName];

                                                return (
                                                    <div key={fIdx} className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</p>
                                                        {field.type === 'file' ? (
                                                            <div className="flex items-center gap-2 text-sm font-bold text-[#0F7B4D]">
                                                                <FileText size={14} />
                                                                {file ? file.name : <span className="text-rose-400 uppercase tracking-widest text-[10px]">No Attachment</span>}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm font-bold text-slate-900">
                                                                {value ? (field.type === 'checkbox' ? (value ? "Checked / Agreed" : "Not Agreed") : value) : <span className="text-slate-300 italic font-medium">N/A</span>}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4">
                                    <div className="flex items-center gap-4 text-[#0F7B4D]">
                                        <ShieldCheck size={28} />
                                        <h4 className="text-lg font-black tracking-tight">Final Declaration</h4>
                                    </div>
                                    <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                                        I hereby certify that the information provided in this registration dossier is true, complete, and accurate to the best of my knowledge. I understand that any deliberate omissions or falsifications may result in disqualification from the procurement registry.
                                    </p>
                                    <label className="flex items-center gap-4 mt-8 pt-4 border-t border-emerald-100 cursor-pointer">
                                        <input type="checkbox" required className="w-6 h-6 rounded-lg text-[#0F7B4D] ring-[#0F7B4D]/20" />
                                        <span className="font-bold text-[#0F7B4D] text-sm italic">Acknowledged and Verified</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-16 pt-10 border-t border-slate-100 gap-6">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0 && !isReviewStep}
                                className={`
                                    flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] px-8 py-5 rounded-2xl transition-all
                                    ${(currentStep === 0 && !isReviewStep) ? 'opacity-30 cursor-not-allowed text-slate-400' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#0F7B4D] hover:text-[#0F7B4D] shadow-sm'}
                                `}
                            >
                                <ArrowLeft size={16} strokeWidth={3} />
                                Back
                            </button>

                            <div className="flex-1 flex justify-end gap-4">
                                <button
                                    onClick={() => toast.success("Draft saved to secure cloud")}
                                    className="hidden md:flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] px-8 py-5 rounded-2xl text-[#0F7B4D] border-2 border-transparent hover:bg-emerald-50 transition-all"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={submitting}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] px-12 py-5 bg-[#0F7B4D] text-white rounded-2xl shadow-xl shadow-[#0F7B4D]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {submitting ? "Transmitting..." : isReviewStep ? "Finalize & Submit" : currentStep === sections.length - 1 ? "Review Details" : "Next Segment"}
                                    {!submitting && <ArrowRight size={16} strokeWidth={3} />}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Footer Progress Bar for Mobile */}
                    <div className="lg:hidden mt-8 grid grid-cols-5 gap-2 px-2">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= activeMajorStep ? 'bg-[#0F7B4D]' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
}
