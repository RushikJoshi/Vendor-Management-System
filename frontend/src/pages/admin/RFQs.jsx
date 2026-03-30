import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Layers,
  Plus,
  RefreshCcw,
  Search,
  Users,
  ChevronRight,
  ChevronLeft,
  Globe,
  Activity,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDaysUntil = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / DAY_IN_MS);
};

const getDepartmentName = (department) => {
  if (department && typeof department === "object" && department.name) return department.name;
  if (typeof department === "string" && department.trim()) return department;
  return "General";
};

const getAudienceLabel = (rfq) => {
  const selectionType = rfq.vendorSelection?.type;
  const targetedCount = rfq.vendorSelection?.targetedVendors?.length || 0;
  if (selectionType === "targeted") return `${targetedCount || 0} invited vendor${targetedCount === 1 ? "" : "s"}`;
  return "Open to all vendors";
};

const getBudgetLabel = (budget) => {
  const amount = Number(budget?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const currency = typeof budget?.currency === "string" && budget.currency.length === 3 ? budget.currency.toUpperCase() : "INR";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
};

const getDeadlineMeta = (value) => {
  if (!value) return { label: "Deadline not set", tone: "text-slate-500", panelTone: "border-slate-200 bg-slate-50/80" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: "Deadline not set", tone: "text-slate-500", panelTone: "border-slate-200 bg-slate-50/80" };
  const daysRemaining = getDaysUntil(value);
  if (daysRemaining < 0) return { label: `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} overdue`, tone: "text-rose-600", panelTone: "border-rose-200 bg-rose-50/80" };
  if (daysRemaining === 0) return { label: "Due today", tone: "text-amber-700", panelTone: "border-amber-200 bg-amber-50/80" };
  if (daysRemaining <= 7) return { label: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`, tone: "text-amber-700", panelTone: "border-amber-200 bg-amber-50/80" };
  return { label: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`, tone: "text-emerald-700", panelTone: "border-emerald-200 bg-emerald-50/70" };
};

const truncate = (text, limit = 180) => {
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
};

const RFQStatusPill = ({ status }) => {
  const normalized = status?.toLowerCase() || "draft";
  const tones = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-100",
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    closed: "bg-rose-50 text-rose-600 border-rose-100",
    cancelled: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[normalized] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {normalized.replace("_", " ")}
    </span>
  );
};

