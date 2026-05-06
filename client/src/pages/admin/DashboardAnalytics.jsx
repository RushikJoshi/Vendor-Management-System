import { motion } from 'framer-motion';
import {
  Users, Activity, IndianRupee, Target, ArrowUpRight, ArrowDownRight,
  TrendingUp, Calendar, Filter, Zap, Layout
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

const allocationData = [
  { name: 'Technology', value: 45 },
  { name: 'Logistics', value: 25 },
  { name: 'Services', value: 30 },
];

export default function DashboardAnalytics() {
  return (
    <div className="space-y-4 pb-10 fade-in">
      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              Live Analytics
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
              <Calendar size={12} className="text-slate-400" />
              Q2 Performance
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                Platform Analytics.
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
                Monitor global vendor spending, compliance metrics, and sourcing efficiency in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                <Filter size={16} />
                Filter Data
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-bold tracking-wide text-white shadow-sm transition-all hover:bg-slate-800">
                <ArrowUpRight size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Total Vendors"
          value="124"
          trend="+12%"
          isPositive={true}
          icon={Users}
          color="indigo"
        />
        <KPICard
          title="Active RFQs"
          value="45"
          trend="+5%"
          isPositive={true}
          icon={Activity}
          color="emerald"
        />
        <KPICard
          title="Monthly Spend"
          value="₹1.2M"
          trend="-2%"
          isPositive={false}
          icon={IndianRupee}
          color="blue"
        />
        <KPICard
          title="Avg Compliance"
          value="98%"
          trend="+0.4%"
          isPositive={true}
          icon={Target}
          color="amber"
        />
      </div>

      {/* ── MAIN CHARTS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Spending Line Chart */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 md:p-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Procurement Trends</h3>
              <p className="mt-1 text-[13px] font-medium text-slate-500">Six-month historical spending analysis.</p>
            </div>
            <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-1 sm:flex">
              <button className="rounded-lg bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200/50">Historical</button>
              <button className="rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">Forecast</button>
            </div>
          </div>

          <div className="h-[400px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                  labelStyle={{ fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Matrix */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex-1">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-6">Spend Distribution</h3>
            <div className="h-48 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationData}>
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={48}>
                    {allocationData.map((entry, index) => (
                      <Cell key={index} fill={['#6366F1', '#10B981', '#F59E0B'][index % 3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-100">
              {allocationData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <p className="text-xl font-bold text-slate-900">{item.value}%</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-sm relative text-white">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Zap size={64} />
            </div>
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/10 p-3 text-emerald-400">
                <Layout size={20} />
              </div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Platform Status</h4>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold tracking-tight leading-none">99.9%</span>
                <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">Stable</span>
              </div>
              <p className="text-[13px] font-medium leading-relaxed text-white/60">
                All analytics services and data pipelines are fully operational.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon, color }) {
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
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.bg} ${style.text} transition-colors duration-300`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {isPositive ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
          {trend}
        </div>
      </div>

      <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">{value}</h3>

      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isPositive ? '75%' : '40%' }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${style.dot}`}
        />
      </div>
    </motion.div>
  );
}
