import { useContext, useState } from "react";
import { Bell, Save, Shield, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

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
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage account details, security, and notifications in one clean layout.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 md:p-6">
          {activeTab === "profile" && (
            <form onSubmit={onSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Full Name">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    className="settings-input"
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    className="settings-input"
                  />
                </Field>
                <Field label="Department">
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
                    className="settings-input"
                  />
                </Field>
                <Field label="Timezone">
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, timezone: e.target.value }))}
                    className="settings-input"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </Field>
                <Field label="Role">
                  <input type="text" value={user?.role || "admin"} readOnly className="settings-input bg-slate-50" />
                </Field>
              </div>
              <FormActions />
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={onSaveSecurity} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Current Password">
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="settings-input"
                  />
                </Field>
                <div />
                <Field label="New Password">
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="settings-input"
                  />
                </Field>
                <Field label="Confirm Password">
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="settings-input"
                  />
                </Field>
              </div>
              <FormActions />
            </form>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={onSaveNotifications} className="space-y-4">
              <ToggleRow
                title="Email Alerts"
                description="Receive important updates over email."
                checked={notifications.emailAlerts}
                onChange={() => setNotifications((prev) => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
              />
              <ToggleRow
                title="Dashboard Alerts"
                description="Show notifications inside dashboard."
                checked={notifications.dashboardAlerts}
                onChange={() => setNotifications((prev) => ({ ...prev, dashboardAlerts: !prev.dashboardAlerts }))}
              />
              <ToggleRow
                title="Weekly Summary"
                description="Receive weekly summary of account activity."
                checked={notifications.weeklySummary}
                onChange={() => setNotifications((prev) => ({ ...prev, weeklySummary: !prev.weeklySummary }))}
              />
              <FormActions />
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function FormActions() {
  return (
    <div className="flex justify-end border-t border-slate-100 pt-4">
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        <Save size={15} />
        Save Changes
      </button>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
