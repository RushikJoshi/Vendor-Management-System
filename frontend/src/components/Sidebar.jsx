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
  Bell
} from "lucide-react";

export default function Sidebar({ links = [] }) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-100 z-50 flex flex-col transition-all duration-300 shadow-[20px_0_70px_-50px_rgba(0,0,0,0.1)]">
      {/* Brand area */}
      <div className="p-10 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none uppercase">VMS <span className="text-indigo-600 tracking-normal italic">SaaS</span></h2>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2">Enterprise Core</p>
          </div>
        </div>
      </div>

      {/* Navigation area */}
      <nav className="flex-1 px-6 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
        
        {links.map((link) => {
          const Icon = link.icon || LayoutDashboard;
          const isActive = location.pathname === link.to;
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={`${isActive ? "text-white" : "group-hover:text-indigo-600"} transition-colors`} strokeWidth={isActive ? 3 : 2} />
                <span className={`text-[13px] font-black uppercase tracking-tight ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900"}`}>{link.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-white opacity-50" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div className="p-8 space-y-4">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ShieldAlert size={18} />
                </div>
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Status Center</p>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <span>Account Health</span>
                    <span className="text-indigo-600">98%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: '98%'}}></div>
                </div>
            </div>
        </div>

        <button className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
        </button>
      </div>
    </aside>
  );
}