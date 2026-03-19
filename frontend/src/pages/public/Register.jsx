import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Building2, Mail, FileUp, Send,
  ArrowLeft, ArrowRight, ShieldCheck,
  CheckCircle, Landmark, ClipboardCheck,
  ShieldAlert, UserCheck, CreditCard,
  FileStack, AlertCircle, X
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
    <p className="text-sm font-black text-[#0F7B4D] uppercase tracking-[0.2em] animate-pulse">Initializing Interface...</p>
  </div>
);

const FloatingLabelInput = ({ label, name, value, onChange, type = "text", required, placeholder, icon: Icon }) => {
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
        onChange={(e) => onChange(name, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
                    w-full px-4 py-4 bg-white border rounded-xl transition-all outline-none font-medium text-slate-700
                    ${focused ? 'border-[#0F7B4D] ring-4 ring-[#0F7B4D]/5 shadow-sm' : 'border-slate-200'}
                `}
        placeholder={focused ? placeholder : ""}
        required={required}
      />
      {value && !focused && (
        <div className="absolute right-4 top-4 text-[#0F7B4D]">
          <CheckCircle size={18} />
        </div>
      )}
    </div>
  );
};

export default function Register() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [emailCheck, setEmailCheck] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [appId, setAppId] = useState(null);
  const navigate = useNavigate();

  const STEPS_PHASE_1 = [
    { name: "Vendor Identification", icon: Building2 },
    { name: "Bank Credentials", icon: CreditCard },
    { name: "Verification Documents", icon: FileStack }
  ];

  const STEPS_PHASE_2 = [
    { name: "Global Identification", icon: UserCheck },
    { name: "Financial Controls", icon: Landmark },
    { name: "Tax Compliance", icon: ShieldCheck },
    { name: "Authorization", icon: ClipboardCheck }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/forms/published");
      setTemplates(res.data.data);
    } catch (err) {
      toast.error("Network services unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!emailCheck) return toast.error("Enter business email to proceed");
    setCheckingEmail(true);
    try {
      const res = await api.get(`/applications/state/${emailCheck}`);
      if (res.data.data) {
        const app = res.data.data;
        setAppId(app._id);
        setStage(app.currentStage);
        setFormData(Object.fromEntries(new Map(Object.entries(app.data))));
        toast.success(`Active dossier found. Resuming Phase ${app.currentStage}`);
      } else {
        setFormData({ email: emailCheck });
        setStage(1);
        toast.success("Initialized Phase 1 Onboarding");
      }
    } catch (err) {
      toast.error("Cloud synchronization failure");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field, file) => {
    setFiles({ ...files, [field]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading(`Broadcasting Phase ${stage} profile...`);

    try {
      const currentTemplate = templates[stage - 1];
      const form = new FormData();
      form.append("formTemplateId", currentTemplate._id);
      form.append("email", formData.email || emailCheck);
      form.append("companyName", formData.vendorName || formData.companyName || "N/A");
      form.append("stage", stage);
      form.append("data", JSON.stringify(formData));

      Object.keys(files).forEach((key) => {
        form.append(key, files[key]);
      });

      const res = await api.post("/applications/submit", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message, { id: toastId });

      if (stage === 1) {
        setStage(2);
        setStep(0);
        setFiles({});
      } else {
        setStage(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Transmission error", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  // Initial Entry
  if (!appId && !formData.email) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0F7B4D]"></div>
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#0F7B4D]/5 rounded-full blur-[100px]"></div>

        <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] p-12 text-center relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#0F7B4D] text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#0F7B4D]/20">
            <ShieldCheck size={36} strokeWidth={2.5} />
          </div>

          <p className="text-[10px] font-black text-[#0F7B4D] uppercase tracking-[0.4em] mb-4">Enterprise Access Portal</p>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Onboarding Gateway</h2>
          <p className="text-slate-500 font-medium mb-12">Enter your verified business email to register or resume your application dossier.</p>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="email"
                value={emailCheck}
                onChange={(e) => setEmailCheck(e.target.value)}
                placeholder="business@corp.id"
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] py-5 px-8 text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#0F7B4D]/5 focus:border-[#0F7B4D] transition-all outline-none text-center font-bold text-lg placeholder:text-slate-300"
              />
            </div>

            <button
              onClick={checkApplicationStatus}
              disabled={checkingEmail}
              className="w-full py-5 bg-[#0F7B4D] text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.25rem] shadow-2xl shadow-[#0F7B4D]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {checkingEmail ? "Authorizing Profile..." : "Initialize Session"}
              <ArrowRight size={16} strokeWidth={3} />
            </button>

            <Link to="/login" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0F7B4D] transition-colors mt-8">
              Already Registered? Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 3) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0F7B4D]"></div>
        <div className="max-w-2xl w-full bg-white border border-slate-100 p-16 rounded-[3.5rem] text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-10 text-[#0F7B4D] border border-emerald-100 shadow-inner">
            <CheckCircle size={48} strokeWidth={2.5} />
          </div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Onboarding Finalized</h2>
          <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium px-4">
            Stage 1 Bank Verification and Stage 2 Master Profiles have been successfully compiled and broadcasted to our compliance registry.
          </p>
          <Link to="/" className="inline-flex items-center gap-4 px-12 py-6 bg-[#0F7B4D] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#0F7B4D]/20 transition-all hover:scale-105 active:scale-95">
            Return to Mission Control
            <ArrowRight size={18} strokeWidth={3} />
          </Link>
        </div>
      </div>
    );
  }

  const currentTemplate = templates[stage - 1];
  if (!currentTemplate) return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;

  const sections = currentTemplate.sections;
  const currentSection = sections[step];
  const sideSteps = stage === 1 ? STEPS_PHASE_1 : STEPS_PHASE_2;
  const activeSideIdx = Math.min(Math.floor((step / sections.length) * sideSteps.length), sideSteps.length - 1);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row overflow-hidden italic-none">
      {/* Sidebar */}
      <aside className="lg:w-[400px] w-full bg-[#0F7B4D] lg:fixed lg:h-full flex flex-col z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F7B4D] to-[#0A5D3A] opacity-90"></div>
        <div className="relative p-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl">
              <ShieldCheck className="text-[#0F7B4D]" size={24} />
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight leading-none uppercase">VMSPRO</h2>
              <p className="text-emerald-300 text-[10px] font-black tracking-[0.2em] uppercase mt-1 opacity-80">PHASE {stage} REGISTRY</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {sideSteps.map((stepItem, idx) => {
              const isActive = idx === activeSideIdx;
              const isCompleted = idx < activeSideIdx;
              const Icon = stepItem.icon;

              return (
                <div key={idx} className={`relative flex items-center gap-5 p-5 rounded-2xl transition-all ${isActive ? 'bg-white/10 border border-white/10 shadow-lg' : 'opacity-60'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-white text-[#0F7B4D]' : isCompleted ? 'bg-emerald-400 text-[#0F7B4D]' : 'border border-white/20 text-white'}`}>
                    {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-emerald-300' : 'text-white/50'}`}>Module 0{idx + 1}</p>
                    <p className={`font-bold tracking-tight ${isActive ? 'text-white text-lg' : 'text-white/80'}`}>{stepItem.name}</p>
                  </div>
                  {isActive && <div className="absolute -right-2 w-1.5 h-10 bg-white rounded-full"></div>}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto p-6 bg-black/10 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Session Integrity</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-xs font-bold text-white/80 uppercase tracking-tighter truncate">{formData.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 lg:ml-[400px] p-6 lg:p-16 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto py-10">
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-[#0F7B4D] border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">Stage {stage} Control</span>
              <span className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest">Sec {step + 1} of {sections.length}</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4 uppercase truncate">{currentTemplate.title.split(' — ')[1] || currentTemplate.title}</h1>
            <p className="text-lg text-slate-500 font-medium">{currentSection.title}</p>
          </header>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-8 lg:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentSection.fields.map(field => (
                <div key={field.name} className={field.type === 'file' || field.type === 'checkbox' ? 'md:col-span-2' : ''}>
                  {field.type === 'file' ? (
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                        <span>{field.label} {field.required && <span className="text-rose-500">*</span>}</span>
                        {files[field.name] && <span className="text-[10px] bg-emerald-100 text-[#0F7B4D] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Ready</span>}
                      </label>
                      <label className={`
                                            flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-[2rem] cursor-pointer transition-all group
                                            ${files[field.name] ? 'border-[#0F7B4D] bg-emerald-50/20' : 'border-slate-200 hover:border-[#0F7B4D] hover:bg-[#0F7B4D]/5'}
                                        `}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${files[field.name] ? 'bg-[#0F7B4D] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-[#0F7B4D]/10 group-hover:text-[#0F7B4D]'}`}>
                          <FileUp size={24} />
                        </div>
                        {files[field.name] ? (
                          <div className="text-center">
                            <p className="text-sm font-bold text-[#0F7B4D] mb-1">{files[field.name].name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0F7B4D]/60 whitespace-nowrap">File ready for synchronization</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-500 mb-1">Click to upload document</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">PDF, JPG, or PNG (Max. 10MB)</p>
                          </div>
                        )}
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(field.name, e.target.files[0])} required={field.required} />
                      </label>
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-start gap-4 p-8 rounded-[2rem] bg-slate-50 border border-slate-200 cursor-pointer hover:bg-white hover:border-[#0F7B4D]/30 hover:shadow-xl transition-all group">
                      <input
                        type="checkbox"
                        className="mt-1 w-6 h-6 rounded-lg border-slate-300 text-[#0F7B4D] focus:ring-[#0F7B4D]"
                        onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        checked={formData[field.name] || false}
                        required={field.required}
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight mb-1">{field.label}</p>
                        <p className="text-xs text-slate-500 font-medium">By checking this box, you confirm that you have read and accepted the relevant enterprise policies.</p>
                      </div>
                    </label>
                  ) : (
                    <FloatingLabelInput
                      label={field.label}
                      name={field.name}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      type={field.type}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-100 pt-12 gap-8">
              <div className="flex gap-3">
                {sections.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'bg-[#0F7B4D] w-12 shadow-lg shadow-[#0F7B4D]/20' : 'bg-slate-100 w-4'}`}></div>
                ))}
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 md:flex-none px-8 py-5 border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:border-[#0F7B4D] hover:text-[#0F7B4D] transition-all">
                    Previous
                  </button>
                )}
                {step < sections.length - 1 ? (
                  <button type="button" onClick={() => setStep(step + 1)} className="flex-1 md:flex-none px-12 py-5 bg-[#0F7B4D] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#0F7B4D]/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3">
                    Next Section
                    <ArrowRight size={16} strokeWidth={3} />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="flex-1 md:flex-none px-12 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3">
                    {submitting ? 'Transmitting Data...' : stage === 1 ? 'Authorize Stage 1' : 'Complete Registration'}
                    {!submitting && <Send size={16} strokeWidth={3} />}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
