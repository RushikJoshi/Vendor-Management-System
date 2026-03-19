import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import { toast } from "react-hot-toast";
import {
    Search,
    Plus,
    FileSignature,
    Calendar,
    Clock,
    AlertTriangle,
    Download,
    Eye,
    Filter,
    MoreVertical,
    ChevronRight,
    User,
    Tags,
    DollarSign,
    X,
    Building2,
    ShieldCheck
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

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
            console.error("Stats fetch error", err);
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
            toast.error("Failed to load contract registry");
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await api.get("/admin/vendors");
            setVendors(res.data.data);
        } catch (err) {
            console.error("Vendor fetch error", err);
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
        if (days < 0) return <span className="text-rose-600 font-bold">Expired</span>;
        if (days < 15) return <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-[4px] text-[10px] font-bold border border-rose-100">{days} Days</span>;
        if (days <= 30) return <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-[4px] text-[10px] font-bold border border-amber-100">{days} Days</span>;
        return <span className="text-gray-600 font-medium">{days} Days</span>;
    };

    const handleCreateContract = async (e) => {
        e.preventDefault();
        const tid = toast.loading("Executing contractual agreement...");
        try {
            await api.post("/slm/contracts", formData);
            toast.success("Contract Registered Successfully", { id: tid });
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
            toast.error(err.response?.data?.message || "Registration failed", { id: tid });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this contract?")) return;
        const tid = toast.loading("Deleting contract...");
        try {
            await api.delete(`/slm/contracts/${id}`);
            toast.success("Contract deleted", { id: tid });
            fetchContracts(pagination.page);
            fetchStats();
            setSelectedContract(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Deletion failed", { id: tid });
        }
    };

    const handleTerminate = async (id) => {
        if (!window.confirm("Are you sure you want to terminate this contract immediately?")) return;
        const tid = toast.loading("Terminating contract...");
        try {
            await api.patch(`/slm/contracts/${id}/terminate`);
            toast.success("Contract terminated", { id: tid });
            fetchContracts(pagination.page);
            fetchStats();
            setSelectedContract(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Termination failed", { id: tid });
        }
    };

    return (
        <div className="space-y-6 fade-in pb-12">
            {/* 8. ALERT BANNER */}
            {stats.expiringSoon > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-[10px] p-4 flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="text-rose-600" size={20} />
                    <p className="text-rose-800 text-sm font-bold tracking-tight uppercase">
                        ⚠️ Critical: {stats.expiringSoon} engagement(s) reaching maturity within 30 days. Action required.
                    </p>
                </div>
            )}

            {/* 1. PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tighter uppercase">Contract Management</h1>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-[0.2em] mt-1">Registry of Infrastructure Procurement & Legal Clauses</p>
                </div>
                <button
                    onClick={() => { fetchVendors(); setShowCreateModal(true); }}
                    className="flex items-center gap-2 bg-[#0B5D3B] text-white px-6 py-3 rounded-[8px] font-bold text-xs uppercase tracking-widest hover:bg-[#117A4F] transition-all shadow-lg hover:shadow-emerald-900/20"
                >
                    <Plus size={18} /> New Contractual Node
                </button>
            </div>

            {/* 2. KPI SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Gross Contracts", val: stats.total, color: "border-[#0B5D3B]" },
                    { label: "Operational Active", val: stats.active, color: "border-emerald-500" },
                    { label: "Maturity Warning", val: stats.expiringSoon, color: "border-amber-500" },
                    { label: "Decommissioned", val: stats.expired, color: "border-rose-500" }
                ].map((kpi, idx) => (
                    <div key={idx} className={`bg-white p-6 rounded-[10px] border-t-4 ${kpi.color} shadow-sm transition-transform hover:-translate-y-1`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{kpi.label}</p>
                        <h3 className="text-3xl font-black text-[#1F2937] mt-2 tracking-tight">{kpi.val}</h3>
                    </div>
                ))}
            </div>

            {/* 3. FILTER & SEARCH BAR */}
            <div className="bg-white p-4 rounded-[10px] border border-[#E5E7EB] flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID or Nomenclature..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[8px] text-[13px] font-semibold outline-none focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                <select
                    className="bg-white border border-gray-200 px-4 py-3 rounded-[8px] text-[12px] font-bold uppercase tracking-wider text-gray-600 outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Classifications</option>
                    <option value="Active">Active Nodes</option>
                    <option value="Expiring">Maturity Warnings</option>
                    <option value="Expired">Archived/Expired</option>
                    <option value="Terminated">Terminated</option>
                </select>

                <button className="flex items-center gap-2 px-6 py-3 border-2 border-[#0B5D3B] text-[#0B5D3B] rounded-[8px] font-bold text-[11px] uppercase tracking-widest hover:bg-[#E8F5EE] transition-all">
                    <Download size={16} /> Data Export
                </button>
            </div>

            {/* 4. CONTRACT TABLE */}
            {contracts.length === 0 && !loading ? (
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-20 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                        <FileSignature size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Registry Silence</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs">
                        No active contractual records detected in the current filter parameters.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-8 flex items-center gap-2 bg-[#0B5D3B] text-white px-8 py-3 rounded-[8px] font-bold text-xs uppercase tracking-widest hover:bg-[#117A4F] transition-all shadow-lg"
                    >
                        <Plus size={18} /> Initialize First Agreement
                    </button>
                </div>
            ) : (
                <Table
                    headers={["Registry ID", "Stakeholder / Service", "Financial Engagement", "Contract Period", "Maturity", "Status", ""]}
                    data={contracts}
                    loading={loading}
                    pagination={pagination}
                    renderRow={(c) => (
                        <>
                            <td className="px-6 py-4 text-[#1F2937]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-50 rounded-[4px] border border-gray-100 flex items-center justify-center text-[#0B5D3B]">
                                        <FileSignature size={16} />
                                    </div>
                                    <span className="text-[13px] font-black">{c.contractNumber}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-[13px] font-bold text-gray-900 leading-none">{c.vendorId?.companyName || "N/A"}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{c.contractTitle}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-black text-[#1F2937] text-sm">
                                ₹{new Intl.NumberFormat('en-IN').format(c.contractValue || 0)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-tighter">
                                        <Calendar size={12} className="text-gray-400" />
                                        {new Date(c.startDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-tighter">
                                        <Clock size={12} className="text-gray-400" />
                                        {new Date(c.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold">
                                    {renderDaysBadge(getDaysRemaining(c.endDate))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={c.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => setSelectedContract(c)}
                                    className="p-2 hover:bg-emerald-50 rounded-full transition-all text-gray-400 hover:text-[#0B5D3B]"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </>
                    )}
                />
            )}

            {/* 7. CONTRACT DETAIL MODAL */}
            {selectedContract && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]">
                        {/* Modal Header */}
                        <div className="bg-[#0B5D3B] p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight italic">Registry Record: {selectedContract.contractNumber}</h2>
                                <p className="text-[10px] font-bold opacity-75 uppercase tracking-[0.2em] mt-1 italic">Procurement Intelligence Module Activated</p>
                            </div>
                            <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Panel */}
                            <div className="w-80 border-r border-gray-100 p-6 bg-gray-50 flex flex-col gap-6">
                                <div className="bg-white p-5 rounded-[8px] border border-gray-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3 mb-4">Partner Profile</p>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 border border-emerald-100">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-gray-900 leading-none">{selectedContract.vendorId?.companyName}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">VMS Node Certified</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-3 border-t border-gray-50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Node Status</span>
                                            <StatusBadge status={selectedContract.status} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-[8px] border border-gray-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3 mb-4">Engagement Value</p>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter">
                                            ₹{new Intl.NumberFormat('en-IN').format(selectedContract.contractValue || 0)}
                                        </h4>
                                    </div>
                                    <p className="text-[9px] font-bold text-[#0B5D3B] uppercase tracking-widest mt-2 px-1 underline decoration-emerald-200">Legal Financial Commitment</p>
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                <div className="flex border-b border-gray-100">
                                    {["Overview", "Documents", "Maturity Cycle", "Audit Log"].map((tab) => (
                                        <button key={tab} className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b-2 border-transparent hover:text-[#0B5D3B] focus:text-[#0B5D3B] focus:border-[#0B5D3B] transition-all">
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 p-8 overflow-auto">
                                    <div className="grid grid-cols-2 gap-8">
                                        <DetailItem label="Contract Nomenclature" value={selectedContract.contractTitle} icon={<FileSignature size={14} />} />
                                        <DetailItem label="Sector Classification" value="Infratructure Division" icon={<Tags size={14} />} />
                                        <DetailItem label="Lifecycle Start" value={new Date(selectedContract.startDate).toDateString()} icon={<Calendar size={14} />} />
                                        <DetailItem label="Maturity Threshold" value={new Date(selectedContract.endDate).toDateString()} icon={<Clock size={14} />} />
                                    </div>

                                    <div className="mt-12">
                                        <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] border-b-2 border-emerald-700 inline-block pb-1 mb-6 italic">Governance Timeline</h5>
                                        <div className="relative pl-8 border-l-2 border-emerald-100 py-2 space-y-8">
                                            <TimelineItem date={new Date(selectedContract.startDate).toDateString()} label="Contract Execution Authorized" color="bg-emerald-500" />
                                            <TimelineItem date="Current Status" label="Operational Engagement Active" color="bg-emerald-300" />
                                            <TimelineItem date={new Date(selectedContract.endDate).toDateString()} label="Mandatory Renewal Evaluation" color="bg-gray-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleTerminate(selectedContract._id)}
                                    disabled={selectedContract.status === 'terminated'}
                                    className="px-6 py-2.5 rounded-[6px] border border-rose-200 text-rose-600 bg-rose-50 text-[11px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                    Force Terminate
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedContract._id)}
                                    className="px-6 py-2.5 rounded-[6px] border border-red-200 text-red-600 bg-white text-[11px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all font-mono"
                                >
                                    Delete Record
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedContract(null)} className="px-6 py-2.5 rounded-[6px] border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-all">Dismiss Dossier</button>
                                <button className="px-6 py-2.5 rounded-[6px] bg-[#0B5D3B] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#117A4F] transition-all flex items-center gap-2">
                                    <Download size={14} /> Download Certificate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE CONTRACT MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                        <div className="bg-emerald-900 p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-widest italic">Initialize Contractual Agreement</h2>
                                <p className="text-[10px] font-bold opacity-75 uppercase tracking-[0.3em] mt-1">Infrastructure Procurement Module v2.0</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateContract} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Registered Vendor</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-mono"
                                        value={formData.vendorId}
                                        onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                    >
                                        <option value="">-- AUTHORIZED PROVIDER LIST --</option>
                                        {vendors.map(v => <option key={v._id} value={v._id}>{v.companyName} ({v.email})</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Engagement ID (Registry No)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: CNT-2024-XXXX"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-emerald-600"
                                        value={formData.contractNumber}
                                        onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Financial Consideration (INR)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-emerald-600"
                                        value={formData.contractValue}
                                        onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Contract Nomenclature (Title)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Formal Title of Agreement"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-emerald-600"
                                        value={formData.contractTitle}
                                        onChange={(e) => setFormData({ ...formData, contractTitle: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Commencement Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[13px] font-bold text-gray-900 outline-none"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Engagement Maturity Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[13px] font-bold text-gray-900 outline-none"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-[8px] border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-all">Cancel Agreement</button>
                                <button type="submit" className="px-10 py-3 rounded-[8px] bg-emerald-700 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2">
                                    <ShieldCheck size={18} /> Authorize & Sign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value, icon }) {
    return (
        <div className="group">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-emerald-700 transition-colors">{label}</p>
            <div className="flex items-center gap-2">
                <div className="text-emerald-700 opacity-50">{icon}</div>
                <p className="text-sm font-black text-gray-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function TimelineItem({ date, label, color }) {
    return (
        <div className="relative">
            <div className={`absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${color}`}></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{date}</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{label}</p>
        </div>
    );
}
