import { useEffect, useState } from "react";
import api from "../../services/api";
import { User, Building2, Mail, Phone, MapPin, Save, Briefcase, Camera, ShieldCheck, Globe, ChevronRight, Activity, Terminal, Lock, Target, Zap, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/vendors/me")
      .then((res) => setInfo(res.data.data || {}))
      .catch(() => toast.error("Failed to load profile intelligence"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    if (!info) return;
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Executing Registry Synthesis...");
    try {
      await api.put("/vendors/me", info);
      toast.success("Protocol updated on global cluster", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registry sync failure", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-12 h-12 border-[6px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 fade-in pb-20 mt-8">
      {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
          <div className="space-y-6">
              <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">Entity Control Hub</span>
                  <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metadata Configuration Terminal</span>
              </div>
              <div>
                  <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-6 font-sans">Identity <span className="text-slate-300">Matrix</span></h1>
                  <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6 lowercase tracking-tight leading-relaxed">Configuring organizational identity parameters and operational signatures. Managing global registry visibility and authenticated contact nodes.</p>
              </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 w-full xl:w-auto">
              <div className="flex-1 xl:flex-none p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-subtle group cursor-pointer hover:border-slate-900 transition-all duration-500">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse transition-all group-hover:scale-125"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] group-hover:text-slate-900 transition-colors">Registry Integrity Status: Verified</span>
              </div>
          </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* ── IDENTITY DOSSIER ────────────────────────────────────────── */ }
        <div className="xl:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-100 rounded-[3.5rem] p-12 text-center sticky top-28 shadow-premium overflow-hidden group/card"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900 opacity-20 group-hover/card:opacity-100 transition-opacity"></div>
            
            <div className="relative group mx-auto w-40 h-40 mb-10 overflow-hidden">
                <div className="w-full h-full rounded-[3rem] bg-slate-900 border-4 border-slate-100 flex items-center justify-center text-white text-6xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-700 relative overflow-hidden group-hover:rotate-3">
                   <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  {info?.companyName?.charAt(0) || '?'}
                </div>
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:text-slate-900 hover:shadow-2xl hover:border-slate-900 transition-all shadow-xl active:scale-90 group/cam z-20">
                    <Camera size={20} className="group-hover/cam:rotate-12 transition-transform" />
                </button>
            </div>
            
            <div className="space-y-2 mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{info?.companyName || 'NULL_ENTITY'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{info?.serviceType || 'SYNC_REQUIRED'}</p>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:border-slate-900 group/status">
                    <span className="text-slate-400 group-hover/status:text-slate-900">Registry Score</span>
                    <span className="text-emerald-500 font-mono">100/100</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:border-slate-900 group/tier">
                    <span className="text-slate-400 group-hover/tier:text-slate-900">Network Tier</span>
                    <span className="text-slate-900 italic underline decoration-slate-200 decoration-2 underline-offset-4 tracking-[0.1em]">Strategic_V1</span>
                </div>
            </div>

            <div className="mt-12 flex flex-col gap-4">
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group/secure">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/secure:scale-125 transition-transform"><ShieldCheck size={100} /></div>
                     <div className="flex items-center gap-3 relative z-10">
                        <Terminal size={16} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Secure Node 4.2.0</span>
                     </div>
                </div>
            </div>
          </motion.div>
        </div>

        {/* ── PROTOCOL CONFIGURATION FORM ──────────────────────────────── */ }
        <div className="xl:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[4rem] p-12 lg:p-20 shadow-premium group/form relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-16 opacity-[0.01] pointer-events-none group-hover/form:scale-110 transition-transform duration-1000 grayscale">
                    <Layers size={600} strokeWidth={1} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-16 relative z-10">
                <div className="space-y-12">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-8 mb-4">
                        <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none">Operational DNA Protocols</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                        <FieldGroup label="Organization Nomenclature" icon={Building2} sequence="01">
                            <input name="companyName" value={info?.companyName || ""} onChange={handleChange} className="vms-input h-16 shadow-inner" placeholder="Enter legal designation..." required />
                        </FieldGroup>
                        <FieldGroup label="Segment Specialization" icon={Layers} sequence="02">
                            <input name="serviceType" value={info?.serviceType || ""} onChange={handleChange} className="vms-input h-16 shadow-inner" placeholder="Define core segment..." required />
                        </FieldGroup>
                        <FieldGroup label="Designated Attache" icon={User} sequence="03">
                            <input name="contactPerson" value={info?.contactPerson || ""} onChange={handleChange} className="vms-input h-16 shadow-inner" placeholder="Enter primary contact..." required />
                        </FieldGroup>
                        <FieldGroup label="Static Transmission IP (Email)" icon={Terminal} sequence="04">
                            <input type="email" value={info?.email || ""} disabled className="vms-input h-16 opacity-40 cursor-not-allowed bg-slate-50/50 pointer-events-none lowercase tracking-normal font-medium shadow-none text-slate-400" />
                        </FieldGroup>
                        <FieldGroup label="Voice Routing Matrix" icon={Phone} sequence="05">
                            <input name="phone" value={info?.phone || ""} onChange={handleChange} className="vms-input h-16 shadow-inner" placeholder="+00 0000 000 000" required />
                        </FieldGroup>
                        <FieldGroup label="Enterprise Website Node" icon={Globe} sequence="06">
                            <input name="website" value={info?.website || ""} onChange={handleChange} className="vms-input h-16 shadow-inner lowercase italic font-medium tracking-normal" placeholder="HTTPS://ENTITY_NODE.COM" />
                        </FieldGroup>
                        <div className="md:col-span-2 space-y-4">
                            <label className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 italic group-focus-within:text-slate-900 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                <MapPin size={14} />
                                Global Headquarters Coordinates (07)
                            </label>
                            <textarea 
                              name="address" value={info?.address || ""} onChange={handleChange}
                              rows="4"
                              className="vms-input h-auto py-8 resize-none shadow-inner" 
                              placeholder="Define organization physical sync point..." required 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-16 border-t border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-4 px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] shadow-subtle group/security cursor-help">
                        <Lock size={20} className="text-slate-400 group-hover/security:text-slate-900 group-hover/security:scale-110 transition-all" />
                        <div>
                             <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none block">Protocol_V4.2 Shield Active</span>
                             <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mt-1 block italic lowercase tracking-tight">high frequency rsa-4096 encryption validated</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full lg:w-auto flex items-center justify-center gap-8 bg-slate-900 text-white px-16 py-6 rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group/btn"
                    >
                         <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-5 transition-opacity"></div>
                        {saving ? (
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="animate-spin" /> SYNCHRONIZING_FLUX
                            </div>
                        ) : (
                            <>Commit Identity Flux <Save size={20} className="group-hover/btn:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </form>
          </motion.div>
        </div>
      </div>
      
      <style>{`
          .vms-input {
              width: 100%;
              padding: 0 1.75rem;
              background-color: #F8FAFC;
              border: 1px solid #F1F5F9;
              border-radius: 1.5rem;
              font-size: 0.9375rem;
              font-weight: 900;
              color: #0F172A;
              transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              outline: none;
              text-transform: uppercase;
          }
          .vms-input:focus {
              background-color: #FFFFFF;
              border-color: #0F172A;
              box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
              transform: translateY(-2px);
          }
           .vms-input::placeholder {
                color: #CBD5E1;
                letter-spacing: normal;
                text-transform: none;
            }
          .shadow-premium {
              box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
          }
          .shadow-subtle {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          }
          .fade-in {
                animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
      `}</style>
    </div>
  );
}

const FieldGroup = ({ label, icon: Icon, sequence, children }) => (
    <div className="space-y-4 group/field">
        <label className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4 transition-colors group-focus-within/field:text-slate-900 italic">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-focus-within/field:bg-slate-900 transition-all"></div>
            <Icon size={14} />
            {label} ({sequence})
        </label>
        {children}
    </div>
);