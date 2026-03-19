import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  LogIn,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  Building2,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const normalizedRole = user?.role?.toLowerCase();
      if (["admin", "hr", "manager"].includes(normalizedRole)) {
        console.log("User already logged in as", normalizedRole, "- Redirecting to Admin Dash");
        navigate("/admin/dashboard");
      } else if (normalizedRole === 'vendor') {
        console.log("User already logged in as vendor - Redirecting to Vendor Dash");
        navigate("/vendor/dashboard");
      }
    }
  }, [user, navigate]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying credentials...");
    try {
      await login(email, password);
      toast.success("Access Granted", { id: toastId });
    } catch (err) {
      toast.error("Authentication failed. Please check your credentials.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#E8F5EE] relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#0B5D3B]"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[12px] border border-gray-200 shadow-2xl overflow-hidden relative z-10">

        {/* Left Side: Corporate Identity */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0B5D3B] text-white">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <ShieldCheck size={32} className="text-white" />
              <div className="h-8 w-px bg-white/20"></div>
              <h1 className="text-xl font-bold tracking-tight uppercase">VMS ERP</h1>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tighter leading-none mb-6">
              Infrastructure <br />
              <span className="text-white/70">Procurement</span> <br />
              Portal
            </h2>
            <p className="text-sm text-white/60 font-medium leading-relaxed max-w-xs uppercase tracking-wider">
              Centralized vendor management system for large-scale infrastructure operations.
            </p>
          </div>

          <div className="space-y-6 border-t border-white/10 pt-8 mt-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldAlert size={16} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Secured Personnel Entry</p>
            </div>
            <p className="text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">Authorized Use Only. All activities are logged.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight uppercase">System Login</h2>
            <div className="h-1 w-12 bg-[#0B5D3B] mt-2"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email ID</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hginfra.com"
                  className="w-full bg-white border border-gray-200 rounded-[6px] py-2.5 pl-12 pr-4 text-sm font-semibold text-gray-900 focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] outline-none transition-all placeholder-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-[6px] py-2.5 pl-12 pr-4 text-sm font-semibold text-gray-900 focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] outline-none transition-all placeholder-gray-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-enterprise-primary py-3 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Login to ERP"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-12 pt-6 border-t border-gray-100 italic">
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider text-center">
              Partner Registration? <Link to="/register" className="text-[#0B5D3B] hover:underline underline-offset-4 font-extrabold uppercase ml-1">Apply Here</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
        © 2026 INFRASTRUCTURE DIVISION VMS
      </div>
    </div>
  );
}