const FilterChip = ({ active, label, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
      active
        ? "border-slate-200 bg-white text-indigo-600 shadow-sm"
        : "border-transparent bg-transparent text-slate-500 hover:text-slate-900"
    }`}
  >
    <span>{label}</span>
    <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
      {count}
    </span>
  </button>
);

const DetailChip = ({ icon: Icon, label }) => (
  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 shadow-sm">
    <Icon size={14} className="text-slate-400" />
    <span>{label}</span>
  </div>
);

const RFQList = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRFQs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/rfqs");
      setRfqs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError("Failed to load sourcing data.");
      toast.error("Unable to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
    
    // Listen for global search from Navbar
    const handleGlobalSearch = (e) => {
        setSearchTerm(e.detail);
    };
    window.addEventListener('GLOBAL_SEARCH', handleGlobalSearch);
    return () => window.removeEventListener('GLOBAL_SEARCH', handleGlobalSearch);
  }, []);

  const totalRfqs = rfqs.length;
  const publishedCount = rfqs.filter((rfq) => rfq.status === "published").length;
  const draftCount = rfqs.filter((rfq) => rfq.status === "draft").length;
  const closingSoonCount = rfqs.filter((rfq) => {
    const daysRemaining = getDaysUntil(rfq.quoteDeadline);
    return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
  }).length;
  const totalItems = rfqs.reduce((sum, rfq) => sum + (Array.isArray(rfq.items) ? rfq.items.length : 0), 0);
  const openCount = rfqs.filter((rfq) => rfq.vendorSelection?.type !== "targeted").length;
  const targetedCount = rfqs.filter((rfq) => rfq.vendorSelection?.type === "targeted").length;

  const filteredRfqs = rfqs
    .filter((rfq) => {
      const matchesStatus = statusFilter === "all" ? true : rfq.status === statusFilter;
      const query = searchTerm.trim().toLowerCase();
      if (!query) return matchesStatus;
      const id = String(rfq._id || "").toLowerCase();
      const title = String(rfq.title || "").toLowerCase();
      const description = String(rfq.description || "").toLowerCase();
      const department = getDepartmentName(rfq.departmentId).toLowerCase();
      return matchesStatus && (id.includes(query) || title.includes(query) || description.includes(query) || department.includes(query));
    })
    .sort((a, b) => {
      const aTime = a.quoteDeadline ? new Date(a.quoteDeadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.quoteDeadline ? new Date(b.quoteDeadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const filterOptions = [
    { key: "all", label: "All", count: totalRfqs },
    { key: "published", label: "Published", count: publishedCount },
    { key: "draft", label: "Draft", count: draftCount },
    { key: "closed", label: "Closed", count: rfqs.filter((rfq) => rfq.status === "closed").length },
    { key: "cancelled", label: "Cancelled", count: rfqs.filter((rfq) => rfq.status === "cancelled").length },
  ];

  return (
    <div className="space-y-6 pb-10 fade-in">
      {/* ── PREMIUM HEADER ─────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                    </span>
                    Sourcing Events
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                    <FileText size={12} className="text-slate-400" />
                    Procurement Lifecycle
                </span>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                        RFQ Management.
                    </h1>
                    <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
                        Orchestrate sourcing requests, track vendor participation, and review incoming quotations. Keep your entire procurement cycle on schedule.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={fetchRFQs}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                      <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                      Refresh Data
                    </button>
                    <button 
                      onClick={() => navigate("/admin/rfq/create")}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 tracking-wide"
                    >
                      <Plus size={18} /> Create RFQ
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* ── KPI GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Requests" value={totalRfqs} trend={`${totalItems} Items`} color="indigo" icon={FileText} />
          <KPICard label="Active Tenders" value={publishedCount} trend="Published" color="emerald" icon={Activity} />
          <KPICard label="Draft Pipeline" value={draftCount} trend="Offline" color="amber" icon={Layers} />
          <KPICard label="Closing Soon" value={closingSoonCount} trend="Next 7D" color="blue" icon={Clock3} />
      </div>

      {/* ── LIST CONTAINER ────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col min-h-[500px]">
        <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
                {filterOptions.map((filter) => (
                    <FilterChip
                      key={filter.key}
                      active={statusFilter === filter.key}
                      label={filter.label}
                      count={filter.count}
                      onClick={() => setStatusFilter(filter.key)}
                    />
                ))}
            </div>
            {searchTerm && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    Searching: {searchTerm}
                </div>
            )}
        </div>

        <div className="p-4 sm:p-6 flex-1">
          {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-4 rounded-2xl border border-slate-100 p-6 bg-slate-50/30">
                        <div className="h-6 w-1/3 bg-slate-100 rounded"></div>
                        <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
                        <div className="flex gap-2">
                             <div className="h-6 w-20 bg-slate-100 rounded-lg"></div>
                             <div className="h-6 w-20 bg-slate-100 rounded-lg"></div>
                        </div>
                    </div>
                ))}
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <AlertCircle size={40} className="text-rose-400 mb-4" />
               <p className="text-[14px] font-bold text-slate-900">{error}</p>
               <button onClick={fetchRFQs} className="mt-4 text-[12px] font-bold text-indigo-600 hover:underline">Retry Connection</button>
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
               <FileText size={48} className="text-slate-200 mb-4" strokeWidth={1.5} />
               <p className="text-[14px] font-bold uppercase tracking-wider">No matching sourcing events</p>
               <p className="mt-1 text-[12px] font-medium text-slate-400">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRfqs.map((rfq, idx) => {
                const deadlineMeta = getDeadlineMeta(rfq.quoteDeadline);
                const departmentName = getDepartmentName(rfq.departmentId);
                const itemCount = Array.isArray(rfq.items) ? rfq.items.length : 0;
                const budgetLabel = getBudgetLabel(rfq.budget);
                const shortId = String(rfq._id || "").slice(-8).toUpperCase();

                return (
                  <motion.article
                    key={rfq._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-[18px] font-bold text-slate-900 group-hover:text-indigo-900 truncate">{rfq.title || "Untitled RFQ"}</h3>
                                <RFQStatusPill status={rfq.status} />
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                <span>#{shortId}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span>{departmentName}</span>
                            </div>
                            {rfq.description && (
                                <p className="text-[13px] leading-relaxed text-slate-500 mb-5 line-clamp-2">{rfq.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <DetailChip icon={Layers} label={`${itemCount} Line Items`} />
                                <DetailChip icon={Users} label={getAudienceLabel(rfq)} />
                                {budgetLabel && <DetailChip icon={FileText} label={budgetLabel} />}
                                <DetailChip icon={Clock3} label={deadlineMeta.label} />
                            </div>
                        </div>

                        <div className={`min-w-[180px] p-4 rounded-xl border ${deadlineMeta.panelTone} flex flex-col items-center justify-center text-center`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Quote Deadline</p>
                            <p className="text-[14px] font-black text-slate-900">{formatDate(rfq.quoteDeadline)}</p>
                            <div className={`mt-2 py-0.5 px-2 rounded-full text-[9px] font-bold uppercase tracking-tighter ${deadlineMeta.tone}`}>
                                {deadlineMeta.label}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                             <button className="h-10 px-6 bg-slate-50 text-slate-500 group-hover:bg-slate-900 group-hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2">
                                Manage <ChevronRight size={14} />
                             </button>
                        </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

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

export default RFQList;
