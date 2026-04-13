import { NavLink, useLocation } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Building2,
  Circle
} from "lucide-react";

export default function Sidebar({
  links = [],
  isMobileOpen = false,
  isCollapsed = false,
  onClose = () => {},
  onToggleCollapse = () => {},
}) {
  const location = useLocation();

  // Group links logically for a more professional feel
  const groups = [
    {
      title: "Core",
      items: links.filter(l => ["Dashboard", "Applications"].includes(l.label))
    },
    {
      title: "Management",
      items: links.filter(l => ["Vendors", "Form Builder", "Categories", "RFQs", "Procurement", "Contracts"].includes(l.label))
    },
    {
      title: "System",
      items: links.filter(l => ["Users", "Settings"].includes(l.label))
    }
  ].filter(g => g.items.length > 0);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden border-r border-slate-200/60 bg-white/80 backdrop-blur-xl text-slate-600 shadow-xl transition-all duration-500 ease-in-out lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "lg:w-[5.5rem]" : "lg:w-[17rem]"}`}
    >
      {/* Brand Header */}
      <div className="relative flex h-20 items-center border-b border-slate-100 bg-white/50 px-6 backdrop-blur-xl">
        <div className="flex w-full items-center gap-3">
          <div className="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Building2 className="text-white" size={22} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">VMS<span className="text-indigo-600">PRO</span></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Enterprise</span>
            </div>
          )}
        </div>
        
        {/* Collapse Trigger (Floating) */}
        {!isMobileOpen && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-indigo-600 hover:text-white lg:flex"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        )}

        <button
          onClick={onClose}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-4 py-8">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            <div className="space-y-1.5">
              {group.items.map((link) => {
                const Icon = link.icon || Circle;
                const isActive = location.pathname === link.to;

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) => `
                      group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300
                      ${isActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                      }
                      ${isCollapsed ? "justify-center px-0" : ""}
                    `}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && <div className="absolute left-0 h-6 w-1 rounded-r-full bg-white/40" />}

                    <div className={`flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
                      <Icon size={isCollapsed ? 22 : 19} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    {!isCollapsed && (
                      <span className="truncate whitespace-nowrap">{link.label}</span>
                    )}

                    {/* Tooltip for Collapsed View */}
                    {isCollapsed && (
                      <div className="invisible absolute left-full ml-4 rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                        {link.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>



      <style>{`
        .sidebar-scroll {
          scrollbar-width: none;
        }
        .sidebar-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
}
