import React, { useState, useEffect } from "react";
import api from "../services/api";
import MonthlyVendorChart from "../components/MonthlyVendorChart";
import { 
    Users, CheckCircle2, CircleDollarSign, Star, 
    ArrowUpRight, RefreshCw, BarChart3, Activity, Globe
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get("/dashboard/vendor-stats");
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-inner"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Data...</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const activeRate = stats.totalVendors > 0 ? Math.round((stats.activeVendors / stats.totalVendors) * 100) : 0;

    return (
        <div className="space-y-6 pb-10 fade-in">
            {/* Premium Header */}
            <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            </span>
                            Live Intelligence
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                            <BarChart3 size={12} className="text-slate-400" />
                            Analytics Overview
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                                Performance Analytics.
                            </h1>
                            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
                                Real-time visibility into vendor onboarding growth, payment distributions, and system-wide operational metrics.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={fetchStats}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Sync Data
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <KPICard 
                    title="Total Vendors" 
                    value={stats.totalVendors} 
                    icon={Users} 
                    color="indigo" 
                />
                <KPICard 
                    title="Active Vendors" 
                    value={stats.activeVendors} 
                    icon={CheckCircle2} 
                    color="emerald" 
                />
                <KPICard 
                    title="Pending Payments" 
                    value={`₹${stats.totalPendingPayments.toLocaleString("en-IN")}`} 
                    icon={CircleDollarSign} 
                    color="amber" 
                />
                <KPICard 
                    title="Average Rating" 
                    value={`${stats.averageRating} / 5`} 
                    icon={Star} 
                    color="blue" 
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chart Section */}
                <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col">
                    <div className="border-b border-slate-100 p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-slate-900">Vendor Acquisition Trajectory</h3>
                                <p className="mt-1 text-[13px] font-medium text-slate-500">Monthly historical growth analysis.</p>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-lg border border-slate-200/50 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-sm">
                                <Activity size={12} className="text-indigo-500" />
                                Timeline View
                            </span>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 flex-1">
                        <MonthlyVendorChart data={stats.monthlyVendorStats} />
                    </div>
                </div>

                {/* Quick Profile Segment */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm h-full flex flex-col">
                        <h3 className="mb-8 text-lg font-bold tracking-tight text-slate-900">System Insights</h3>
                        <div className="space-y-6 flex-1">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-5 border border-slate-100">
                                <span className="text-[14px] font-bold text-slate-600">Total Purchase Orders</span>
                                <span className="text-2xl font-black text-slate-900">{stats.totalOrders || 0}</span>
                            </div>
                            <div className="flex flex-col justify-center rounded-xl bg-slate-50 p-5 border border-slate-100 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[14px] font-bold text-slate-600">Global Active Rate</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-emerald-600">{activeRate}%</span>
                                        <ArrowUpRight size={18} className="text-emerald-500" />
                                    </div>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${activeRate}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-emerald-500"
                                    />
                                </div>
                                <p className="text-center text-[10.5px] font-black uppercase tracking-widest text-slate-400 mt-4">Retention Quality Metric</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function KPICard({ title, value, icon: Icon, color }) {
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white ${style.bg} ${style.text} transition-colors duration-300`}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
            </div>
            
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors truncate">{value}</h3>
            
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: typeof value === 'string' && value.includes('/') ? '80%' : '60%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${style.dot}`} 
                />
            </div>
        </motion.div>
    );
}

export default Dashboard;
