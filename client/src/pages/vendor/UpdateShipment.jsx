import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, PackageCheck } from "lucide-react";
import procurementApi from "../../services/procurementApi";
import { ProcurementContext } from "../../context/ProcurementContext";

export default function UpdateShipment() {
  const navigate = useNavigate();
  const { purchaseOrders, refreshAll } = useContext(ProcurementContext);
  const [working, setWorking] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    poId: "",
    status: "in_transit",
    expectedDate: "",
    deliveredDate: "",
    tracking: { carrier: "", trackingNumber: "", trackingUrl: "" },
    items: [],
  });

  const myPos = purchaseOrders || [];

  const submitDelivery = async () => {
    if (!deliveryForm.poId) {
      return toast.error("Select PO First");
    }
    
    // Automatically set deliveredDate if marking as delivered
    const isDelivered = deliveryForm.status === "delivered";
    const finalForm = {
      ...deliveryForm,
      expectedDate: deliveryForm.expectedDate || null,
      deliveredDate: isDelivered ? new Date().toISOString() : (deliveryForm.deliveredDate || null),
    };

    setWorking(true);
    try {
      await procurementApi.upsertDelivery(finalForm);
      toast.success("Shipment status updated successfully");
      await refreshAll();
      navigate("/vendor/procurement");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delivery update failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
             <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft size={18} />
             </button>
             <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Update Shipment Tracker</h1>
                <p className="text-xs font-medium text-slate-500">Report dispatch data, update parcel tracking, or mark delivery completion.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Form Container */}
      <div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
           <div className="border-b border-slate-100 bg-slate-50 p-6 flex flex-col gap-2">
               <div className="h-12 w-12 bg-white flex items-center justify-center rounded-xl shadow-sm mb-2 text-indigo-600">
                    <Truck size={24} />
               </div>
               <h2 className="text-lg font-bold text-slate-900">Dispatch & Tracking Update</h2>
               <p className="text-sm text-slate-500">Provide tracing information and timeline updates for specific purchase order consignments.</p>
           </div>
           
           <div className="p-8 space-y-8">
              {/* Order Selection */}
              <div className="space-y-4">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Procurement Association</h3>
                 <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Purchase Order Reference <span className="text-rose-500">*</span></label>
                    <select
                      value={deliveryForm.poId}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, poId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                    >
                       <option value="">Select Order for Dispatch Updates</option>
                       {myPos.map(po => <option key={po._id} value={po._id}>{po.poNumber}</option>)}
                    </select>
                 </div>
              </div>

              {/* Status Update */}
              <div className="space-y-4">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Fulfillment Milestones</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Shipment Condition</label>
                        <select
                           value={deliveryForm.status}
                           onChange={(e) => setDeliveryForm({ ...deliveryForm, status: e.target.value })}
                           className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                        >
                           <option value="in_transit">🚀 In Transit</option>
                           <option value="delivered">✅ Delivered & Accomplished</option>
                           <option value="delayed">⚠️ Delayed / Deferred Status</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Expected Arrival Date</label>
                        <input
                          type="date"
                          value={deliveryForm.expectedDate}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, expectedDate: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Courier / Vendor Agency</label>
                        <input
                          placeholder="e.g. FedEx, BlueDart, Own Fleet"
                          value={deliveryForm.tracking.carrier}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, tracking: { ...deliveryForm.tracking, carrier: e.target.value }})}
                          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Consignment Tracking Reference</label>
                        <input
                          placeholder="e.g. BLD12891924848"
                          value={deliveryForm.tracking.trackingNumber}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, tracking: { ...deliveryForm.tracking, trackingNumber: e.target.value }})}
                          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>
                 </div>
              </div>

              {/* Form Action */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                 <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                 >
                    Discard Changes
                 </button>
                 <button
                    onClick={submitDelivery}
                    disabled={working}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {working ? (
                      <span className="flex items-center gap-2">Connecting...</span>
                    ) : (
                      <>
                        <PackageCheck size={16} />
                        Sync Telemetry Data
                      </>
                    )}
                 </button>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
