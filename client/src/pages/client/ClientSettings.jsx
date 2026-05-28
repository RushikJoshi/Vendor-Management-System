import React, { useState, useEffect } from 'react';
import { User, Settings, Activity, Shield, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientSettings() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on URL
  const getActiveTab = () => {
    if (location.pathname.includes('settings')) return 'settings';
    if (location.pathname.includes('activity')) return 'activity';
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/client/${tab}`);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity', label: 'Activity Log', icon: Activity }
  ];

  return (
    <div className="p-6 w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Account Management</h1>
        <p className="text-sm text-slate-500">Manage your profile, preferences, and view account activity.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && <ProfileTab user={user} navigate={navigate} />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'activity' && <ActivityTab />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

function ProfileTab({ user, navigate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
          {user?.name?.charAt(0) || 'C'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={14} />
            Verified Client
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Security</h3>
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Account Password</p>
              <p className="text-xs text-slate-500">Update your password to keep your account secure.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/client/change-password')}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [notifications, setNotifications] = useState({
    orders: true,
    invoices: true,
    marketing: false
  });

  const toggleSetting = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Bell size={18} className="text-indigo-500" />
        Notification Preferences
      </h3>
      
      <div className="space-y-4">
        {[
          { id: 'orders', title: 'Order Updates', desc: 'Get notified when your order status changes.' },
          { id: 'invoices', title: 'Invoice Reminders', desc: 'Receive alerts for pending payments and due invoices.' },
          { id: 'marketing', title: 'News & Updates', desc: 'Occasional emails about new features and services.' }
        ].map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <button
              onClick={() => toggleSetting(item.id)}
              className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.id] ? 'bg-indigo-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[item.id] ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTab() {
  const activities = [
    { id: 1, action: "Logged in to portal", time: "Just now", icon: User },
    { id: 2, action: "Viewed Dashboard", time: "5 minutes ago", icon: Activity },
    { id: 3, action: "Checked Pending Payments", time: "1 hour ago", icon: Settings }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
      
      <div className="space-y-6">
        {activities.map((act, index) => (
          <div key={act.id} className="flex gap-4 relative">
            {/* Timeline line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-100" />
            )}
            
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 z-10">
              <act.icon size={14} />
            </div>
            <div className="pt-1.5">
              <p className="text-sm font-semibold text-slate-900">{act.action}</p>
              <p className="text-xs text-slate-400">{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
