import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, FileText, ShoppingCart, CreditCard, TrendingUp, TrendingDown,
  Clock, CheckCircle, AlertCircle, MoreVertical, Plus, Search,
  Filter, ArrowUpRight, ArrowDownRight, Calendar, Zap, ChevronRight,
  ShieldCheck, Globe, Activity, Layers, Database, Lock, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/vms/StatCard';
import { motion, AnimatePresence } from 'framer-motion';

const SaaSDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendors: { value: 124, trend: '+12%', isPositive: true },
    openRFQs: { value: 45, trend: '+5%', isPositive: true },
    pendingPOs: { value: 12, trend: '-2%', isPositive: false },
    totalSpent: { value: '$84,200', trend: '+18%', isPositive: true }
  });

  const chartData = [
    { name: 'JAN', value: 4000 },
    { name: 'FEB', value: 3000 },
    { name: 'MAR', value: 5000 },
    { name: 'APR', value: 4500 },
    { name: 'MAY', value: 6000 },
    { name: 'JUN', value: 5500 },
  ];

  const departmentData = [
    { name: 'ENGINEERING', value: 45, color: '#0F172A' },
    { name: 'INFRASTRUCTURE', value: 30, color: '#334155' },
    { name: 'OPERATIONS', value: 25, color: '#64748B' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
        setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const Badge = ({ children, status }) => {
    const styles = {
      high: "bg-rose-50 text-rose-600 border-rose-100",
      medium: "bg-amber-50 text-amber-600 border-amber-100",
      low: "bg-emerald-50 text-emerald-600 border-emerald-100",
      open: "bg-slate-900 text-white border-slate-900",
      pending: "bg-slate-100 text-slate-500 border-slate-200",
      closed: "bg-slate-50 text-slate-300 border-slate-100"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${styles[status]}`}>
        {children}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-10 space-y-12 animate-pulse bg-white min-h-screen">
        <div className="h-20 bg-slate-50 rounded-[2.5rem] w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2.5rem]"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 h-[500px] bg-slate-50 rounded-[3.5rem]"></div>
            <div className="h-[500px] bg-slate-50 rounded-[3.5rem]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 fade-in pb-20">
      {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Operational Intel</span>
                  <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Node Overview</span>
              </div>
              <div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Command Center</h1>
                  <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Real-time procurement landscape. Synchronizing vendor pipelines, capital velocity, and structural risk across all operational sectors.</p>
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <button className="flex items-center gap-4 bg-white border border-slate-100 text-slate-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:text-slate-900 hover:border-slate-900 transition-all shadow-subtle active:scale-95">
              <Filter size={18} /> Analysis Filter
            </button>
            <button 
                onClick={() => navigate('/admin/rfq/create')}
                className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Plus size={18} /> Initiate RFQ Protocol
            </button>
          </div>
      </header>

      {/* ── METRIC SNAPSHOTS ────────────────────────────────────────────── */ }
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <MetricCard label="Registry Density" value={stats.totalVendors.value} trend="+12.4%" trendIsPos={true} icon={Users} />
        <MetricCard label="Active Protocols" value={stats.openRFQs.value} trend="+5.2%" trendIsPos={true} icon={FileText} />
        <MetricCard label="Capital Velocity" value={stats.totalSpent.value} trend="+18.9%" trendIsPos={true} icon={TrendingUp} />
        <MetricCard label="Queue Latency" value={stats.pendingPOs.value} trend="-2.4%" trendIsPos={false} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── PRIMARY ANALYTICS ─────────────────────────────────────────── */ }
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden flex flex-col">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4 font-black">
                     <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                     <div>
                        <h2 className="text-xs uppercase tracking-[0.2em] text-slate-900">Procurement Drift</h2>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">6-Month Capital Flow Registry</p>
                     </div>
                </div>
                <div className="flex items-center gap-4">
                     <div className="h-10 px-4 bg-white border border-slate-100 rounded-xl flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-inner">
                         <Calendar size={12} /> FY 2024-25
                     </div>
                </div>
            </div>
            
            <div className="p-10 h-[450px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="driftGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.08}/>
                                <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} 
                            dy={20}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} 
                        />
                        <Tooltip 
                            cursor={{ stroke: '#0F172A', strokeWidth: 1, strokeDasharray: '4 4' }}
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 40px 100px -30px rgba(0,0,0,0.15)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0F172A" 
                            strokeWidth={4} 
                            fill="url(#driftGradient)" 
                            activeDot={{ r: 8, fill: '#0F172A', stroke: '#fff', strokeWidth: 4 }} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* ── COMPONENT SPLIT ──────────────────────────────────────────── */ }
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden flex flex-col">
             <div className="p-10 border-b border-slate-50 bg-slate-50/50 font-black">
                <h2 className="text-xs uppercase tracking-[0.2em] text-slate-900">Portfolio Diversity</h2>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Sector Allocation Matrix</p>
             </div>

             <div className="flex-1 p-10 flex flex-col">
                <div className="h-[220px] mb-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 900 }} />
                            <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                    {departmentData.map((dept, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-2 rounded-full overflow-hidden bg-slate-50 border border-slate-100 relative shadow-inner">
                                    <div className="absolute top-0 left-0 h-full transition-all duration-1000" style={{backgroundColor: dept.color, width: `${dept.value}%`}}></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors uppercase">{dept.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-900 tracking-tighter shadow-subtle px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">{dept.value}%</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-10 border-t border-slate-50">
                    <button className="w-full flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] group">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Detailed Ledger</span>
                        <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── LIVE OPERATIONS ──────────────────────────────────────────── */ }
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-xl">
                        <Terminal size={20} />
                     </div>
                     <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Operational Log</h2>
                </div>
                <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors border-b-2 border-slate-100 hover:border-slate-900 pb-1 italic">Archive Access</button>
            </div>
            
            <div className="p-8 space-y-4">
                {[
                  { title: 'Cluster Infrastructure Upgrade', dept: 'System_Arch', priority: 'high', status: 'open', date: 'TRANS_24.03' },
                  { title: 'Global Registry Maintenance', dept: 'Reg_Logic', priority: 'medium', status: 'pending', date: 'TRANS_22.03' },
                  { title: 'Operational Asset Procurement', dept: 'Proc_Ops', priority: 'low', status: 'open', date: 'TRANS_20.03' },
                ].map((rfq, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 10, backgroundColor: '#FDFDFD' }}
                    className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-[2rem] hover:border-slate-300 hover:shadow-xl transition-all group relative active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-inner transition-all border border-transparent group-hover:border-slate-100">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{rfq.title}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{rfq.dept}</span>
                          <span className="text-slate-200 text-xs font-black">/</span>
                          <span className="text-[8px] text-slate-300 font-black flex items-center gap-1 uppercase tracking-widest italic group-hover:text-slate-500 transition-colors">
                            {rfq.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge status={rfq.priority}>{rfq.priority}</Badge>
                      <div className="w-px h-6 bg-slate-100"></div>
                      <Badge status={rfq.status}>{rfq.status}</Badge>
                    </div>
                  </motion.div>
                ))}
            </div>
        </div>

        {/* ── REGISTRATION QUEUE ────────────────────────────────────────── */ }
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-xl">
                        <Globe size={20} />
                     </div>
                     <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Registry Ingress</h2>
                </div>
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-2xl text-[9px] font-black tracking-widest uppercase animate-pulse shadow-sm">2 Actions Pending</div>
            </div>

            <div className="p-8 space-y-4">
                {[
                  { name: 'NexGen Global Logistics', applied: '02H_LATENCY', category: 'LOGISTICS', logo: 'NL' },
                  { name: 'TerraBuild Infrastructures', applied: '05H_LATENCY', category: 'CONSTRUCTION', logo: 'TB' },
                ].map((vendor, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50/30 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all group active:scale-[0.99] cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center font-black text-slate-900 text-lg tracking-tighter group-hover:shadow-xl transition-all relative overflow-hidden">
                        {vendor.logo}
                        <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none uppercase tracking-tighter mb-2 group-hover:text-emerald-700 transition-colors uppercase">{vendor.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{vendor.category} <span className="text-slate-200 mx-2">|</span> {vendor.applied}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="h-11 px-6 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200">Verify</button>
                      <button className="h-11 px-6 bg-white border border-slate-100 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-95 transition-all">Defer</button>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="p-10 pt-0 mt-4 border-t border-slate-50/50">
                <div className="py-10 text-center space-y-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-6">Autonomous Security Mesh Active</p>
                    <div className="flex justify-center -space-x-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 shadow-xl overflow-hidden flex items-center justify-center text-[11px] font-black text-slate-400 uppercase">NODE_{i}</div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-xl">+32</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
          .shadow-premium {
              box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
          }
          .shadow-subtle {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const MetricCard = ({ label, value, trend, trendIsPos, icon: Icon }) => (
    <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-premium flex flex-col justify-between group transition-all duration-500 cursor-pointer overflow-hidden relative"
    >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Icon size={120} strokeWidth={2.5} />
        </div>
        <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-2xl transition-all duration-500">
                <Icon size={28} />
            </div>
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${trendIsPos ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {trend}
            </div>
        </div>
        <div className="relative z-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3 group-hover:text-slate-900 transition-colors">{value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 group-hover:text-slate-500 transition-colors uppercase">{label}</p>
        </div>
    </motion.div>
);

export default SaaSDashboard;
