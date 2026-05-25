import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
    ArrowLeft, Tag, Users, Star, 
    Mail, Phone, ShieldCheck, 
    Award, Search, Filter,
    Briefcase, FileText, IndianRupee, 
    Building2, Activity, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-hot-toast";

export default function CategoryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, vendorRes] = await Promise.all([
                api.get(`/categories/${id}`),
                api.get(`/vendors?category=${id}`)
            ]);
            setCategory(catRes.data.data);
            setVendors(vendorRes.data.data);
        } catch (err) {
            toast.error("Failed to load category intelligence.");
            navigate("/admin/categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const filteredVendors = vendors.filter(v => 
        (v.companyName || v.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Intelligence...</p>
                </div>
            </div>
        );
    }

    if (!category) return null;

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* ── PREMIUM HEADER ─────────────────────────────────────────── */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => navigate("/admin/categories")}
                            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <ArrowLeft size={12} /> Back to Registry
                        </button>
                        <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                            <Tag size={12} /> {category.name} Segment
                        </span>
                        <StatusBadge status={category.status} />
                    </div>

                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                                Category Intelligence.
                            </h1>
                            <p className="mt-4 text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                                {category.description || "In-depth analytics and partner registry for the operational segment."}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segment UID</span>
                                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                    #{id.slice(-8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── KPI GRID ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <KPICard label="Total Partners" value={vendors.length} trend="Active" color="indigo" icon={Building2} />
                <KPICard label="Avg Rating" value={(vendors.reduce((acc, v) => acc + (v.rating || 0), 0) / (vendors.length || 1)).toFixed(1)} trend="Score" color="emerald" icon={Star} />
                <KPICard label="Min Turnover" value={`₹${((category.criteria?.minimumTurnover || 0) / 100000).toFixed(1)}L`} trend="Requirement" color="blue" icon={IndianRupee} />
                <KPICard label="Compliance" value="96.2%" trend="Stable" color="amber" icon={ShieldCheck} />
            </div>

            {/* ── VENDOR LIST - FULL WIDTH ─────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col min-h-[500px]">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                        <Filter size={16} className="text-indigo-500" />
                        <span>Registry Index: {filteredVendors.length} Partners</span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text"
                            placeholder="Filter by company or identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all w-full md:w-64 shadow-sm placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Partner & Identity</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contact Intel</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Rating</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredVendors.map((v) => (
                                <tr 
                                    key={v._id}
                                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                    onClick={() => navigate(`/admin/vendors/${v._id}`)}
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white group-hover:shadow-md transition-all">
                                                <Building2 size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-900 leading-none mb-1.5">{v.companyName || v.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">#{v.vendorId?.slice(-6) || 'TEMP'}</span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.address?.city || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-700">{v.email}</span>
                                            <span className="text-[11px] font-medium text-slate-400">{v.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 w-fit">
                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                            <span className="text-[13px] font-black">{v.rating || '0.0'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/admin/vendors/${v._id}/performance`);
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-700 shadow-sm hover:bg-amber-100 transition-all active:scale-95"
                                        >
                                            <Star size={12} className="fill-amber-500" /> Rate
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/vendors/${v._id}`)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95"
                                        >
                                            Manage <ChevronRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredVendors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Search size={40} className="mb-4 text-slate-200" strokeWidth={1.5} />
                                            <p className="text-[13px] font-bold uppercase tracking-wider">No matching partners</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
            className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md group"
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
