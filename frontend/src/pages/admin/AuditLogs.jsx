import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    Search, X, Clock, User, Shield, ArrowRight, Activity, 
    Filter, Database, Terminal, FileText, ChevronLeft, ChevronRight
} from "lucide-react";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({ page: 1, limit: 15, actionType: "" });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, [filters.page, filters.actionType]);

    useEffect(() => {
        const handleGlobalSearch = (e) => {
            setFilters(f => ({ ...f, actionType: e.detail.toUpperCase(), page: 1 }));
        };
        window.addEventListener('GLOBAL_SEARCH', handleGlobalSearch);
        return () => window.removeEventListener('GLOBAL_SEARCH', handleGlobalSearch);
    }, []);

    const fetchLogs = async () => {
        try {
            const query = new URLSearchParams();
            query.append("page", filters.page);
            query.append("limit", filters.limit);
            if (filters.actionType) query.append("actionType", filters.actionType);

            const res = await api.get(`/admin/audit-logs?${query.toString()}`);
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Audit log error:", err);
            toast.error("Failed to load audit logs.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (filters.page < pagination.pages) setFilters(f => ({ ...f, page: f.page + 1 }));
    };

    const handlePrevPage = () => {
        if (filters.page > 1) setFilters(f => ({ ...f, page: f.page - 1 }));
    };

    // Helper to format JSON chunks in the modal
    const renderJSON = (data) => {
        if (!data || Object.keys(data).length === 0) return <span className="text-slate-400 italic">No data</span>;
        return <pre className="text-[12px] font-mono leading-relaxed text-slate-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
    };

    return (
        <div className="space-y-6 pb-10 fade-in">
            {/* ── HEADER ─────────────────────────────────────────── */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            </span>
                            System Security
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                            <Shield size={12} className="text-slate-400" />
                            Activity Logs
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                                Audit Trail.
                            </h1>
                            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
                                Track all system mutations, user activities, and security events across the platform in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LOGS TABLE ─────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col min-h-[500px]">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                        <Database size={16} className="text-indigo-500" />
                        <span>Live Event Ledger</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[12px] font-bold text-slate-500">
                            Page {filters.page} of {pagination.pages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={handlePrevPage} 
                                disabled={filters.page === 1} 
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                onClick={handleNextPage} 
                                disabled={filters.page >= pagination.pages} 
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">User / Actor</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Action Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Entity</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-6"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="p-6"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                                        <td className="p-6"><div className="h-6 w-24 bg-slate-100 rounded-full"></div></td>
                                        <td className="p-6"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                                        <td className="p-6 text-right"><div className="h-8 w-24 bg-slate-100 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Shield size={40} className="mb-4 text-slate-300" strokeWidth={1.5} />
                                            <p className="text-[13px] font-bold uppercase tracking-wider">No logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-semibold text-slate-700">
                                                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                                                    <User size={12} />
                                                </div>
                                                <span className="text-[13px] font-bold text-slate-600">
                                                    {log.userId?.slice(-6).toUpperCase() || "SYSTEM"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                log.actionType.includes('DELETE') || log.actionType.includes('REJECT') 
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                                    : log.actionType.includes('CREATE') || log.actionType.includes('APPROVE')
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[12px] font-bold text-slate-900">{log.entityType}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-[11px] font-mono font-bold text-slate-500">#{log.entityId?.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedLog(log)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95"
                                            >
                                                View <ArrowRight size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MODAL ─────────────────────────────────────────── */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                    <Activity size={20} className="text-indigo-600" />
                                    Audit Detail
                                </h3>
                                <p className="mt-1 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                                    ID: {selectedLog._id}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Context */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-slate-100 bg-white">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Actor</span>
                                <div className="text-[13px] font-bold text-slate-900 leading-tight">
                                    {selectedLog.userRole} <span className="text-slate-300 mx-1">/</span> {selectedLog.userId}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">IP Address</span>
                                <div className="text-[13px] font-bold text-slate-900 leading-tight">
                                    {selectedLog.ipAddress || '127.0.0.1'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Timestamp</span>
                                <div className="text-[13px] font-bold text-slate-900 leading-tight">
                                    {new Date(selectedLog.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Modal Diff Body */}
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50">
                            <div className="w-full md:w-1/2 flex flex-col border-r border-slate-200/50">
                                <div className="px-6 py-3 border-b border-slate-200/50 bg-slate-100/50">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Before Change</span>
                                </div>
                                <div className="flex-1 overflow-auto p-6 no-scrollbar">
                                    {renderJSON(selectedLog.beforeData)}
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col">
                                <div className="px-6 py-3 border-b border-slate-200/50 bg-emerald-50">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">After Change</span>
                                </div>
                                <div className="flex-1 overflow-auto p-6 no-scrollbar">
                                    {renderJSON(selectedLog.afterData)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
