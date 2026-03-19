import { Link } from "react-router-dom";
import Button from "../../components/Button";
import {
  ShieldCheck, ArrowRight, Users,
  BarChart3, Globe, Zap, CheckCircle2,
  Building, Mail, Phone, ExternalLink,
  Layers, Lock, Sparkles, Command
} from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-[#FCFCFD] min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-bounce duration-[10000ms]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div className="px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-white">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">VMS<span className="text-indigo-600 italic">PRO</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Solutions', 'Network', 'Security', 'Enterprise'].map(item => (
              <a key={item} href="#" className="text-[13px] font-black text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-widest">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-widest hidden sm:block">Sign In</Link>
            <Link to="/register">
              <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl shadow-xl shadow-slate-200 text-[11px] font-black uppercase tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 hover:bg-indigo-600">
                Join Network
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-56 pb-32 px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm text-indigo-700 font-black text-[10px] uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={14} className="text-amber-400" />
            The Gold Standard in Supply Chain Orchestration
          </div>

          <h1 className="text-7xl md:text-[9.5rem] font-black text-slate-900 tracking-[-0.04em] leading-[0.88] mb-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Command Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 italic pr-4">Global Network</span>
          </h1>

          <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-16 leading-[1.6] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Automate onboarding, enforce hyper-compliance, and unlock deep procurement intelligence with our precision-engineered vendor ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link to="/register">
              <button className="group relative px-12 py-6 bg-slate-900 text-white text-lg font-black tracking-tight rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.15)] overflow-hidden transition-all hover:bg-slate-800 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-3">
                  Start Onboarding <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>

            <div className="flex items-center gap-5 p-2 pr-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <div className="flex -space-x-3 ml-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-12 h-12 rounded-full border-4 border-white ${i % 2 === 0 ? 'bg-indigo-100' : 'bg-slate-100'} flex items-center justify-center text-[10px] font-black`}>NC</div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Global Trusted Nodes</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">500+ Fortune 1000 Corps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento-style Features */}
      <section className="py-32 px-6 bg-[#0B0C10] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <p className="text-indigo-400 font-black text-[11px] uppercase tracking-[0.4em] mb-4">Core Capabilities</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">Elite Infrastructure for <span className="text-slate-500">Modern Supply Chains</span></h2>
            </div>
            <p className="text-slate-400 font-medium text-lg max-w-sm">
              Scale without friction using our distributed compliance and lifecycle management protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full md:h-[600px]">
            {/* Box 1 */}
            <div className="md:col-span-8 bg-slate-900/50 border border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] group-hover:bg-indigo-600/20 transition-all"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-indigo-400 border border-white/10">
                    <Command size={32} />
                  </div>
                  <h3 className="text-3xl font-black mb-4">Centralized Intelligence</h3>
                  <p className="text-slate-400 text-lg font-medium max-w-md">Command entire vendor lifecycles from a single, high-fidelity dashboard designed for maximum visibility.</p>
                </div>
                <div className="flex gap-4 mt-8">
                  <div className="px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest">Live Monitoring</div>
                  <div className="px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest">Deep Analytics</div>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="md:col-span-4 bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden group transform transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 text-white border border-white/30 backdrop-blur-sm">
                  <Lock size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black mb-4">Zero Trust Compliance</h3>
                  <p className="text-indigo-100 font-medium">Hyper-secure verification protocol ensuring every node in your network meets ISO/NIST standards.</p>
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div className="md:col-span-4 bg-slate-900 border border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden group hover:border-purple-500/50 transition-all duration-500">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-purple-400 border border-white/10">
                  <Layers size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4">Modular Registry</h3>
                <p className="text-slate-400 font-medium">Build custom onboarding flows tailored to regional laws and specific business units.</p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="md:col-span-8 bg-gradient-to-r from-slate-900 to-slate-800 border border-white/5 rounded-[3.5rem] p-12 flex items-center justify-between relative group hover:border-emerald-500/50 transition-all">
              <div className="max-w-md">
                <h3 className="text-3xl font-black mb-4">Predictive Risk Engine</h3>
                <p className="text-slate-400 font-medium">Identify supply chain bottlenecks before they manifest with our AI-driven analytics module.</p>
              </div>
              <div className="hidden lg:flex gap-4">
                <BarChart3 size={80} className="text-emerald-500/20 group-hover:text-emerald-500/40 transition-all scale-150 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Integration Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[4rem] p-12 md:p-24 border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 max-w-2xl">
              <p className="text-indigo-600 font-black text-[11px] uppercase tracking-[0.4em] mb-6 animate-pulse">Enterprise Ready</p>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
                Seamless <span className="italic text-slate-400">SAP & ERP</span> <br /> Node Integration
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Connect VMSPRO to your existing technological stack in minutes with our high-throughput REST API.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-6 w-full md:w-auto">
              <Link to="/register">
                <button className="w-full px-12 py-6 bg-slate-900 text-white text-xl font-black rounded-3xl hover:bg-indigo-600 transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200 flex items-center justify-center gap-4">
                  Request Access <ExternalLink size={24} />
                </button>
              </Link>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol v4.0.2 Stable Release</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fine-Print Footer */}
      <footer className="py-32 px-6 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={22} />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">VMSPRO</span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm mb-12 text-lg leading-relaxed">
                Next-generation vendor lifecycle management engineered for high-growth global enterprises.
              </p>
              <div className="flex gap-6">
                {['LinkedIn', 'Twitter', 'GitHub', 'Docs'].map(item => (
                  <div key={item} className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer uppercase tracking-widest">{item}</div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-10 text-indigo-600">Infrastructure</h4>
              <ul className="space-y-6">
                {['Smart Onboarding', 'Active Compliance', 'Audit Intelligence', 'Custom Workflows'].map(item => (
                  <li key={item}><a href="#" className="text-slate-500 hover:text-slate-900 font-bold text-sm tracking-tight transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-10 text-indigo-600">Company</h4>
              <ul className="space-y-6">
                {['Strategic Partners', 'Network Status', 'Compliance Standards', 'Global Mission'].map(item => (
                  <li key={item}><a href="#" className="text-slate-500 hover:text-slate-900 font-bold text-sm tracking-tight transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-20 mt-20 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">All Systems Operational • Protocol AES-256 Enabled</p>
            </div>
            <div className="flex gap-12">
              <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-indigo-600">Legal Architecture</a>
              <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-indigo-600">Data Sovereignity</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}