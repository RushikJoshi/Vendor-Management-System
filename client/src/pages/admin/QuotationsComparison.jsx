import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ChevronLeft, ShieldCheck, TrendingUp,
    ArrowRight, CheckCircle2, User, Calendar,
    Check, X, Award, Info
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

    const fetchData = useCallback(async () => {
        try {
            const [rfqRes, quotesRes] = await Promise.all([
                api.get(`/rfqs/${id}`),
                api.get(`/quotations/rfq/${id}`)
            ]);
            setRfq(rfqRes.data.data);
            setQuotations(quotesRes.data.data);
        } catch {
            toast.error("Failed to load comparison module.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAccept = async (quoteId, orderType = "PO") => {
        console.log(`Accept action (${orderType}) initiated for:`, quoteId);
        
        setProcessing(true);
        const toastId = toast.loading(`Formalizing Contract & ${orderType}...`);
        try {
            const res = await api.post(`/quotations/${quoteId}/accept`, { orderType });
            toast.success(`Success! Contract & ${orderType} have been provisioned.`, { id: toastId });
            navigate("/admin/contracts");
        } catch (err) {
            toast.error(err.response?.data?.message || "Internal Protocol Error: Failed to finalize acceptance.", { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (quoteId) => {
        if (!window.confirm("Are you sure you want to reject this quotation?")) return;

        setProcessing(true);
        const toastId = toast.loading("Rejecting quotation...");
        try {
            await api.post(`/quotations/${quoteId}/reject`);
            toast.success("Quotation rejected successfully.", { id: toastId });
            await fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject quotation.", { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest">Loading quotations...</div>;

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* ── HEADER ────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-6 border-l-4 border-l-indigo-600">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2.5 hover:bg-slate-100/80 text-slate-400 hover:text-slate-900 rounded-xl transition-all border border-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-indigo-500" /> Quotation Comparison
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{rfq?.title}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Bids Received</p>
                            <p className="text-2xl font-black text-slate-900 tabular-nums">{quotations.length}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                           <CheckCircle2 className="text-emerald-500" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── COMPARISON GRID ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {quotations.map((quote) => (
                    <div 
                        key={quote._id} 
                        className={`relative group bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl overflow-hidden ${
                            quote.status === 'accepted' ? 'border-emerald-500 shadow-emerald-50' : 'border-slate-100 hover:border-indigo-200'
                        }`}
                    >
                        {quote.status === 'accepted' && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 z-10">
                                <Award size={14} /> Accepted
                            </div>
                        )}
                        {quote.status === 'rejected' && (
                            <div className="absolute top-0 right-0 bg-rose-500 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 z-10">
                                <X size={14} /> Rejected
                            </div>
                        )}

                        {/* Vendor Profile Card */}
                        <div className="p-5 pb-4 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 text-xl font-bold">
                                    {quote.vendorId?.companyName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">{quote.vendorId?.companyName}</h3>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Verified Partner
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="p-5 space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Quote</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(quote.totalAmount)}
                                        </p>
                                    </div>
                                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                                        <TrendingUp size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <DetailBox label="Submitted By" value={quote.vendorId?.name} icon={User} />
                                <DetailBox label="Valid Until" value={new Date(quote.validUntil || Date.now()).toLocaleDateString()} icon={Calendar} />
                            </div>

                            {/* Itemized Price Matrix */}
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Item Pricing</h4>
                                {quote.items?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-1">
                                        <span className="font-bold text-slate-500 uppercase text-[11px] tracking-tight truncate flex-1 pr-4">{item.notes || "Line Item"}</span>
                                        <span className="font-black text-slate-900 tracking-tighter tabular-nums">
                                            {new Intl.NumberFormat('en-IN').format(item.unitPrice)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex flex-col gap-2">
                                {quote.status === 'accepted' ? (
                                    <div className="w-full bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <Check size={16} strokeWidth={3} /> Quotation Accepted
                                    </div>
                                ) : quote.status === 'rejected' ? (
                                    <div className="w-full bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-200 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <X size={16} strokeWidth={3} /> Quotation Rejected
                                    </div>
                                ) : rfq.status === 'closed' ? (
                                    <div className="w-full bg-amber-50 text-amber-700 p-3.5 rounded-xl border border-amber-200 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-center">
                                        <Info size={16} /> RFQ Closed - Cannot Negotiate
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleAccept(quote._id, "PO")}
                                            disabled={processing || rfq.status === 'closed'}
                                            className="w-full h-12 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {processing ? "Processing..." : "Accept as Purchase Order"} <ArrowRight size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleAccept(quote._id, "SO")}
                                            disabled={processing || rfq.status === 'closed'}
                                            className="w-full h-10 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {processing ? "Processing..." : "Accept as Service Order"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReject(quote._id)}
                                            disabled={processing || rfq.status === 'closed'}
                                            className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors py-1 disabled:opacity-50"
                                        >
                                            Reject Quotation
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
                        <p className="text-xl font-black uppercase tracking-widest">No Quotations Yet</p>
                        <p className="text-[12px] font-bold mt-2 uppercase">Waiting for vendor submissions</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailBox({ icon, label, value }) {
    const IconComponent = icon;

    return (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="text-slate-300">
                <IconComponent size={14} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-[12px] font-bold text-slate-700 truncate tracking-tight leading-none">{value}</p>
            </div>
        </div>
    );
}
