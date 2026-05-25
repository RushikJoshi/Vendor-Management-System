import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingCart, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/sales-orders');
      setOrders(data.data || []);
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
            <ShoppingCart size={24} className="text-indigo-600" />
            My Orders
          </h1>
          <p className="text-sm text-slate-500">View and track your sales orders</p>
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
                  <td className="p-4 text-slate-600">{new Date(order.orderDate).toLocaleDateString()}</td>
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
                      <Link to={`/client/orders/${order._id}`} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg w-fit transition-colors">
                        <ExternalLink size={14} /> View Order
                      </Link>
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
