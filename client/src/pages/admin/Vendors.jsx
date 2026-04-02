import { useEffect, useState } from "react";
import api from "../../services/api";
import VendorDetailsModal from "./VendorDetailsModal";
import AddVendorModal from "./AddVendorModal";
import { toast } from "react-hot-toast";
import { 
    Trash2, Check, X, Eye, Building2, UserCircle2, 
    Filter, Download, Upload, FileSpreadsheet, Plus, 
    ShieldCheck, Activity, Globe, ChevronRight, MoreVertical, 
    ExternalLink, ArrowUpRight, ArrowDownRight, Terminal, User,
    Search, Mail, Briefcase, Calendar
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new: 0,
    compliance: "98.4%"
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors", {
        params: { status: "approved" }
      });
      const data = res.data.data;
      setVendors(data);
      
      setStats({
        total: data.length,
        active: data.filter(v => v.lifecycleStatus === 'active' || !v.lifecycleStatus).length,
        new: data.filter(v => {
            const createdDate = new Date(v.createdAt);
            const now = new Date();
            return (now - createdDate) / (1000 * 60 * 60 * 24) < 7;
        }).length,
        compliance: "98.4%"
      });
    } catch (err) {
      toast.error("Failed to load vendor registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const toastId = toast.loading("Exporting vendor data...");
    try {
      const response = await api.get("/admin/vendors/export", {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Vendor_Registry.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful", { id: toastId });
    } catch (err) {
      toast.error("Export failed", { id: toastId });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Importing vendors...");
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/vendors/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(res.data.message, { id: toastId });
      fetchVendors(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failure", { id: toastId });
    } finally {
      setImporting(false);
      e.target.value = ""; 
    }
  };

  useEffect(() => {
    fetchVendors();
    
    // Listen for global search from Navbar
    const handleGlobalSearch = (e) => {
        setSearch(e.detail);
    };
    window.addEventListener('GLOBAL_SEARCH', handleGlobalSearch);
    return () => window.removeEventListener('GLOBAL_SEARCH', handleGlobalSearch);
  }, []);

  const filtered = vendors.filter(v =>
    v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

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
                      Managed Partners
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                      <Globe size={12} className="text-slate-400" />
                      Global Registry
                  </span>
              </div>

              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                  <div className="max-w-3xl">
                      <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                          Vendor Ecosystem.
                      </h1>
                      <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
                          Master directory of all validated enterprise partners. Manage compliance, contact details, and operational status from one central platform.
                      </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer">
                          <Upload size={16} /> Import
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} disabled={importing} />
                      </label>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                      >
                        <Download size={16} /> Export
                      </button>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 tracking-wide"
                      >
                        <Plus size={18} /> Add Vendor
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* ── KPI GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Vendors" value={stats.total} trend={`${stats.total} Active`} color="indigo" icon={Building2} />
          <KPICard label="Active Operations" value={stats.active} trend="Live" color="emerald" icon={Activity} />
          <KPICard label="New This Week" value={stats.new} trend="Growth" color="blue" icon={Calendar} />
          <KPICard label="Avg Compliance" value={stats.compliance} trend="Stable" color="amber" icon={ShieldCheck} />
      </div>

      {/* ── TABLE CONTAINER ────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col min-h-[500px]">
        <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                <Filter size={16} className="text-indigo-500" />
                <span>Registry Index: {filtered.length} Partners</span>
            </div>
            {search && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    Searching: {search}
                </div>
            )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Partner & Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Contact Person</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="p-6"><div className="h-10 w-48 bg-slate-100 rounded-lg"></div></td>
                        <td className="p-6"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                        <td className="p-6"><div className="h-6 w-24 bg-slate-100 rounded-full"></div></td>
                        <td className="p-6"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                        <td className="p-6 text-right"><div className="h-8 w-20 bg-slate-100 rounded-lg ml-auto"></div></td>
                    </tr>
                  ))
              ) : filtered.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Building2 size={40} className="mb-4 text-slate-300" strokeWidth={1.5} />
                            <p className="text-[13px] font-bold uppercase tracking-wider">No matching vendors found</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filtered.map((v) => (
                    <tr 
                        key={v._id} 
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelected(v)}
                    >
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md transition-all border border-transparent group-hover:border-slate-100">
                                    <Building2 size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-900 truncate">{v.companyName}</p>
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">#{v._id?.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-slate-700">{v.contactPerson || "N/A"}</span>
                                <span className="text-[12px] font-medium text-slate-400">{v.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
                                {v.category?.name || "Uncategorized"}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            <StatusBadge status={v.lifecycleStatus || "active"} />
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95">
                                    Manage <ArrowRight size={12} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <MoreVertical size={16} />
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

      <VendorDetailsModal vendor={selected} onClose={() => setSelected(null)} />
      <AddVendorModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onRefresh={fetchVendors} 
      />
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

const ArrowRight = ({ size, className }) => (
    <ChevronRight size={size} className={className} />
);
