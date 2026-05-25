import { useState } from "react";
import { Star, X, ShieldCheck, Truck, MessageSquare, Award, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import procurementApi from "../services/procurementApi";
import { toast } from "react-hot-toast";

export default function VendorRatingModal({ isOpen, onClose, vendor, onRefresh }) {
    const [scores, setScores] = useState({
        quality: 80,
        delivery: 80,
        compliance: 80,
        communication: 80
    });
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await procurementApi.submitPerformanceReview({
                vendorId: vendor._id,
                scores,
                remarks
            });
            toast.success(`Performance review submitted for ${vendor.companyName || vendor.name}`);
            onRefresh();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const criteria = [
        { id: 'quality', label: 'Quality of Goods/Services', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'delivery', label: 'Delivery Timeliness', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'compliance', label: 'Compliance & Safety', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'communication', label: 'Communication & Support', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Rate Vendor Performance</h2>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                                {vendor.companyName || vendor.name} • Master Registry
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {criteria.map((item) => (
                                <div key={item.id} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                                            <span>Efficiency: {scores[item.id]}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={scores[item.id]}
                                            onChange={(e) => setScores(p => ({ ...p, [item.id]: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                            <span>Poor</span>
                                            <span>Average</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Qualitative Remarks</label>
                            <textarea 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Explain the rationale behind these scores..."
                                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all resize-none min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Discard
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="flex-[2] py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Finalize & Submit Score'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
