import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LogIn,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  Building2,
  ExternalLink,
  ChevronRight,
  Zap,
  BarChart3,
  Sun,
  Moon,
  TrendingUp,
  Users
} from "lucide-react";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (user) {
      const normalizedRole = user?.role?.toLowerCase();
      if (["admin", "hr", "manager"].includes(normalizedRole)) {
        navigate("/admin/dashboard");
      } else if (normalizedRole === 'vendor') {
        navigate(user?.mustChangePassword ? "/vendor/change-password" : "/vendor/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Secure Login in progress...");
    try {
      await login(email, password);
      toast.success("Welcome to VMS ERP", { id: toastId });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 429
          ? "Too many login attempts. Please wait and try again."
          : "Access Denied. Check credentials.");

      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex bg-white dark:bg-slate-950 font-['Inter',_sans-serif] selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-500 ${isDark ? 'dark' : ''}`}>
      
      {/* LEFT SIDE: Brand Intensity (Full Height) */}
      <div className="hidden lg:flex w-[40%] flex-col justify-between p-16 bg-[#064e3b] text-white relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-3 mb-24 group w-fit">
            <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-emerald-400/30 group-hover:scale-105 transition-all">
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <div className="h-8 w-px bg-white/20 mx-2"></div>
            <span className="text-xl font-black tracking-tighter uppercase">VMS ERP</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-black tracking-tight leading-[1.1] mb-8">
              Infrastructure <br />
              <span className="text-emerald-400/80">Procurement</span> <br />
              Portal
            </h1>
            <p className="text-lg text-emerald-100/60 font-medium leading-relaxed max-w-sm mb-12">
              The high-fidelity standard for global supply chain and infrastructure vendor operations.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck size={20} />, text: "Enterprise Secured Access" },
                { icon: <Zap size={20} />, text: "Frictionless Operations" },
                { icon: <Users size={20} />, text: "Global Vendor Network" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-bold text-white/70 hover:text-white transition-all cursor-default group">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-emerald-500/20 transition-colors">{item.icon}</div>
                   {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 mt-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Secure Hub: Connected</p>
            </div>
            <p className="text-[10px] font-black text-white/20">V4.2.0</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form (Full Page Form) */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Toggle Theme Top Right */}
        <div className="absolute top-8 right-8 z-50">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-slate-500 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 md:p-20">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="mb-12">
              <div className="lg:hidden flex items-center gap-2 mb-8">
                 <ShieldCheck size={24} className="text-[#064e3b]" />
                 <span className="text-xl font-black text-[#064e3b]">VMS ERP</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-3">System Login</h2>
              <div className="h-1 w-12 bg-emerald-600 mb-6"></div>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">Authorized Personnel Only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Corporate Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-600 transition-all pointer-events-none" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hginfra.com"
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Key</label>
                   <a href="#" className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline active:scale-95 transition-all">Recover Key?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-600 transition-all pointer-events-none" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#064e3b] hover:bg-[#053d2e] text-white text-sm font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(6,78,59,0.3)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span className="text-[11px]">Verifying Node...</span>
                    </div>
                  ) : (
                    <>
                      Login to ERP
                      <ArrowRight size={18} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-16 text-center">
              <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                Partner Portal?
              </p>
              <Link to="/register">
                <button className="px-10 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-600/50 hover:bg-emerald-50/30 transition-all active:scale-95">
                  Request Access
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="p-10 border-t border-slate-50 dark:border-slate-900/50 text-center">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">© 2026 INFRASTRUCTURE DIVISION VMS</p>
        </div>
      </div>
    </div>
  );
}
