import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  UserCircle2,
  ChevronDown,
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
  const navigate = useNavigate();
  const isVendor = String(user?.role || "").toLowerCase() === "vendor";

  const handleProfileAction = (action) => {
    if (isVendor) {
      if (action === "profile") navigate("/vendor/change-password");
      else navigate("/vendor/dashboard");
      setIsProfileOpen(false);
      return;
    }

    if (action === "profile") navigate("/admin/profile");
    if (action === "settings") navigate("/admin/settings");
    if (action === "activity") navigate("/admin/audit-logs");
    setIsProfileOpen(false);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-40 flex h-[4.25rem] items-center justify-between border-b border-white/60 bg-[#fbfaf7]/90 px-3 backdrop-blur-xl transition-all duration-500 sm:px-4 lg:h-[4.5rem] lg:px-6 ${
        isSidebarCollapsed ? "lg:left-[6rem]" : "lg:left-[16rem]"
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
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white/95 px-2.5 py-1.5 shadow-[0_14px_32px_-24px_rgba(37,99,235,0.35)] transition-all hover:border-sky-200 hover:shadow-[0_20px_45px_-24px_rgba(37,99,235,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:gap-3 sm:px-3.5"
          >
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-semibold leading-none text-slate-900">
                {user?.name || "System Admin"}
              </p>
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                  {user?.role || "admin"}
                </span>
              </div>
            </div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#1f78c1_0%,#2f9ae0_100%)] text-sm font-semibold text-white shadow-lg shadow-sky-200/80 ring-4 ring-[#f7f3eb] sm:h-10 sm:w-10"
              >
                {user?.name?.charAt(0) || "S"}
              </motion.div>
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.24)] sm:mt-4 sm:w-72 sm:p-5"
              >
                <div className="mb-4">
                  <p className="mb-1 text-[12px] font-medium text-slate-400">
                    Account
                  </p>
                  <h4 className="text-[22px] font-semibold leading-none text-slate-900">
                    {user?.name}
                  </h4>
                  <p className="mt-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                    {user?.role || "admin"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <ProfileLink icon={UserCircle2} label="My Profile" onClick={() => handleProfileAction("profile")} />
                  <ProfileLink icon={Settings} label="Settings" onClick={() => handleProfileAction("settings")} />
                  <ProfileLink icon={Activity} label="Activity Log" onClick={() => handleProfileAction("activity")} />
                </div>

                <div className="my-4 h-px bg-stone-100" />

                <button
                  className="group/logout flex w-full items-center justify-between rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-600 transition-all duration-300 hover:bg-rose-500 hover:text-white active:scale-95"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                >
                  Logout
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

const ProfileLink = ({ icon: Icon, label, onClick }) => (
  <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-100 bg-stone-50 text-stone-400 transition-all group-hover:bg-white group-hover:text-slate-900">
      <Icon size={15} />
    </div>
    <span>{label}</span>
    <ChevronDown
      size={14}
      className="-rotate-90 ml-auto opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
    />
  </button>
);
