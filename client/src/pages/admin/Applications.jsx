import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import {
    Eye, Building2, Mail, Filter, Globe, X, ChevronDown,
    Activity, Zap, Layers, AlertCircle, CheckCircle2, MoreHorizontal, ChevronRight, Search,
    TrendingUp, ShieldCheck, Terminal, ArrowUpRight, Calendar, Briefcase, User, ArrowRight
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import ApplicationDetail from "./ApplicationDetail";
import Stepper from "../../components/vms/Stepper";
import MatchProgress from "../../components/vms/MatchProgress";
import { motion, AnimatePresence } from "framer-motion";

export default function Applications() {
    const navigate = useNavigate();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [showPipelineFilter, setShowPipelineFilter] = useState(false);
    const [pipelineCategory, setPipelineCategory] = useState("all");
    const [pipelineRisk, setPipelineRisk] = useState("all");
    const [pipelineStage, setPipelineStage] = useState("all");
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const filterRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        highRisk: 0,
        approved: 0
    });

    useEffect(() => {
        fetchApps();
        
        // Listen for global search from Navbar
        const handleGlobalSearch = (e) => {
            setSearch(e.detail);
        };
        window.addEventListener('GLOBAL_SEARCH', handleGlobalSearch);
        return () => window.removeEventListener('GLOBAL_SEARCH', handleGlobalSearch);
    }, [filterStatus]);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/applications`);
            const data = res.data.data;
            setApps(data);
            
            setStats({
                total: data.length,
                pending: data.filter(a => a.status === 'pending' || a.status === 'submitted').length,
                highRisk: data.filter(a => a.riskLevel === 'High').length,
                approved: data.filter(a => a.status === 'approved').length
            });
        } catch (err) {
            toast.error("Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    // Close pipeline filter on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowPipelineFilter(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const categories = [...new Set(apps.map(a => a.category?.name || 'General').filter(Boolean))];

    const filteredApps = apps.filter(app => {
        const matchesStatus = filterStatus === 'all' || app.status?.toLowerCase() === filterStatus.toLowerCase();
        const matchesSearch = !search || 
            app.companyName?.toLowerCase().includes(search.toLowerCase()) ||
            app.email?.toLowerCase().includes(search.toLowerCase()) ||
            app._id?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = pipelineCategory === 'all' || (app.category?.name || 'General') === pipelineCategory;
        const matchesRisk = pipelineRisk === 'all' || (app.riskLevel || 'Low') === pipelineRisk;
        const matchesStage = pipelineStage === 'all' || (app.currentStage || 'SUBMITTED') === pipelineStage;
        return matchesStatus && matchesSearch && matchesCategory && matchesRisk && matchesStage;
    });

    const pendingFilteredIds = filteredApps.filter(a => a.status === 'pending' || a.status === 'submitted' || a.status === 'draft').map(a => a._id);
    const allPendingSelected = pendingFilteredIds.length > 0 && pendingFilteredIds.every(id => selectedIds.has(id));

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (allPendingSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingFilteredIds));
        }
    };

    const handleBulkApprove = async () => {
        const ids = [...selectedIds];
        if (ids.length === 0) return toast.error('Select at least one pending application.');
        const confirm = window.confirm(`Approve ${ids.length} application(s)?`);
        if (!confirm) return;
        setBulkLoading(true);
        let success = 0, fail = 0;
        for (const id of ids) {
            try {
                await api.post('/submission/approve', { submissionId: id, action: 'approved' });
                success++;
            } catch {
                fail++;
            }
        }
        setBulkLoading(false);
        setSelectedIds(new Set());
        toast.success(`${success} approved${fail ? `, ${fail} failed` : ''}`);
        fetchApps();
    };

    const activePipelineFilters = [pipelineCategory, pipelineRisk, pipelineStage].filter(f => f !== 'all').length;

    const clearPipelineFilters = () => {
        setPipelineCategory('all');
        setPipelineRisk('all');
        setPipelineStage('all');
    };

    return (
        <div className="space-y-6 pb-10 fade-in">
            {/* ── PREMIUM HEADER ─────────────────────────────────────────── */}
            <section className="relative rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-wrap items-center gap-5">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl whitespace-nowrap">
                                Vendor Applications.
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                                    </span>
                                    Onboarding Pipeline
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                                    <Activity size={12} className="text-slate-400" />
                                    Live Queue
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative" ref={filterRef}>
                                <button onClick={() => setShowPipelineFilter(!showPipelineFilter)} className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-[13px] font-bold shadow-sm transition-all hover:bg-slate-50 ${activePipelineFilters > 0 ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700'}`}>
                                    <Filter size={16} /> Pipeline Filter
                                    {activePipelineFilters > 0 && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{activePipelineFilters}</span>}
                                    <ChevronDown size={14} className={`transition-transform ${showPipelineFilter ? 'rotate-180' : ''}`} />
                                </button>
                                {showPipelineFilter && (
                                    <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Pipeline Filters</h4>
                                            {activePipelineFilters > 0 && <button onClick={clearPipelineFilters} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">Clear All</button>}
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                                                <select value={pipelineCategory} onChange={e => setPipelineCategory(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
                                                    <option value="all">All Categories</option>
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Risk Level</label>
                                                <select value={pipelineRisk} onChange={e => setPipelineRisk(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
                                                    <option value="all">All Risk Levels</option>
                                                    <option value="Low">Low Risk</option>
                                                    <option value="Medium">Medium Risk</option>
                                                    <option value="High">High Risk</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pipeline Stage</label>
                                                <select value={pipelineStage} onChange={e => setPipelineStage(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
                                                    <option value="all">All Stages</option>
                                                    <option value="SUBMITTED">Submitted</option>
                                                    <option value="TECHNICAL">Technical</option>
                                                    <option value="FINANCE">Finance</option>
                                                    <option value="COMPLIANCE">Compliance</option>
                                                    <option value="FINAL_APPROVAL">Final Approval</option>
                                                    <option value="COMPLETED">Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleBulkApprove}
                                disabled={selectedIds.size === 0 || bulkLoading}
                                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold shadow-sm transition-all tracking-wide ${
                                    selectedIds.size > 0
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                            >
                                <ShieldCheck size={18} />
                                {bulkLoading ? 'Approving...' : selectedIds.size > 0 ? `Bulk Approve (${selectedIds.size})` : 'Bulk Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── KPI GRID ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                 <KPICard label="Total Applications" value={stats.total} trend="Active Pool" color="indigo" icon={Layers} />
                 <KPICard label="Pending Review" value={stats.pending} trend="Action Req" color="amber" icon={AlertCircle} />
                 <KPICard label="High Risk Alert" value={stats.highRisk} trend="Review Needed" color="blue" icon={Briefcase} />
                 <KPICard label="Approved Today" value={stats.approved} trend="Verified" color="emerald" icon={CheckCircle2} />
            </div>

            {/* ── TABLE CONTAINER ────────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col min-h-[500px]">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
                        {['All', 'Draft', 'Pending', 'Approved', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status.toLowerCase())}
                                className={`whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                                    filterStatus === status.toLowerCase() 
                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    {search && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            Searching: {search}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-4 py-4 w-10">
                                    <input type="checkbox" checked={allPendingSelected && pendingFilteredIds.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" title="Select all pending" />
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Applicant</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Progress</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Risk Level</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-4 bg-slate-100 rounded"></div></td>
                                        <td className="p-6"><div className="h-10 w-48 bg-slate-100 rounded-lg"></div></td>
                                        <td className="p-6"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                                        <td className="p-6"><div className="h-6 w-32 bg-slate-100 rounded-full"></div></td>
                                        <td className="p-6"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                                        <td className="p-6 text-right"><div className="h-8 w-20 bg-slate-100 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Layers size={40} className="mb-4 text-slate-300" strokeWidth={1.5} />
                                            <p className="text-[13px] font-bold uppercase tracking-wider">No matching applications</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => (
                                    <tr 
                                        key={app._id} 
                                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        navigate(`/admin/submissions/${app._id}`);
                                    }}
                                    >
                                        <td className="px-4 py-5" onClick={e => e.stopPropagation()}>
                                            {(app.status === 'pending' || app.status === 'submitted' || app.status === 'draft') && (
                                                <input type="checkbox" checked={selectedIds.has(app._id)} onChange={() => toggleSelect(app._id)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md transition-all border border-transparent group-hover:border-slate-100">
                                                    <Building2 size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[14px] font-semibold text-slate-900 group-hover:text-indigo-900 truncate">{app.companyName || "N/A"}</p>
                                                        {app.isNew && <span className="bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>}
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{app.category?.name || "General"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-slate-700">{app.email}</span>
                                                <span className="text-[11px] font-mono text-slate-400 mt-0.5">#{app._id?.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-3 min-w-[140px]">
                                                <Stepper currentStage={app.currentStage || 'SUBMITTED'} status={app.status} />
                                                <StatusBadge status={app.status} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2">
                                               <span className={`inline-flex items-center justify-center w-fit min-w-[80px] rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                                                    app.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    app.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                    {app.riskLevel || 'Low'} Risk
                                                </span>
                                                <MatchProgress percentage={app.eligibilityScore || 85} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95">
                                                    Review <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedApp && (
                <Modal open={true} onClose={() => setSelectedApp(null)} size="7xl">
                    <ApplicationDetail app={selectedApp} onSuccess={() => { setSelectedApp(null); fetchApps(); }} />
                </Modal>
            )}
        </div>
    );
}

function KPICard({ label, value, trend, icon: Icon, color }) {
    const colorMap = {
        indigo: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
        blue: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
        amber: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" }
    };
    const style = colorMap[color];

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md group"
        >
            <div className="flex items-start justify-between mb-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
                    {trend}
                </div>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">{value}</h3>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${style.dot}`} 
                />
            </div>
        </motion.div>
    );
}


