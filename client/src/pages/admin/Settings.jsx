import { useContext, useState } from "react";
import { Bell, Save, Shield, User, Settings as SettingsIcon, Info, Lock, Mail, Globe, Building, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
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
    weeklySummary: true,
  });

  const onSaveProfile = (e) => {
    e.preventDefault();
    toast.success("Profile settings saved");
  };

  const onSaveSecurity = (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }
    toast.success("Security settings saved");
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const onSaveNotifications = (e) => {
    e.preventDefault();
    toast.success("Notification settings saved");
  };

  return (
    <div className="space-y-4 pb-20 fade-in">
      {/* COMPACT HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
            <SettingsIcon className="text-indigo-600" size={18} />
            System Settings
          </h1>
          <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-slate-500">
            <Info size={12} className="text-slate-400" />
            Manage account details, security credentials, and notification preferences.
          </div>
        </div>
      </motion.div>

      {/* TABS + CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">

        {/* LEFT: TAB NAVIGATION */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm lg:sticky lg:top-5"
        >
          <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
            <SettingsIcon size={13} className="text-indigo-600" />
            <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">Navigation</h2>
          </div>
          <div className="p-3 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-bold transition-all ${
                    active 
                      ? "bg-indigo-50/80 text-indigo-700 border border-indigo-200 ring-1 ring-indigo-200 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon size={14} className={active ? "text-indigo-600" : "text-slate-400"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* User Info Card */}
          <div className="border-t border-slate-100 p-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={14} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 leading-none">{user?.name || "User"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{String(user?.role || "admin").toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: CONTENT AREA */}
        <div className="lg:col-span-3 space-y-4">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={onSaveProfile} className="space-y-4">
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
                  <User size={13} className="text-indigo-600" />
                  <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">Personal Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <InputGroup 
                    label="Full Legal Name" 
                    icon={User}
                    value={profile.name} 
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="Enter full name"
                  />
                  <InputGroup 
                    label="Official Email ID" 
                    icon={Mail}
                    type="email"
                    value={profile.email} 
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} 
                    placeholder="name@company.com"
                  />
                  <InputGroup 
                    label="Department" 
                    icon={Building}
                    value={profile.department} 
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))} 
                    placeholder="Enter department"
                  />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                      Timezone
                    </p>
                    <div className="relative">
                      <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-[13px] font-bold text-slate-900 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      </select>
                    </div>
                  </div>
                  <InputGroup 
                    label="Assigned Role" 
                    icon={Shield}
                    value={String(user?.role || "admin").toUpperCase()} 
                    disabled
                  />
                </div>
              </motion.section>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}  
                className="flex justify-end"
              >
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Save Profile <Save size={13} />
                </button>
              </motion.div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <form onSubmit={onSaveSecurity} className="space-y-4">
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-indigo-600" />
                    <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">Password Management</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-700 uppercase tracking-widest">Sensitive</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <InputGroup 
                    label="Current Password" 
                    icon={Lock}
                    type="password"
                    value={security.currentPassword} 
                    onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))} 
                    placeholder="Enter current password"
                    required
                  />
                  <div /> {/* Spacer */}
                  <InputGroup 
                    label="New Password" 
                    icon={Lock}
                    type="password"
                    value={security.newPassword} 
                    onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))} 
                    placeholder="Enter new password"
                    required
                  />
                  <InputGroup 
                    label="Confirm New Password" 
                    icon={Lock}
                    type="password"
                    value={security.confirmPassword} 
                    onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                    placeholder="Confirm new password"
                    required
                  />
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 italic">
                      <Info size={10} /> Password must be at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-end"
              >
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Update Password <Lock size={13} />
                </button>
              </motion.div>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <form onSubmit={onSaveNotifications} className="space-y-4">
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={13} className="text-indigo-600" />
                    <h2 className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">Notification Preferences</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">Configurable</span>
                </div>
                <div className="p-6 space-y-3">
                  <ToggleRow
                    icon={Mail}
                    title="Email Alerts"
                    description="Receive important updates and system notifications via email."
                    checked={notifications.emailAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
                  />
                  <ToggleRow
                    icon={Bell}
                    title="Dashboard Alerts"
                    description="Show real-time notifications inside the admin dashboard."
                    checked={notifications.dashboardAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, dashboardAlerts: !prev.dashboardAlerts }))}
                  />
                  <ToggleRow
                    icon={Clock}
                    title="Weekly Summary"
                    description="Receive a consolidated weekly summary of all account activity."
                    checked={notifications.weeklySummary}
                    onChange={() => setNotifications(prev => ({ ...prev, weeklySummary: !prev.weeklySummary }))}
                  />
                </div>
              </motion.section>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-end"
              >
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Save Preferences <Save size={13} />
                </button>
              </motion.div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false, disabled = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </p>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        <input
          required={required}
          disabled={disabled}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 ${Icon ? 'pl-9' : 'pl-4'} pr-4 text-[13px] font-bold text-slate-900 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500`}
        />
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3.5 transition-all ${
      checked 
        ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-100' 
        : 'bg-white border-slate-100 hover:border-slate-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          checked ? 'bg-indigo-100' : 'bg-slate-100'
        }`}>
          {Icon && <Icon size={14} className={checked ? "text-indigo-600" : "text-slate-400"} />}
        </div>
        <div>
          <p className="text-[12px] font-bold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-all flex-shrink-0 ${
          checked ? "bg-indigo-600 shadow-sm shadow-indigo-200" : "bg-slate-300"
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[1.3rem]" : "left-0.5"
        }`} />
      </button>
    </div>
  );
}
