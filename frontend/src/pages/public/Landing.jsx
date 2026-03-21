import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Command, 
  ShieldAlert, 
  Layers, 
  Lock,
  CheckCircle2,
  Sparkle,
  Sun,
  Moon,
  Users,
  Clock,
  LayoutDashboard
} from "lucide-react";

const DashboardMockup = () => (
  <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-300">
    <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors animate-pulse"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors"></div>
        <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors"></div>
      </div>
    </div>
    
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: <Users size={18} />, label: 'Vendors', value: '1,284', color: 'text-purple-500' },
          { icon: <CheckCircle2 size={18} />, label: 'Verified', value: '942', color: 'text-emerald-500' },
          { icon: <Clock size={18} />, label: 'Pending', value: '48', color: 'text-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-all hover:scale-[1.02] cursor-default">
            <div className={`flex items-center gap-2 ${stat.color} mb-3`}>
              {stat.icon}
              <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Recent Activity</div>
            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest cursor-pointer hover:underline">View All</div>
          </div>
          {[
            { name: 'Acme Corp', type: 'Tech Services', date: '2 min ago' },
            { name: 'Global Logistics', type: 'Shipping', date: '15 min ago' },
            { name: 'FinTech Solutions', type: 'Internal', date: '1 hour ago' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:border-purple-200 dark:hover:border-purple-900/50 group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs uppercase">
                {item.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{item.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 group-hover:text-purple-500 transition-colors uppercase tracking-widest">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform"></div>
          <div>
            <div className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Performance</div>
            <div className="text-4xl font-black text-white">99.2%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Network Uptime</div>
          </div>
          <div className="flex items-end gap-1.5 h-24 mt-8">
             {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
               <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white/10 rounded-t-sm transition-all hover:bg-purple-500 group-hover:bg-white/20"></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Landing() {
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

  const imagePath = "C:/Users/Dharmik Jethwani/.gemini/antigravity/brain/80658207-2011-400c-bd49-39bbc61586ac/vms_dashboard_mockup_landing_preview_1773936782415.png";

  return (
    <div className={`bg-[#f8fafc] dark:bg-slate-950 min-h-screen font-['Inter',sans-serif] selection:bg-purple-100 selection:text-purple-600 overflow-x-hidden transition-all duration-300 ${isDark ? 'dark' : ''}`}>

      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-[100] h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 dark:shadow-none">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase transition-colors group-hover:text-purple-600">VMS<span className="text-slate-500">PRO</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {[
              { name: 'Features', href: '#features' },
              { name: 'Dashboard', href: '#dashboard' },
              { name: 'Benefits', href: '#benefits' },
              { name: 'Network', href: '#network' }
            ].map(item => (
              <a 
                key={item.name} 
                href={item.href} 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-[0.05em]"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login">
              <button className="px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-purple-100 dark:shadow-none hover:shadow-xl hover:shadow-purple-200 transition-all transform active:scale-95">
                Join Network
              </button>
            </Link>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 transition-colors duration-300"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50 rounded-full text-purple-600 dark:text-purple-400 font-bold text-[11px] uppercase tracking-widest mb-8">
            <Sparkle size={14} className="animate-pulse" />
            The Gold Standard in Vendor Management
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-8">
            Manage Your <br className="hidden md:block" />
            <span className="animated-gradient-text">Global Network</span>
          </h1>

          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Streamline onboarding, ensure compliance, and gain real-time visibility into your vendor ecosystem with our intelligent VMS platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-[0_20px_40px_rgba(139,92,246,0.15)] hover:shadow-[0_25px_50px_rgba(139,92,246,0.25)] hover:-translate-y-1 transition-all flex items-center gap-2 btn-glow">
              Get Started <ArrowRight size={20} />
            </button>
            <button className="px-10 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-lg font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              Book Demo
            </button>
          </div>
        </motion.div>
      </section>


      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Zap className="text-purple-500" />, 
                title: "Onboarding Automation", 
                desc: "Switch from manual chaos to 1-click verified onboarding workflows." 
              },
              { 
                icon: <ShieldAlert className="text-blue-500" />, 
                title: "Compliance & Risk", 
                desc: "Hyper-automated KYC and security checks for every network node." 
              },
              { 
                icon: <BarChart3 className="text-purple-600" />, 
                title: "Real-Time Analytics", 
                desc: "Full-fidelity visibility into vendor performance and spend data." 
              },
              { 
                icon: <Sparkle className="text-blue-600" />, 
                title: "Smart Matching", 
                desc: "Intelligent vendor discovery powered by global performance metrics." 
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br from-purple-50 to-blue-50 dark:group-hover:from-purple-900/40 dark:group-hover:to-blue-900/40 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium transition-colors">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Dashboard Preview Section */}
      <section id="dashboard" className="py-24 px-6 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight lg:leading-tight">
              Powerful Dashboard at <br className="hidden md:block" /> <span className="text-purple-600">Your Fingertips</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-4">Intuitive management that scales with your enterprise needs.</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto max-w-5xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-4 shadow-2xl transition-colors duration-300 animate-float"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"></div>
            <DashboardMockup />
          </motion.div>
        </div>
      </section>


      {/* Benefits Section */}
      <section id="benefits" className="py-32 px-6 bg-slate-50/50 dark:bg-slate-900/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-purple-600 dark:text-purple-400 font-bold text-sm uppercase tracking-[0.3em] mb-4">Enterprise Benefits</p>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 transition-colors">Engineered for <br /><span className="text-slate-400 dark:text-slate-500 font-medium italic">High-Stakes Economy</span></h2>
              <div className="space-y-6">
                {[
                  { title: "Faster Onboarding", desc: "Reduce onboarding cycles from weeks to minutes with smart verification." },
                  { title: "Reduced Risk", desc: "Continuous monitoring for compliance shifts across your entire network." },
                  { title: "Better Decision Making", desc: "Spend every dollar with absolute certainty using deep financial insights." },
                  { title: "Cost Optimization", desc: "Unlock untapped efficiency scores through automated network analysis." }
                ].map((b, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2 transition-colors">{b.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed transition-colors">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6 relative"
            >
              <div className="absolute inset-0 bg-blue-100/30 dark:bg-blue-900/10 blur-[100px] rounded-full -z-10 translate-y-20"></div>
              <div className="space-y-6 pt-12">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transform hover:-rotate-2 transition-all">
                  <BarChart3 className="text-purple-500 mb-4" size={32} />
                  <p className="text-3xl font-black text-slate-900 dark:text-white">88%</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Faster Onboarding</p>
                </div>
                <div className="bg-slate-900 dark:bg-black p-8 rounded-3xl text-white transform hover:rotate-3 transition-all">
                  <Lock className="text-blue-400 mb-4" size={32} />
                  <p className="text-3xl font-black">Zero</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Compliance Gaps</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-purple-600 p-8 rounded-3xl text-white transform hover:rotate-2 transition-all">
                  <TrendingUp className="text-white/80 mb-4" size={32} />
                  <p className="text-3xl font-black">3.2x</p>
                  <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mt-1">ROI Multiplier</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transform hover:-rotate-1 transition-all">
                  <Command className="text-slate-900 dark:text-white mb-4" size={32} />
                  <p className="text-3xl font-black">1.2k</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Integrations</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer id="network" className="py-24 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800 rounded-lg flex items-center justify-center text-white">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">VMSPRO</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xs mb-8">
                Building the future of decentralized supply chain operations for global giants. Secure, fast, and intelligent.
              </p>
              <div className="flex gap-5">
                {['LinkedIn', 'Twitter', 'GitHub'].map(s => (
                  <span key={s} className="text-xs font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-widest cursor-pointer">{s}</span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">Solutions</h5>
              <ul className="space-y-4">
                {['Smart Registry', 'Vetting Engine', 'Spend Analysis', 'SLA Tracking'].map(l => (
                  <li key={l}><a href="#" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">Network</h5>
              <ul className="space-y-4">
                {['Browse Vendors', 'Global Standards', 'Sustainability', 'Trust Score'].map(l => (
                  <li key={l}><a href="#" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">SaaS Protocol</h5>
              <ul className="space-y-4">
                {['API Docs', 'Security Architecture', 'Uptime Status', 'Release Notes'].map(l => (
                  <li key={l}><a href="#" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">Privacy</h5>
              <ul className="space-y-4">
                {['Data Sovereignty', 'Terms of Use', 'Ethical Supply', 'License'].map(l => (
                  <li key={l}><a href="#" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 VMSPRO • High Contrast Protocol Active</p>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Mainnet Node Operational</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}