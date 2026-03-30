import React, { useEffect, useState } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Filter,
  Calendar,
  ChevronRight,
  Globe,
  Activity,
  Terminal,
  ArrowRight,
  CircleDollarSign,
  Building2,
  ShieldCheck,
  BriefcaseBusiness,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import api from '../../services/api';

const defaultSpendData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

const categoryData = [
  { name: "Engineering", value: 45, color: "#0f172a" },
  { name: "Infrastructure", value: 30, color: "#2563eb" },
  { name: "Operations", value: 25, color: "#f59e0b" },
];

const activityFeed = [
  {
    title: "Strategic sourcing cycle reopened for infrastructure vendors",
    dept: "Operations",
    date: "24 Mar",
    status: "Open",
  },
  {
    title: "Compliance review queue needs final approval from leadership",
    dept: "Risk",
    date: "22 Mar",
    status: "Pending",
  },
  {
    title: "Renewal shortlist prepared for logistics contracts",
    dept: "Contracts",
    date: "20 Mar",
    status: "Ready",
  },
];

const queueData = [
  { name: "NexGen Global Logistics", category: "Logistics", age: "2 hours ago", initials: "NL" },
  { name: "TerraBuild Infrastructures", category: "Construction", age: "5 hours ago", initials: "TB" },
];

