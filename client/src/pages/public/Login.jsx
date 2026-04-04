import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { getAdminLinksForUser } from "../../config/SidebarConfig";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users
} from "lucide-react";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Use standard normalization to handle all internal roles (Viewer, Manager, etc.)
      const normalizedRole = user?.role?.toLowerCase();
      
      if (normalizedRole === 'vendor') {
        navigate(user?.mustChangePassword ? "/vendor/change-password" : "/vendor/dashboard");
      } else {
        const adminLinks = getAdminLinksForUser(user, user?.allowedModules || []);
        navigate(adminLinks[0]?.to || "/admin/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying network node...");
    try {
      await login(email, password);
      toast.success("Welcome to VMS ERP", { id: toastId });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 429
          ? "Too many login attempts. Access throttled."
          : "Access Denied. Check your key.");

      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-['Inter',_sans-serif]">
      {/* LEFT SIDE: Centered Branding Focused (Vibrant Blue) */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-600 text-white flex-col items-center justify-center p-16 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-800/30 rounded-full blur-[100px]"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center flex flex-col items-center"
        >
          {/* Central Logo Box */}
          <div className="mb-12">
             <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4 border border-white/20"
             >
                <ShieldCheck size={48} className="text-blue-600" />
             </motion.div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-light tracking-[0.2em] leading-[1.2] uppercase text-white drop-shadow-lg">
                Infrastructure <br />
                <span className="font-bold opacity-100 text-blue-100">Procurement</span> <br />
                Portal
            </h1>
            <div className="h-0.5 w-24 bg-gradient-to-right from-transparent via-white/50 to-transparent mx-auto rounded-full"></div>
            <p className="text-sm text-blue-100/40 font-medium tracking-widest leading-relaxed max-w-sm mx-auto uppercase pt-2">
              The high-fidelity standard for global supply chain.
            </p>
          </div>

          <div className="flex justify-center gap-8 mt-12">
            {[
              { icon: <ShieldCheck size={16} />, text: "SECURE" },
              { icon: <Zap size={16} />, text: "EASY" },
              { icon: <Users size={16} />, text: "GLOBAL" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-[9px] font-black tracking-[0.3em] text-white/30 hover:text-white transition-all cursor-default group">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-500/30">
                    {item.icon}
                 </div>
                 {item.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Footer Elements */}
        <div className="absolute bottom-10 left-0 right-0 z-10 flex items-center justify-between px-16">
          <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Secure Hub: Connected</p>
          </div>
          <p className="text-[9px] font-black text-white/10 tracking-widest">V4.2.0</p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Mobile Header (Hidden on LG) */}
        <div className="lg:hidden p-8 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-100" />
                <span className="text-lg font-black uppercase tracking-tighter">VMS ERP</span>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-[440px]"
          >
            <div className="mb-10 lg:text-left text-center">
              <h2 className="text-[42px] font-bold text-slate-900 mb-2 leading-tight">Welcome Back</h2>
              <div className="h-1.5 w-16 bg-blue-600 mb-6 mx-auto lg:mx-0 rounded-full"></div>
              <p className="text-slate-500 text-[16px] font-medium">Please enter your credentials to access the ERP portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider ml-1">Corporate Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your corporate email"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-6 text-[15px] font-medium text-slate-900 focus:bg-white focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder-slate-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Access Password / Key</label>
                   <Link to="#" className="text-[11px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Forgot Key?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your access key"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-16 text-[15px] font-medium text-slate-900 focus:bg-white focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder-slate-300 shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 group mt-4 overflow-hidden"
              >
                {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10">Sign In to Dashboard</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap leading-none">Portal Onboarding</p>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <Link to="/register">
                <button className="w-full py-4.5 bg-white text-slate-900 text-[11px] font-bold uppercase tracking-widest rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all active:scale-95 shadow-sm">
                  Become a Strategic Partner
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Global Footer */}
        <div className="py-6 text-center border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em]">© 2026 INFRASTRUCTURE DIVISION VMS • GO GLOBAL</p>
        </div>
      </div>
    </div>
  );
}
