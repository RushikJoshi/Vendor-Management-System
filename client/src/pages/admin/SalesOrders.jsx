import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { FileText, Plus, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/sales-orders");
      setOrders(data.data || []);
    } catch (err) {
      toast.error("Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading sales orders...</div>;

  return (
    <div className="space-y-6 fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={24} className="text-indigo-600" />
            Sales Orders
          </h1>
          <p className="text-slate-500 text-sm">Manage sales and customer orders</p>
        </div>
        <Link to="/admin/sales/orders/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-indigo-700 transition">
          <Plus size={16} /> New Sales Order
        </Link>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-200">No sales orders found.</p>
        ) : (
          orders.map((so) => (
            <div key={so._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-slate-900">{so.soNumber}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase">{so.status}</span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">{so.clientId?.companyName || "Unknown Client"}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(so.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Amount</p>
                  <p className="font-black text-xl text-slate-900">₹{so.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
                <Link to={`/admin/sales/orders/${so._id}`} className="p-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-lg transition">
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
