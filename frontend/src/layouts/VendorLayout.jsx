import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { LayoutDashboard, User, FileText, MessageCircle, ClipboardCheck, Zap, FileSignature } from "lucide-react";

const links = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/applications", label: "My Applications", icon: FileText },
  { to: "/vendor/fill-form", label: "Fill Form", icon: ClipboardCheck },
  { to: "/vendor/rfqs", label: "RFQ Response", icon: Zap },
  { to: "/vendor/contracts", label: "Contracts", icon: FileSignature },
  { to: "/vendor/profile", label: "My Profile", icon: User },
];


export default function VendorLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar links={links} />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-pink-500/5 blur-[120px] -z-0 pointer-events-none"></div>

        <Navbar />
        <div className="flex-1 overflow-auto pt-28 px-8 pb-8 relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}