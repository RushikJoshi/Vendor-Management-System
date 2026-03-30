import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Globe,
  Key,
  Lock,
  Save,
  Shield,
  User,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

const tabs = [
  { id: "profile", label: "Profile", icon: User, desc: "Personal account details" },
  { id: "security", label: "Security", icon: Shield, desc: "Password and access controls" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alert preferences" },
  { id: "advanced", label: "Advanced", icon: Cpu, desc: "System level references" },
];

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: "Administration",
    timezone: "Asia/Kolkata",
  });
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    dashboardAlerts: true,
    vendorUpdates: false,
    weeklySummary: true,
  });

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="space-y-3 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                Admin Settings
              </span>
              <span className="rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                Admin / Settings
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
              Clear Settings For A Smoother Admin Workflow.
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
              Manage Profile Details, Security Controls, And Notification Preferences In A Clean
              Layout That Feels Consistent With The Rest Of The Admin Dashboard.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroTile icon={User} label="Current Role" value={user?.role || "Admin"} />
              <HeroTile icon={Shield} label="Security State" value="Protected" />
              <HeroTile icon={Bell} label="Alert Status" value="Configured" />
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
            <QuickInfoCard
              title="Workspace Health"
              value="Stable"
              note="Core admin preferences and settings are available from one place."
            />
            <QuickInfoCard
              title="Session Status"
              value="Active"
              note="Profile details and visual controls can be reviewed without changing backend behavior."
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95">
                <Save size={16} />
                Save Changes
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                <Activity size={16} />
                Review Status
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Profile" value="Ready" tone="slate" />
        <SummaryCard label="Security" value="MFA On" tone="emerald" />
        <SummaryCard label="Alerts" value="3 Active" tone="indigo" />
        <SummaryCard label="Environment" value="Admin" tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[18rem_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 xl:p-5">
            <h2 className="text-base font-semibold text-slate-900">Setting Sections</h2>
            <p className="mt-1 text-[12px] text-slate-500">
              Move between core admin setting groups.
            </p>
          </div>

          <div className="space-y-3 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      active ? "bg-white/10 text-white" : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">{tab.label}</p>
                    <p className={`mt-1 text-[11px] ${active ? "text-slate-200" : "text-slate-500"}`}>
                      {tab.desc}
                    </p>
                  </div>
                  <ChevronRight size={16} className={active ? "text-white/70" : "text-slate-300"} />
                </button>
              );
            })}

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-slate-700" />
                <h3 className="text-[12px] font-semibold text-slate-900">Privacy Note</h3>
              </div>
              <p className="mt-3 text-[12px] leading-6 text-slate-500">
                Account access and protected policies are still controlled by existing admin
                rules. This update is UI-only.
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-5 xl:p-6"
              >
                <SectionHeader
                  icon={User}
                  title="Profile Settings"
                  note="Review basic account details used across the admin workspace."
                />

                <div className="grid gap-6 xl:grid-cols-[16rem_1fr]">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-slate-900 text-3xl font-semibold text-white shadow-sm">
                      {userInitial}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">
                      {user?.name || "Admin User"}
                    </h3>
                    <p className="mt-1 text-[12px] text-slate-500">{user?.email || "admin@example.com"}</p>
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-700">
                      Account status: Active
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="Full Name">
                        <input
                          type="text"
                          className="saas-input"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </Field>
                      <Field label="Email Address">
                        <input
                          type="email"
                          className="saas-input"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </Field>
                      <Field label="Department">
                        <input
                          type="text"
                          className="saas-input"
                          value={profile.department}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        />
                      </Field>
                      <Field label="Timezone">
                        <select
                          className="saas-input"
                          value={profile.timezone}
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </Field>
                      <Field label="Role">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13px] font-semibold text-slate-700">
                          {user?.role || "Admin"}
                        </div>
                      </Field>
                      <Field label="Workspace">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13px] font-semibold text-slate-700">
                          GT Vendor Management
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-5 xl:p-6"
              >
                <SectionHeader
                  icon={Shield}
                  title="Security Settings"
                  note="Password fields and protection controls stay in one simple panel."
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard label="Password Policy" value="Strong" note="Enterprise standard applied" />
                  <InfoCard label="MFA" value="Enabled" note="Recommended for admin access" />
                  <InfoCard label="Session Rotation" value="120 min" note="Controlled by policy" />
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Current Password">
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="saas-input"
                        value={security.currentPassword}
                        onChange={(e) =>
                          setSecurity({ ...security, currentPassword: e.target.value })
                        }
                      />
                    </Field>
                    <div />
                    <Field label="New Password">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="saas-input"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      />
                    </Field>
                    <Field label="Confirm Password">
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="saas-input"
                        value={security.confirmPassword}
                        onChange={(e) =>
                          setSecurity({ ...security, confirmPassword: e.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">
                          Multi-factor authentication
                        </p>
                        <p className="mt-1 text-[12px] text-slate-500">
                          Additional protection for admin sign-in and sensitive changes.
                        </p>
                      </div>
                      <StaticToggle active />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-5 xl:p-6"
              >
                <SectionHeader
                  icon={Bell}
                  title="Notification Settings"
                  note="Choose which admin alerts should remain visible and active."
                />

                <div className="space-y-3">
                  <ToggleRow
                    title="Email Alerts"
                    desc="Receive important admin notifications on email."
                    active={notifications.emailAlerts}
                    onToggle={() =>
                      setNotifications({
                        ...notifications,
                        emailAlerts: !notifications.emailAlerts,
                      })
                    }
                  />
                  <ToggleRow
                    title="Dashboard Alerts"
                    desc="Show high-priority updates inside the admin dashboard."
                    active={notifications.dashboardAlerts}
                    onToggle={() =>
                      setNotifications({
                        ...notifications,
                        dashboardAlerts: !notifications.dashboardAlerts,
                      })
                    }
                  />
                  <ToggleRow
                    title="Vendor Activity Updates"
                    desc="Show new vendor profile and application activity updates."
                    active={notifications.vendorUpdates}
                    onToggle={() =>
                      setNotifications({
                        ...notifications,
                        vendorUpdates: !notifications.vendorUpdates,
                      })
                    }
                  />
                  <ToggleRow
                    title="Weekly Summary"
                    desc="Receive a summary of admin activity and workspace changes."
                    active={notifications.weeklySummary}
                    onToggle={() =>
                      setNotifications({
                        ...notifications,
                        weeklySummary: !notifications.weeklySummary,
                      })
                    }
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "advanced" && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-5 xl:p-6"
              >
                <SectionHeader
                  icon={Cpu}
                  title="Advanced Settings"
                  note="Reference-only values and protected system information for admin review."
                />

                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                  <p className="text-[12px] font-semibold text-amber-800">Restricted area</p>
                  <p className="mt-2 text-[12px] leading-6 text-amber-700">
                    These items are shown for visibility only. Critical system configuration is
                    still controlled by existing platform rules.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <ReferenceCard
                    icon={Globe}
                    label="Webhook Endpoint"
                    value={`https://api.gateway.local/webhook/${user?._id || "admin-node"}`}
                  />
                  <ReferenceCard
                    icon={Key}
                    label="API Mode"
                    value="Production workspace"
                  />
                  <ReferenceCard
                    icon={Activity}
                    label="System Version"
                    value="v4.1 stable"
                  />
                  <ReferenceCard
                    icon={CheckCircle2}
                    label="Health Status"
                    value="All services available"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                  <p className="text-[13px] font-semibold text-slate-900">Protected actions</p>
                  <p className="mt-2 text-[12px] text-slate-500">
                    Use these buttons as visual entry points only. No backend behavior was changed
                    in this update.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-700 transition-all hover:bg-slate-50">
                      Rotate API Key
                    </button>
                    <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800">
                      Generate New Token
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

const HeroTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-inner">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const QuickInfoCard = ({ title, value, note }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p>
  </div>
);

const SummaryCard = ({ label, value, tone }) => {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "indigo"
      ? "border-indigo-100 bg-indigo-50 text-indigo-700"
      : tone === "amber"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between">
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${toneClass}`}>
          {label}
        </span>
      </div>
      <h3 className="text-4xl font-semibold tracking-tight text-slate-900">{value}</h3>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, note }) => (
  <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
      <Icon size={18} />
    </div>
    <div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-[12px] text-slate-500">{note}</p>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
      {label}
    </label>
    {children}
  </div>
);

const InfoCard = ({ label, value, note }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-[12px] text-slate-500">{note}</p>
  </div>
);

const ToggleRow = ({ title, desc, active, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 text-left shadow-sm transition-all hover:bg-slate-50"
  >
    <div>
      <p className="text-[14px] font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[12px] leading-6 text-slate-500">{desc}</p>
    </div>
    <StaticToggle active={active} />
  </button>
);

const StaticToggle = ({ active }) => (
  <div
    className={`relative h-7 w-12 rounded-full transition-all ${
      active ? "bg-slate-900" : "bg-slate-200"
    }`}
  >
    <div
      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
        active ? "left-6" : "left-1"
      }`}
    />
  </div>
);

const ReferenceCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-[13px] font-semibold text-slate-900 break-all">{value}</p>
      </div>
    </div>
  </div>
);
