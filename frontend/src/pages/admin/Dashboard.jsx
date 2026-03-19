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
  Briefcase
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import EnterpriseCard from "../../components/EnterpriseCard";
import StatusBadge from "../../components/StatusBadge";

const COLORS = {
  Low: "#0B5D3B",
  Medium: "#f59e0b",
  High: "#ef4444",
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
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-corp-dark/20 border-t-corp-dark rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Synchronizing Infrastructure Data...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-800 uppercase">Engine Offline</h2>
      <p className="text-gray-500 mt-2">Could not connect to the procurement analytics service.</p>
    </div>
  );

  const riskChartData = [
    { name: "Low", value: data.riskDistribution.Low },
    { name: "Medium", value: data.riskDistribution.Medium },
    { name: "High", value: data.riskDistribution.High },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-corp-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-corp-text tracking-tighter">Executive Dashboard</h1>
          <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-wider">Enterprise Procurement & Risk Management Portal</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Operations Center</p>
          <p className="text-sm font-bold text-corp-dark">SLA Uptime: 99.9%</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Partners" value={data.totalVendors} icon={Users} trend="Institutional" />
        <KPICard title="Active Nodes" value={data.approvedVendors} icon={ShieldCheck} trend="Verified" />
        <KPICard title="High Risk" value={data.riskDistribution.High} icon={ShieldAlert} trend="Attention Required" isCritical />
        <KPICard title="Pending Queue" value={data.pendingApprovals} icon={Clock} trend="Validation Required" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Distribution */}
        <EnterpriseCard title="Risk Distribution Profile" className="lg:col-span-1">
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>

              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </EnterpriseCard>

        {/* Efficiency Chart */}
        <EnterpriseCard title="Approval Cycle Efficiency" className="lg:col-span-2">
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>

              <LineChart data={data.approvalMetrics.stageWiseAverage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="stageName" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="avgDays" stroke="#0B5D3B" strokeWidth={3} dot={{ r: 6, fill: '#0B5D3B' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </EnterpriseCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiring Docs */}
        <EnterpriseCard title="Compliance Surveillance" subtitle="Critical Document Expiries (T-30 Days)">
          <div className="space-y-4">
            {data.expiringDocuments.length === 0 ? (
              <p className="text-gray-400 text-xs italic py-4 text-center">No immediate compliance threats detected.</p>
            ) : (
              data.expiringDocuments.slice(0, 5).map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-[6px] border-l-4 border-rose-500">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-800 truncate uppercase">{doc.vendorName}</p>
                    <p className="text-[10px] font-medium text-gray-500 truncate">{doc.documentName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded leading-none">
                      {doc.daysRemaining} Days
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </EnterpriseCard>

        {/* Expiring Contracts */}
        <EnterpriseCard title="Contractual Pipeline" subtitle="Lifecycle Expiries & Renewals" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Organization</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Contract Asset</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Termination Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.upcomingContractExpiries.length === 0 ? (
                  <tr><td colSpan="3" className="py-8 text-center text-gray-400 text-xs italic">No contracts nearing termination.</td></tr>
                ) : (
                  data.upcomingContractExpiries.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <p className="text-xs font-bold text-gray-800 uppercase">{c.vendorId?.companyName || "N/A"}</p>
                      </td>
                      <td className="py-4 text-center">
                        <p className="text-[11px] font-medium text-gray-600">{c.contractTitle}</p>
                      </td>
                      <td className="py-4 text-right">
                        <p className="text-xs font-bold text-corp-dark">{new Date(c.endDate).toLocaleDateString('en-IN')}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, isCritical }) {
  return (
    <div className={`bg-white border-l-4 ${isCritical ? 'border-l-rose-600' : 'border-l-corp-dark'} border-t border-r border-b border-gray-200 p-6 rounded-[10px] shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-[6px] ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-corp-bg text-corp-dark'}`}>
          <Icon size={20} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{title}</p>
          <p className={`text-[9px] font-bold uppercase tracking-tight ${isCritical ? 'text-rose-500' : 'text-corp-secondary'}`}>{trend}</p>
        </div>
      </div>
      <h3 className="text-3xl font-extrabold text-corp-text tracking-tighter tabular-nums">{value}</h3>
    </div>
  );
}
