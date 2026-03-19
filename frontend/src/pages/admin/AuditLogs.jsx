import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { ShieldCheck, Database, Search, ChevronRight, X, Clock, User, Activity } from "lucide-react";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({ page: 1, limit: 15, actionType: "" });
    const [pagination, setPagination] = useState({});

    // Poll logs every 10 seconds for real-time emulation
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.actionType]);

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
            toast.error("Failed to load audit trail.");
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

    if (loading) return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#0B5D3B] border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-6 fade-in h-[calc(100vh-80px)] flex flex-col">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Activity className="text-corp-dark" size={28} /> Immutable Audit Ledger
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-10">Cryptographically secured operational logs</p>
                </div>
                <div className="flex items-center gap-4 bg-white border border-gray-200 p-2 rounded-[8px] shadow-sm">
                    <Search className="text-gray-400 ml-2" size={16} />
                    <input
                        type="text"
                        placeholder="Filter by action... (e.g. APPROVED)"
                        value={filters.actionType}
                        onChange={(e) => setFilters(f => ({ ...f, actionType: e.target.value.toUpperCase(), page: 1 }))}
                        className="text-xs font-bold text-gray-900 border-none outline-none w-64 uppercase placeholder-gray-300"
                    />
                </div>
            </header>

            <div className="bg-white rounded-[10px] border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden relative">
                {/* Fixed Header */}
                <div className="bg-gray-50 border-b border-gray-200 shrink-0">
                    <div className="grid grid-cols-12 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest items-center">
                        <div className="col-span-2">Timestamp</div>
                        <div className="col-span-1">Actor ID</div>
                        <div className="col-span-3">Action Type</div>
                        <div className="col-span-2">Entity Context</div>
                        <div className="col-span-2">IP Trace</div>
                        <div className="col-span-2 text-right">Integrity Tool</div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={log._id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 hover:bg-emerald-50/30 transition-colors items-center group text-xs text-gray-700 font-semibold cursor-pointer" onClick={() => setSelectedLog(log)}>
                            <div className="col-span-2 flex items-center gap-2">
                                <Clock size={12} className="text-gray-300 group-hover:text-emerald-500" />
                                <span className="font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="col-span-1 text-[10px] font-black uppercase text-gray-400">
                                {log.userId?.slice(-6) || "SYSTEM"}
                            </div>
                            <div className="col-span-3">
                                <span className={`px-2 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest ${log.actionType.includes('REJECT') || log.actionType.includes('DELETE') ? 'bg-rose-100 text-rose-700' :
                                    log.actionType.includes('APPROVE') ? 'bg-emerald-100 text-emerald-700' :
                                        log.actionType.includes('CREATE') ? 'bg-blue-100 text-blue-700' :
                                            'bg-indigo-100 text-indigo-700'
                                    }`}>
                                    {log.actionType}
                                </span>
                            </div>
                            <div className="col-span-2 font-mono text-[10px] text-gray-400 group-hover:text-gray-900 transition-colors">
                                {log.entityType} <span className="text-gray-300">|</span> {log.entityId?.slice(-6) || 'N/A'}
                            </div>
                            <div className="col-span-2 font-mono text-[9px] text-gray-400 opacity-60 group-hover:opacity-100">
                                {log.ipAddress || '127.0.0.1'}
                            </div>
                            <div className="col-span-2 text-right">
                                <button className="text-[9px] font-bold text-corp-dark uppercase tracking-widest border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 px-3 py-1.5 rounded-[4px] invisible group-hover:visible transition-all">
                                    Display Diff
                                </button>
                            </div>
                        </div>
                    ))}

                    {logs.length === 0 && (
                        <div className="p-10 text-center flex flex-col justify-center items-center h-full">
                            <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-gray-400">No operational logs match query</p>
                        </div>
                    )}
                </div>

                {/* Footer Pagination */}
                <div className="bg-gray-50 border-t border-gray-200 p-4 shrink-0 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <p>Showing Node Pages {filters.page} of {pagination.pages || 1}</p>
                    <div className="flex gap-2 text-xs">
                        <button onClick={handlePrevPage} disabled={filters.page === 1} className="px-4 py-1.5 bg-white border border-gray-200 rounded-[4px] disabled:opacity-30 hover:bg-gray-100">Prev</button>
                        <button onClick={handleNextPage} disabled={filters.page >= pagination.pages} className="px-4 py-1.5 bg-white border border-gray-200 rounded-[4px] disabled:opacity-30 hover:bg-gray-100">Next</button>
                    </div>
                </div>
            </div>

            {/* Differential View Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
                    <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative border flex border-gray-200">
                        <div className="bg-corp-dark text-white p-6 shrink-0 border-b border-corp-primary/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-extrabold tracking-tight uppercase">Audit Block {selectedLog._id.slice(-8)}</h3>
                                    <p className="text-[10px] font-black tracking-widest uppercase text-emerald-300 mt-1 flex items-center gap-2">
                                        <Database size={10} /> {new Date(selectedLog.createdAt).toUTCString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="text-white/50 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 shrink-0 grid grid-cols-3 gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <div>
                                <span className="text-gray-400 block mb-1">Actor Profile</span>
                                <div className="flex items-center gap-2 text-gray-900 border border-gray-200 bg-white p-2 rounded shadow-sm">
                                    <User size={12} className="text-corp-dark" /> {selectedLog.userRole} | ID: {selectedLog.userId || "SYS"}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-1">Vector / Access</span>
                                <div className="flex items-center gap-2 text-gray-900 border border-gray-200 bg-white p-2 text-[9px] font-mono rounded shadow-sm truncate">
                                    {selectedLog.userAgent?.slice(0, 40) || 'Unknown'} <div className="w-1 h-1 bg-gray-300 rounded-full"></div> {selectedLog.ipAddress || 'LOCAL_SYS'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-1">Entity Reference</span>
                                <div className="flex items-center gap-2 text-emerald-600 border border-emerald-100 bg-emerald-50 rounded shadow-sm p-2 font-black cursor-pointer uppercase transition-colors hover:bg-emerald-100 text-[10px]">
                                    {selectedLog.entityType} <ChevronRight size={10} /> {selectedLog.entityId}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 min-h-0 bg-[#0A0A0A]">
                            <div className="w-1/2 border-r border-gray-800 flex flex-col">
                                <div className="bg-[#111111] p-2 text-center text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] border-b border-gray-800 shrink-0">
                                    Before Mutation (Nullified)
                                </div>
                                <div className="p-4 flex-1 overflow-auto bg-[#0F0F0F] text-emerald-400/80 font-mono text-xs custom-scrollbar">
                                    <pre className="whitespace-pre-wrap leading-relaxed">{JSON.stringify(selectedLog.beforeData || {}, null, 2)}</pre>
                                </div>
                            </div>
                            <div className="w-1/2 flex flex-col">
                                <div className="bg-[#111111] p-2 text-center text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] border-b border-gray-800 shrink-0">
                                    After Mutation (Committed)
                                </div>
                                <div className="p-4 flex-1 overflow-auto bg-[#0F0F0F] text-emerald-400 font-mono text-xs custom-scrollbar border-l border-emerald-500/20">
                                    <pre className="whitespace-pre-wrap leading-relaxed">{JSON.stringify(selectedLog.afterData || {}, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
