import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { sidebarItems } from "../config/SidebarConfig";

import { normalizeRole, hasAccess } from "../config/roles";

export default function AdminLayout() {
  const { user, allowedModules } = useContext(AuthContext);

  const filteredLinks = sidebarItems.filter(item => {
    if (user?.role === "admin") return true;
    if (allowedModules && allowedModules.length > 0) {
        return allowedModules.includes(item.label) || allowedModules.includes(item.key);
    }
    const userRole = normalizeRole(user?.role || "");
    return item.allowedRoles ? item.allowedRoles.includes(userRole) : hasAccess(userRole, item.requiredRole || "admin");
  }).map(item => ({
    to: item.path,
    label: item.label,
    icon: item.icon
  }));


  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar links={filteredLinks} />
      
      <div className="flex-1 flex flex-col h-full ml-64 transition-all duration-300">
        <Navbar />
        
        <main className="flex-1 mt-20 p-8 overflow-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}