import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingCart, FileText, ExternalLink, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isPendingView = location.pathname.includes('pending-payments');

  useEffect(() => {
    fetchOrders();
  }, [isPendingView]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/sales-orders');
      let fetchedOrders = data.data || [];
      
      if (isPendingView) {
        // Pending Payments: show only unpaid orders
        fetchedOrders = fetchedOrders.filter(o => ['Draft', 'Sent', 'Accepted', 'Invoiced'].includes(o.status));
      } else {
        // My Orders: show only paid orders as per user request
        fetchedOrders = fetchedOrders.filter(o => ['Paid'].includes(o.status));
      }
      
      setOrders(fetchedOrders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading your orders...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {isPendingView ? <CreditCard size={24} className="text-orange-500" /> : <ShoppingCart size={24} className="text-indigo-600" />}
            {isPendingView ? "Pending Payments" : "My Orders"}
          </h1>
          <p className="text-sm text-slate-500">
            {isPendingView ? "View and pay your pending invoices" : "View and track your sales orders"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-700">Order ID</th>
              <th className="p-4 font-bold text-slate-700">Date</th>
              <th className="p-4 font-bold text-slate-700">Amount</th>
              <th className="p-4 font-bold text-slate-700">Status</th>
              <th className="p-4 font-bold text-slate-700">Document</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-bold text-indigo-600">{order.soNumber}</td>
                  <td className="p-4 text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-slate-900">₹{order.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {isPendingView ? (
                      <Link to={`/client/orders/${order._id}/pay`} className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-white uppercase tracking-widest bg-orange-50 hover:bg-orange-600 px-4 py-2 rounded-lg w-fit transition-all shadow-sm">
                        <CreditCard size={14} /> Pay Now
                      </Link>
                    ) : (
                      <Link to={`/client/orders/${order._id}`} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-white uppercase tracking-widest bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-lg w-fit transition-all shadow-sm">
                        <ExternalLink size={14} /> View Order
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
