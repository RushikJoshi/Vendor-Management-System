import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { 
    Building2, Briefcase, Mail, CheckCircle, Clock, 
    XCircle, FileText, MessageSquare, Settings, 
    ChevronRight, ShieldCheck, Zap, ArrowUpRight,
    TrendingUp, Globe, Monitor, User, Shield, Activity, Layers, Terminal
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MetricNode = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-slate-900 transition-all cursor-pointer relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
            <Icon size={100} />
        </div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${color} bg-opacity-10 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-xl`}>
                <Icon size={22} strokeWidth={2.5} />
            </div>
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Telemetry_Linked</div>
        </div>
        <div className="relative z-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{label}</p>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/vendors/me")
            .then((res) => setInfo(res.data.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="w-12 h-12 border-[6px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!info) return (
        <div className="p-16 text-center bg-white rounded-[4rem] border border-slate-100 shadow-premium max-w-3xl mx-auto space-y-10">
            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-pulse relative">
                <div className="absolute inset-2 border border-white/20 rounded-2xl border-dashed"></div>
                <Building2 size={40} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none">Entity Undetected</h2>
                <p className="text-slate-500 text-sm font-medium max-w-md mx-auto italic lowercase tracking-tight">
                    Welcome, {user?.name}. Your verified operational profile is missing from the global registry cluster. Initialize activation to link your enterprise node.
                </p>
            </div>
            <Link to="/vendor/fill-form" className="inline-flex items-center gap-6 px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_50px_-10px_rgba(15,23,42,0.4)] hover:bg-black transition-all active:scale-95 group">
                Initiate Sourcing Link <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
        </div>
    );

    const statusConfig = {
        approved: { color: "text-emerald-500", bg: "bg-emerald-50", icon: ShieldCheck, label: "Registry: Active" },
        pending: { color: "text-amber-500", bg: "bg-amber-50", icon: Clock, label: "Syncing..." },
        rejected: { color: "text-rose-500", bg: "bg-rose-50", icon: XCircle, label: "Access: Locked" }
    };

    const currentStatus = statusConfig[info.status?.toLowerCase()] || statusConfig.pending;

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── MISSION CONTROL HEADER ───────────────────────────────────── */}
            <header className="relative bg-slate-900 rounded-[3.5rem] p-12 lg:p-20 text-white shadow-[0_50px_100px_-20px_rgba(15,23,42,0.4)] overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(16,185,129,0.1)_0%,_transparent_50%)]"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.02] rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:scale-110"></div>
                
                <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-end gap-12">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-emerald-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.3em]">Operational</span>
                            <div className="h-1 w-8 bg-white/10 rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Verified Vendor Terminal</span>
                        </div>
                        <div className="space-y-2">
                             <h1 className="text-6xl lg:text-8xl font-black tracking-[-0.05em] leading-none uppercase select-none">
                                <span className="text-white/40 block">Greetings,</span>
                                <span className="text-white">{info.companyName}</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium text-xl max-w-3xl leading-relaxed italic lowercase tracking-tight border-l-4 border-emerald-500/30 pl-8">
                            Managing enterprise identity node. Synchronizing compliance matrices and operational procurement frequencies within the Antigravity ecosystem.
                        </p>
                    </div>
                </div>
            </header>

            {/* ── SIGNAL MATRIX ────────────────────────────────────────────── */ }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricNode label="Registry Ingress" value={currentStatus.label.split(': ')[1] || 'PENDING'} icon={currentStatus.icon} color="text-amber-500" delay={0.1} />
                <MetricNode label="Secure Transmissions" value="03" icon={MessageSquare} color="text-slate-900" delay={0.2} />
                <MetricNode label="Network Trust Grade" value="98.2" icon={Shield} color="text-emerald-500" delay={0.3} />
                <MetricNode label="Regional Anchor" value="GLOB_01" icon={Globe} color="text-indigo-500" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* ── ENTITY DOSSIER ────────────────────────────────────────── */ }
                <div className="xl:col-span-2 bg-white rounded-[3.5rem] p-12 lg:p-16 border border-slate-100 shadow-premium relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-16 px-4">
                         <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                                <Building2 className="text-slate-900" size={28} />
                                Entity Dossier
                            </h2>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-11">Metadata Synchronization Core</p>
                         </div>
                        <Link to="/vendor/profile" className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-subtle active:scale-95">
                            Update Registry <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 px-4">
                        {[
                            { label: "Legal Nomenclature", value: info.companyName, icon: Building2 },
                            { label: "Designated Attache", value: info.contactPerson, icon: User },
                            { label: "Operational Sector", value: typeof info.category === 'object' ? info.category?.name : (info.category || 'GENERAL_OPS'), icon: Layers },
                            { label: "Network Address", value: info.email, icon: Mail },
                        ].map((item, idx) => (
                            <div key={idx} className="group/item cursor-pointer space-y-4">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-3 flex items-center gap-3 italic">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-slate-900 transition-all"></div>
                                   {item.label}
                                </p>
                                <div className="flex items-center gap-6">
                                     <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover/item:bg-slate-900 group-hover/item:text-white group-hover/item:shadow-xl transition-all shadow-inner uppercase">
                                        <item.icon size={22} strokeWidth={2.5} />
                                     </div>
                                     <span className="text-xl font-black text-slate-900 tracking-tighter leading-none group-hover/item:translate-x-1 transition-all uppercase">{item.value || 'NULL_DATA'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── TERMINAL ACCESS ────────────────────────────────────────── */ }
                <div className="bg-white rounded-[3.5rem] p-12 lg:p-16 border border-slate-100 shadow-premium flex flex-col space-y-10 group">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Access Console</h3>
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] italic">Operational Node Controls</p>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        {[
                            { label: "Fill Form Architecture", path: "/vendor/fill-form", icon: Terminal, desc: "BOM entry & injection" },
                            { label: "Compliance Repository", path: "/vendor/documents", icon: Shield, desc: "Artifact encryption" },
                            { label: "Market Flux Terminal", path: "/vendor/rfqs", icon: Zap, desc: "Priority RFQ sync" },
                        ].map((item) => (
                            <Link key={item.path} to={item.path} className="flex flex-col p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-slate-900 hover:shadow-2xl transition-all group/btn active:scale-[0.98]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 group-hover/btn:bg-slate-900 group-hover/btn:text-white group-hover/btn:shadow-xl transition-all">
                                        <item.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <ArrowUpRight size={18} className="text-slate-200 group-hover/btn:text-slate-900 transition-all" />
                                </div>
                                <div>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{item.label}</span>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 italic">{item.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl group cursor-pointer relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95">
                        <div className="absolute inset-4 border border-white/5 rounded-2xl border-dashed opacity-40 group-hover:rotate-12 transition-transform duration-1000"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Security State</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">ENCRYPT</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400 lowercase italic tracking-tight relative z-10">End-to-End Enterprise Vault Syncing Active at 256-SHA frequency.</p>
                    </div>
                </div>
            </div>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .shadow-subtle {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                .fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
