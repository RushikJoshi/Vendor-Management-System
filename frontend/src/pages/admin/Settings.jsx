import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Save, Shield, Bell, Key, User, Globe, Lock, Cpu, Activity, Zap, Check, ChevronRight, Tablet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: 'profile', label: 'Identity Matrix', icon: User, desc: 'Personal parameters' },
        { id: 'security', label: 'Security Protocols', icon: Shield, desc: 'Access & Encryption' },
        { id: 'notifications', label: 'Transmission Flux', icon: Bell, desc: 'Global alerts' },
        { id: 'advanced', label: 'Core Engine', icon: Cpu, desc: 'API & Webhooks' }
    ];

    return (
        <div className="space-y-12 fade-in pb-20">
             {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
             <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Operational Console</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Configuration Terminal</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Control Hub</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Configuring the underlying neural parameters of your VMS workspace. Adjusting identity, security authorizations, and global transmission relays.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 shadow-subtle">
                         <Activity size={18} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Sync: 100% Stable</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* ── SIDEBAR NAVIGATION ─────────────────────────────────────── */ }
                <div className="lg:col-span-1 space-y-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full p-6 rounded-[2rem] border transition-all duration-500 flex items-center gap-5 group relative overflow-hidden active:scale-[0.98] ${
                                activeTab === tab.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 
                                'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'
                            }`}>
                                <tab.icon size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">{tab.label}</p>
                                <p className={`text-[8px] font-bold uppercase tracking-[0.1em] opacity-40 italic transition-colors ${activeTab === tab.id ? 'text-white' : 'text-slate-300'}`}>{tab.desc}</p>
                            </div>
                            {activeTab === tab.id && (
                                <ChevronRight size={16} className="ml-auto text-white/40 group-hover:translate-x-1 transition-transform" />
                            )}
                        </button>
                    ))}

                    <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                         <div className="flex items-center gap-3">
                             <Lock size={16} className="text-slate-900" />
                             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Workspace Privacy</h4>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">Encryption protocols are managed by enterprise policy. Session tokens auto-rotate every 120 minutes of inactivity.</p>
                         <button className="w-full py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all shadow-subtle">Rotate Session</button>
                    </div>
                </div>

                {/* ── TAB CONTENT ────────────────────────────────────────────── */ }
                <div className="lg:col-span-3">
                     <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium p-12 lg:p-16 min-h-[600px] flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === "profile" && (
                                <motion.div 
                                    key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                    <div className="flex items-center gap-8 border-b border-slate-50 pb-12">
                                         <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black relative group cursor-pointer shadow-premium">
                                              {user?.name?.charAt(0) || "A"}
                                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] flex items-center justify-center">
                                                   <Zap size={24} className="text-emerald-400" />
                                              </div>
                                         </div>
                                         <div>
                                              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Identity Synthesis</h2>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] underline decoration-slate-200 underline-offset-8 decoration-2 italic">Global Actor Metadata Protocol</p>
                                         </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Actor Nomenclature</label>
                                            <input
                                                type="text" defaultValue={user?.name || "SYSTEM_ADMIN"}
                                                className="vms-input h-16 shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Transmission Link (Email)</label>
                                            <input
                                                type="email" defaultValue={user?.email || "ADMIN@ANTIGRAVITY.CORE"}
                                                className="vms-input h-16 shadow-inner bg-slate-50/50 cursor-not-allowed opacity-60"
                                                disabled
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Authorization Grade (Role)</label>
                                            <div className="h-16 flex items-center px-8 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-200 group cursor-default">
                                                <Shield size={16} className="mr-4 text-emerald-400 group-hover:rotate-12 transition-transform" /> {user?.role || "SUPER_USER_OMEGA"}
                                            </div>
                                            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic ml-4">Grade level is immutable. Managed by the genesis system core.</p>
                                        </div>
                                    </div>

                                    <div className="pt-12 mt-auto border-t border-slate-50 flex justify-end">
                                        <button className="h-16 px-12 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center gap-3">
                                            <Save size={18} /> Commit Identity Flux
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "security" && (
                                <motion.div 
                                    key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                     <div className="flex items-center gap-6 border-b border-slate-50 pb-10">
                                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                                              <Lock size={24} />
                                         </div>
                                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.2em]">Credential Rotation</h3>
                                     </div>

                                     <div className="space-y-10">
                                         <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Current Authorization Token (Password)</label>
                                            <input type="password" placeholder="••••••••••••" className="vms-input h-16 shadow-inner" />
                                         </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                             <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">New Protocol Sequence</label>
                                                <input type="password" placeholder="••••••••••••" className="vms-input h-16 shadow-inner" />
                                             </div>
                                             <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Confirm Protocol Sequence</label>
                                                <input type="password" placeholder="••••••••••••" className="vms-input h-16 shadow-inner border-emerald-100" />
                                             </div>
                                         </div>
                                     </div>

                                     <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                                          <div className="flex items-center gap-4">
                                               <Shield size={20} className="text-slate-400" />
                                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Multi-Factor Authentication Required for rotation commit.</p>
                                          </div>
                                          <div className="w-12 h-6 bg-slate-900 rounded-full relative">
                                               <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                                          </div>
                                     </div>

                                     <div className="pt-12 mt-auto border-t border-slate-50 flex justify-end">
                                        <button className="h-16 px-12 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center gap-3">
                                            <Save size={18} /> Authorize Rotation
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "notifications" && (
                                <motion.div 
                                    key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                     <div className="flex items-center gap-6 border-b border-slate-50 pb-10">
                                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                                              <Bell size={24} />
                                         </div>
                                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.2em]">Signal Preference</h3>
                                     </div>

                                     <div className="space-y-6">
                                          <SignalSwitch 
                                            title="External Transmission (Email)" 
                                            desc="Relay critical registry updates and contract maturity alerts to external link."
                                            isActive={true}
                                          />
                                          <SignalSwitch 
                                            title="Dashboard Ingress Alerts" 
                                            desc="Broadcast high-priority system events directly to the operational UI terminal."
                                            isActive={true}
                                          />
                                          <SignalSwitch 
                                            title="Vendor Activity Flux" 
                                            desc="Monitor real-time application submissions and profile update transmissions."
                                            isActive={false}
                                          />
                                     </div>
                                </motion.div>
                            )}

                            {activeTab === "advanced" && (
                                <motion.div 
                                    key="advanced" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex-1"
                                >
                                     <div className="p-10 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center gap-8 relative overflow-hidden group">
                                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Cpu size={120} /></div>
                                          <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200 relative z-10">
                                               <Shield size={32} />
                                          </div>
                                          <div className="relative z-10">
                                               <h3 className="text-[11px] font-black text-rose-900 uppercase tracking-[0.4em] mb-2">High-Frequency Zone</h3>
                                               <p className="text-sm font-medium text-rose-800 italic leading-snug">Engineering access only. Modification of these nodes may cause cascading system decoupling.</p>
                                          </div>
                                     </div>

                                     <div className="space-y-10">
                                          <div className="space-y-4">
                                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Webhook Relay Ingress URL</label>
                                               <div className="flex items-center gap-4">
                                                    <div className="flex-1 vms-input h-16 shadow-inner flex items-center bg-slate-50/50 font-mono lowercase tracking-normal text-slate-400 text-xs">
                                                        HTTPS://API.GATEWAY.CORE/V1/WEBHOOK/SYNC_{user?._id?.slice(-8).toUpperCase()}
                                                    </div>
                                                    <button className="h-16 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                                                        <Activity size={20} />
                                                    </button>
                                               </div>
                                          </div>

                                          <div className="space-y-4 pt-10 border-t border-slate-50 flex flex-col items-center">
                                               <button className="h-20 w-full bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-6 group">
                                                    Generate New RSA Cluster Token <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                               </button>
                                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-6 italic">Protocol v4.1.0-beta-stable_build_20250612</p>
                                          </div>
                                     </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                     </div>
                </div>
            </div>

            <style>{`
                .vms-input {
                    width: 100%;
                    padding: 0 1.5rem;
                    background-color: #F8FAFC;
                    border: 1px solid #F1F5F9;
                    border-radius: 1.5rem;
                    font-size: 0.8125rem;
                    font-weight: 900;
                    color: #0F172A;
                    transition: all 0.3s;
                    outline: none;
                    text-transform: uppercase;
                }
                .vms-input:focus {
                    background-color: #FFFFFF;
                    border-color: #0F172A;
                    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05);
                }
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .shadow-subtle {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

const SignalSwitch = ({ title, desc, isActive }) => (
    <div className={`p-10 border rounded-[2.5rem] flex items-center justify-between transition-all duration-500 group cursor-pointer ${isActive ? 'bg-slate-50/50 border-slate-200 shadow-premium' : 'bg-white border-slate-100 grayscale hover:grayscale-0'}`}>
         <div className="max-w-xl">
             <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-2 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h3>
             <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed italic ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>{desc}</p>
         </div>
         <div className={`w-16 h-8 rounded-full transition-all relative shadow-inner ${isActive ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all shadow-xl ${isActive ? 'left-9 bg-white' : 'left-1.5 bg-white/40'}`}></div>
         </div>
    </div>
);

const ArrowRight = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
);
