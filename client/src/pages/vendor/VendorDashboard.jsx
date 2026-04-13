import { useEffect, useState } from "react";
import api from "../../services/api";
import procurementApi from "../../services/procurementApi";
import {
  TrendingUp,
  Package,
  FileCheck,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    activePOs: 0,
    pendingInvoices: 0,
    avgRating: 0,
    onTimeDelivery: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get("/vendors/me"),
          procurementApi.getVendorDashboardStats()
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Orders",
      count: stats.activePOs,
      icon: Package,
      color: "bg-indigo-50 text-indigo-600",
      trend: "Immediate Action",
      link: "/vendor/procurement-desk"
    },
    {
      label: "Pending Invoices",
      count: stats.pendingInvoices,
      icon: FileCheck,
      color: "bg-emerald-50 text-emerald-600",
      trend: "Payment Cycle",
      link: "/vendor/procurement-desk"
    },
    {
      label: "Service Rating",
      count: `${stats.avgRating}/5`,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      trend: "Trust Score",
      link: "/vendor/profile"
    },
    {
      label: "New Alerts",
      count: stats.unreadNotifications,
      icon: Bell,
      color: "bg-rose-50 text-rose-600",
      trend: "System Feed",
      link: "/vendor/messages"
    }
  ];

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-8 bg-slate-50/50 p-6 rounded-3xl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome, <span className="text-indigo-600">{profile?.companyName || "Vendor"}</span>
          </h1>
          <p className="mt-1 text-slate-500 font-medium">Here is a summary of your procurement ecosystem today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border-2 ${profile?.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <CheckCircle size={14} />
            {profile?.status?.toUpperCase() || "PENDING"} VERIFICATION
          </div>
          <Link to="/vendor/profile" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
             <span className="sr-only">Profile</span>
             <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Link key={i} to={card.link} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-3 ${card.color}`}>
                <card.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.trend}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.count}</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">{card.label}</p>
            </div>
            <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <ExternalLink size={14} className="text-slate-300" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="text-indigo-600" size={20} />
                Operations Roadmap
              </h2>
              <Link to="/vendor/procurement-desk" className="text-xs font-bold text-indigo-600 hover:underline">Manage Desk</Link>
            </div>

            <div className="relative space-y-10 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full border-4 border-white bg-indigo-600 shadow-sm flex items-center justify-center text-white">
                  <CheckCircle size={14} />
                </div>
                <h4 className="font-bold text-slate-900">Application Verified</h4>
                <p className="text-sm text-slate-500 mt-1">Your entity has been cleared for strategic sourcing operations.</p>
                <div className="mt-2 text-[10px] font-bold text-emerald-600 uppercase">Completed • Verified Level 1</div>
              </div>

              <div className="relative pl-10">
                <div className={`absolute left-0 top-1.5 h-8 w-8 rounded-full border-4 border-white ${stats.activePOs > 0 ? "bg-indigo-600" : "bg-slate-100"} shadow-sm flex items-center justify-center text-white`}>
                  {stats.activePOs > 0 ? <CheckCircle size={14} /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
                </div>
                <h4 className="font-bold text-slate-900">Active Procurement</h4>
                <p className="text-sm text-slate-500 mt-1">Participate in open RFQs or fulfill existing Purchase Orders.</p>
                <div className="mt-2 text-[10px] font-bold text-indigo-600 uppercase">{stats.activePOs} Active POs running</div>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full border-4 border-white bg-slate-50 shadow-sm flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                </div>
                <h4 className="font-bold text-slate-900 opacity-60">Payment Settlement</h4>
                <p className="text-sm text-slate-500 mt-1 opacity-60">Revenue cycle management and historical payment audit trails.</p>
                <div className="mt-2 text-[10px] font-bold text-slate-300 uppercase">Wait for next cycle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Performance Section */}
        <div className="space-y-6">
           <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700" />
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="h-20 w-20 rounded-full border-4 border-slate-800 bg-slate-800 flex items-center justify-center mb-4">
                    <TrendingUp size={32} className="text-indigo-400" />
                 </div>
                 <h3 className="text-2xl font-black text-white">{stats.onTimeDelivery}%</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">On-Time Delivery Rate</p>
                 <div className="mt-6 w-full space-y-3 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-bold uppercase">Consistency</span>
                       <span className="text-indigo-400 font-black">High Performance</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.onTimeDelivery}%` }} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6">
              <div className="flex items-start gap-3">
                 <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Priority Action Needed</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">You have {stats.pendingInvoices} invoices in the verification stage. Ensure accuracy to avoid payout delays.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
