import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Facebook,
  HardHat,
  Linkedin,
  Map,
  Milestone,
  Send,
  Train,
  TrendingUp,
  Twitter,
  Users,
  Waves,
} from "lucide-react";
import PublicNavbar from "../../components/common/PublicNavbar";
import PublicFooter from "../../components/common/PublicFooter";

const stats = [
  { value: "20+", label: "Years of Experience", icon: Map },
  { value: "150+", label: "Projects Completed", icon: HardHat },
  { value: "5000+", label: "KM Road Built", icon: TrendingUp },
  { value: "3000+", label: "Team Strength", icon: Users },
];

const services = [
  {
    title: "Highways & Roadways",
    desc: "Pioneering in flexible and rigid pavement construction with a strong project execution fleet.",
    icon: Milestone,
  },
  {
    title: "Railways & Metro",
    desc: "Executing complex earthwork, bridges, and track laying for large public mobility programs.",
    icon: Train,
  },
  {
    title: "Water Management",
    desc: "Delivering canals, irrigation, and water infrastructure with durable engineering systems.",
    icon: Waves,
  },
];

const projects = [
  { title: "6-Lane NH Elevated Corridor", location: "Rajasthan", meta: "Completion: 2023 | Segment: Highways" },
  { title: "Greenfield Expressway Lot-4", location: "Uttar Pradesh", meta: "Completion: 2024 | Segment: Infrastructure" },
  { title: "Metro Line 4 Viaducts", location: "Maharashtra", meta: "Status: Ongoing | Segment: Urban Rail" },
];

const footerLinks = {
  "Quick Links": ["About Us", "Our Projects", "Leadership", "Careers", "Investor Relations"],
  Services: ["Highways & Roads", "Railways & Metro", "Water Infrastructure", "Solar Energy"],
};

const HERO_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/File:Aerial%20Photo%20of%20Temporary%20Work%20Bridge.jpg";

export default function Landing() {
  return (
    <div className="overflow-x-hidden bg-slate-50 font-['Inter',sans-serif] text-slate-900 dark:bg-slate-900 dark:text-white">
      <PublicNavbar />

      <header className="relative flex min-h-screen items-center overflow-hidden bg-[#001f3f] pb-40 pt-32">
        <div className="absolute inset-0 bg-[#001f3f]">
          <img src={HERO_IMAGE} alt="Bridge construction site" className="h-full w-full scale-105 object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,31,63,0.9),rgba(0,31,63,0.4))]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1540px] px-6">
          <div className="max-w-3xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px w-12 bg-[#0097a7]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#0097a7]">Pioneering Progress</span>
              <div className="h-px w-12 bg-[#0097a7]" />
            </div>
            <h1 className="mb-8 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-7xl">
              Excellence in <span className="text-[#0097a7]">Procurement</span> & Vendor Management
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
              Forging path-breaking solutions for vendor onboarding, compliance, and lifecycle management with over two decades of operational brilliance.
            </p>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 rounded-full bg-[#0097a7] px-8 py-4 text-base font-bold text-white transition-all hover:bg-white hover:text-[#001f3f] md:px-10 md:text-lg"
              >
                Explore Our Projects
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center rounded-full border-2 border-white px-8 py-4 text-base font-bold text-white transition-all hover:bg-white hover:text-[#001f3f] md:px-10 md:text-lg"
              >
                Our Expertise
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 animate-bounce text-white md:block">
          <ChevronDown size={32} className="opacity-70" />
        </div>
      </header>

      <section className="relative z-20 -mt-20 pb-20">
        <div className="mx-auto max-w-[1540px] px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="group flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-[#001f3f] transition-colors group-hover:bg-[#001f3f] group-hover:text-white">
                    <Icon size={30} />
                  </div>
                  <h3 className="text-4xl font-extrabold text-[#001f3f]">{item.value}</h3>
                  <p className="mt-2 font-medium text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-24">
        <div className="mx-auto flex max-w-[1540px] flex-col items-center gap-20 px-6 lg:flex-row">
          <div className="relative lg:w-1/2">
            <div className="absolute -left-10 -top-10 h-64 w-64 animate-pulse rounded-full bg-[#0097a7]/10 blur-3xl" />
            <img src={HERO_IMAGE} alt="Bridge construction site" className="relative z-10 w-full rounded-3xl shadow-2xl" />
            <div className="absolute -bottom-10 -right-10 z-20 hidden rounded-3xl bg-[#001f3f] p-10 shadow-2xl md:block">
              <p className="mb-2 text-5xl font-extrabold text-[#0097a7]">20+</p>
              <p className="font-medium text-white">States Presence<br />Across Bharat</p>
            </div>
          </div>

          <div className="lg:w-1/2">
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-[#0097a7]">Our Origin Story</span>
            <h2 className="mb-8 text-4xl font-extrabold text-[#001f3f] md:text-5xl">
              Redefining the Future of <br />Infrastructure
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-600">
              GT Vendor Management is a leading solution for procurement and infrastructure partnerships. We are committed to transparency, reliability, and excellence in every collaboration we undertake.
            </p>

            <div className="mb-10 space-y-6">
              {[
                ["Uncompromising Quality", "Adhering to global standards in safety and engineering excellence."],
                ["Timely Execution", "Known for delivering complex projects within stipulated timelines."],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-[#0097a7]/10 p-2 text-[#0097a7]">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#001f3f]">{title}</h4>
                    <p className="text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/about" className="inline-flex items-center gap-2 text-lg font-bold text-[#001f3f] underline decoration-[#0097a7] decoration-2 underline-offset-8 transition-colors hover:text-[#0097a7]">
              Learn More About Our Values
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-[1540px] px-6">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#0097a7]">Industrial Expertise</span>
            <h2 className="mt-4 text-4xl font-extrabold text-[#001f3f] md:text-5xl">Our Core Businesses</h2>
            <div className="mx-auto mb-6 mt-6 h-1 w-24 bg-[#0097a7]" />
            <p className="text-lg italic text-slate-500">"We don't just build structures; we build lifelines for the nation."</p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group rounded-3xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:border-[#0097a7] hover:shadow-2xl"
                >
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#001f3f] text-white transition-colors group-hover:rotate-6 group-hover:bg-[#0097a7]">
                    <Icon size={40} />
                  </div>
                  <h3 className="mb-4 text-2xl font-extrabold text-[#001f3f]">{service.title}</h3>
                  <p className="mb-8 leading-relaxed text-slate-500">{service.desc}</p>
                  <a href="#/" className="flex items-center gap-2 font-bold text-[#0097a7] transition-all group-hover:gap-4">
                    Details
                    <ChevronRight size={20} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
