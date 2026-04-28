import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Award, 
  Settings, 
  Shield, 
  Quote, 
  ShieldCheck, 
  Clock, 
  Target, 
  Users2, 
  TrendingUp, 
  CheckCircle2, 
  Eye,
  Rocket,
  Linkedin,
  Mail,
  ChevronRight,
  ArrowUpRight,
  Building2,
  HardHat,
  Globe2
} from "lucide-react";
import PublicNavbar from "../../components/common/PublicNavbar";
import PublicFooter from "../../components/common/PublicFooter";

const SectionHeading = ({ subtitle, title, dark = false }) => (
  <div className="mb-16 text-left">
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 text-[#0097a7] mb-4"
    >
      <div className="h-px w-12 bg-[#0097a7]"></div>
      <span className="font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">{subtitle}</span>
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-4xl md:text-6xl font-black ${dark ? 'text-white' : 'text-[#001f3f]'} leading-[1.1] tracking-tighter font-['Montserrat']`}
    >
      {title}
    </motion.h2>
  </div>
);

const AboutUs = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { label: "Founded", value: "2003", icon: Building2, color: "from-blue-500 to-indigo-600" },
    { label: "States", value: "20+", icon: Globe2, color: "from-emerald-500 to-teal-600" },
    { label: "Workforce", value: "3000+", icon: HardHat, color: "from-orange-500 to-red-600" },
    { label: "Success Rate", value: "99%", icon: TrendingUp, color: "from-purple-500 to-pink-600" },
  ];

  return (
    <div className="bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#0097a7] selection:text-white dark:bg-[#020617] dark:text-white overflow-hidden">
      <PublicNavbar />

      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=2000" 
            alt="Engineering Excellence" 
            className="w-full h-[120%] object-cover scale-110"
          />
          <div className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-[2px]"></div>
          {/* Blueprint Grid Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-2 px-6 rounded-full bg-[#0097a7] text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8 shadow-xl shadow-[#0097a7]/20">
                Engineering Tomorrow's India
              </span>
              <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter font-['Montserrat'] leading-[0.9]">
                OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0097a7] to-white">LEGACY</span>.
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl leading-relaxed font-light mb-12 border-l-4 border-[#0097a7] pl-8">
                For over two decades, H.G. Infra has been the silent engine behind Bharat's infrastructure transformation, delivering excellence one milestone at a time.
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="px-10 py-5 bg-white text-[#001f3f] font-bold rounded-2xl flex items-center gap-3 hover:bg-[#0097a7] hover:text-white transition-all duration-500 shadow-2xl group">
                  EXPLORE TIMELINE <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Breadcrumb */}
        <div className="absolute bottom-12 left-6 right-6">
          <div className="container mx-auto px-6">
             <nav className="flex items-center space-x-3 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-[#0097a7]" />
              <span className="text-white">Our Legacy</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Overlap */}
      <section className="relative z-20 -mt-24 pb-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
                  <stat.icon size={28} />
                </div>
                <h4 className="text-4xl font-black text-[#001f3f] dark:text-white mb-2 font-['Montserrat'] tracking-tighter">{stat.value}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Split */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <SectionHeading subtitle="Who We Are" title="Precision Engineering, Built on Trust" />
              <div className="space-y-8 relative">
                {/* Decorative Side Line */}
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0097a7] to-transparent rounded-full opacity-30"></div>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                  "Established in 2003, H.G. Infra Engineering Limited has evolved from a local executor to a national benchmark in infrastructure development."
                </p>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Our core strength lies in our technical brilliance and a massive fleet of modern machinery. We specialize in EPC projects for Highways, Railways, and Water Management, ensuring every square inch we build is a testament to India's growing might.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#0097a7]/10 flex items-center justify-center text-[#0097a7]">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-[#001f3f] dark:text-white mb-1">Modern Fleet</h5>
                      <p className="text-sm text-slate-500">In-house inventory of 2000+ specialized machines.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#0097a7]/10 flex items-center justify-center text-[#0097a7]">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-[#001f3f] dark:text-white mb-1">Safety First</h5>
                      <p className="text-sm text-slate-500">Zero-accident goal with global safety protocols.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
               <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800"
              >
                <img src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=1200" alt="Construction Progress" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/60 to-transparent"></div>
              </motion.div>
              
              {/* Floating Highlight */}
              <div className="absolute -bottom-12 -right-6 z-20 bg-[#0097a7] text-white p-10 rounded-[2.5rem] shadow-2xl shadow-[#0097a7]/30 max-w-[280px]">
                <p className="text-5xl font-black mb-2 font-['Montserrat']">ISO</p>
                <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">Certified Excellence In Management & Safety</p>
              </div>
              
              {/* Animated Blueprint Element */}
              <div className="absolute -top-12 -left-12 w-64 h-64 border-2 border-slate-200 dark:border-white/10 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission - Glass Cards */}
      <section className="py-32 bg-[#001f3f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <SectionHeading subtitle="Our Purpose" title="Driving Sustainable Progress" dark />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
            <motion.div 
              whileHover={{ y: -20 }}
              className="group p-12 rounded-[4rem] bg-white/5 backdrop-blur-2xl border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 text-[#0097a7]/5 group-hover:text-[#0097a7]/10 transition-colors pointer-events-none">
                <Eye size={240} strokeWidth={1} />
              </div>
              <div className="w-20 h-20 bg-[#0097a7] rounded-3xl flex items-center justify-center text-white mb-10 shadow-xl shadow-[#0097a7]/20 group-hover:rotate-[15deg] transition-transform duration-500">
                <Eye size={40} />
              </div>
              <h3 className="text-4xl font-black text-white mb-8 tracking-tighter font-['Montserrat']">OUR VISION</h3>
              <p className="text-xl text-slate-300 leading-relaxed font-light">
                To be India's most admired infrastructure pioneer, creating engineering marvels that power the nation's growth while setting global standards in integrity and quality.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -20 }}
              className="group p-12 rounded-[4rem] bg-white/5 backdrop-blur-2xl border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 text-[#0097a7]/5 group-hover:text-[#0097a7]/10 transition-colors pointer-events-none">
                <Rocket size={240} strokeWidth={1} />
              </div>
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#001f3f] mb-10 shadow-xl group-hover:rotate-[15deg] transition-transform duration-500">
                <Rocket size={40} />
              </div>
              <h3 className="text-4xl font-black text-white mb-8 tracking-tighter font-['Montserrat']">OUR MISSION</h3>
              <p className="text-xl text-slate-300 leading-relaxed font-light">
                Executing complex projects with technical ingenuity, adopting sustainable technologies, and delivering unparalleled value to our stakeholders.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership - Premium Layout */}
      <section className="py-32 bg-white dark:bg-[#020617]">
        <div className="container mx-auto px-6">
          <SectionHeading subtitle="Leadership" title="Architects of our Success" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
            {[
              { 
                name: "Harendra Singh", 
                role: "Chairman & MD", 
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
                desc: "A visionary with 25+ years in infrastructure, driving H.G. Infra to national heights."
              },
              { 
                name: "Girishpal Singh", 
                role: "Whole-time Director", 
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
                desc: "Specialist in project execution and optimizing supply chain for massive highway projects."
              },
              { 
                name: "Rajeev Singh", 
                role: "CEO & Director", 
                image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
                desc: "Leading the company's modernization and digital transformation in engineering."
              }
            ].map((leader, idx) => (
              <motion.div 
                key={leader.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl">
                  <img src={leader.image} alt={leader.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                  
                  {/* Social Overlay */}
                  <div className="absolute bottom-10 left-10 right-10 flex flex-col translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h4 className="text-3xl font-black text-white font-['Montserrat'] mb-1 tracking-tight">{leader.name}</h4>
                    <p className="text-[#0097a7] font-bold uppercase tracking-widest text-xs mb-4">{leader.role}</p>
                    <div className="flex gap-4">
                      <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#0097a7] transition-all"><Linkedin size={18} /></a>
                      <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#0097a7] transition-all"><Mail size={18} /></a>
                    </div>
                  </div>
                </div>
                <div className="mt-8 px-4">
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic">"{leader.desc}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Values - Icon Grid */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-6">
          <SectionHeading subtitle="Our Values" title="The Pillars of H.G. Infra" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
            {[
              { 
                title: "INTEGRITY", 
                icon: Shield, 
                desc: "Unwavering commitment to honesty and ethical practices in every contract and relationship." 
              },
              { 
                title: "QUALITY", 
                icon: Award, 
                desc: "Engineering marvels that stand the test of time, adhering to rigorous global quality standards." 
              },
              { 
                title: "TIMELINES", 
                icon: Clock, 
                desc: "Recognized for delivering multi-billion projects ahead of schedule without compromising safety." 
              }
            ].map((v, idx) => (
              <motion.div 
                key={v.title}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-white/5 group text-center"
              >
                <div className="w-24 h-24 bg-[#001f3f] rounded-[2rem] flex items-center justify-center text-white mb-10 mx-auto group-hover:bg-[#0097a7] group-hover:rotate-[15deg] transition-all duration-500 shadow-2xl">
                  <v.icon size={40} />
                </div>
                <h3 className="text-2xl font-black text-[#001f3f] dark:text-white mb-6 font-['Montserrat']">{v.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-[#020617]">
        <div className="container mx-auto px-6 text-center">
          <Quote className="mx-auto w-20 h-20 text-[#0097a7] opacity-20 mb-12" />
          <h2 className="text-4xl md:text-6xl font-light text-[#001f3f] dark:text-white italic leading-[1.2] max-w-5xl mx-auto font-['Montserrat']">
            "We don't just build roads; we pave the way for a <span className="font-black text-[#0097a7]">Prosperous Bharat</span>."
          </h2>
          <div className="mt-12 flex items-center justify-center gap-4">
             <div className="h-px w-20 bg-slate-300"></div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Our Management's Motto</p>
             <div className="h-px w-20 bg-slate-300"></div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutUs;
