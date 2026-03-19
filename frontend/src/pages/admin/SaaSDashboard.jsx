import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SaaSDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendors: { value: 124, trend: '+12%', isPositive: true },
    openRFQs: { value: 45, trend: '+5%', isPositive: true },
    pendingPOs: { value: 12, trend: '-2%', isPositive: false },
    totalSpent: { value: '$84,200', trend: '+18%', isPositive: true }
  });

  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  const departmentData = [
    { name: 'Tech', value: 45, color: '#4F46E5' },
    { name: 'Logistics', value: 30, color: '#10B981' },
    { name: 'Real Estate', value: 25, color: '#F59E0B' },
  ];

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
        setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, isPositive, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}>
          <Icon className={`${color.replace('bg-', 'text-')}`} size={22} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium tracking-tight mb-1 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  const Badge = ({ children, status }) => {
    const styles = {
      high: "bg-rose-50 text-rose-600 border-rose-100",
      medium: "bg-amber-50 text-amber-600 border-amber-100",
      low: "bg-emerald-50 text-emerald-600 border-emerald-100",
      open: "bg-indigo-50 text-indigo-600 border-indigo-100",
      pending: "bg-blue-50 text-blue-600 border-blue-100",
      closed: "bg-gray-100 text-gray-600 border-gray-200"
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {children}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-[400px] bg-gray-200 rounded-2xl"></div>
            <div className="h-[400px] bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive <span className="text-indigo-600">Overview</span></h1>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-2 mt-1">
            <Calendar size={14} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={18} /> Filters
          </button>
          <button 
            onClick={() => navigate('/admin/rfq/create')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
            Create RFQ
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Vendors" value={stats.totalVendors.value} icon={Users} trend={stats.totalVendors.trend} isPositive={stats.totalVendors.isPositive} color="bg-indigo-500" />
        <StatCard title="Live RFQs" value={stats.openRFQs.value} icon={FileText} trend={stats.openRFQs.trend} isPositive={stats.openRFQs.isPositive} color="bg-orange-500" />
        <StatCard title="Market Value" value={stats.totalSpent.value} icon={CreditCard} trend={stats.totalSpent.trend} isPositive={stats.totalSpent.isPositive} color="bg-emerald-500" />
        <StatCard title="POs Pending" value={stats.pendingPOs.value} icon={ShoppingCart} trend={stats.pendingPOs.trend} isPositive={stats.pendingPOs.isPositive} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Procurement Trends</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Monthly spending overview</p>
            </div>
            <select className="bg-gray-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>

              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0">
            <h2 className="text-lg font-black text-gray-900 tracking-tight mb-8">Resources</h2>
            <div className="h-[200px] w-full mb-8 min-h-[200px] min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>

                    <BarChart data={departmentData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {departmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-4">
                {departmentData.map((dept, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: dept.color}}></div>
                            <span className="text-sm font-bold text-gray-600">{dept.name}</span>
                        </div>
                        <span className="text-xs font-black text-gray-900">{dept.value}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent RFQs Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase tracking-wide">Live Requests</h2>
            <button className="text-xs font-black text-indigo-600 hover:underline tracking-widest uppercase">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Infrastructure Upgrade', dept: 'Development', priority: 'high', status: 'open', date: 'Mar 24' },
              { title: 'Server Maintenance', dept: 'IT', priority: 'medium', status: 'pending', date: 'Mar 22' },
              { title: 'Office Supplies', dept: 'Admin', priority: 'low', status: 'open', date: 'Mar 20' },
            ].map((rfq, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all group overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">{rfq.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider underline decoration-indigo-200 underline-offset-4">{rfq.dept}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                        <Clock size={10} /> {rfq.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={rfq.priority}>{rfq.priority}</Badge>
                  <Badge status={rfq.status}>{rfq.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Approval Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase tracking-wide">Vendor Registrations</h2>
            <span className="bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">2 Pending</span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'NexGen Logistics', applied: '2h ago', category: 'Shipping', logo: 'NL' },
              { name: 'TerraBuild Infra', applied: '5h ago', category: 'Materials', logo: 'TB' },
            ].map((vendor, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center font-black text-indigo-600 tracking-tight">
                    {vendor.logo}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight uppercase tracking-tight">{vendor.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{vendor.category} • {vendor.applied}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">Approve</button>
                  <button className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-dashed border-gray-200 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Compliance Check Active</p>
            <div className="flex justify-center -space-x-3">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">+8</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaaSDashboard;
