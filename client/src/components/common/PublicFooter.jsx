import React from "react";
import { Link } from "react-router-dom";
import {
  Linkedin,
  Twitter,
  Facebook,
  Send,
} from "lucide-react";

const footerLinks = {
  "Quick Links": ["About Us", "Our Projects", "Leadership", "Careers", "Investor Relations"],
  Services: ["Highways & Roads", "Railways & Metro", "Water Infrastructure", "Solar Energy"],
};

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#001f3f] pb-12 pt-20 text-white">
      <div className="mx-auto max-w-[1540px] px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-8 flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0097a7]">
                <span className="text-xl font-extrabold text-white">GT</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight">VMS</span>
            </Link>
            <p className="mb-8 leading-relaxed text-slate-400">
              Leading the infrastructure revolution with engineering excellence and a passion for building a better tomorrow.
            </p>
            <div className="flex space-x-4">
              {[Linkedin, Twitter, Facebook].map((Icon, index) => (
                <a
                  key={index}
                  href="#/"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-[#0097a7]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-8 text-xl font-bold">{title}</h4>
              <ul className="space-y-4 text-slate-400">
                {links.map((item) => (
                  <li key={item}>
                    {item === "About Us" ? (
                      <Link to="/about" className="transition-colors hover:text-[#0097a7]">
                        {item}
                      </Link>
                    ) : (
                      <a href="#/" className="transition-colors hover:text-[#0097a7]">
                        {item}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-8 text-xl font-bold">Newsletter</h4>
            <p className="mb-6 text-slate-400">Stay updated with our latest project milestones and company news.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="w-full rounded-lg border-none bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#0097a7]" />
              <button className="rounded-lg bg-[#0097a7] p-3 transition hover:bg-[#00b3c7]">
                <Send size={18} />
              </button>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Need vendor access?</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Use the login portal to manage onboarding, approvals, and procurement workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-800 pt-12 md:flex-row">
          <p className="text-sm text-slate-500">© 2026 GT Vendor Management. All Rights Reserved.</p>
          <div className="flex space-x-6 text-sm text-slate-500">
            <a href="#/" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#/" className="transition-colors hover:text-white">Terms of Use</a>
            <a href="#/" className="transition-colors hover:text-white">Site Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
