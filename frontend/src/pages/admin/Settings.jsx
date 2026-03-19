import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Save, Shield, Bell, Key, User } from "lucide-react";

export default function Settings() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your account and system configuration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === "profile"
                                ? "bg-green-50 text-green-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <User size={20} />
                        <span>Profile settings</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === "security"
                                ? "bg-green-50 text-green-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Shield size={20} />
                        <span>Security</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === "notifications"
                                ? "bg-green-50 text-green-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Bell size={20} />
                        <span>Notifications</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("advanced")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === "advanced"
                                ? "bg-green-50 text-green-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Key size={20} />
                        <span>Advanced API Keys</span>
                    </button>
                </div>

                <div className="md:col-span-3">
                    {activeTab === "profile" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Profile Information</h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue={user?.name || "System Admin"}
                                            className="w-full border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || "admin@example.com"}
                                            className="w-full border-gray-200 rounded-xl bg-gray-50"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.role || "Super Admin"}
                                        className="w-full border-gray-200 rounded-xl bg-gray-50"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Your role is managed by the system administrator.</p>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm font-medium">
                                        <Save size={18} />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Security Settings</h2>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border-gray-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border-gray-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border-gray-200 rounded-xl" />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm font-medium">
                                        <Save size={18} />
                                        <span>Update Password</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-xl hover:border-green-200 hover:bg-green-50/30 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Email Notifications</h3>
                                        <p className="text-sm text-gray-500">Receive emails about new applications and contracts.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-xl hover:border-green-200 hover:bg-green-50/30 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">In-App Alerts</h3>
                                        <p className="text-sm text-gray-500">Show notification dots in the sidebar.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "advanced" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Advanced Settings</h2>
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
                                <h3 className="text-orange-800 font-semibold mb-1 flex items-center gap-2">
                                    <Shield size={16} /> Danger Zone
                                </h3>
                                <p className="text-sm text-orange-700">These settings are for developers only. Please proceed with caution.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Webhook URL</label>
                                    <input type="url" placeholder="https://api.example.com/webhook" className="w-full border-gray-200 rounded-xl font-mono text-sm" />
                                </div>
                                <div className="pt-4">
                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto">
                                        Generate New API Token
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
