import { Outlet } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { ClipboardList, LayoutDashboard, UserCircle2 } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import { hasPermission } from "../config/permissions";

const vendorLinks = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "vendor_dashboard" },
  { to: "/vendor/rfqs", label: "My RFQs", icon: ClipboardList, permission: "vendor_rfq_view" },
  { to: "/vendor/submit-quotation", label: "Submit Quotation", icon: ClipboardList, permission: "vendor_quote_submit" },
  { to: "/vendor/profile", label: "My Profile", icon: UserCircle2, permission: "vendor_dashboard" },
];

export default function VendorLayout() {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const filteredLinks = useMemo(() => {
    return vendorLinks
      .filter((item) => hasPermission(user, item.permission))
      .map((item) => ({ to: item.to, label: item.label, icon: item.icon }));
  }, [user]);

  return (
    <div className="vendor-readable relative flex min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
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
        className={`relative z-10 flex min-h-screen flex-1 flex-col pl-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-[6rem]" : "lg:pl-[16rem]"
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
