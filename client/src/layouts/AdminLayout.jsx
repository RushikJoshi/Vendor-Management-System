import { Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getAdminLinksForUser } from "../config/SidebarConfig";

export default function AdminLayout() {
  const { user, allowedModules } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const filteredLinks = getAdminLinksForUser(user, allowedModules);

  return (
    <div className="admin-readable relative flex min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f3eb_0%,#f4efe6_26%,#f8f7f3_58%,#fbfaf7_100%)] text-slate-900 selection:bg-amber-200 selection:text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-emerald-100/20 blur-3xl" />
      </div>

      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <Sidebar
        links={filteredLinks}
        isMobileOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`relative z-10 flex min-h-screen flex-1 flex-col pl-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:pl-[5.5rem]" : "lg:pl-[17rem]"
          }`}
      >
        <Navbar
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
          onDesktopToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="no-scrollbar mt-[4.25rem] flex-1 overflow-auto px-2 pb-4 pt-2 scroll-smooth sm:px-3 lg:mt-[4.5rem] lg:px-4">
          <div className="mx-auto max-w-none">
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
