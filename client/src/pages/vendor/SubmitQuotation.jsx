import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight, Info, Send, ListChecks, IndianRupee, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import {
  PageShell,
  SectionCard,
  Field,
  inputClass,
  textareaClass,
  secondaryButtonClass,
  surfaceClass,
  cn
} from "../../components/vendor/VendorUI";
import CommentSection from "../../components/CommentSection";

export default function SubmitQuotation() {
    const navigate = useNavigate();
    const { id } = useParams(); // Should be passed in URL or state
    const [rfq, setRfq] = useState(null);
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        rfqId: id || "",
        totalAmount: "",
        validUntil: "",
        notes: "",
        items: []
    });

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // Fetch active RFQs assigned to vendor
                const res = await api.get("/rfqs");
                const available = Array.isArray(res.data?.data) ? res.data.data : [];
                setRfqs(available);

                if (id) {
                    const rfqRes = await api.get(`/rfqs/${id}`);
                    const rfqData = rfqRes.data.data;
                    setRfq(rfqData);
                    setFormData(prev => ({
                        ...prev,
                        rfqId: id,
                        items: (rfqData.items || []).map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            unitPrice: 0,
                            hsn: ""
                        }))
                    }));
                }
            } catch {
                toast.error("Failed to load sourcing context.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, [id]);

    const handleRfqSelect = async (rfqId) => {
        if (!rfqId) return;
        setLoading(true);
        try {
            const rfqRes = await api.get(`/rfqs/${rfqId}`);
            const rfqData = rfqRes.data.data;
            setRfq(rfqData);
            setFormData({
                rfqId: rfqId,
                totalAmount: "",
                validUntil: "",
                notes: "",
                items: (rfqData.items || []).map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: 0,
                    hsn: ""
                }))
            });
        } catch {
            toast.error("Failed to sync RFQ items.");
        } finally {
            setLoading(false);
        }
    };

    const handleHsnChange = (index, value) => {
        const newItems = [...formData.items];
        newItems[index].hsn = value;
        setFormData({ ...formData, items: newItems });
    };

    const handlePriceChange = (index, value) => {
        const newItems = [...formData.items];
        const price = Number(value);
        newItems[index].unitPrice = price;
        newItems[index].totalPrice = price * newItems[index].quantity;
        newItems[index].notes = newItems[index].name; // Using name as notes for now
        
        // Auto-calculate total
        const total = newItems.reduce((acc, curr) => acc + (curr.totalPrice), 0);
        
        setFormData({
            ...formData,
            items: newItems,
            totalAmount: total
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.rfqId) return toast.error("Please select an Event.");
        if (formData.totalAmount <= 0) return toast.error("Valuation must be greater than zero.");

        setSubmitting(true);
        const toastId = toast.loading("Transmitting quotation protocol...");
        try {
            await api.post("/quotations", formData);
            toast.success("Quotation transmitted successfully.", { id: toastId });
            navigate("/vendor/rfqs");
        } catch (err) {
            toast.error(err.response?.data?.message || "Transmission failure.", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !rfq) return <div className="p-10 text-center animate-pulse text-slate-500 font-semibold uppercase tracking-widest text-[12px]">Syncing Registry...</div>;

    return (
        <PageShell className="max-w-[1200px] mx-auto xl:max-w-none">
            {/* Header section matching MyRFQs style closely */}
            <section className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700">
                        <Send size={12} /> Quotation Submission
                    </span>
                    <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-900">Bid Response Proposal</h1>
                    <p className="mt-2 text-[14px] leading-6 text-slate-500 max-w-2xl">
                        Review the operational requirements and submit your most competitive proposal for this sourcing event.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={secondaryButtonClass}
                >
                    <ChevronLeft size={16} /> Back
                </button>
            </section>

            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] xl:grid-cols-[2fr_1fr] gap-6">
                {/* Left Side */}
                <div className="space-y-6">
                    <SectionCard title="Sourcing Event Reference" description="Select the RFQ to submit a quotation against.">
                        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                            <Field label="Active Sourcing Event">
                                <select 
                                    value={formData.rfqId}
                                    onChange={(e) => handleRfqSelect(e.target.value)}
                                    disabled={!!id}
                                    className={inputClass}
                                >
                                    <option value="">-- Select Active RFQ --</option>
                                    {rfqs.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                                </select>
                            </Field>
                        </div>
                    </SectionCard>

                    <SectionCard title="Requirement Price Matrix" description="Provide your best unit price for each requested item. All values in INR.">
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {formData.items.length > 0 ? formData.items.map((item, idx) => (
                                <div key={idx} className="p-6 grid grid-cols-1 md:grid-cols-[1fr_140px_160px_120px] lg:grid-cols-[1fr_120px_180px_120px] gap-6 items-center hover:bg-slate-50/30 transition">
                                    <div>
                                        <p className="text-[14px] font-semibold text-slate-900">{item.name}</p>
                                        <p className="text-[12px] font-medium text-slate-500 mt-1">{item.quantity} {item.unit} Required</p>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                placeholder="HSN/SAC"
                                                value={item.hsn || ""}
                                                onChange={(e) => handleHsnChange(idx, e.target.value)}
                                                className={cn(inputClass, "font-semibold bg-white")}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[14px]">₹</span>
                                            <input 
                                                type="number"
                                                placeholder="Unit Price"
                                                value={item.unitPrice || ""}
                                                onChange={(e) => handlePriceChange(idx, e.target.value)}
                                                className={cn(inputClass, "pl-8 font-semibold bg-white")}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em] leading-none mb-2">Line Total</p>
                                        <p className="text-[16px] font-semibold text-slate-900">
                                            ₹{new Intl.NumberFormat('en-IN').format(item.unitPrice * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 shadow-inner">
                                        <ListChecks size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-900 mb-2">No Event Selected</h3>
                                    <p className="text-[14px] leading-6 text-slate-500 max-w-[280px]">Select an active sourcing event above to populate the requirement matrix.</p>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="Submission Notes / Terms" description="Add any specific conditions, delivery notes, or exclusions.">
                        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                            <textarea 
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Add specifics about delivery, validity, or exclusions (Optional)..."
                                className={textareaClass}
                            />
                        </div>
                    </SectionCard>
                </div>

                {/* Right Side */}
                <div>
                    <div className="sticky top-24">
                        <div className={cn(surfaceClass, "overflow-hidden")}>
                            {/* Dark header section */}
                            <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-transparent to-transparent"></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                                        <IndianRupee size={14} /> Total Bid Valuation
                                    </p>
                                    <h3 className="text-3xl font-semibold tracking-[-0.03em] text-white">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(formData.totalAmount)}
                                    </h3>
                                </div>
                            </div>

                            {/* White body section */}
                            <div className="p-6 space-y-6">
                                <Field label="Quote Validity (Deadline)">
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="date"
                                            value={formData.validUntil}
                                            onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                                            className={cn(inputClass, "pl-10")}
                                            required
                                        />
                                    </div>
                                </Field>

                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 mt-2">
                                    <div className="flex gap-3">
                                        <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                        <p className="text-[13px] font-medium leading-relaxed text-indigo-800">
                                            By submitting this proposal, you agree to fulfill the operational mandates as per the specifications in the RFQ document.
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting || !formData.rfqId}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-[13px] font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {submitting ? "Transmitting..." : "Submit Proposal"} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* DISCUSSION AREA */}
            <div className="mt-10 max-w-[1200px] mx-auto xl:max-w-none grid grid-cols-1 gap-6 pb-20">
                <CommentSection targetModel="RFQ" targetId={id} />
            </div>
        </PageShell>
    );
}
