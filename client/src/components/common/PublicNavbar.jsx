import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { aboutMenu, projectMenu, investorMenu } from "../../config/menuConfig";

function MegaMenu({ sections, featuredTitle, featuredCta }) {
  return (
    <div className="invisible absolute left-0 top-full z-50 w-full border-t border-white/10 bg-[#001f3f] opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:opacity-100">
      <div className="mx-auto grid max-w-[1540px] grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0097a7]">{section.title}</h4>
            <ul className="space-y-4 text-sm">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    {item.path ? (
                      <Link to={item.path} className="group/link flex items-start gap-3 text-white/70 transition-colors hover:text-white">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#0097a7] transition-colors group-hover/link:bg-[#0097a7] group-hover/link:text-white">
                          <Icon size={16} />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-bold">{item.label}</span>
                          {item.meta ? <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">{item.meta}</span> : null}
                        </span>
                      </Link>
                    ) : (
                      <a href="#/" className="group/link flex items-start gap-3 text-white/70 transition-colors hover:text-white">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#0097a7] transition-colors group-hover/link:bg-[#0097a7] group-hover/link:text-white">
                          <Icon size={16} />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-bold">{item.label}</span>
                          {item.meta ? <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">{item.meta}</span> : null}
                        </span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="h-full bg-[linear-gradient(135deg,rgba(0,151,167,0.28),rgba(0,31,63,0.96))] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0097a7]">Featured</p>
            <h5 className="mt-4 text-2xl font-extrabold text-white">{featuredTitle}</h5>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Built with a stronger engineering-first visual style, richer navigation, and a premium corporate presentation.
            </p>
            <a
              href="#/"
              className="mt-8 inline-flex rounded-lg bg-[#0097a7] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-[#001f3f]"
            >
              {featuredCta}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicNavbar() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState("about");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleSection = (section) => {
    setMobileSection((current) => (current === section ? "" : section));
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 py-4 md:py-6 bg-[#001f3f]/80 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between px-4 md:px-6">
          <Link to="/" className="group flex items-center">
            <div className="relative mr-3 h-12 w-12 transition-transform duration-1000 group-hover:rotate-[360deg]">
              <div className="flex h-full w-full items-center justify-center rounded-full border border-[#ffb400]/50 bg-white/95 shadow-lg">
                <Shield className="text-[#001f3f]" size={24} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-['Roboto_Condensed',sans-serif] text-2xl font-bold leading-none tracking-tight text-white">HG INFRA</span>
              <span className="mt-1 hidden text-[10px] uppercase tracking-[0.2em] text-slate-300 md:block">Engineering Ltd.</span>
            </div>
          </Link>

          <div className="ml-auto hidden items-center lg:flex">
            <Link to="/" className="px-4 py-2 font-medium text-white transition-colors hover:text-[#0097a7]">Home</Link>

            <div className="group">
              <button className="flex items-center gap-1 px-4 py-2 font-medium text-white transition-colors group-hover:text-[#0097a7]">
                About Us
                <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />
              </button>
              <MegaMenu sections={aboutMenu} featuredTitle="Leading India's Infrastructure Revolution" featuredCta="Learn More" />
            </div>

            <a href="#services" className="px-4 py-2 font-medium text-white transition-colors hover:text-[#0097a7]">Services</a>

            <div className="group">
              <button className="flex items-center gap-1 px-4 py-2 font-medium text-white transition-colors group-hover:text-[#0097a7]">
                Projects
                <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />
              </button>
              <MegaMenu sections={projectMenu} featuredTitle="Roads & Highways Portfolio" featuredCta="Portfolio" />
            </div>

            <div className="group">
              <button className="flex items-center gap-1 px-4 py-2 font-medium text-white transition-colors group-hover:text-[#0097a7]">
                Investors
                <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />
              </button>
              <MegaMenu sections={investorMenu} featuredTitle="Investor Relations Dashboard" featuredCta="View Dashboard" />
            </div>

            <a href="#/" className="px-4 py-2 font-medium text-white transition-colors hover:text-[#0097a7]">Careers</a>
          </div>

          <div className="ml-6 flex items-center gap-4">
            <Link
              to="/login"
              className="hidden rounded-full border border-white/40 px-6 py-2.5 font-semibold text-white transition-all hover:bg-white hover:text-[#001f3f] md:block"
            >
              Log In
            </Link>
            <Link
              to="/contact"
              className="hidden rounded-full bg-[#0097a7] px-6 py-2.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#001f3f] hover:shadow-xl md:block"
            >
              Contact Us
            </Link>
            <button
              onClick={() => setIsDark((current) => !current)}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={30} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[70] flex transform flex-col overflow-y-auto bg-[#001f3f] transition-transform duration-500 md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Shield className="text-[#001f3f]" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white">HG INFRA</span>
              <span className="mt-1 text-[8px] uppercase tracking-widest text-slate-400">Engineering Ltd.</span>
            </div>
          </div>
          <button className="rounded-lg bg-white/10 p-2 text-white" onClick={() => setMobileOpen(false)}>
            <X size={30} />
          </button>
        </div>

        <div className="flex-1 px-6 py-8">
          <nav className="space-y-6 text-left">
            <Link to="/" className="block text-2xl font-bold text-white transition-colors hover:text-[#0097a7]" onClick={() => setMobileOpen(false)}>Home</Link>

            {[
              ["about", "About Us", aboutMenu],
              ["projects", "Projects", projectMenu],
              ["investors", "Investors", investorMenu],
            ].map(([key, label, sections]) => (
              <div key={key} className="space-y-4 text-left">
                <button
                  className="flex w-full items-center justify-between text-2xl font-bold text-white transition-colors hover:text-[#0097a7]"
                  onClick={() => toggleSection(key)}
                >
                  {label}
                  <ChevronDown size={24} className={`transition-transform ${mobileSection === key ? "rotate-180" : ""}`} />
                </button>
                <div className={`${mobileSection === key ? "block" : "hidden"} ml-2 space-y-6 border-l-2 border-[#0097a7]/30 pl-4`}>
                  {sections.map((section) => (
                    <div key={section.title} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#0097a7]/70">{section.title}</h4>
                      {section.items.map((item) => (
                        item.path ? (
                          <Link key={item.label} to={item.path} className="block py-1 font-normal text-white/80 transition-colors hover:text-white" onClick={() => setMobileOpen(false)}>
                            {item.label}
                          </Link>
                        ) : (
                          <a key={item.label} href="#/" className="block py-1 font-normal text-white/80 transition-colors hover:text-white">
                            {item.label}
                          </a>
                        )
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <a href="#services" className="block text-2xl font-bold text-white transition-colors hover:text-[#0097a7]">Services</a>
            <Link to="/login" className="block text-2xl font-bold text-white transition-colors hover:text-[#0097a7]" onClick={() => setMobileOpen(false)}>Log In</Link>
            <a href="#contact" className="block pt-8 text-2xl font-bold text-[#0097a7]">Contact Us</a>
          </nav>
        </div>

        <div className="mt-auto bg-black/20 p-8">
          <p className="mb-6 text-sm text-white/60">Connect with us</p>
          <div className="flex space-x-6">
            {[Linkedin, Twitter, Facebook].map((Icon, index) => (
              <a
                key={index}
                href="#/"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#0097a7]"
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
