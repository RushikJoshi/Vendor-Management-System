import { useEffect, useMemo, useState } from "react";
import { BellRing, Users, FileText, Clock3, CircleDollarSign, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#1d4ed8", "#3b82f6"];

export default function SaaSDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeVendors: 0,
    openRFQs: 0,
    pendingApprovals: 2,
    totalSpend: 0,
    trendData: [],
    categoryData: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard/vendor-stats");
        const d = res.data?.data || {};

        const trendData = Array.isArray(d.monthlyVendorStats)
          ? d.monthlyVendorStats.map((item) => ({
              month: item.month,
              value: Number(item.count || 0),
            }))
          : [];

        const categoryData = Array.isArray(d.categoryMix)
          ? d.categoryMix
              .filter((item) => Number(item.value || 0) > 0)
              .map((item, idx) => ({
                name: item.name || `Category ${idx + 1}`,
                value: Number(item.value || 0),
                color: CHART_COLORS[idx % CHART_COLORS.length],
              }))
          : [];

        setData({
          activeVendors: Number(d.activeVendors || 0),
          openRFQs: Number(d.openRFQs || 0),
          pendingApprovals: Number(d.pendingApprovals || 2),
          totalSpend: Number(d.totalOrders || 0),
          trendData,
          categoryData,
        });
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalCategory = useMemo(() => data.categoryData.reduce((sum, item) => sum + Number(item.value || 0), 0), [data.categoryData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-2xl bg-white" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="h-[360px] rounded-2xl bg-white" />
          <div className="h-[360px] rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-[42px]">
              Vendor Operations at a Glance
            </h1>
            <p className="mt-3 text-[16px] leading-7 text-slate-600">
              Monitor vendor activity, RFQ flow, approvals, and spend from one clear executive dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/submissions")}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-800 transition hover:bg-amber-100"
          >
            <BellRing size={15} />
            {data.pendingApprovals} approvals pending
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active Vendors" value={data.activeVendors.toLocaleString()} />
        <StatCard icon={FileText} label="Open RFQs" value={data.openRFQs.toLocaleString()} />
        <StatCard icon={Clock3} label="Pending Approvals" value={data.pendingApprovals.toLocaleString()} />
        <StatCard icon={CircleDollarSign} label="Total Spend" value={`$${data.totalSpend.toLocaleString()}`} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp size={17} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-slate-900">Procurement Trend</h2>
              <p className="text-[12px] text-slate-500">Monthly sourcing activity</p>
            </div>
          </div>
          <div className="h-[290px] rounded-xl border border-slate-100 p-3">
            {data.trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No procurement trend data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px rgba(2, 6, 23, 0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <PieChartIcon size={17} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-slate-900">Category Mix</h2>
              <p className="text-[12px] text-slate-500">Vendor category distribution</p>
            </div>
          </div>

          <div className="h-[240px] rounded-xl border border-slate-100 p-3">
            {data.categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No category mix data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px rgba(2, 6, 23, 0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Pie
                    data={data.categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {data.categoryData.map((item, idx) => (
                      <Cell key={idx} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {data.categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-[13px] font-semibold text-slate-900">{totalCategory > 0 ? Math.round((item.value / totalCategory) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
      <Icon size={18} />
    </div>
    <p className="text-[13px] font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-[30px] font-semibold leading-none text-slate-900">{value}</p>
  </div>
);
