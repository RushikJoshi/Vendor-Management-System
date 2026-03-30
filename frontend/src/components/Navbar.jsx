import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Search,
  LogOut,
  UserCircle2,
  ChevronDown,
  ShieldCheck,
  Settings,
  Globe,
  Activity,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({
  onMenuToggle = () => {},
  onDesktopToggle = () => {},
  isSidebarCollapsed = false,
}) {
  const { logout, user } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-40 flex h-[4.25rem] items-center justify-between border-b border-white/60 bg-[#fbfaf7]/90 px-3 backdrop-blur-xl transition-all duration-500 sm:px-4 lg:h-[4.5rem] lg:px-6 ${
        isSidebarCollapsed ? "lg:left-[5.5rem]" : "lg:left-[14.25rem]"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white/85 text-stone-600 transition-all hover:border-amber-400 hover:text-slate-900 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 lg:hidden">
          <p className="truncate text-[13px] font-bold tracking-tight text-slate-900">
            Vendor Management
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            Admin Panel
          </p>
        </div>

        <button
          type="button"
          onClick={onDesktopToggle}
          className="hidden h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white/85 px-3 text-[12px] font-semibold text-stone-600 transition-all hover:border-amber-400 hover:text-slate-900 lg:inline-flex"
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {isSidebarCollapsed ? "Open Menu" : "Collapse Menu"}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="relative hidden xl:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="text-stone-400" size={16} strokeWidth={2.2} />
          </div>
          <input
            type="text"
            onChange={(e) => window.dispatchEvent(new CustomEvent('GLOBAL_SEARCH', { detail: e.target.value }))}
            placeholder="Search vendors, RFQs, actions..."
            className="w-72 rounded-[1.3rem] border border-stone-200 bg-white/80 py-2.5 pl-12 pr-5 text-[13px] font-medium text-slate-900 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100/70"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white/80 text-stone-500 transition-all hover:border-amber-400 hover:text-slate-900 hover:shadow-lg active:scale-95 sm:flex">
            <Globe size={18} className="transition-transform hover:rotate-12" />
          </button>
          <div className="relative">
            <NotificationBell />
          </div>
        </div>

        <div className="mx-1 hidden h-8 w-px bg-stone-200 xl:block" />

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-[1.1rem] border border-white/70 bg-white/80 px-2.5 py-1.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] transition-all hover:shadow-[0_22px_55px_-25px_rgba(15,23,42,0.5)] sm:gap-3 sm:px-3"
          >
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-bold leading-none tracking-tight text-slate-900">
                {user?.name || "System Admin"}
              </p>
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-stone-400">
                {user?.role || "Global Manager"}
              </p>
            </div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(135deg,#1f2937_0%,#111827_100%)] text-sm font-bold text-white shadow-lg shadow-stone-300/60 ring-4 ring-[#f7f3eb] sm:h-10 sm:w-10 sm:rounded-[1rem]"
              >
                {user?.name?.charAt(0) || "S"}
              </motion.div>
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-xl">
                <div className="h-1 w-1 rounded-full bg-white" />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 top-full z-50 mt-4 w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.18)] sm:mt-5 sm:w-72 sm:p-6"
              >
                <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-[0.03]">
                  <ShieldCheck size={120} />
                </div>

                <div className="relative z-10 mb-6">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-stone-400">
                    Account
                  </p>
                  <h4 className="text-lg font-black leading-none tracking-tight text-slate-900">
                    {user?.name}
                  </h4>
                </div>

                <div className="relative z-10 space-y-3">
                  <ProfileLink icon={UserCircle2} label="View Profile Dossier" />
                  <ProfileLink icon={Settings} label="System Protocols" />
                  <ProfileLink icon={Activity} label="Access Logs" />
                </div>

                <div className="mx-2 my-6 h-px bg-stone-100" />

                <button
                  className="group/logout relative z-10 flex w-full items-center justify-between rounded-2xl bg-rose-50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-rose-600 transition-all duration-500 hover:bg-rose-500 hover:text-white active:scale-95"
                  onClick={logout}
                >
                  Terminate session
                  <LogOut size={16} className="transition-transform group-hover/logout:translate-x-1" />
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
  <button className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[11px] font-black text-stone-500 transition-all duration-300 hover:bg-stone-50 hover:text-slate-900">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-100 bg-stone-50 text-stone-400 shadow-inner transition-all group-hover:bg-white group-hover:text-slate-900">
      <Icon size={16} />
    </div>
    <span className="tracking-wide">{label}</span>
    <ChevronDown
      size={14}
      className="-rotate-90 ml-auto opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
    />
  </button>
);
