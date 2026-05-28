import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ClientLogin() {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const normalizedRole = user?.role?.toLowerCase();
      if (normalizedRole === "client") {
        navigate(user?.mustChangePassword ? "/client/change-password" : "/client/dashboard");
      } else {
        // If an admin or vendor accidentally logs in here, redirect them to their respective dashboards
        if (normalizedRole === "vendor") {
          navigate(user?.mustChangePassword ? "/vendor/change-password" : "/vendor/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying client credentials...");

    try {
      await login(email, password, "client-portal");
      toast.success("Welcome to Client Portal", { id: toastId });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 429
          ? "Too many login attempts. Access throttled."
          : "Access Denied. Check your credentials.");

      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-['Inter',_sans-serif]">
      {/* Left Branding Area */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center border-r border-slate-200 bg-slate-50 px-10 xl:px-16 shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="flex w-full flex-col items-center justify-center"
        >
          <img
            src="/logo.png"
            alt="Client logo"
            className="h-auto w-full max-w-[560px] object-contain drop-shadow-sm"
          />
          <p className="mt-6 text-[22px] font-semibold uppercase tracking-[0.2em] text-[#0f172a]">
            Client Portal
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden p-8 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Client logo"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>

        {/* Login Form Area */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-[440px]"
          >
            <div className="mb-10 lg:text-left text-center">
              <h2 className="text-[42px] font-bold text-slate-900 mb-2 leading-tight">Client Access</h2>
              <div className="h-1.5 w-16 bg-slate-800 mb-6 mx-auto lg:mx-0 rounded-full"></div>
              <p className="text-slate-500 text-[16px] font-medium">Please enter your client credentials to access your orders and invoices.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-6 text-[15px] font-medium text-slate-900 focus:bg-white focus:border-slate-800/30 focus:ring-4 focus:ring-slate-800/5 outline-none transition-all placeholder-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <Link to="#" className="text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:underline hover:text-slate-900">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-16 text-[15px] font-medium text-slate-900 focus:bg-white focus:border-slate-800/30 focus:ring-4 focus:ring-slate-800/5 outline-none transition-all placeholder-slate-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 group mt-4 overflow-hidden"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10">Sign In to Portal</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
