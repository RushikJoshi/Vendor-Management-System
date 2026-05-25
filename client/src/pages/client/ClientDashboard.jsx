import React from 'react';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/client/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer block group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">My Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">View All</h3>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Account Status</p>
              <h3 className="text-2xl font-bold text-slate-900">Active</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
