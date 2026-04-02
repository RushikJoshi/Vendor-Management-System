import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ChevronLeft, ShieldCheck, TrendingUp, AlertCircle, 
    ArrowRight, CheckCircle2, User, Building2, Calendar, 
    Briefcase, FileText, Check, X, Award, DollarSign
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

export default function QuotationsComparison() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rfq, setRfq] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchData = async () => {
        try {
            const [rfqRes, quotesRes] = await Promise.all([
                api.get(`/rfqs/${id}`),
                api.get(`/quotations/rfq/${id}`)
            ]);
            setRfq(rfqRes.data.data);
            setQuotations(quotesRes.data.data);
        } catch (err) {
            toast.error("Failed to load comparison module.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAccept = async (quoteId) => {
        if (!window.confirm("EXECUTE PROCUREMENT PROTOCOL: Are you sure you want to accept this quotation? This will formalize a legal contract and terminate other bids.")) return;
        
        setProcessing(true);
        const toastId = toast.loading("Formulating operational mandate...");
        try {
            await api.post(`/quotations/${quoteId}/accept`);
            toast.success("Strategic Partnership Formalized", { id: toastId });
            navigate("/admin/contracts");
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol execution failure.", { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest">Initializing Comparison Matrix...</div>;

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* ── HEADER ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-[13px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Procurement Comparison Matrix</h1>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{rfq?.title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target Bids Received</p>
                        <p className="text-xl font-black text-slate-900 leading-none">{quotations.length}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-2" />
                    <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
            </div>

            {/* ── COMPARISON GRID ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {quotations.map((quote, idx) => (
                    <div 
                        key={quote._id} 
                        className={`relative group bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl overflow-hidden ${
                            quote.status === 'accepted' ? 'border-emerald-500 shadow-emerald-50' : 'border-slate-100 hover:border-indigo-200'
                        }`}
                    >
                        {quote.status === 'accepted' && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 z-10">
                                <Award size={14} /> Winning_Bid
                            </div>
                        )}

                        {/* Vendor Profile Card */}
                        <div className="p-6 pb-2 border-b border-slate-50 bg-slate-50/30 group-hover:bg-white transition-colors">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100">
                                    {quote.vendorId?.companyName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-black text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{quote.vendorId?.companyName}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <Building2 size={10} /> Authorized Vendor Node
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                    <p className="text-2xl font-black">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(quote.totalAmount)}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={20} className="text-emerald-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <DetailBox label="Submited By" value={quote.vendorId?.name} icon={User} />
                                <DetailBox label="Valid Until" value={new Date(quote.validUntil || Date.now()).toLocaleDateString()} icon={Calendar} />
                            </div>

                            {/* Itemized Price Matrix */}
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Item_Valuation_Matrix</h4>
                                {quote.items?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-1">
                                        <span className="font-bold text-slate-500 uppercase text-[11px] tracking-tight truncate flex-1 pr-4">{item.notes || "Line Item Execution"}</span>
                                        <span className="font-black text-slate-900 tracking-tighter tabular-nums">
                                            {new Intl.NumberFormat('en-IN').format(item.unitPrice)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 flex flex-col gap-3">
                                {quote.status === 'accepted' ? (
                                    <div className="w-full bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest">
                                        <Check size={16} strokeWidth={3} /> Operational Directive Active
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleAccept(quote._id)}
                                            disabled={processing || rfq.status === 'closed'}
                                            className="w-full h-14 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                                        >
                                            {processing ? "Syncing..." : "Accept & Provision Contract"} <ArrowRight size={14} />
                                        </button>
                                        <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors">
                                            Reject_Node_Capability
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {quotations.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                        <Award size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-black uppercase tracking-widest">No Bids Registered Yet</p>
                        <p className="text-[12px] font-bold mt-2 uppercase">Await Vendor Participation Matrix</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailBox({ icon: Icon, label, value }) {
    return (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="text-slate-300">
                <Icon size={14} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-[12px] font-bold text-slate-700 truncate tracking-tight leading-none">{value}</p>
            </div>
        </div>
    );
}
