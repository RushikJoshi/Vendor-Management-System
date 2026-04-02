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
      className={`fixed left-0 top-0 bottom-0 z-50 flex w-[16rem] flex-col overflow-hidden border-r border-sky-200/70 bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_100%)] shadow-[18px_0_36px_rgba(15,76,129,0.08)] transition-all duration-300 lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "lg:w-[6rem]" : "lg:w-[16rem]"}`}
    >
      <div className="border-b border-sky-100 bg-transparent px-4 py-4">
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
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto bg-transparent py-3">
        {links.map((link) => {
          const Icon = link.icon || LayoutDashboard;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              title={isCollapsed ? link.label : undefined}
              className={`group mx-1.5 mb-2 flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "border-sky-200 bg-[linear-gradient(90deg,#d8efff_0%,#c9e7ff_100%)] text-sky-900 shadow-[0_8px_18px_rgba(59,130,246,0.18)]"
                  : "border-sky-100 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/70"
              } ${isCollapsed ? "lg:justify-center lg:px-2 lg:py-3.5" : ""}`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isCollapsed ? "lg:w-full lg:justify-center lg:gap-0" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${
                    isActive ? "bg-sky-100 text-sky-700" : "bg-sky-50 text-sky-700/90"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <span className={`text-[14px] font-medium ${isCollapsed ? "lg:hidden" : ""}`}>
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
