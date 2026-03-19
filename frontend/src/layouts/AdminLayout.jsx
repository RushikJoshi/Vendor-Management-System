import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { sidebarItems } from "../config/SidebarConfig";

import { normalizeRole, hasAccess } from "../config/roles";

export default function AdminLayout() {
  const { user } = useContext(AuthContext);

  const filteredLinks = sidebarItems.filter(item => {
    const userRole = normalizeRole(user?.role || "");
    return item.allowedRoles ? item.allowedRoles.includes(userRole) : hasAccess(userRole, item.requiredRole || "admin");
  }).map(item => ({

    to: item.path,
    label: item.label,
    icon: item.icon
  }));


  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* SaaS Sidebar (80 width / 20rem / 320px) */}
      <Sidebar links={filteredLinks} />
      
      <div className="flex-1 flex flex-col h-full ml-80 transition-all duration-300">
        {/* SaaS Navbar (20 height / 5rem / 80px) */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 mt-20 p-10 overflow-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Page Header (Optional Breadcrumbs logic could go here) */}
            <div className="relative z-10">
              <Outlet />
            </div>
            
            {/* Subtle brand background elements */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2"></div>
            <div className="fixed bottom-0 left-80 w-[400px] h-[400px] bg-emerald-50/20 rounded-full blur-[100px] -z-10 translate-y-1/2"></div>
          </div>
        </main>
      </div>
    </div>
  );
}