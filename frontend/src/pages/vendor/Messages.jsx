import { useEffect, useState } from "react";
import api from "../../services/api";
import { MessageSquare, Mail, Reply, Search, Filter, ChevronRight, Activity, ArrowUpRight, Terminal, ShieldCheck, Lock, Globe, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vendors/messages")
      .then((res) => setMsgs(res.data.data))
      .catch(() => toast.error("Failed to fetch transmission signals"))
      .finally(() => setLoading(false));
  }, []);

  const handleReply = (id) => {
    toast.success("Initializing Secure Reply Protocol...");
  };

  return (
    <div className="space-y-12 fade-in pb-20 mt-8">
      {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Communication Hub</span>
            <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Protocol Transmissions</span>
          </div>
          <div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-6 font-sans">Signal <span className="text-slate-300">Uplink</span></h1>
            <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6 lowercase tracking-tight leading-relaxed">Synchronizing direct communications with procurement officers and administrative nodes. Managing direct socket infrastructure with end-to-end operational encryption.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-subtle group cursor-pointer hover:border-slate-900 transition-all duration-500">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse transition-all group-hover:scale-125"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] group-hover:text-slate-900 transition-colors">Encryption Status: SHA-4096 VALID</span>
          </div>
        </div>
      </header>

      {/* ── REGISTRY CANVAS ───────────────────────────────────────────── */ }
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden relative">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-50/50">
          <div className="relative w-full md:w-[450px] group/search">
            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Communication Nodes..." 
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 transition-all outline-none shadow-inner placeholder-slate-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin Node</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject Payload</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Uplink</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {loading ? (
                  [1, 2, 3].map(i => (
                     <tr key={i} className="animate-pulse h-28 bg-slate-50/10"><td colSpan="4"></td></tr>
                  ))
                ) : msgs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-10 py-40 text-center grayscale opacity-80 group/empty relative overflow-hidden">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none group-hover/empty:scale-110 transition-transform duration-1000 grayscale">
                            <Layers size={600} strokeWidth={1} />
                        </div>
                      <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 group-hover/empty:bg-slate-900 group-hover/empty:text-white transition-all duration-500 shadow-inner">
                          <MessageSquare size={40} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Transmission Silence</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] max-w-[320px] mx-auto leading-relaxed italic border-l-2 border-slate-100 pl-6">Your secure communication queue is currently synchronized. No inbound signals detected in the buffer.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  msgs.map((m, idx) => (
                    <motion.tr 
                      key={m._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-[#FDFDFD] transition-all cursor-pointer border-l-4 border-transparent hover:border-slate-900"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-xl transition-all shadow-inner relative overflow-hidden">
                              <Activity size={18} strokeWidth={2.5} />
                              <div className="absolute inset-1 border border-slate-200 group-hover:border-white/10 rounded-xl border-dashed"></div>
                           </div>
                           <span className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none italic">Administrator_Node</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4 group/item">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-900 transition-colors"></div>
                            <span className="text-xs font-black text-slate-700 uppercase italic max-w-xs block truncate leading-none tracking-tight group-hover:text-slate-900 transition-colors">
                            {m.subject}
                            </span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1 tracking-widest font-black uppercase text-[9px]">
                          <span className="text-slate-900 leading-none">{new Date(m.createdAt).toLocaleDateString()}</span>
                          <span className="text-slate-300 font-mono mt-1">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} UTC</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleReply(m._id)}
                          className="h-14 px-8 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-2xl transition-all flex items-center gap-4 ml-auto group/btn active:scale-95 shadow-subtle group-hover:bg-[#FDFDFD]"
                        >
                          <Reply size={18} strokeWidth={2.5} className="group-hover/btn:-translate-x-1 transition-transform" /> Authorize Reply
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TERMINAL FOOTER ────────────────────────────────────────── */ }
      <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-12 group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-[0.02] rounded-full blur-[80px] -mr-40 -mt-20 group-hover:scale-[1.1] transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex items-center gap-8">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-2xl group-hover:bg-white group-hover:text-slate-900 transition-all duration-500 overflow-hidden relative">
                 <div className="absolute inset-2 border border-white/10 group-hover:border-slate-200 rounded-xl border-dashed"></div>
                 <Terminal size={24} strokeWidth={2.5} />
            </div>
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Administrative Uplink</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-relaxed italic border-l-2 border-white/10 pl-6 mt-3">Direct socket established with headquarters terminal cluster. Synchronized at 100% integrity.</p>
            </div>
        </div>
        
        <button className="relative z-10 h-16 px-12 bg-white text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald-400 hover:text-slate-900 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-6 overflow-hidden group/btn">
            Request Uplink Protocol <ArrowUpRight size={18} strokeWidth={2.5} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-all" />
        </button>
      </div>

      <style>{`
          .shadow-premium {
              box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
          }
          .shadow-subtle {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .fade-in {
                animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
      `}</style>
    </div>
  );
}