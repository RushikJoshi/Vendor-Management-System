import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, LayoutDashboard, X } from "lucide-react";

export default function Sidebar({
  links = [],
  isMobileOpen = false,
  isCollapsed = false,
  onClose = () => {},
  onToggleCollapse = () => {},
}) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 flex w-[14.25rem] flex-col overflow-hidden border-r border-sky-900/20 bg-white shadow-[18px_0_40px_rgba(0,0,0,0.06)] transition-all duration-300 lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "lg:w-[5.5rem]" : "lg:w-[14.25rem]"}`}
    >
      <div className="border-b border-sky-100 bg-white px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 lg:flex"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>
        <div
          className={`rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-3.5 py-3 shadow-sm ${
            isCollapsed ? "lg:px-2.5" : ""
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f4c81_0%,#0f766e_100%)] text-white shadow-lg shadow-sky-100">
              <span className="text-[15px] font-black uppercase tracking-[0.08em]">VM</span>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className={`min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
              <p className="text-[13px] font-black uppercase leading-none tracking-[0.08em] text-[#16324f]">
                Vendor Management
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700/75">
                Admin Panel
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto bg-white py-3">
        {links.map((link) => {
          const Icon = link.icon || LayoutDashboard;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              title={isCollapsed ? link.label : undefined}
              className={`group mx-0.5 mb-1 flex items-center justify-between border-l-4 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "border-l-[#ff5a00] bg-[linear-gradient(90deg,#f03a00_0%,#ff5a00_100%)] text-white shadow-[0_8px_18px_rgba(240,58,0,0.25)]"
                  : "border-l-transparent bg-[linear-gradient(90deg,#0e5d9d_0%,#136cae_100%)] text-white hover:bg-[linear-gradient(90deg,#0c568f_0%,#115f99_100%)]"
              } ${isCollapsed ? "lg:justify-center lg:px-2 lg:py-3.5" : ""}`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isCollapsed ? "lg:w-full lg:justify-center lg:gap-0" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${
                    isActive ? "bg-white/18" : "bg-white/10"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <span
                  className={`text-[12px] font-semibold tracking-[0.01em] ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  {link.label}
                </span>
              </div>

            </NavLink>
          );
        })}
      </nav>

      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #ffffff;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #ffffff;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
          border: 2px solid #ffffff;
        }
      `}</style>
    </aside>
  );
}
