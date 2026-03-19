import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
    AreaChart, Area
} from "recharts";
import {
    Clock, ShieldAlert, BarChart3, AlertTriangle,
    TrendingUp, Zap, FileWarning,
    CheckCircle2, AlertCircle, ShieldCheck,
    Briefcase, Activity
} from "lucide-react";
import EnterpriseCard from "../../components/EnterpriseCard";

const COLORS = {
    Low: "#0B5D3B",     // Primary Dark Green
    Medium: "#117A4F",  // Secondary Green
    High: "#DC2626",    // Sharp Red for alert
};

export default function DashboardAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/analytics")
            .then(res => setData(res.data.data))
            .catch(err => console.error("Analytics failure", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-corp-dark/20 border-t-corp-dark rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Synchronizing Operational Data...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="p-10 text-center">
            <ShieldAlert size={48} className="mx-auto text-rose-600 mb-4" />
            <h2 className="text-xl font-extrabold text-[#1F2937] uppercase tracking-tight">Analytics Engine Offline</h2>
            <p className="text-gray-400 text-xs font-bold uppercase mt-2">Verification of backend connectivity is required.</p>
        </div>
    );

    const riskChartData = [
        { name: "Low", value: data.riskDistribution.Low },
        { name: "Medium", value: data.riskDistribution.Medium },
        { name: "High", value: data.riskDistribution.High },
    ];

    return (
        <div className="space-y-8 fade-in">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-corp-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tighter">Enterprise Intelligence</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time Visibility into Pipeline Integrity & compliance</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-[6px] shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none">Live Protocol Feed</span>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Audit Cycle Time"
                    value={`${data.approvalMetrics.averageApprovalDays}d`}
                    icon={Clock}
                    trend="Market Average"
                />
                <MetricCard
                    title="High-Risk Nodes"
                    value={data.riskDistribution.High}
                    icon={AlertTriangle}
                    trend="Registry Warning"
                    variant="danger"
                />
                <MetricCard
                    title="Operational Avg"
                    value="92%"
                    icon={Activity}
                    trend="+4.2% Growth"
                />
                <MetricCard
                    title="Audit Compliance"
                    value="Optimized"
                    icon={ShieldCheck}
                    trend="System Secure"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Distribution Chart */}
                <EnterpriseCard title="Strategic Risk Distribution" className="flex flex-col">
                    <div className="h-[280px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>

                            <PieChart>
                                <Pie
                                    data={riskChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    cornerRadius={4}
                                >
                                    {riskChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', padding: '8px', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="rect" formatter={(val) => <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{val}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </EnterpriseCard>

                {/* Approvals Efficiency */}
                <div className="lg:col-span-2 bg-[#0B5D3B] rounded-[10px] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Zap className="text-emerald-400" size={16} />
                            Procurement Velocity Pipeline
                        </h3>
                        <div className="grid grid-cols-3 gap-6 mb-10">
                            <div>
                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Fastest Stage</p>
                                <p className="text-2xl font-extrabold">{data.approvalMetrics.fastestApprovalDays}d</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Global Mean</p>
                                <p className="text-2xl font-extrabold">{data.approvalMetrics.averageApprovalDays}d</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Outlier Delay</p>
                                <p className="text-2xl font-extrabold">{data.approvalMetrics.slowestApprovalDays}d</p>
                            </div>
                        </div>

                        <div className="h-[160px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>

                                <BarChart data={data.approvalMetrics.stageWiseAverage}>
                                    <XAxis dataKey="stageName" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold' }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0B5D3B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }} />
                                    <Bar dataKey="avgDays" fill="#117A4F" radius={[4, 4, 0, 0]} barSize={40}>
                                        <LabelList dataKey="avgDays" position="top" fill="#ffffff" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendor Growth Trend */}
            <EnterpriseCard title="Vendor Growth Trend" className="w-full">
                <div className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>

                        <AreaChart data={data.vendorGrowthTrend}>
                            <defs>
                                <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0B5D3B" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0B5D3B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }} />
                            <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', padding: '8px', fontSize: '10px', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="vendors" stroke="#0B5D3B" strokeWidth={3} fillOpacity={1} fill="url(#colorVendors)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </EnterpriseCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Category Matrix */}
                <div className="lg:col-span-2">
                    <EnterpriseCard title="Strategic Performance Matrix">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-100">
                                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                        <th className="pb-4">Segment</th>
                                        <th className="pb-4">Node Count</th>
                                        <th className="pb-4">Efficiency</th>
                                        <th className="pb-4">Risk Index</th>
                                        <th className="pb-4">Integrity Rank</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.categoryPerformance.map((cat, i) => (
                                        <tr key={i} className="hover:bg-gray-50 group transition-colors">
                                            <td className="py-4">
                                                <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{cat.categoryName}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{cat.vendorCount} Nodes</span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-extrabold text-[#0B5D3B] italic">{cat.approvalRate?.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[10px] font-bold ${cat.avgRisk > 7 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {cat.avgRisk?.toFixed(1) || "0.0"}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-corp-secondary" style={{ width: `${cat.avgPerformance || 0}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </EnterpriseCard>
                </div>

                {/* Compliance Monitor */}
                <EnterpriseCard title="Compliane Watchlist">
                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-[6px]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Monitoring</span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${data.schedulerStatus?.isRunning ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">SYS-ACTIVE</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {data.expiringDocuments.length === 0 ? (
                                    <div className="text-center py-6 text-emerald-600">
                                        <ShieldCheck size={24} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">All Systems Compliant</p>
                                    </div>
                                ) : (
                                    data.expiringDocuments.slice(0, 5).map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between gap-3 p-2 bg-white border border-gray-100 rounded-[4px]">
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-bold text-gray-900 uppercase truncate tracking-tight">{doc.vendorName}</p>
                                                <p className="text-[7px] font-bold text-rose-600 uppercase italic truncate">{doc.documentName}</p>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${doc.daysRemaining < 7 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {doc.daysRemaining}d Left
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto border-t border-gray-100">
                            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                <span>Upcoming Expiries</span>
                            </div>
                            <div className="space-y-3 mb-4">
                                {data.upcomingContractExpiries.length === 0 ? (
                                    <div className="text-[10px] text-gray-400 uppercase italic">No contracts expiring soon.</div>
                                ) : (
                                    data.upcomingContractExpiries.map((contract, i) => (
                                        <div key={i} className="flex items-center justify-between gap-3 p-2 border-l-2 border-amber-500 bg-amber-50 rounded-r-[4px]">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-gray-900 uppercase truncate tracking-tight">{contract.vendorId?.companyName || "Unknown"}</p>
                                                <p className="text-[8px] font-bold text-amber-600 uppercase italic truncate">{contract.title}</p>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-amber-600">
                                                {new Date(contract.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto border-t border-gray-100">
                            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                <span>Sync Cycle: Daily 00:00</span>
                                <span>{data.staleApprovalsCount} Overdue</span>
                            </div>
                            <button className="w-full btn-enterprise-primary py-2.5 text-[10px] shadow-sm italic flex items-center justify-center gap-2">
                                <ShieldCheck size={14} /> Initiate Integrity Audit
                            </button>
                        </div>
                    </div>
                </EnterpriseCard>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, trend, variant = "default" }) {
    return (
        <div className="bg-white border border-gray-200 rounded-[10px] p-6 shadow-sm group hover:border-corp-dark/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-[6px] ${variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-corp-dark'}`}>
                    <Icon size={20} />
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-widest ${variant === 'danger' ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {trend}
                </div>
            </div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-3xl font-extrabold text-[#1F2937] tracking-tighter">{value}</p>
        </div>
    );
}
