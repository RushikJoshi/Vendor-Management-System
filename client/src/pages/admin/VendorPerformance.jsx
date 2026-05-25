import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, ShieldCheck, Truck, MessageSquare, Award, Loader2, Save, Activity } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import procurementApi from "../../services/procurementApi";
import { toast } from "react-hot-toast";

export default function VendorPerformance() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [scores, setScores] = useState({
        quality: 0,
        delivery: 0,
        compliance: 0,
        communication: 0
    });
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        const fetchVendorAndPerformance = async () => {
            try {
                const [vendorRes, perfRes] = await Promise.all([
                    api.get(`/vendors/${id}`),
                    procurementApi.getVendorPerformance(id)
                ]);
                
                setVendor(vendorRes.data.data);
                
                // Pre-fill with latest review if exists
                if (perfRes.data.data && perfRes.data.data.length > 0) {
                    const latest = perfRes.data.data[0];
                    setScores({
                        quality: latest.qualityScore || 0,
                        delivery: latest.deliveryScore || 0,
                        compliance: latest.complianceScore || 0,
                        communication: latest.communicationScore || 0
                    });
                    setRemarks(latest.remarks || "");
                }
            } catch (err) {
                toast.error("Failed to load vendor identity or performance history.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchVendorAndPerformance();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading("Recording performance telemetry...");
        try {
            await procurementApi.submitPerformanceReview({
                vendorId: id,
                scores,
                remarks
            });
            toast.success(`Performance matrix updated for ${vendor.companyName || vendor.name}`, { id: toastId });
            navigate(-1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Internal Protocol Failure", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Master Node...</p>
        </div>
    );

    const criteria = [
        { id: 'quality', label: 'Quality of Goods/Services', desc: 'Product accuracy and material standards', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'delivery', label: 'Delivery Timeliness', desc: 'SLA adherence and lead-time precision', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'compliance', label: 'Compliance & Safety', desc: 'Regulatory alignment and documentation', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'communication', label: 'Communication & Support', desc: 'Responsiveness and problem resolution', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Performance Audit</h1>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-widest border border-indigo-100">SLM Protocol</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Activity size={12} className="text-indigo-500" /> {vendor.companyName || vendor.name} • {vendor.vendorId || 'ID: ' + id.slice(-8)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Cancel Audit
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Commit Performance Index</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- EVALUATION MATRIX --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Star size={16} className="text-amber-500" /> Scoring Dimensions
                            </h2>
                        </div>
                        
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {criteria.map((item) => (
                                <div key={item.id} className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-3 rounded-2xl ${item.bg} ${item.color} shadow-sm`}>
                                            <item.icon size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 leading-none mb-1.5">{item.label}</h4>
                                            <p className="text-[11px] font-medium text-slate-400 leading-tight uppercase tracking-tight">{item.desc}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">Efficiency: {scores[item.id]}%</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${scores[item.id] > 70 ? 'text-emerald-500' : scores[item.id] > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                {scores[item.id] > 80 ? 'Excellent' : scores[item.id] > 60 ? 'Good' : scores[item.id] > 40 ? 'Average' : 'Poor'}
                                            </span>
                                        </div>
                                        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                className={`absolute inset-y-0 left-0 rounded-full ${scores[item.id] > 70 ? 'bg-emerald-500' : scores[item.id] > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${scores[item.id]}%` }}
                                            />
                                            <input 
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={scores[item.id]}
                                                onChange={(e) => setScores(p => ({ ...p, [item.id]: parseInt(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- QUALITATIVE REMARKS --- */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={16} className="text-indigo-500" /> Qualitative Feedback
                            </h2>
                        </div>
                        <div className="p-8">
                            <textarea 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Explain the rationale behind these scores. Highlighting specific instances of excellence or failure will help in better risk profiling."
                                className="w-full rounded-2xl border border-slate-200 p-6 text-sm font-medium focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all resize-none min-h-[180px] bg-slate-50/30 placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR INFO --- */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-indigo-400" /> Audit Impact
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6">
                            This performance review will directly influence the vendor's **Dynamic Risk Score** and **Market Ranking**.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weightage Matrix</p>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                                    <div className="flex justify-between"><span>Quality</span> <span className="text-indigo-400">30%</span></div>
                                    <div className="flex justify-between"><span>Delivery</span> <span className="text-indigo-400">30%</span></div>
                                    <div className="flex justify-between"><span>Compliance</span> <span className="text-indigo-400">20%</span></div>
                                    <div className="flex justify-between"><span>Comm.</span> <span className="text-indigo-400">20%</span></div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-200">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Alert Trigger</p>
                                <p className="text-[11px] font-medium leading-tight">Scores below 50% will trigger an immediate escalation to the Procurement Manager.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Master Sync Status</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-slate-600">Database Connection: Stable</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-slate-600">Entity Resolved: {vendor.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                <span className="text-xs font-bold text-slate-600">Audit Mode: Live Persistence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
