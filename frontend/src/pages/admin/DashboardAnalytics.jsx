import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingCart, TrendingUp, CreditCard, Filter, 
  Calendar, RefreshCw, MoreHorizontal, ChevronRight,
  TrendingDown, ArrowUpRight, ArrowDownRight, Activity,
  Layers, Zap, Globe, Target
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
  { name: 'Tech', value: 45 },
  { name: 'Logistics', value: 25 },
  { name: 'Services', value: 30 },
];

export default function DashboardAnalytics() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* ── TOP NAVIGATION CONTEXT ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">System Node A</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Registry Secured</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mt-2">Executive <span className="text-slate-300">Intelligence</span></h1>
        </div>

        <div className="flex items-center gap-3">
             <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95 group">
                <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                Contextual Filter
             </button>
             <button className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                Generate Report <ArrowUpRight size={14} />
             </button>
        </div>
      </div>

      {/* ── KPI GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <KPICard 
            title="Operational Partners" 
            value="124" 
            trend="+12%" 
            isPositive={true} 
            icon={Users} 
            color="indigo" 
          />
          <KPICard 
            title="Live Solicitations" 
            value="45" 
            trend="+5%" 
            isPositive={true} 
            icon={Activity} 
            color="emerald" 
          />
          <KPICard 
            title="Network Valuation" 
            value="$1.2M" 
            trend="-2%" 
            isPositive={false} 
            icon={Globe} 
            color="blue" 
          />
          <KPICard 
            title="Compliance Score" 
            value="98%" 
            trend="+0.4%" 
            isPositive={true} 
            icon={Target} 
            color="amber" 
          />
      </div>

      {/* ── MAIN CONTENT GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-10">
          {/* Main Spending Intelligence */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-12 shadow-premium group">
              <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
                  <div className="space-y-2">
                       <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Spending Trajectory</h3>
                       <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Procurement Analytics</p>
                  </div>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                       <button className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100/50">Historical</button>
                       <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Future Projection</button>
                  </div>
              </div>
              
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0F172A" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Allocation Matrix */}
          <div className="col-span-12 lg:col-span-4 space-y-10">
              <div className="bg-[#0F172A] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-10">
                      <div className="flex items-center justify-between">
                           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                               <Zap size={24} />
                           </div>
                           <button className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                                Details <ArrowUpRight size={14} />
                           </button>
                      </div>
                      <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">System Health</h4>
                           <div className="flex items-end gap-3">
                               <span className="text-5xl font-black tracking-tighter leading-none">99.9%</span>
                               <span className="text-[10px] text-emerald-400 font-black uppercase mb-1">Optimized</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '99.9%' }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full bg-emerald-500 rounded-full"
                                />
                           </div>
                      </div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">Infrastructure operating at peak operational parameters across all global nodes.</p>
                  </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-premium flex flex-col items-center text-center">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 w-full text-left ml-4">Budget Distribution</h4>
                  <div className="w-full h-48 mb-8">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={allocationData}>
                           <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                             {allocationData.map((entry, index) => (
                               <Cell key={index} fill={['#6366F1', '#10B981', '#F59E0B'][index % 3]} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-6 w-full">
                       {allocationData.map((item, idx) => (
                           <div key={idx} className="space-y-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                               <p className="text-sm font-black text-slate-900 tracking-tighter">{item.value}%</p>
                           </div>
                       ))}
                  </div>
              </div>
          </div>
      </div>

      <style>{`
          .shadow-premium {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 20px 50px -10px rgba(0, 0, 0, 0.04);
          }
      `}</style>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon, color }) {
    const colorVariants = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100/50 hover:border-indigo-500 hover:shadow-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100/50 hover:border-emerald-500 hover:shadow-emerald-50",
        blue: "text-blue-600 bg-blue-50 border-blue-100/50 hover:border-blue-500 hover:shadow-blue-50",
        amber: "text-amber-600 bg-amber-50 border-amber-100/50 hover:border-amber-500 hover:shadow-amber-50"
    };

    return (
        <motion.div 
            whileHover={{ y: -8 }}
            className={`bg-white border border-slate-100 p-8 rounded-[3rem] shadow-premium group transition-all duration-500 ${colorVariants[color].split(' hover:')[1]}`}
        >
            <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-all duration-500 scale-100 group-hover:scale-110 group-hover:shadow-2xl ${colorVariants[color].split(' hover:')[0]}`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-2">{title}</p>
                <div className="flex items-center justify-between">
                    <h3 className="text-4xl font-black text-[#0F172A] tracking-[-0.05em] leading-none">{value}</h3>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                        {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                        {trend}
                    </div>
                </div>
                <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden group-hover:w-full transition-all duration-700">
                    <div className={`h-full opacity-60 rounded-full ${color === 'indigo' ? 'bg-indigo-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`} style={{width: '60%'}}></div>
                </div>
            </div>
        </motion.div>
    );
}
