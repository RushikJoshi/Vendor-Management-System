import { Outlet } from "react-router-dom";
import { useState } from "react";
import { ClipboardCheck, FileSignature, FileText, LayoutDashboard, User, Zap } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const vendorLinks = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/applications", label: "My Applications", icon: FileText },
  { to: "/vendor/fill-form", label: "Protocol Fill", icon: ClipboardCheck },
  { to: "/vendor/rfqs", label: "RFQ Sync", icon: Zap },
  { to: "/vendor/contracts", label: "Commit Documents", icon: FileSignature },
  { to: "/vendor/profile", label: "Entity Profile", icon: User },
];

export default function VendorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <Sidebar
        links={vendorLinks}
        isMobileOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`relative z-10 flex min-h-screen flex-1 flex-col pl-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-[5.5rem]" : "lg:pl-[14.25rem]"
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
