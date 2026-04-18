import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import procurementApi from "../../services/procurementApi";
import { ProcurementContext } from "../../context/ProcurementContext";
import { 
  Package, 
  Truck, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Box
} from "lucide-react";
import Modal from "../../components/Modal";
export default function VendorProcurementDesk() {
  const navigate = useNavigate();
  const { purchaseOrders, serviceOrders, deliveries, invoices, refreshAll } = useContext(ProcurementContext);
  const [activeTab, setActiveTab] = useState("orders"); // orders, services, deliveries, invoices
  const [working, setWorking] = useState(false);

  useEffect(() => {
    refreshAll().catch(() => toast.error("Failed to load procurement data"));
  }, []);



  const myPos = purchaseOrders || [];
  const mySos = serviceOrders || [];
  const myDeliveries = deliveries || [];
  const myInvoices = invoices || [];

  const StatusPill = ({ status }) => {
    const colors = {
      sent: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accepted: "bg-blue-50 text-blue-700 border-blue-100",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-100",
      in_transit: "bg-sky-50 text-sky-700 border-sky-100",
      submitted: "bg-slate-50 text-slate-700 border-slate-100",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors[status.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-100 uppercase"}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-10 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg">
                <Box size={20} className="text-indigo-600" />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Procurement Desk</h1>
                <p className="text-xs font-medium text-slate-500">Manage orders, deliveries and invoicing central hub.</p>
             </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => navigate("/vendor/procurement/shipment/update")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95">
                <Truck size={14} />
                Update Shipment
             </button>
             <button onClick={() => navigate("/vendor/procurement/invoice/new")} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-black active:scale-95">
                <Plus size={14} />
                New Invoice
             </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 px-2 overflow-x-auto no-scrollbar">
         {[
           { id: "orders", label: "Purchase Orders", icon: Package, count: myPos.length },
           { id: "services", label: "Service Orders", icon: FileText, count: mySos.length },
           { id: "deliveries", label: "Deliveries", icon: Truck, count: myDeliveries.length },
           { id: "invoices", label: "Invoices", icon: FileText, count: myInvoices.length }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 pb-4 text-xs font-bold transition-all relative ${activeTab === tab.id ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
           >
              <tab.icon size={16} />
              {tab.label}
              <span className={`inline-flex items-center justify-center h-4 px-1.5 rounded text-[9px] font-black ${activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                {tab.count}
              </span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
           </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {activeTab === "orders" && (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                       <th className="px-6 py-4">Order ID</th>
                       <th className="px-6 py-4">Created Date</th>
                       <th className="px-6 py-4">Total Amount</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {myPos.length > 0 ? myPos.map(po => (
                       <tr key={po._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="font-bold text-slate-900">{po.poNumber}</div>
                             <div className="text-[10px] text-slate-400">ID: {String(po._id).slice(-6)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                             {new Date(po.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-sm font-bold text-slate-900">₹{po.totalAmount?.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                             <StatusPill status={po.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => navigate(`/vendor/procurement/po/${po._id}`)}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                             >
                                <ArrowUpRight size={18} />
                             </button>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-6 py-20 text-center">
                             <Package className="mx-auto text-slate-200 mb-4" size={48} />
                             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No orders found</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === "services" && (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                       <th className="px-6 py-4">Service Order ID</th>
                       <th className="px-6 py-4">Created Date</th>
                       <th className="px-6 py-4">Contract Value</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {mySos.length > 0 ? mySos.map(so => (
                       <tr key={so._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="font-bold text-slate-900">{so.poNumber}</div>
                             <div className="text-[10px] text-indigo-500 font-bold">SO Ref: {String(so._id).slice(-6)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                             {new Date(so.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-sm font-bold text-slate-900">₹{so.totalAmount?.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                             <StatusPill status={so.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => navigate(`/vendor/procurement/po/${so._id}`)}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                             >
                                <ArrowUpRight size={18} />
                             </button>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-6 py-20 text-center">
                             <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No service orders found</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}
        {activeTab === "deliveries" && (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                       <th className="px-6 py-4">Tracking Number</th>
                       <th className="px-6 py-4">Expected Date</th>
                       <th className="px-6 py-4">Carrier</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Timeline</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {myDeliveries.length > 0 ? myDeliveries.map(dl => (
                       <tr key={dl._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="font-bold text-slate-900">{dl.deliveryNumber}</div>
                             <div className="text-[10px] text-indigo-500 font-bold">{dl.tracking?.trackingNumber || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                             {dl.expectedDate ? new Date(dl.expectedDate).toLocaleDateString() : "Pending"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                             {dl.tracking?.carrier || "Standard"}
                          </td>
                          <td className="px-6 py-4">
                             <StatusPill status={dl.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Clock className="inline-block text-slate-300" size={18} />
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-sm tracking-widest">No active shipments</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === "invoices" && (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                       <th className="px-6 py-4">Invoice #</th>
                       <th className="px-6 py-4">Due Date</th>
                       <th className="px-6 py-4">Total Amount</th>
                       <th className="px-6 py-4">Payment Status</th>
                       <th className="px-6 py-4 text-right">Details</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {myInvoices.length > 0 ? myInvoices.map(inv => (
                       <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                             <div className="text-[10px] text-slate-400">PO Ref: {String(inv.poId?._id || inv.poId || "N/A").slice(-6)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                             {new Date(inv.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                             ₹{inv.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                             <StatusPill status={inv.status} />
                             {inv.rejectionReason && (
                                <div className="mt-1 text-[10.5px] italic text-slate-500 max-w-[200px] truncate" title={inv.rejectionReason}>
                                   "{inv.rejectionReason}"
                                </div>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => navigate(`/vendor/procurement/po/${inv.poId?._id || inv.poId}`)}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                             >
                                <ArrowUpRight size={18} />
                             </button>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-sm tracking-widest">No invoices recorded</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}
      </div>

    </div>
  );
}
