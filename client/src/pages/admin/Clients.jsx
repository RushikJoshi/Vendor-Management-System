import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Users, Plus, Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginModalData, setLoginModalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get("/clients");
      setClients(data.data || []);
    } catch (err) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.name || !formData.email || !formData.phone) {
      return toast.error("All required fields must be filled!");
    }

    try {
      setSubmitting(true);
      await api.post("/clients", formData);
      toast.success("Client added successfully");
      setIsModalOpen(false);
      setFormData({ companyName: "", name: "", email: "", phone: "", address: "" });
      fetchClients();
    } catch (err) {
      toast.error("Failed to add client");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLogin = async (clientId) => {
    try {
      const { data } = await api.post(`/clients/${clientId}/create-login`);
      toast.success("Login created successfully");
      setLoginModalData(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create login");
    }
  };

  if (loading) return <div className="p-4 text-slate-500 font-medium">Loading clients...</div>;

  return (
    <div className="space-y-6 fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-indigo-600" />
            Clients
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your sales customers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="mt-4 md:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clients.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 border-dashed">
             <Users size={48} className="mx-auto text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-900 mb-1">No Clients Yet</h3>
             <p className="text-slate-500">Add your first client to get started with sales orders.</p>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
              <h3 className="font-bold text-[17px] text-slate-900">{client.companyName}</h3>
              <p className="text-sm font-semibold text-indigo-600 mb-5">{client.name}</p>
              
              <div className="space-y-3 text-[13px] font-medium text-slate-600">
                <p className="flex items-center gap-3"><Mail size={16} className="text-slate-400" /> {client.email}</p>
                <p className="flex items-center gap-3"><Phone size={16} className="text-slate-400" /> {client.phone}</p>
                {client.address && <p className="flex items-start gap-3"><MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" /> <span className="leading-snug">{client.address}</span></p>}
              </div>
              
              <div className="mt-5 pt-5 border-t border-slate-100 flex justify-end">
                <button onClick={() => handleCreateLogin(client._id)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                  Generate Login
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client" size="max-w-md">
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Company Name <span className="text-red-500">*</span></label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition text-sm font-medium" placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Person <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition text-sm font-medium" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition text-sm font-medium" placeholder="john@acme.com" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition text-sm font-medium" placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Address (Optional)</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition text-sm font-medium" placeholder="123 Business Rd..." />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-2">
              {submitting ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!loginModalData} onClose={() => setLoginModalData(null)} title="Client Login Credentials" size="max-w-sm">
        {loginModalData && (
          <div className="space-y-4">
             <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-[13px] border border-yellow-200">
                Please copy these credentials and share them securely with the client. The password will not be shown again.
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email / Username</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-sm">{loginModalData.email}</div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Temporary Password</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-lg tracking-widest text-indigo-600">{loginModalData.password}</div>
             </div>
             <div className="pt-4 flex justify-end">
               <button onClick={() => setLoginModalData(null)} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition">Close</button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
