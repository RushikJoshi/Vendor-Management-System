import { Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { LayoutDashboard, ShoppingCart, UserCircle2, CreditCard } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

const clientLinks = [
  { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/client/orders", label: "My Orders", icon: ShoppingCart },
  { to: "/client/pending-payments", label: "Pending Payments", icon: CreditCard }
];

export default function ClientLayout() {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white text-slate-900">
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <Sidebar
        links={clientLinks}
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
