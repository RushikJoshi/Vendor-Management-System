import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Search, Bell, LogOut, UserCircle2, ChevronDown, ShieldCheck, Settings, Globe, Moon } from "lucide-react";
import NotificationBell from "./NotificationBell";


export default function Navbar() {
  const { logout, user } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-80 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-10 flex items-center justify-between transition-all duration-300">
      {/* Search area */}
      <div className="flex-1 max-w-xl">
        <div className="relative group overflow-hidden rounded-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="block w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-gray-400 font-medium"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <kbd className="hidden sm:inline-block px-1.5 py-1 text-[10px] font-black text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Actions area */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                <Globe size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                <Moon size={18} />
            </button>
        </div>

        <NotificationBell />


        <div className="h-8 w-px bg-gray-100 mx-2"></div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all active:scale-95"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-gray-900 leading-none uppercase tracking-tight">{user?.name || "Admin"}</p>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                {user?.role || "Manager"}
              </p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-4 w-56 bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] rounded-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-4 py-2 border-b border-gray-50 mb-2">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Settings</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-black uppercase tracking-tight text-gray-600 transition-colors">
                <UserCircle2 size={16} /> My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-black uppercase tracking-tight text-gray-600 transition-colors">
                <Settings size={16} /> Preferences
              </button>
              <div className="h-px bg-gray-50 my-2 mx-4"></div>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest transition-colors"
                onClick={logout}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}