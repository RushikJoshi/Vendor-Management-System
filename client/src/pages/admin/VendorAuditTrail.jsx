import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { History, User, Clock, Terminal, Shield, ArrowRight, Zap, Info, ChevronRight, Activity } from "lucide-react";
import Modal from "../../components/Modal";
import { format } from "date-fns";

export default function VendorAuditTrail({ open, onClose, vendorId, entityName }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!open) return;
            setLoading(true);
            try {
                const res = await api.get(`/activity-logs`, {
                    params: { 
                        entityId: vendorId,
                        entityType: "Vendor",
                        limit: 50,
                        sort: "-createdAt"
                    }
                });
                setLogs(res.data.data);
            } catch (err) {
                toast.error("Security: Failed to authorize audit data retrieval.");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [open, vendorId]);

    const getActionColor = (action) => {
        if (action.includes("CREATE")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
        if (action.includes("UPDATE")) return "text-indigo-600 bg-indigo-50 border-indigo-100";
        if (action.includes("BLACKLIST")) return "text-rose-600 bg-rose-50 border-rose-100";
        if (action.includes("DELETE")) return "text-red-600 bg-red-50 border-red-100";
        return "text-slate-600 bg-slate-50 border-slate-100";
    };

    return (
        <Modal open={open} onClose={onClose} title="Institutional Audit Trail" size="3xl">
            <div className="flex flex-col h-[600px]">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield size={18} className="text-indigo-600" />
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-500">Master Governance Log: {entityName}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Immutable Security Ledger
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <History size={48} strokeWidth={1} className="mb-4 opacity-50" />
                            <p className="text-[13px] font-black uppercase tracking-widest">No audit mutations detected in ledger.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100" />
                            {logs.map((log, idx) => (
                                <div key={log._id} className="relative pl-14 pb-8 last:pb-0 group">
                                    <div className={`absolute left-0 top-1 w-14 h-14 rounded-2xl border flex items-center justify-center transition-all group-hover:scale-110 z-10 ${getActionColor(log.action)}`}>
                                        <Activity size={20} />
                                    </div>
                                    
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm group-hover:border-indigo-200 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                                                <Clock size={12} />
                                                {format(new Date(log.createdAt), "MMM dd, yyyy • HH:mm:ss")}
                                            </div>
                                        </div>

                                        <p className="text-[13px] font-bold text-slate-700 mb-4 leading-relaxed">
                                            Partner state mutation initiated on the institutional node. 
                                            New parameters synchronized across the ecosystem.
                                        </p>

                                        <div className="flex items-center gap-3 bg-slate-50/50 rounded-xl px-4 py-3 border border-slate-100">
                                            <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase shadow-sm">
                                                {log.performedBy?.name?.charAt(0) || "U"}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 leading-none">Performed By</p>
                                                <p className="text-[13px] font-bold text-slate-900 mt-1 flex items-center gap-2">
                                                    {log.performedBy?.name || "System Automated"}
                                                    <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">{log.performedBy?.role || "Admin"}</span>
                                                </p>
                                            </div>
                                            {log.ipAddress && (
                                                <div className="hidden md:block text-right">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase">Gateway IP</p>
                                                    <p className="text-[11px] font-mono font-bold text-slate-400">{log.ipAddress}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center px-8">
                     <div className="flex items-center gap-2 text-rose-500">
                         <Shield size={14} className="animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Integrity Monitoring Active</span>
                     </div>
                     <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Close Registry Log
                    </button>
                </div>
            </div>
        </Modal>
    );
}
