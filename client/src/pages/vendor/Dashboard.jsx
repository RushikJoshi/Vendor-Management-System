import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const statusConfig = {
  approved: {
    label: "Approved",
    summary: "Your vendor account is active and ready for procurement activity.",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    icon: ShieldCheck,
  },
  pending: {
    label: "Pending Review",
    summary: "Your information is under review. Keep profile and documents updated.",
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
    icon: Clock3,
  },
  rejected: {
    label: "Action Required",
    summary: "Some profile details need attention before approval can continue.",
    pill: "bg-rose-50 text-rose-700 border border-rose-100",
    icon: XCircle,
  },
};

const getCategoryLabel = (category) => {
  if (!category) return "Not assigned";
  if (typeof category === "object") return category.name || "Not assigned";
  return category;
};

const getCompletion = (info) => {
  const fields = [
    info?.companyName,
    info?.contactPerson,
    info?.email,
    info?.phone,
    info?.address,
    info?.website,
    getCategoryLabel(info?.category) !== "Not assigned" ? info?.category : null,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/vendors/me")
      .then((res) => setInfo(res.data.data))
      .catch((err) => {
        if (err?.response?.status === 403) {
          navigate("/access-denied", { replace: true });
          return;
        }
        setInfo(null);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-64 rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="h-[360px] rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
          <div className="h-[360px] rounded-2xl border border-slate-200/60 bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <section className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">
            Vendor workspace
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-4xl">
            Vendor profile not found.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-500">
            Welcome, {user?.name || "Vendor"}. Complete your onboarding form to activate the vendor dashboard.
          </p>
          <Link
            to="/vendor/fill-form"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-slate-800"
          >
            Complete onboarding
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  const statusKey = info.status?.toLowerCase();
  const currentStatus = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;
  const completion = getCompletion(info);
  const categoryLabel = getCategoryLabel(info.category);

  const statCards = [
    { label: "Verification", value: currentStatus.label, icon: StatusIcon },
    { label: "Profile Completion", value: `${completion}%`, icon: CheckCircle2 },
    { label: "Category", value: categoryLabel, icon: BriefcaseBusiness },
    { label: "Primary Contact", value: info.contactPerson || user?.name || "Not added", icon: User },
  ];

  const companyDetails = [
    { label: "Company name", value: info.companyName || "Not available", icon: Building2 },
    { label: "Email address", value: info.email || "Not available", icon: Mail },
    { label: "Phone number", value: info.phone || "Not available", icon: Phone },
    { label: "Business address", value: info.address || "Not available", icon: MapPin },
  ];

  const quickActions = [
    {
      title: "Update profile",
      description: "Keep company details, contact information, and address current.",
      to: "/vendor/profile",
      icon: User,
    },
    {
      title: "Manage documents",
      description: "Upload or review compliance and onboarding documents.",
      to: "/vendor/documents",
      icon: FolderOpen,
    },
    {
      title: "Active agreements",
      description: "Review accepted bids, formal contracts, and operative purchase orders.",
      to: "/vendor/contracts",
      icon: ShieldCheck,
    },
  ];

  const checklist = [
    {
      label: "Company profile information",
      done: Boolean(info.companyName && info.contactPerson && info.address),
    },
    {
      label: "Business contact details",
      done: Boolean(info.email && info.phone),
    },
    {
      label: "Category assignment",
      done: categoryLabel !== "Not assigned",
    },
    {
      label: "Approval workflow status",
      done: statusKey === "approved",
      pendingLabel: currentStatus.label,
    },
  ];

  return (
    <div className="space-y-4 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-700">
                Vendor dashboard
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${currentStatus.pill}`}>
                <StatusIcon size={13} />
                {currentStatus.label}
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
                Welcome back, {info.companyName || user?.name || "Vendor"}.
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed font-medium text-slate-500 tracking-wide">
                Review your onboarding status, keep company information updated, and move quickly between the core vendor tasks from one clean workspace.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FeatureTile icon={Building2} label="Company" value={info.companyName || "Not added"} />
              <FeatureTile icon={BriefcaseBusiness} label="Category" value={categoryLabel} />
              <FeatureTile icon={CheckCircle2} label="Completion" value={`${completion}%`} />
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
            <InfoPanel
              icon={StatusIcon}
              title="Current status"
              value={currentStatus.label}
              note={currentStatus.summary}
            />
            <InfoPanel
              icon={Mail}
              title="Primary email"
              value={info.email || "Not available"}
              note="This address is used for approvals, updates, and sourcing notifications."
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                to="/vendor/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                Update profile
              </Link>
              <Link
                to="/vendor/documents"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800"
              >
                Open documents
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <StatCard key={card.label} {...card} delay={index * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 xl:p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Company Snapshot</h2>
              <p className="mt-1 text-[12px] text-slate-500">Key details used across onboarding and approvals.</p>
            </div>
            <Link to="/vendor/profile" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
              Edit details
            </Link>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2">
            {companyDetails.map((item) => (
              <DetailCard key={item.label} {...item} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 xl:p-5">
            <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-[12px] text-slate-500">Jump straight to the pages you use most.</p>
          </div>

          <div className="space-y-3 p-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.to} {...action} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 xl:p-5">
            <h2 className="text-base font-semibold text-slate-900">Readiness Checklist</h2>
            <p className="mt-1 text-[12px] text-slate-500">A simple view of the profile signals that support approval progress.</p>
          </div>

          <div className="space-y-3 p-4">
            {checklist.map((item) => (
              <ChecklistRow key={item.label} {...item} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 xl:p-5">
            <h2 className="text-base font-semibold text-slate-900">Account Summary</h2>
            <p className="mt-1 text-[12px] text-slate-500">Useful details for day-to-day vendor operations.</p>
          </div>

          <div className="space-y-3 p-4">
            <SummaryTile
              label="Assigned category"
              value={categoryLabel}
              note="This affects onboarding routing and sourcing visibility."
            />
            <SummaryTile
              label="Company location"
              value={info.address || "Address not added"}
              note="Keep this updated so teams can verify business records quickly."
            />
            <SummaryTile
              label="Support owner"
              value={info.contactPerson || user?.name || "Not assigned"}
              note="Use the profile page to keep the primary point of contact current."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

const FeatureTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-inner">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const InfoPanel = ({ icon: Icon, title, value, note }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 shadow-inner">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <p className="mt-1 break-words text-lg font-semibold text-slate-900">{value}</p>
        <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
  >
    <div className="mb-6 flex items-start justify-between">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100/80 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 shadow-inner">
        <Icon size={22} />
      </div>
    </div>
    <h3 className="break-words text-3xl font-semibold tracking-tight text-slate-900">{value}</h3>
    <p className="mt-2 text-[12px] font-semibold text-slate-500">{label}</p>
  </motion.div>
);

const DetailCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:bg-slate-50">
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-2 break-words text-[15px] font-medium leading-7 text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, to, icon: Icon }) => (
  <Link
    to={to}
    className="group flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-[13px] leading-6 text-slate-500">{description}</p>
    </div>
    <ArrowRight size={18} className="mt-1 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
  </Link>
);

const ChecklistRow = ({ label, done, pendingLabel }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-white px-4 py-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          done ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        }`}
      >
        {done ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
      </div>
      <p className="text-[14px] font-medium text-slate-900">{label}</p>
    </div>
    <span
      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {done ? "Ready" : pendingLabel || "Pending"}
    </span>
  </div>
);

const SummaryTile = ({ label, value, note }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <p className="mt-2 break-words text-[16px] font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p>
  </div>
);
