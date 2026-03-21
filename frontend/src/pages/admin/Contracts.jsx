import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import { toast } from "react-hot-toast";
import {
    Search, Plus, FileSignature, Calendar, Clock, AlertTriangle, Download,
    Eye, Filter, MoreVertical, ChevronRight, User, Tags, DollarSign, X,
    Building2, ShieldCheck, Activity, Layers, ArrowUpRight, Lock, Terminal, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Contracts() {
    const [contracts, setContracts] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, expiringSoon: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedContract, setSelectedContract] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create form state
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({
        vendorId: "",
        contractNumber: "",
        contractTitle: "",
        startDate: "",
        endDate: "",
        contractValue: "",
        documentUrl: "https://example.com/contract.pdf"
    });

    const fetchStats = async () => {
        try {
            const res = await api.get(`/slm/contracts/stats`);
            setStats(res.data.data);
        } catch (err) {
            console.error("Stats fail", err);
        }
    };

    const fetchContracts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/slm/contracts`, {
                params: {
                    page,
                    limit: pagination.limit,
                    search,
                    status: statusFilter
                }
            });
            setContracts(res.data.data);
            setPagination(res.data.pagination || { ...pagination, page });
        } catch (err) {
            toast.error("Registry sync failure");
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await api.get("/admin/vendors");
            setVendors(res.data.data);
        } catch (err) {
            console.error("Vendor fail", err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchContracts();
    }, [statusFilter, pagination.page]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchContracts(1);
        }
    };

    const getDaysRemaining = (endDate) => {
        const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const renderDaysBadge = (days) => {
        if (days < 0) return <span className="text-rose-600 font-black uppercase tracking-widest text-[10px]">Decommissioned</span>;
        if (days < 15) return <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[9px] font-black border border-rose-100 uppercase tracking-widest animate-pulse">{days} Days Remaining</span>;
        if (days <= 30) return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[9px] font-black border border-amber-100 uppercase tracking-widest">{days} Days Remaining</span>;
        return <span className="text-slate-400 font-black uppercase tracking-widest text-[9px]">{days} Days Residual</span>;
    };

    const handleCreateContract = async (e) => {
        e.preventDefault();
        const tid = toast.loading("Executing contractual agreement...");
        try {
            await api.post("/slm/contracts", formData);
            toast.success("Contractual Protocol Registered", { id: tid });
            setShowCreateModal(false);
            fetchContracts(1);
            fetchStats();
            setFormData({
                vendorId: "",
                contractNumber: "",
                contractTitle: "",
                startDate: "",
                endDate: "",
                contractValue: "",
                documentUrl: "https://example.com/contract.pdf"
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failure", { id: tid });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("PROTOCOL SECURITY: Permanently purge contractual artifact?")) return;
        const tid = toast.loading("Purging artifact...");
        try {
            await api.delete(`/slm/contracts/${id}`);
            toast.success("Artifact purged", { id: tid });
            fetchContracts(pagination.page);
            fetchStats();
            setSelectedContract(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Purge failure", { id: tid });
        }
    };

    const handleTerminate = async (id) => {
        if (!window.confirm("PROTOCOL SECURITY: Immediate operational termination?")) return;
        const tid = toast.loading("Terminating engagement...");
        try {
            await api.patch(`/slm/contracts/${id}/terminate`);
            toast.success("Engagement terminated", { id: tid });
            fetchContracts(pagination.page);
            fetchStats();
            setSelectedContract(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Termination failure", { id: tid });
        }
    };

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── ALERTS ─────────────────────────────────────────────────── */}
            {stats.expiringSoon > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center justify-between shadow-premium"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 animate-pulse">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-rose-800 uppercase tracking-[0.3em] mb-1">Maturity Advisory</p>
                            <p className="text-sm font-bold text-rose-900 tracking-tight">{stats.expiringSoon} Engagement(s) reaching termination threshold within 30 days. Renewal protocol required.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Legal Framework</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Agreement Registry</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Contract Ledger</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Unified registry of infrastructure procurement agreements, legal clauses, and financial engagements across global partner nodes.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <button 
                         onClick={() => { fetchVendors(); setShowCreateModal(true); }}
                         className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={18} /> Initialize Contract Node
                    </button>
                </div>
            </header>

            {/* ── KPI MATRIX ────────────────────────────────────────────────── */ }
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <MetricMini label="Aggregated Nodes" value={stats.total} trend="ACTIVE" isPositive={true} icon={FileSignature} />
                <MetricMini label="Operational Flow" value={stats.active} trend="SYNCED" isPositive={true} icon={Activity} />
                <MetricMini label="Maturity Risk" value={stats.expiringSoon} trend="ADVISORY" isPositive={false} icon={Clock} />
                <MetricMini label="Decommissioned" value={stats.expired} trend="ARCHIVED" isPositive={false} icon={Lock} />
            </div>

            {/* ── REGISTRY CONTROLS ──────────────────────────────────────────── */ }
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-subtle flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[350px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Filter Agreement Data by ID or Protocol..."
                        className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all shadow-inner placeholder-slate-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                <select
                    className="h-14 bg-white border border-slate-100 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 outline-none focus:border-slate-900 transition-all cursor-pointer shadow-subtle"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Clusters</option>
                    <option value="Active">Operational Nodes</option>
                    <option value="Expiring">Maturity Warnings</option>
                    <option value="Expired">Archived Records</option>
                    <option value="Terminated">PURGED_STATUS</option>
                </select>

                <button className="h-14 flex items-center gap-4 px-8 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-subtle active:scale-95 group">
                    <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> Registry Export
                </button>
            </div>

            {/* ── REGISTRY TABLE ─────────────────────────────────────────────── */ }
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <Table
                    headers={["Protocol ID", "Stakeholder Context", "Financial Flux", "Temporal Spacing", "Maturity", "Status", ""]}
                    data={contracts}
                    loading={loading}
                    pagination={pagination}
                    renderRow={(c) => (
                        <>
                            <td className="px-10 py-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner relative">
                                        <FileSignature size={18} />
                                    </div>
                                    <span className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none">{c.contractNumber}</span>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{c.vendorId?.companyName || "GEN_PARTNER"}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 italic">{c.contractTitle}</p>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <span className="text-sm font-black text-slate-900 tracking-tighter">
                                    ₹{new Intl.NumberFormat('en-IN').format(c.contractValue || 0)}
                                </span>
                            </td>
                            <td className="px-10 py-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar size={12} className="text-slate-200" />
                                        {new Date(c.startDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Clock size={12} className="text-slate-200" />
                                        {new Date(c.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                {renderDaysBadge(getDaysRemaining(c.endDate))}
                            </td>
                            <td className="px-10 py-8">
                                <StatusBadge status={c.status} />
                            </td>
                            <td className="px-10 py-8 text-right">
                                <button
                                    onClick={() => setSelectedContract(c)}
                                    className="p-3 bg-white text-slate-300 hover:text-slate-900 hover:border-slate-900 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95"
                                >
                                    <Eye size={20} />
                                </button>
                            </td>
                        </>
                    )}
                />

                {!loading && contracts.length === 0 && (
                     <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                            <FileSignature size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">Registry Silence detected</p>
                    </div>
                )}
            </div>

            {/* ── CONTRACT DOSSIER MODAL ────────────────────────────────────── */ }
            <AnimatePresence>
                {selectedContract && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            <div className="p-12 border-b border-slate-50 bg-slate-50 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                    <FileSignature size={150} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                         <Lock size={18} className="text-slate-900" />
                                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Agreement Dossier</h3>
                                    </div>
                                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-600 flex items-center gap-2 italic">
                                        PROTOCOL_ID: {selectedContract.contractNumber} <span className="text-slate-200">|</span> UPLINK_CORE: {new Date(selectedContract.createdAt).toISOString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedContract(null)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                <div className="w-80 border-r border-slate-100 bg-slate-50/30 p-10 flex flex-col gap-10 overflow-y-auto no-scrollbar">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Stakeholder Node</p>
                                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium group cursor-pointer hover:border-slate-900 transition-all">
                                             <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <Building2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase leading-none">{selectedContract.vendorId?.companyName.slice(0, 15)}...</p>
                                                    <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">Certified VMS</p>
                                                </div>
                                             </div>
                                             <div className="pt-4 border-t border-slate-50">
                                                 <StatusBadge status={selectedContract.status} />
                                             </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Engagement Flux</p>
                                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
                                                <DollarSign size={80} />
                                            </div>
                                            <h4 className="text-3xl font-black tracking-tighter shadow-subtle group-hover:text-emerald-400 transition-colors">
                                                ₹{new Intl.NumberFormat('en-IN').format(selectedContract.contractValue || 0)}
                                            </h4>
                                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] mt-3 italic underline decoration-white/10 decoration-2 underline-offset-8">Financial Protocol Commit</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <button className="w-full flex items-center justify-between p-6 bg-white border border-slate-200 text-slate-400 rounded-2xl shadow-subtle hover:border-slate-900 hover:text-slate-900 transition-all group active:scale-[0.98]">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">IPFS Data Node</span>
                                            <Globe size={18} className="group-hover:rotate-180 transition-transform duration-1000" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                                     <div className="flex border-b border-slate-100 bg-slate-50/20">
                                        {["Clausal Overview", "Encrypted Docs", "Maturity Ledger", "Operational Log"].map((tab, i) => (
                                            <button key={tab} className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${i === 0 ? 'text-slate-900 border-slate-900 bg-white' : 'text-slate-300 border-transparent hover:text-slate-500'}`}>
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 p-12 overflow-y-auto no-scrollbar space-y-16">
                                        <div className="grid grid-cols-2 gap-12">
                                            <DetailItem label="Protocol Nomenclature" value={selectedContract.contractTitle} icon={<Terminal size={16} />} />
                                            <DetailItem label="Sector Classification" value="INTERNAL_INFRASTRUCTURE" icon={<Layers size={16} />} />
                                            <DetailItem label="Genesis Threshold" value={new Date(selectedContract.startDate).toDateString()} icon={<Calendar size={16} />} />
                                            <DetailItem label="Maturity Event" value={new Date(selectedContract.endDate).toDateString()} icon={<Clock size={16} />} />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-4 mb-10">
                                                <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                                                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none">Temporal Evolution</h5>
                                            </div>
                                            <div className="relative pl-12 border-l-4 border-slate-50 py-4 space-y-12 ml-4">
                                                <TimelineItem date={new Date(selectedContract.startDate).toDateString()} label="Contractual Hub Authorized" status="COMPLETED" />
                                                <TimelineItem date="SYNC_ACTIVE_NOW" label="Operational Engagement Validated" status="ACTIVE" />
                                                <TimelineItem date={new Date(selectedContract.endDate).toDateString()} label="Mandatory Integrity Review" status="PENDING" />
                                            </div>
                                        </div>
                                    </div>

                                     <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleTerminate(selectedContract._id)}
                                                disabled={selectedContract.status === 'terminated'}
                                                className="h-12 px-8 rounded-2xl border border-rose-100 text-rose-500 bg-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all disabled:opacity-30 shadow-subtle active:scale-95"
                                            >
                                                Force Terminate
                                            </button>
                                             <button
                                                onClick={() => handleDelete(selectedContract._id)}
                                                className="h-12 px-8 rounded-2xl border border-slate-200 text-slate-300 hover:text-rose-600 hover:border-rose-600 bg-white text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-subtle active:scale-95"
                                            >
                                                Purge Artifact
                                            </button>
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="h-12 px-10 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 group">
                                                <Download size={16} className="group-hover:-translate-y-1 transition-transform" /> Sync Certificate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── INITIALIZE MODAL ───────────────────────────────────────────── */ }
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            <div className="p-10 border-b border-slate-50 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.08] pointer-events-none">
                                    <ShieldCheck size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Initialize Protocol</h2>
                                    <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.4em] mt-2">Legal Genesis Entry_Point_v4.2</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateContract} className="p-10 lg:p-12 space-y-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2 space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Authorized Operational Partner</label>
                                        <select
                                            required
                                            className="vms-input h-16 appearance-none bg-slate-50 shadow-inner"
                                            value={formData.vendorId}
                                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                        >
                                            <option value="">-- SELECT SECURITY NODE --</option>
                                            {vendors.map(v => <option key={v._id} value={v._id}>{v.companyName.toUpperCase()} ({v.email.toLowerCase()})</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Registry ID (Protocol_No)</label>
                                        <input
                                            required type="text" placeholder="CNT-NODE-2025"
                                            className="vms-input h-16 shadow-inner"
                                            value={formData.contractNumber}
                                            onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Capital Engagement (INR)</label>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="vms-input h-16 shadow-inner"
                                            value={formData.contractValue}
                                            onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Agreement Nomenclature (Title)</label>
                                        <input
                                            required type="text" placeholder="Unified Structural Covenant..."
                                            className="vms-input h-16 shadow-inner"
                                            value={formData.contractTitle}
                                            onChange={(e) => setFormData({ ...formData, contractTitle: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Genesis Ingress</label>
                                        <input
                                            required type="date"
                                            className="vms-input h-16 shadow-inner"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Maturity Threshold</label>
                                        <input
                                            required type="date"
                                            className="vms-input h-16 shadow-inner border-rose-100 focus:border-rose-400"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <ShieldCheck size={20} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">High Frequency Encryption Active</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-5 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                                        <button type="submit" className="px-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center gap-3 group">
                                            Authorize Protocol <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .vms-input {
                    width: 100%;
                    padding: 0 1.5rem;
                    background-color: #F8FAFC;
                    border: 1px solid #F1F5F9;
                    border-radius: 1.5rem;
                    font-size: 0.8125rem;
                    font-weight: 900;
                    color: #0F172A;
                    transition: all 0.3s;
                    outline: none;
                    text-transform: uppercase;
                }
                .vms-input:focus {
                    background-color: #FFFFFF;
                    border-color: #0F172A;
                    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05);
                }
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .shadow-subtle {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

const DetailItem = ({ label, value, icon }) => (
    <div className="group space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 group-hover:text-slate-900 transition-colors uppercase">{label}</p>
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] group-hover:border-slate-900 group-hover:bg-white transition-all shadow-subtle">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-inner transition-colors">
                {icon}
            </div>
            <p className="text-xs font-black text-slate-900 tracking-tighter uppercase">{value || 'DATA_VACUUM'}</p>
        </div>
    </div>
);

const TimelineItem = ({ date, label, status }) => (
    <div className="relative pl-6">
        <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-xl ${
            status === 'COMPLETED' ? 'bg-slate-900' : 
            status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'
        }`}></div>
        <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>{date}</p>
        <p className={`text-xs font-black uppercase tracking-tight ${status === 'ACTIVE' ? 'text-emerald-900' : 'text-slate-900'}`}>{label}</p>
    </div>
);

const MetricMini = ({ label, value, trend, isPositive, icon: Icon }) => (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-premium group hover:border-slate-900 transition-all duration-500 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
            <Icon size={100} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 group-hover:text-slate-900 transition-colors uppercase relative z-10">{label}</p>
        <div className="flex items-end justify-between relative z-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {trend}
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = status?.toString().toLowerCase();
    const style = s === 'active' ? 'bg-emerald-900 text-white border-emerald-900' :
                  s === 'expired' || s === 'terminated' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  'bg-slate-50 text-slate-400 border-slate-100';
    return (
        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${style}`}>
            {status || 'DRAFT'}
        </span>
    );
};
