import { useContext, useEffect, useState } from "react";
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
  const { purchaseOrders, deliveries, invoices, refreshAll } = useContext(ProcurementContext);
  const [activeTab, setActiveTab] = useState("orders"); // orders, deliveries, invoices
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [working, setWorking] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    poId: "",
    status: "in_transit",
    expectedDate: "",
    deliveredDate: "",
    tracking: { carrier: "", trackingNumber: "", trackingUrl: "" },
    items: [],
  });
  
  const [invoiceForm, setInvoiceForm] = useState({
    poId: "",
    invoiceNumber: "",
    dueDate: "",
    taxAmount: 0,
    lines: [{ itemName: "Item", quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    refreshAll().catch(() => toast.error("Failed to load procurement data"));
  }, []);

  const submitDelivery = async () => {
    if (!deliveryForm.poId) return toast.error("Select PO First");
    setWorking(true);
    try {
      await procurementApi.upsertDelivery({
        ...deliveryForm,
        expectedDate: deliveryForm.expectedDate || null,
        deliveredDate: deliveryForm.deliveredDate || null,
      });
      toast.success("Delivery status updated");
      setShowDeliveryModal(false);
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delivery update failed");
    } finally {
      setWorking(false);
    }
  };

  const submitInvoice = async () => {
    if (!invoiceForm.poId || !invoiceForm.invoiceNumber) return toast.error("PO and Invoice Number are required");
    setWorking(true);
    try {
      await procurementApi.createInvoice({
        ...invoiceForm,
        invoiceDate: new Date().toISOString(),
      });
      toast.success("Invoice successfully submitted");
      setShowInvoiceModal(false);
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invoice submission failed");
    } finally {
      setWorking(false);
    }
  };

  const myPos = purchaseOrders || [];
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
    <div className="mx-auto max-w-7xl p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
           <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Box size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Procurement Desk</h1>
              <p className="text-sm text-slate-500 font-medium">Manage orders, deliveries and invoicing central hub.</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setShowDeliveryModal(true)} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all">
              <Truck size={16} />
              Update Shipment
           </button>
           <button onClick={() => setShowInvoiceModal(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all">
              <Plus size={16} />
              New Invoice
           </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 px-2 overflow-x-auto no-scrollbar">
         {[
           { id: "orders", label: "Purchase Orders", icon: Package, count: myPos.length },
           { id: "deliveries", label: "Deliveries", icon: Truck, count: myDeliveries.length },
           { id: "invoices", label: "Invoices", icon: FileText, count: myInvoices.length }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
           >
              <tab.icon size={18} />
              {tab.label}
              <span className={`inline-flex items-center justify-center h-5 px-1.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                {tab.count}
              </span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
           </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
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
                             <div className="text-[10px] text-slate-400">ID: {po._id.slice(-6)}</div>
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
                             <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
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
                             <div className="text-[10px] text-slate-400">PO Ref: {inv.poId?.slice(-6) || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                             {new Date(inv.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                             ₹{inv.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                             <StatusPill status={inv.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                             <ArrowUpRight className="inline-block text-slate-300" size={18} />
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

      {/* Modals */}
      <Modal open={showDeliveryModal} onClose={() => setShowDeliveryModal(false)} title="Update Shipment Status">
         <div className="space-y-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Order</label>
               <select
                 value={deliveryForm.poId}
                 onChange={(e) => setDeliveryForm({ ...deliveryForm, poId: e.target.value })}
                 className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 transition-all outline-none"
               >
                  <option value="">Select PO Reference</option>
                  {myPos.map(po => <option key={po._id} value={po._id}>{po.poNumber}</option>)}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment Status</label>
                  <select
                     value={deliveryForm.status}
                     onChange={(e) => setDeliveryForm({ ...deliveryForm, status: e.target.value })}
                     className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
                  >
                     <option value="in_transit">In Transit</option>
                     <option value="delivered">Delivered</option>
                     <option value="delayed">Delayed</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Date</label>
                  <input
                    type="date"
                    value={deliveryForm.expectedDate}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, expectedDate: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
                  />
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Number</label>
               <input
                 placeholder="e.g. FEDEX-48590"
                 value={deliveryForm.tracking.trackingNumber}
                 onChange={(e) => setDeliveryForm({ ...deliveryForm, tracking: { ...deliveryForm.tracking, trackingNumber: e.target.value }})}
                 className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
               />
            </div>
            <button
               onClick={submitDelivery}
               disabled={working}
               className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
            >
               {working ? "Syncing..." : "Commit Status Update"}
            </button>
         </div>
      </Modal>

      <Modal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Generate New Invoice">
         <div className="space-y-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source PO</label>
               <select
                 value={invoiceForm.poId}
                 onChange={(e) => setInvoiceForm({ ...invoiceForm, poId: e.target.value })}
                 className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
               >
                  <option value="">Select Order to Invoice</option>
                  {myPos.map(po => <option key={po._id} value={po._id}>{po.poNumber}</option>)}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Identifier</label>
                  <input
                    placeholder="INV-2026-XXXX"
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
                  />
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Component (%)</label>
               <input
                  type="number"
                  value={invoiceForm.taxAmount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, taxAmount: Number(e.target.value) })}
                  className="w-full mt-1 rounded-xl border border-slate-200 p-3 text-sm"
               />
            </div>
            <button
               onClick={submitInvoice}
               disabled={working}
               className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg"
            >
               {working ? "Processing..." : "Submit Digital Invoice"}
            </button>
         </div>
      </Modal>
    </div>
  );
}
