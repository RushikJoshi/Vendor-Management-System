import { useContext, useEffect, useMemo, useState } from "react";
import { BellRing, Users, FileText, Clock3, IndianRupee, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
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
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getAdminLinksForUser } from "../../config/SidebarConfig";

const CHART_COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#1d4ed8", "#3b82f6"];

export default function SaaSDashboard() {
  const { user, allowedModules } = useContext(AuthContext);
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
        if (err?.response?.status === 403) {
          console.warn("Dashboard access fallback: using empty dashboard state for this user.");
        } else {
          console.error("Dashboard fetch failed:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const totalCategory = useMemo(() => data.categoryData.reduce((sum, item) => sum + Number(item.value || 0), 0), [data.categoryData]);
  const adminLinks = useMemo(() => getAdminLinksForUser(user, allowedModules), [user, allowedModules]);
  const hasDashboardAccess = adminLinks.some((link) => link.to === "/admin/dashboard");

  if (!hasDashboardAccess && adminLinks[0]?.to) {
    return <Navigate to={adminLinks[0].to} replace />;
  }

  if (loading) {
    return (
      <div className="space-y-4 xl:space-y-6">
        <div className="h-56 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-[38px]">
              Dashboard Overview
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/submissions")}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-[13px] font-bold text-amber-800 transition hover:bg-amber-100 active:scale-95 shadow-sm"
            >
              <BellRing size={16} />
              {data.pendingApprovals} approvals pending
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active Vendors" value={data.activeVendors.toLocaleString()} />
        <StatCard icon={FileText} label="Open RFQs" value={data.openRFQs.toLocaleString()} />
        <StatCard icon={Clock3} label="Pending Approvals" value={data.pendingApprovals.toLocaleString()} />
        <StatCard icon={IndianRupee} label="Total Spend" value={`₹${data.totalSpend.toLocaleString()}`} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">Procurement Trend</h2>
              <p className="text-[12px] text-slate-500 font-medium tracking-tight">Monthly sourcing activity analytics</p>
            </div>
          </div>
          <div className="h-[300px] min-h-[300px] min-w-0 rounded-2xl border border-slate-100 p-4">
            {data.trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400 uppercase tracking-widest">No trend data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <LineChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "none",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      fontWeight: 700
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">Category Mix</h2>
              <p className="text-[12px] text-slate-500 font-medium tracking-tight">Vendor category distribution registry</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[250px] w-full md:w-1/2 min-h-[250px] min-w-0">
              {data.categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400 uppercase tracking-widest">No category data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "14px",
                        border: "none",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                        fontWeight: 700
                      }}
                    />
                    <Pie
                      data={data.categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {data.categoryData.map((item, idx) => (
                        <Cell key={idx} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="w-full md:w-1/2 space-y-2.5">
              {data.categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[13px] font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-[13px] font-black text-slate-900">{totalCategory > 0 ? Math.round((item.value / totalCategory) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
      <Icon size={20} />
    </div>
    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-tight">{label}</p>
    <p className="mt-1 text-[32px] font-black leading-none text-slate-900 tracking-tighter">{value}</p>
  </div>
);
