import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Users,
  Clock,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Activity,
  Zap,
  Layers,
  Search,
  ArrowUpRight
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import StatCard from "../../components/vms/StatCard";
import StatusBadge from "../../components/StatusBadge";

const COLORS = {
  Low: "#10B981",
  Medium: "#F59E0B",
  High: "#EF4444",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics")
      .then(res => setData(res.data.data))
      .catch(err => console.error("Dashboard data failure", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#10B981] rounded-full animate-spin shadow-inner"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-50">Calibrating Data Streams...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-10">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100/50">
        <ShieldAlert size={40} />
      </div>
      <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase mb-2">Core Offline</h2>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">Infrastructure telemetry could not be established. Please check system logs for connectivity failures.</p>
    </div>
  );

  const riskChartData = [
    { name: "Low", value: data.riskDistribution.Low },
    { name: "Medium", value: data.riskDistribution.Medium },
    { name: "High", value: data.riskDistribution.High },
  ];

  return (
    <div className="space-y-10 fade-in min-h-screen bg-[#F8FAFC] p-4 lg:p-10">
      {/* Page Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10B981] opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="relative z-10">
              <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  <span>Log_Analytics</span>
                  <ChevronRight size={10} className="text-slate-300" />
                  <span className="text-[#0F172A]">Overview_Report</span>
              </nav>
              <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Executive Dashboard</h1>
              <p className="text-sm font-bold text-slate-500 mt-4 flex items-center gap-2">
                  <Activity size={16} className="text-[#10B981]" />
                  Global supply chain surveillance & lifecycle monitoring.
              </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
              <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Primary Node</p>
                  <p className="text-[11px] font-black text-[#10B981] uppercase tracking-widest">India_C1_Operational</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden sm:block"></div>
              <button className="vms-btn-primary">
                  <BarChart3 size={18} />
                  Detailed Report
              </button>
          </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Partners" value={data.totalVendors} icon={Users} colorClass="bg-blue-600" trend={{ positive: true, value: 8 }} />
          <StatCard title="Active Segments" value={data.approvedVendors} icon={ShieldCheck} colorClass="bg-[#10B981]" trend={{ positive: true, value: 5 }} />
          <StatCard title="Risk Alerts" value={data.riskDistribution.High} icon={ShieldAlert} colorClass="bg-rose-500" trend={{ positive: false, value: 12 }} />
          <StatCard title="Pending Queue" value={data.pendingApprovals} icon={Clock} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Distribution */}
        <div className="vms-card lg:col-span-1 flex flex-col h-full bg-white">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.15em]">Risk Distribution</h3>
            <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
          <div className="p-6 flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="99%" height={300} debounce={10}>
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={40} 
                    iconType="circle" 
                    iconSize={8} 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Chart */}
        <div className="vms-card lg:col-span-2 flex flex-col h-full bg-white">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div>
                <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.15em]">Validation Throughput</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Average Processing Time (Days)</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-[#0F172A] uppercase tracking-wider border border-slate-100">
                <TrendingUp size={12} className="text-[#10B981]" />
                System_Optimized
            </div>
          </div>
          <div className="p-8 flex-1 min-h-[300px]">
            <ResponsiveContainer width="99%" height={300} debounce={10}>
              <AreaChart data={data.approvalMetrics.stageWiseAverage}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                    dataKey="stageName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 'bold' }} 
                    dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }} />
                <Area 
                    type="monotone" 
                    dataKey="avgDays" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorAvg)" 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Surveillance */}
        <div className="vms-card bg-white">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.15em]">Critical Compliance</h3>
            <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded leading-none">High Alert</span>
          </div>
          <div className="p-6 space-y-4">
            {data.expiringDocuments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-300 opacity-50">
                  <CheckCircle2 size={32} className="mb-3 text-[#10B981]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Threat Vector: Null</p>
              </div>
            ) : (
              data.expiringDocuments.slice(0, 5).map((doc, i) => (
                <div key={i} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                        <FileWarning size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-[#0F172A] truncate uppercase leading-none">{doc.vendorName}</p>
                        <p className="text-[9px] font-bold text-slate-400 truncate uppercase mt-1.5">{doc.documentName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-rose-600">
                        <span className="text-[12px] font-black">{doc.daysRemaining}</span>
                        <span className="text-[8px] font-black uppercase">Days</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="vms-card bg-white lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.15em]">Legacy Pipeline Maturity</h3>
            <button className="text-[10px] font-black uppercase text-[#10B981] hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="vms-table-header">Strategic Partner</th>
                  <th className="vms-table-header">Contract Scope</th>
                  <th className="vms-table-header text-right">Maturity Date</th>
                  <th className="vms-table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.upcomingContractExpiries.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-300 text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">End_of_File: No Expiries</td></tr>
                ) : (
                  data.upcomingContractExpiries.map((c, i) => (
                    <tr key={i} className="vms-table-row">
                      <td className="px-8 py-5">
                        <p className="text-[11px] font-black text-[#0F172A] uppercase truncate max-w-[200px]">{c.vendorId?.companyName || "N/A"}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                             <p className="text-[10px] font-bold text-slate-500 uppercase">{c.contractTitle}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-mono text-[11px] font-black text-[#0F172A]">
                        {new Date(c.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5">
                         <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[8px] font-black uppercase rounded-[4px] border border-[#10B981]/20">Active</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

