import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateSalesOrder() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState([{ name: "", quantity: 1, unitPrice: 0, hsn: "" }]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get("/clients");
      setClients(data.data || []);
    } catch (err) {
      toast.error("Failed to load clients");
    }
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, unitPrice: 0, hsn: "" }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) return toast.error("Please select a client");
    if (items.some(i => !i.name || i.quantity < 1 || i.unitPrice < 0)) return toast.error("Invalid item details");

    setLoading(true);
    try {
      await api.post("/sales-orders", { clientId, items, deliveryAddress });
      toast.success("Sales order created successfully");
      navigate("/admin/sales/orders");
    } catch (err) {
      toast.error("Failed to create sales order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Sales Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Select Client</label>
          <select 
            value={clientId} 
            onChange={(e) => setClientId(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            required
          >
            <option value="">-- Select Client --</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address (Optional)</label>
          <textarea 
            value={deliveryAddress} 
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Leave blank to use client's default billing address"
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            rows="2"
          ></textarea>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Order Items</h2>
            <button type="button" onClick={handleAddItem} className="text-indigo-600 text-sm font-bold flex items-center gap-1">
              <Plus size={16} /> Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                <input type="text" required value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm" />
              </div>
              <div className="w-24">
                <label className="block text-xs font-bold text-slate-500 mb-1">Quantity</label>
                <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-slate-500 mb-1">Unit Price</label>
                <input type="number" min="0" step="0.01" required value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm" />
              </div>
              <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition mb-1">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <div className="text-right pt-4 border-t border-slate-100">
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Amount</p>
             <p className="text-2xl font-black text-slate-900">
               ₹{items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('en-IN')}
             </p>
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
          {loading ? "Creating..." : "Generate Sales Order"}
        </button>
      </form>
    </div>
  );
}
