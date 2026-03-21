import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Search, Bell, LogOut, UserCircle2, ChevronDown, ShieldCheck, Settings, Globe, Moon, Terminal, Activity, Zap, Cpu } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { logout, user } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-72 h-24 px-12 flex items-center justify-between transition-all duration-500 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      
      {/* ── CONTEXTUAL SIGNALS ─────────────────────────────────────────── */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner group cursor-pointer hover:border-slate-900 transition-all">
           <Cpu size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors italic">Node_Alpha_721</span>
        </div>
        
        <div className="h-6 w-[1px] bg-slate-100 hidden md:block"></div>
        
        <div className="hidden lg:flex items-center gap-3 group cursor-help">
           <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
           </div>
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] group-hover:text-emerald-600 transition-colors leading-none">Global Registry Status: Syncing</span>
        </div>
      </div>

      {/* ── OPERATIONAL CLUSTER ────────────────────────────────────────── */}
      <div className="flex items-center gap-10">
        {/* Intelligence Search Bar */}
        <div className="relative group hidden xl:block">
           <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
             <Search className="text-slate-300 group-focus-within:text-slate-900 transition-all duration-500" size={18} strokeWidth={2.5} />
           </div>
           <input
             type="text"
             placeholder="Search Universal Registry..."
             className="w-80 bg-slate-50 border border-slate-100 rounded-[1.5rem] py-3 pl-16 pr-6 text-xs font-black text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-[15px] focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner"
           />
        </div>

        <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-xl transition-all group active:scale-95">
                <Globe size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
            <div className="relative">
                 <NotificationBell />
            </div>
        </div>

        <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>

        {/* Executive Profile Dossier */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-5 group"
          >
            <div className="text-right hidden sm:block transition-all group-hover:-translate-x-1">
              <p className="text-[13px] font-black text-slate-900 tracking-tighter uppercase leading-none">{user?.name || "System Admin"}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">
                {user?.role || "Global Manager"}
              </p>
            </div>
            
            <div className="relative">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="w-12 h-12 bg-slate-900 rounded-[1.4rem] flex items-center justify-center text-white font-black text-base shadow-2xl shadow-slate-200 ring-4 ring-slate-50 transition-all"
               >
                {user?.name?.charAt(0) || "S"}
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-full right-0 mt-8 w-72 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] border border-slate-100 p-8 z-50 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <ShieldCheck size={120} />
                </div>
                
                <div className="mb-8 relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Account Registry</p>
                  <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">{user?.name}</h4>
                </div>
                
                <div className="space-y-3 relative z-10">
                    <ProfileLink icon={UserCircle2} label="View Profile Dossier" />
                    <ProfileLink icon={Settings} label="System Protocols" />
                    <ProfileLink icon={Activity} label="Access Logs" />
                </div>

                <div className="h-px bg-slate-100 my-8 mx-2"></div>
                
                <button
                  className="w-full relative z-10 flex items-center justify-between px-6 py-4 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-sm active:scale-95 group/logout"
                  onClick={logout}
                >
                  Terminate session
                  <LogOut size={16} className="group-hover/logout:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

const ProfileLink = ({ icon: Icon, label }) => (
    <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 rounded-2xl text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all duration-300 group">
      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:bg-white transition-all shadow-inner">
         <Icon size={16} />
      </div>
      <span className="uppercase tracking-widest">{label}</span>
      <ChevronDown size={14} className="-rotate-90 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
);