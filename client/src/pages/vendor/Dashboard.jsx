import { useContext, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import {
  EmptyState,
  LinkButton,
  PageShell,
  SectionCard,
  StatusBadge,
} from "../../components/vendor/VendorUI";

const CHART_COLORS = ["#0f172a", "#475569", "#94a3b8"];

const statusConfig = {
  active: {
    label: "Active",
    summary: "Your vendor profile is active and available for procurement activity.",
    tone: "emerald",
    icon: ShieldCheck,
  },
  approved: {
    label: "Approved",
    summary: "Your vendor profile has been approved and is ready for new business.",
    tone: "emerald",
    icon: ShieldCheck,
  },
  pending: {
    label: "Pending Review",
    summary: "Your profile is under review. Keep your company information up to date.",
    tone: "amber",
    icon: Clock3,
  },
  inactive: {
    label: "Inactive",
    summary: "Your profile is currently inactive. Contact the admin team if this looks incorrect.",
    tone: "slate",
    icon: Clock3,
  },
  rejected: {
    label: "Action Required",
    summary: "Some information still needs attention before approval can continue.",
    tone: "rose",
    icon: XCircle,
  },
};

const getCategoryLabel = (category) => {
  if (!category) return "Not assigned";
  if (typeof category === "object") return category.name || "Not assigned";
  return category;
};

const getAddressLabel = (address) => {
  if (!address) return "Not available";
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    const parts = [address.city, address.state, address.pincode].filter(Boolean);
    return parts.length ? parts.join(", ") : "Not available";
  }
  return "Not available";
};

const getCompletion = (info) => {
  const fields = [
    info?.companyName,
    info?.contactPerson,
    info?.email,
    info?.phone,
    getAddressLabel(info?.address) !== "Not available" ? info?.address : null,
    getCategoryLabel(info?.category) !== "Not assigned" ? info?.category : null,
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

const getRfqStatusBuckets = (rfqs = []) => {
  return rfqs.reduce(
    (acc, rfq) => {
      const status = String(rfq?.status || "").toLowerCase();
      if (status === "closed") {
        acc.closed += 1;
      } else {
        acc.open += 1;
      }
      return acc;
    },
    { open: 0, closed: 0 }
  );
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState(null);
  const [chartMetrics, setChartMetrics] = useState({
    openRfqs: 0,
    closedRfqs: 0,
    activeContracts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [vendorRes, rfqRes, contractRes] = await Promise.allSettled([
          api.get("/vendors/me"),
          api.get("/rfqs"),
          api.get("/slm/contracts", { params: { page: 1, limit: 1 } }),
        ]);

        if (vendorRes.status === "fulfilled") {
          setInfo(vendorRes.value.data.data);
        }

        const rfqs = rfqRes.status === "fulfilled" && Array.isArray(rfqRes.value.data?.data)
          ? rfqRes.value.data.data
          : [];
        const rfqBuckets = getRfqStatusBuckets(rfqs);

        const activeContracts =
          contractRes.status === "fulfilled"
            ? Number(contractRes.value.data?.pagination?.total || contractRes.value.data?.data?.length || 0)
            : 0;

        setChartMetrics({
          openRfqs: rfqBuckets.open,
          closedRfqs: rfqBuckets.closed,
          activeContracts,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />)}
        </div>
        <div className="h-96 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="p-10">
        <section className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Building2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor profile not found</h2>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed">
                We could not find an active vendor profile for {user?.name || "this account"}. 
                Please contact the procurement team or review your registration status.
            </p>
            <div className="mt-8">
                <LinkButton to="/vendor/profile" className="px-8">Check Profile Status</LinkButton>
            </div>
        </section>
      </div>
    );
  }

  const normalizedStatus = String(info.lifecycleStatus || info.status || "pending").toLowerCase();
  const currentStatus = statusConfig[normalizedStatus] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;
  const completion = getCompletion(info);
  const chartData = [
    { name: "Open RFQs", value: chartMetrics.openRfqs, color: "#4f46e5" },
    { name: "Closed RFQs", value: chartMetrics.closedRfqs, color: "#94a3b8" },
    { name: "Active Contracts", value: chartMetrics.activeContracts, color: "#10b981" },
  ].filter((item) => item.value > 0);

  const statusColors = {
    emerald: "bg-emerald-500 shadow-emerald-500/50",
    amber: "bg-amber-500 shadow-amber-500/50",
    rose: "bg-rose-500 shadow-rose-500/50",
    slate: "bg-slate-500 shadow-slate-500/50"
  };

  return (
    <div className="space-y-4 pb-10">
      {/* HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                  <Building2 size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome, {info.companyName || "Vendor"}</h1>
                <p className="text-xs font-medium text-slate-500">Corporate Vendor Portal & Procurement Workspace.</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${statusColors[currentStatus.tone] || statusColors.amber}`} />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{currentStatus.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <MetricCard 
                label="Open Requests (RFQs)" 
                value={chartMetrics.openRfqs} 
                icon={Clock3}
                tone="indigo"
                note="Pending your response" 
            />
           <MetricCard 
                label="Active Agreements" 
                value={chartMetrics.activeContracts} 
                icon={ShieldCheck}
                tone="emerald"
                note="Awarded contracts" 
            />
           <MetricCard 
                label="Profile Completeness" 
                value={`${completion}%`} 
                icon={CheckCircle2}
                tone="slate"
                note="Vendor verification data" 
            />
      </div>

      <div className="grid grid-cols-1 gap-5">
          {/* ACTIVITY SUMMARY - Full Width */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-slate-100 bg-slate-50/50 p-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Active Portfolio</h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Summary of your current business engagement.</p>
                    </div>
                </div>
                <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="h-[240px] relative">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-2">
                                    <Activity size={24} />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">No active data</p>
                            </div>
                        )}
                        {chartData.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">Total</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">
                                        {chartMetrics.openRfqs + chartMetrics.closedRfqs + chartMetrics.activeContracts}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
          </section>
      </div>

    </div>
  );
}


function MetricCard({ label, value, icon: Icon, tone, note }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl ${tones[tone]}`}>
                <Icon size={20} />
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
        <p className="mt-4 text-xs font-medium text-slate-500 italic border-t border-slate-50 pt-3">{note}</p>
    </div>
  );
}

function NavButton({ to, label, icon: Icon }) {
    return (
        <LinkButton 
            to={to} 
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 rounded-xl transition-all group"
        >
            <div className="flex items-center gap-3">
                <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{label}</span>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
        </LinkButton>
    )
}

