import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/Card";
import { Building2, User, Briefcase, Mail, CheckCircle, Clock, XCircle, FileText, MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/vendors/me")
      .then((res) => setInfo(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="p-6 bg-amber-50 rounded-full text-amber-500 animate-pulse">
          <Building2 size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Profile Pending</h2>
          <p className="text-slate-500 max-w-sm">
            Welcome, {user?.name || 'Vendor'}! We couldn't find your enterprise profile. 
            Please complete your application or contact support to activate your dashboard.
          </p>
        </div>
        <Link 
          to="/vendor/fill-form" 
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
        >
          Complete Profile
        </Link>
      </div>
    );
  }


  const statusConfig = {
    approved: {
      color: "from-emerald-600/20 to-teal-600/20",
      textColor: "text-emerald-400",
      icon: CheckCircle,
      description: "Your account is fully verified and active.",
    },
    pending: {
      color: "from-amber-600/20 to-orange-600/20",
      textColor: "text-amber-400",
      icon: Clock,
      description: "Your application is currently under review by our admin team.",
    },
    rejected: {
      color: "from-rose-600/20 to-red-600/20",
      textColor: "text-rose-400",
      icon: XCircle,
      description: "Your application was not approved. Please contact support.",
    },
  };

  const statusMap = {
    active: "approved",
    inactive: "rejected",
    pending: "pending"
  };

  const normalizedStatus = statusMap[info.status] || info.status || "pending";
  const currentStatus = statusConfig[normalizedStatus] || statusConfig.pending;


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Welcome, {info.companyName}
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Everything you need to manage your partnership and scale your business with our enterprise platform.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Alert */}
          <div className={`bg-gradient-to-br ${currentStatus.color} border border-white/10 rounded-2xl p-6 flex items-center gap-6 shadow-lg`}>
            <div className={`p-4 rounded-2xl bg-white/10 ${currentStatus.textColor}`}>
              <currentStatus.icon size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Status Verification</p>
              <h3 className={`text-2xl font-bold ${currentStatus.textColor} capitalize mb-1`}>{normalizedStatus}</h3>

              <p className="text-slate-300 text-sm">{currentStatus.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Company Details">
              <div className="space-y-6 mt-4">
                {[
                  { label: "Company Name", value: info.companyName, icon: Building2 },
                  { label: "Contact Person", value: info.contactPerson, icon: User },
                  { label: "Business Category", value: typeof info.category === 'object' ? info.category?.name : (info.category || info.serviceType), icon: Briefcase },
                  { label: "Contact Email", value: info.email, icon: Mail },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                      <p className="text-slate-200 font-semibold">{item.value || 'N/A'}</p>
                    </div>
                  </div>
                ))}

              </div>
            </Card>

            <Card title="Quick Navigation">
              <div className="grid grid-cols-1 gap-3 mt-4">
                {[
                  { label: "Edit Profile", icon: Settings, path: "/vendor/profile", color: "hover:bg-indigo-500/10 hover:text-indigo-400" },
                  { label: "My Documents", icon: FileText, path: "/vendor/documents", color: "hover:bg-emerald-500/10 hover:text-emerald-400" },
                  { label: "Inbox Messages", icon: MessageCircle, path: "/vendor/messages", color: "hover:bg-pink-500/10 hover:text-pink-400" },
                ].map((nav) => (
                  <Link
                    key={nav.label}
                    to={nav.path}
                    className={`flex items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl transition-all group ${nav.color}`}
                  >
                    <nav.icon size={20} className="transition-transform group-hover:scale-110" />
                    <span className="font-semibold text-sm">{nav.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card title="Recent Notifications">
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 animate-pulse">
                <div className="h-4 w-3/4 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-slate-800 rounded"></div>
              </div>
              <p className="text-center text-slate-500 text-sm italic py-4">No new notifications</p>
            </div>
          </Card>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-rose-500/20 shadow-xl">
            <h4 className="text-xl font-bold text-white mb-2">Need Support?</h4>
            <p className="text-slate-400 text-sm mb-6">Our partner success team is here to help you 24/7.</p>
            <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
              Contact Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