export default function SaaSDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeVendors: 124,
    spendWindow: "$84.2K",
    complianceScore: "92%",
    totalVendors: { value: 124, trend: "+12.4%", positive: true },
    openRFQs: { value: 45, trend: "+5.2%", positive: true },
    totalSpent: { value: "$84,200", trend: "+18.9%", positive: true },
    pendingPOs: { value: 12, trend: "-2.4%", positive: false },
    spendData: defaultSpendData
  });

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/vendor-stats');
      if (res.data?.data) {
        const d = res.data.data;
        const active = d.activeVendors || 0;
        const avgRating = d.averageRating || 4.6;
        const compliance = Math.round((avgRating / 5) * 100);

        setData(prev => ({
          ...prev,
          activeVendors: active,
          complianceScore: `${compliance}%`,
          spendWindow: `$${(d.totalPendingPayments / 1000).toFixed(1)}K`,
          totalVendors: { ...prev.totalVendors, value: d.totalVendors || 0 },
          totalSpent: { ...prev.totalSpent, value: `$${(d.totalOrders || 0).toLocaleString()}` },
          spendData: d.monthlyVendorStats?.length > 0 ? d.monthlyVendorStats.map(item => ({
            name: item.month,
            value: item.count,
          })) : prev.spendData
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-[1.6rem] bg-white" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-[1.4rem] bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="h-[420px] rounded-[1.6rem] bg-white" />
          <div className="h-[420px] rounded-[1.6rem] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full bg-indigo-50/80 border border-indigo-100 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Executive dashboard
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                <Calendar size={12} className="text-slate-400" />
                March overview
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                Vendor Operations at a Glance.
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] xl:text-[17px] leading-relaxed font-medium text-slate-500 tracking-wide">
                Track Approvals, Sourcing Activity, Spend Movement, And Pending Actions From One Clean Executive View.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FeatureTile icon={Building2} label="Active Vendors" value={data.activeVendors} />
              <FeatureTile icon={CircleDollarSign} label="Spend Window" value={data.spendWindow} />
              <FeatureTile icon={ShieldCheck} label="Compliance Score" value={data.complianceScore} />
            </div>
          </div>

          <div className="grid gap-3 p-5 xl:p-6 bg-slate-50/50">
            <InfoPanel
              icon={Activity}
              title="Operational Health"
              value="Stable"
              note="Vendor onboarding, approvals, and workflow steps are running as expected."
            />
            <InfoPanel
              icon={ShieldAlert}
              title="Needs Attention"
              value="02 items"
              note="Pending approvals should be reviewed before end of day."
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                <Filter size={16} />
                Filter view
              </button>
              <button
                onClick={() => navigate("/admin/rfq/create")}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                <Plus size={16} />
                Create RFQ
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vendor Network" value={data.totalVendors.value} trend={data.totalVendors.trend} positive={data.totalVendors.positive} icon={Users} />
        <StatCard label="Open RFQs" value={data.openRFQs.value} trend={data.openRFQs.trend} positive={data.openRFQs.positive} icon={FileText} />
        <StatCard label="Spend Movement" value={data.totalSpent.value} trend={data.totalSpent.trend} positive={data.totalSpent.positive} icon={TrendingUp} />
        <StatCard label="Pending POs" value={data.pendingPOs.value} trend={data.pendingPOs.trend} positive={data.pendingPOs.positive} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.55fr_0.75fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 xl:p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Procurement Trend</h2>
                <p className="mt-1 text-[12px] text-slate-500">Six month sourcing movement</p>
              </div>
            </div>
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[11px] text-slate-600">
              <Calendar size={12} />
              FY 2024-25
            </div>
          </div>

          <div className="grid gap-3 p-4 xl:grid-cols-[1fr_16rem] xl:p-4">
            <div className="h-[360px] rounded-[1.25rem] border border-slate-200/60 bg-white p-4 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.spendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={34}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#1e293b"
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[2, 2, 0, 0]}
                  >
                    {data.spendData.map((entry, index) => {
                      const CHART_COLORS = ["#475569", "#dc2626", "#16a34a", "#2563eb", "#a855f7", "#f59e0b"];
                      return <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-3 self-start">
              <InsightCard label="This Month" value="+18.9%" tone="text-emerald-600" />
              <InsightCard label="Best Category" value="Infra" />
              <InsightCard label="Cycle Average" value="11 days" />
              <InsightCard label="Escalations" value="03" tone="text-rose-600" />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 p-4 xl:p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <PieChart size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Category Mix</h2>
              <p className="mt-1 text-[12px] text-slate-500">Department allocation</p>
            </div>
          </div>

          <div className="p-4 xl:p-5">
            <div className="mb-8 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#1e293b"
                    }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={38}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="relative h-2 w-14 overflow-hidden rounded-full bg-slate-100">
                      <div className="absolute left-0 top-0 h-full" style={{ backgroundColor: item.color, width: `${item.value}%` }} />
                    </div>
                    <span className="text-[12px] font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>

            <button className="mt-8 flex w-full items-center justify-between rounded-xl bg-slate-900 px-5 py-4 text-sm font-medium text-white transition hover:bg-slate-800">
              Open detailed report
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 xl:p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                <Terminal size={18} />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Leadership Feed</h2>
            </div>
            <button className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
              View archive
            </button>
          </div>

          <div className="space-y-3 p-4">
            {activityFeed.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-[16px] font-medium leading-7 text-slate-900">{item.title}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-600">
                          {item.dept}
                        </span>
                        <span className="text-[11px] text-slate-400">Updated {item.date}</span>
                      </div>
                    </div>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 xl:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                  <Globe size={18} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Approval Queue</h2>
              </div>
              <div className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600">
                2 actions pending
              </div>
            </div>

            <div className="space-y-3 p-4">
              {queueData.map((vendor, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-900">
                      {vendor.initials}
                    </div>
                    <div>
                      <p className="text-[16px] font-medium text-slate-900">{vendor.name}</p>
                      <p className="mt-1 text-[12px] text-slate-400">
                        {vendor.category} | {vendor.age}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-medium text-white transition hover:bg-slate-800">
                      Review
                    </button>
                    <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50">
                      Hold
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>


        </div>
      </div>
    </div>
  );
}

const FeatureTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm transition-all">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-inner">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const InfoPanel = ({ icon: Icon, title, value, note }) => (
  <div className="group rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
        <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, trend, positive, icon: Icon }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md"
  >
    <div className="mb-6 flex items-start justify-between">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/80 text-slate-700 shadow-inner">
        <Icon size={22} />
      </div>
      <span className={`px-3 py-1.5 rounded-full text-[10px] font-semibold ${positive ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-rose-50 text-rose-600 border border-rose-100/50"}`}>
        {trend}
      </span>
    </div>
    <h3 className="text-4xl font-semibold tracking-tight text-slate-900">{value}</h3>
    <p className="mt-2 text-[12px] font-semibold text-slate-500">{label}</p>
  </motion.div>
);

const InsightCard = ({ label, value, tone = "text-slate-900" }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md">
    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
  </div>
);

const StatusPill = ({ status }) => {
  const tone =
    status === "Open"
      ? "bg-slate-900 text-white"
      : status === "Pending"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";

  return <span className={`px-3 py-1.5 text-[10px] font-medium ${tone}`}>{status}</span>;
};

