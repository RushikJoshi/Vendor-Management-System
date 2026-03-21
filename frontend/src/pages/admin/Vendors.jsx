import { useEffect, useState } from "react";
import api from "../../services/api";
import VendorDetailsModal from "./VendorDetailsModal";
import AddVendorModal from "./AddVendorModal";
import { toast } from "react-hot-toast";
import { 
    Search, Trash2, Check, X, Eye, Building2, UserCircle2, 
    Filter, Download, Upload, FileSpreadsheet, Plus, 
    ShieldCheck, Activity, Globe, ChevronRight, MoreVertical, 
    ExternalLink, ArrowUpRight, ArrowDownRight, Terminal, User
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
    highCompliance: 0
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
            return (now - createdDate) / (1000 * 60 * 60 * 24) < 7; // Last 7 days
        }).length,
        highCompliance: Math.floor(data.length * 0.85) // Mocked for UI
      });
    } catch (err) {
      toast.error("Registry synchronization failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const toastId = toast.loading("Extracting Registry Snapshot...");
    try {
      const response = await api.get("/admin/vendors/export", {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Vendor_Global_Registry.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Snapshot finalized", { id: toastId });
    } catch (err) {
      toast.error("Extraction failed", { id: toastId });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Injecting Batch Data...");
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
      toast.error(err.response?.data?.message || "Injection error", { id: toastId });
    } finally {
      setImporting(false);
      e.target.value = ""; 
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filtered = vendors.filter(v =>
    v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 fade-in pb-20">
      {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Global Directory</span>
                <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Partner Nodes</span>
            </div>
            <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Vendor Registry</h1>
                <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Master architectural database of validated enterprise partners across all operational sectors.</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <label className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:border-slate-900 hover:text-slate-900 cursor-pointer transition-all shadow-sm active:scale-95">
            <Upload size={16} /> Batch Inject
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} disabled={importing} />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95"
          >
            <Download size={16} /> Registry Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} /> Add Entity
          </button>
        </div>
      </header>

      {/* ── METRIC SNAPSHOT ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <MetricMini label="Total Registry" value={stats.total} trend="+4" isPositive={true} />
           <MetricMini label="Live Operations" value={stats.active} trend="Active" isPositive={true} />
           <MetricMini label="New Onboarding" value={stats.new} trend="Weekly" isPositive={true} />
           <MetricMini label="System Integrity" value="98.4%" trend="+0.2%" isPositive={true} />
      </div>

      {/* ── REGISTRY TABLE COMPONENT ────────────────────────────────────── */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50">
          <div className="relative w-full md:w-[450px]">
             <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
              type="text"
              placeholder="Filter Directory By Entity, Node ID, or Protocol..."
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">
               <Filter size={16} /> Unified Filter
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
              Directory Index: {filtered.length} nodes
            </span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Node & Identity</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Contact</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Stack</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Origin</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                  [1,2,3,4].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>)
              ) : filtered.map((v, idx) => (
                <motion.tr 
                    key={v._id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                    onClick={() => setSelected(v)}
                >
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner relative overflow-hidden">
                                <Globe size={20} className="relative z-10" />
                                <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{v.companyName}</p>
                                <div className="flex items-center gap-2">
                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">NODE #{v._id?.slice(-8).toUpperCase()}</span>
                                     <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified Baseline</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                <UserCircle2 size={13} className="text-slate-300" />
                                {v.contactPerson || "Node Admin"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold lowercase opacity-70 italic">{v.email}</p>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em] px-3 py-1 bg-white border border-slate-100 rounded-xl shadow-sm">
                                {v.category?.name || v.serviceType || "Infrastructure"}
                            </span>
                            <div className="flex items-center gap-2 ml-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Strategic_Lvl_3</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                            <StatusBadge status={v.lifecycleStatus || "active"} />
                            <div className="flex items-center gap-3">
                                <div className="w-1 w-1 rounded-full bg-slate-200"></div>
                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <button className="h-10 px-6 bg-slate-50 text-slate-400 hover:text-slate-900 hover:border-slate-900 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-subtle group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-xl">
                                Configure
                            </button>
                            <button className="p-2 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </td>
                </motion.tr>
              ))}
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

      <style>{`
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

const MetricMini = ({ label, value, trend, isPositive }) => (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-premium group hover:border-slate-900 transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 group-hover:text-slate-900 transition-colors uppercase">{label}</p>
        <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {trend}
            </div>
        </div>
    </div>
);
