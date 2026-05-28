import React, { useContext, useEffect, useState } from 'react';
import { ShoppingCart, TrendingUp, CreditCard, Package, ArrowRight, Bell, Clock, IndianRupee, Activity } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingAmount: 0,
    totalSpent: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/sales-orders');
        const orders = res.data.data || [];
        
        let pending = 0;
        let spent = 0;
        
        orders.forEach(order => {
          if (['Paid'].includes(order.status)) {
            spent += order.totalAmount;
          } else if (['Sent', 'Accepted', 'Invoiced'].includes(order.status)) {
            pending += order.totalAmount;
          }
        });

        setStats({
          totalOrders: orders.length,
          pendingAmount: pending,
          totalSpent: spent,
          recentOrders: orders.slice(0, 3) // get top 3 latest
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-['Inter',_sans-serif]">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Welcome Banner (Glassmorphism) */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 p-8 lg:p-12 shadow-2xl shadow-indigo-900/20"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Valued Client'}
              </h1>
              <p className="text-indigo-200 text-lg max-w-xl font-medium">
                Here is your account overview and recent order activity.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-white font-semibold tracking-wide">Account Active</span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Orders Stat */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-500 font-medium mb-1">Total Orders</p>
                  <h3 className="text-4xl font-bold text-slate-900">
                    {loading ? '...' : stats.totalOrders}
                  </h3>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <ShoppingCart size={24} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pending Amount Stat */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-orange-100 transition-colors"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-500 font-medium mb-1">Pending Payments</p>
                  <h3 className="text-4xl font-bold text-slate-900">
                    {loading ? '...' : `₹${stats.pendingAmount.toLocaleString()}`}
                  </h3>
                </div>
                <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                  <Clock size={24} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Total Spent Stat */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-emerald-100 transition-colors"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-500 font-medium mb-1">Total Spent</p>
                  <h3 className="text-4xl font-bold text-slate-900">
                    {loading ? '...' : `₹${stats.totalSpent.toLocaleString()}`}
                  </h3>
                </div>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <IndianRupee size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" /> Recent Activity
            </h3>
            <Link to="/client/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="p-0">
            {loading ? (
               <div className="p-8 text-center text-slate-500">Loading recent orders...</div>
            ) : stats.recentOrders.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No recent orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order No.</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentOrders.map((order, idx) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.soNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                            ['Sent', 'Accepted', 'Invoiced'].includes(order.status) ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
