import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  FileText,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  ShieldAlert,
  ChevronRight,
  LogOut,
  HelpCircle,
  Bell,
  Workflow,
  Plus,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ links = [] }) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white text-slate-500 z-50 flex flex-col transition-all duration-500 shadow-[20px_0_50px_rgba(0,0,0,0.02)] border-r border-slate-100 overflow-hidden">
      
      {/* ── BRAND IDENTITY ─────────────────────────────────────────────── */}
      <div className="p-10 mb-6 relative">
        <div className="flex items-center gap-4 group cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 ring-4 ring-slate-50"
          >
            <ShieldCheck size={24} strokeWidth={2.5} />
          </motion.div>
          <div className="transition-all group-hover:translate-x-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Antigravity</h2>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1.5 opacity-80">Vendor OS v2.0</p>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION CORE ───────────────────────────────────────────── */}
      <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar pt-6">
        <div className="px-4 mb-6">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">System Index</span>
        </div>
        
        {links.map((link, idx) => {
          const Icon = link.icon || LayoutDashboard;
          const isActive = location.pathname === link.to;
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-5 py-4 rounded-3xl transition-all duration-500 group relative ${isActive
                  ? "bg-slate-900 text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)]"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <div className="flex items-center gap-4">
                <Icon size={18} className={`${isActive ? "text-white" : "group-hover:text-slate-900 hover-bounce"} transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[13px] font-black tracking-widest uppercase ${isActive ? "text-white" : "group-hover:text-slate-900"}`}>
                  {link.label}
                </span>
              </div>
              
              <AnimatePresence>
                {isActive && (
                    <motion.div 
                        layoutId="active-pill"
                        className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                    />
                )}
              </AnimatePresence>

              {!isActive && (
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-300" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── BOTTOM OPERATIONALS ───────────────────────────────────────── */}
      <div className="p-8 mt-auto space-y-8 bg-slate-50/50 border-t border-slate-100">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm group hover:border-slate-900 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <Workflow size={14} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">Status</p>
                   <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">Live Node</p>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '99.9%' }}
                        className="h-full bg-slate-900 rounded-full"
                    />
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>Registry Sync</span>
                    <span className="text-slate-900">99.9%</span>
                </div>
            </div>
        </div>

        <button className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95 group overflow-hidden relative">
            <span className="relative z-10 flex items-center gap-3">
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                Sign Out Protocol
            </span>
        </button>
      </div>

      <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .hover-bounce { transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .group:hover .hover-bounce { transform: scale(1.1) rotate(5deg); }
      `}</style>
    </aside>
  );
}

function AnimatePresence({ children }) {
    return <>{children}</>;
}