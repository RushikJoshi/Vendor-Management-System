import { useEffect, useState } from "react";
import api from "../../services/api";
import { MessageSquare, Mail, Reply, Calendar, Search, Filter, MoreVertical, ChevronRight, User, Globe, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    setLoading(true);
    api.get("/admin/messages")
      .then((res) => setMessages(res.data.data))
      .catch(() => toast.error("Communication sync failure"))
      .finally(() => setLoading(false));
  };

  const handleReply = (id) => {
    toast.success("Protocol: Initializing secure response channel...");
  };

  return (
    <div className="space-y-12 fade-in pb-20">
      {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
          <div className="space-y-6">
              <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Messaging Hub</span>
                  <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Uplink Channel</span>
              </div>
              <div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Inbox</h1>
                  <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Unified communication terminal for managing vendor inquiries, protocol clarifications, and strategic partner dialogue.</p>
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <button className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
              <Mail size={18} /> Compose Dispatch
            </button>
          </div>
      </header>

      {/* ── MESSAGE LOG ────────────────────────────────────────────────── */ }
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
              <div className="relative w-full md:w-[450px]">
                  <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="text"
                      placeholder="Filter Communication Logs..."
                      className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                  />
              </div>

              <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                    Active Transmission: {messages.length} Units
                  </span>
              </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                  <thead>
                      <tr className="bg-slate-50/20">
                          <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin Node</th>
                          <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission Subject</th>
                          <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dossier Timestamp</th>
                          <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {loading ? (
                          [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="4"></td></tr>)
                      ) : messages.map((m, idx) => (
                          <motion.tr 
                              key={m._id} 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                          >
                              <td className="px-10 py-8">
                                  <div className="flex items-center gap-6">
                                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 shadow-inner transition-all relative overflow-hidden">
                                          <User size={18} />
                                          <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                      </div>
                                      <div>
                                          <p className="text-sm font-black text-slate-900 lowercase tracking-tight leading-none mb-1">{m.from}</p>
                                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">External Link</span>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-10 py-8">
                                  <div className="max-w-md">
                                      <p className="text-sm font-black text-slate-800 tracking-tight leading-none truncate group-hover:text-slate-900 transition-colors uppercase">{m.subject}</p>
                                      <p className="text-[10px] text-slate-400 font-bold mt-2 truncate italic uppercase">Inquiry ID: #{m._id?.slice(-6).toUpperCase()}</p>
                                  </div>
                              </td>
                              <td className="px-10 py-8">
                                  <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                      <Calendar size={12} className="text-slate-200" />
                                      {new Date(m.createdAt).toLocaleDateString('en-IN')}
                                  </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                  <div className="flex items-center justify-end gap-3 transition-opacity">
                                      <button 
                                          onClick={() => handleReply(m._id)}
                                          className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:border-slate-900 border border-transparent rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-subtle group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-xl"
                                      >
                                          <Reply size={14} /> Reply
                                      </button>
                                      <button className="p-2 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                          <MoreVertical size={18} />
                                      </button>
                                  </div>
                              </td>
                          </motion.tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {!loading && messages.length === 0 && (
              <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                      <MessageSquare size={48} strokeWidth={1} />
                  </div>
                  <p className="font-black uppercase tracking-[0.3em] text-xs">No active transmissions detected</p>
                  <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Your inbox is clear.</p>
              </div>
          )}
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
      `}</style>
    </div>
  );
}