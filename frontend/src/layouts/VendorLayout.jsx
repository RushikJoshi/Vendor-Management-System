import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { 
  LayoutDashboard, User, FileText, MessageCircle, ClipboardCheck, 
  Zap, FileSignature, Layers, ShieldCheck, Mail, Settings 
} from "lucide-react";
import { motion } from "framer-motion";

const vendorLinks = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Operational Nexus" },
  { to: "/vendor/applications", label: "My Applications", icon: FileText, desc: "Registry Ingress" },
  { to: "/vendor/fill-form", label: "Protocol Fill", icon: ClipboardCheck, desc: "Asset Injection" },
  { to: "/vendor/rfqs", label: "RFQ Sync", icon: Zap, desc: "Market Flux" },
  { to: "/vendor/contracts", label: "Commit Documents", icon: FileSignature, desc: "Legal Framework" },
  { to: "/vendor/profile", label: "Entity Profile", icon: User, desc: "Identity Node" },
];

export default function VendorLayout() {
  return (
    <div className="flex h-screen bg-white font-sans selection:bg-slate-900 selection:text-white">
      {/* ── SIDEBAR TRANSITION ─────────────────────────────────────────── */}
      <Sidebar links={vendorLinks} type="vendor" />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* ── NAVIGATION CORE ─────────────────────────────────────────── */}
        <Navbar />

        {/* ── SCROLLABLE CANVAS ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pt-28 px-8 lg:px-12 pb-12 bg-white relative z-10 transition-all duration-700">
           <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
              <Outlet />
              
              {/* ── FOOTER ARTIFACT ─────────────────────────────────────── */}
              <footer className="mt-auto pt-20 pb-8 flex flex-col md:flex-row items-center justify-between border-t border-slate-50 opacity-40 hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-4 mb-6 md:mb-0">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                      AG
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                      Antigravity <span className="text-slate-400">Procurement VMS_CORE</span>
                    </p>
                 </div>
                 <div className="flex items-center gap-8">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency: 14ms</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encryption: AES-256</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ver: 4.2.0_STABLE</span>
                 </div>
              </footer>
           </div>
        </div>

        {/* ── DESIGN ELEMENTS (SUBTLE) ─────────────────────────────────── */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none -z-0"></div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        ::selection {
          background-color: #0f172a;
          color: white;
        }

        @media (max-width: 1024px) {
          .ml-64 { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}