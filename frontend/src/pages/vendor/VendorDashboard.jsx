import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Mail,
  ChevronRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Globe
} from "lucide-react";

export default function VendorDashboard() {
  const [info, setInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/vendors/me");
        setInfo(res.data);
        const msgRes = await api.get("/vendors/messages");
        setMessages(msgRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-[#0F7B4D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!info) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
      <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
      <h2 className="text-2xl font-black text-slate-900">Synchronization Error</h2>
      <p className="text-slate-500 mt-2">Could not retrieve vendor profile from the core registry.</p>
    </div>
  );

  const statusColors = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Clock },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle },
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: AlertCircle },
  };

  const status = info.status?.toLowerCase() || 'pending';
  const theme = statusColors[status] || statusColors.pending;
  const StatusIcon = theme.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Top Welcome Section */}
      <div className="relative overflow-hidden bg-[#0F7B4D] rounded-[2.5rem] p-10 lg:p-14 text-white shadow-2xl shadow-[#0F7B4D]/20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
              <Building2 size={14} />
              Official Entity Dashboard
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase">
              Welcome, <span className="text-emerald-300">{info.companyName}</span>
            </h1>
            <p className="text-emerald-100/70 font-medium text-lg max-w-xl">
              Manage your global procurement identity, compliance certifications, and enterprise communications from the official mission control.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-[#0F7B4D] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
              Profile Settings
            </button>
            <button className="bg-emerald-400 text-[#0F7B4D] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
              View Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover:border-[#0F7B4D]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${theme.bg} ${theme.text}`}>
              <StatusIcon size={24} />
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none text-right">Registry <br /> Status</div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-black capitalize ${theme.text}`}>{status}</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1">Verified on 24 Feb 2026</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover:border-[#0F7B4D]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
              <Mail size={24} />
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none text-right">System <br /> Messages</div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{messages.length}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Unread priority notifications</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover:border-[#0F7B4D]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-sky-50 text-sky-600">
              <TrendingUp size={24} />
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none text-right">Network <br /> Trust Score</div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">98%</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Tier 1 Strategic Vendor</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover:border-[#0F7B4D]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
              <Globe size={24} />
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none text-right">Regional <br /> Presence</div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Global</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Registered in 14 Regions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Approval Timeline */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Clock className="text-[#0F7B4D]" size={24} />
              Onboarding Lifecycle
            </h2>
            <button className="text-[10px] font-black text-[#0F7B4D] uppercase tracking-widest hover:underline">View History</button>
          </div>

          <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            <div className="relative pl-14 flex flex-col group">
              <div className="absolute left-0 top-1 w-10 h-10 bg-[#0F7B4D] text-white rounded-xl flex items-center justify-center z-10 shadow-lg shadow-[#0F7B4D]/30">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-black text-slate-900 leading-none mb-1">Dossier Submission</h4>
              <p className="text-xs text-slate-500 font-medium">Stage 1 and Stage 2 profiles successfully ingested into the registry.</p>
              <span className="text-[10px] font-black text-emerald-600 mt-3 flex items-center gap-1 uppercase tracking-widest">
                <CheckCircle size={10} /> Sequence Completed • 12 Jan
              </span>
            </div>

            <div className="relative pl-14 flex flex-col group">
              <div className={`absolute left-0 top-1 w-10 h-10 ${status === 'pending' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-[#0F7B4D] text-white shadow-lg shadow-[#0F7B4D]/30'} rounded-xl flex items-center justify-center z-10`}>
                <Clock size={20} />
              </div>
              <h4 className="font-black text-slate-900 leading-none mb-1">Security Committee Review</h4>
              <p className="text-xs text-slate-500 font-medium">Compliance officers are currently evaluating entity cross-references and bank data.</p>
              <span className={`text-[10px] font-black ${status === 'pending' ? 'text-amber-600' : 'text-emerald-600'} mt-3 flex items-center gap-1 uppercase tracking-widest`}>
                {status === 'pending' ? 'Active Investigation' : 'Verified • 18 Jan'}
              </span>
            </div>

            <div className="relative pl-14 flex flex-col group opacity-40">
              <div className="absolute left-0 top-1 w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center z-10">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-black text-slate-900 leading-none mb-1">Registry Activation</h4>
              <p className="text-xs text-slate-500 font-medium">Formal injection into the active procurement database for contract bidding.</p>
              <span className="text-[10px] font-black text-slate-300 mt-3 flex items-center gap-1 uppercase tracking-widest">Sequence Locked</span>
            </div>
          </div>
        </div>

        {/* Secure Notifications */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10 mb-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                <Bell className="text-emerald-400" size={20} />
                Secure Inbox
              </h2>
              <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                {messages.length}
              </div>
            </div>

            <div className="space-y-6">
              {messages.length > 0 ? messages.map((m, idx) => (
                <div key={m._id} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Priority 0{idx + 1}</p>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-transform group-hover:translate-x-1" />
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">{m.subject}</h4>
                  <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed font-medium">{m.preview}</p>
                </div>
              )) : (
                <div className="text-center py-10 opacity-40">
                  <MessageSquare className="mx-auto mb-4" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest">No Active Messages</p>
                </div>
              )}
            </div>
          </div>

          <button className="relative z-10 w-full mt-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all">
            Open Secure Terminal
          </button>
        </div>
      </div>

    </div>
  );
}
