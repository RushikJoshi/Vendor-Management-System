import { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, Package, Clock, MapPin, Search, Filter } from "lucide-react";
import { ProcurementContext } from "../../context/ProcurementContext";
import { toast } from "react-hot-toast";

export default function AdminDeliveries() {
  const { deliveries, purchaseOrders, loading, refreshAll } = useContext(ProcurementContext);
  const navigate = useNavigate();

  useEffect(() => {
    refreshAll().catch(() => toast.error("Failed to sync logistics data"));
  }, [refreshAll]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'delayed': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'in_transit': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const pendingShipments = useMemo(() => {
    if (!purchaseOrders) return [];
    // POs that are paid but don't have a delivery record yet
    const deliveredPoIds = new Set(deliveries.map(d => String(d.poId?._id || d.poId)));
    return purchaseOrders.filter(po => po.status === 'paid' && !deliveredPoIds.has(String(po._id)));
  }, [purchaseOrders, deliveries]);


  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 p-3 md:p-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Logistics & Shipments</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Global Procurement Tracking System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search Waybill / PO..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all w-64"
              />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Filter size={18} className="text-slate-600" />
           </button>
        </div>
      </div>

      {/* Pending Dispatch Section */}
      {pendingShipments.length > 0 && (
        <section className="space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="h-2 w-2 bg-amber-500 rounded-full animate-ping"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Awaiting Dispatch (Paid Orders)</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pendingShipments.map(po => (
                <div key={po._id} className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-indigo-600 uppercase">{po.poNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Paid</span>
                   </div>
                   <h3 className="text-sm font-bold text-slate-900 truncate mb-4">{po.vendorId?.companyName || "Vendor Operation"}</h3>
                   <button 
                      onClick={() => navigate(`/admin/procurement/po/${po._id}`)}
                      className="w-full py-2.5 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                      Track Order Status
                   </button>
                </div>
              ))}
           </div>
        </section>
      )}

      <div className="flex items-center gap-3 px-2 pt-4">
          <Truck size={16} className="text-slate-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Active Shipments & In-Transit</h2>
      </div>

      {/* Grid of Delivery Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {deliveries.length > 0 ? deliveries.map((dlv) => (
          <div key={dlv._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group overflow-hidden">
            <div className="flex items-stretch h-full">
              {/* Left Status Bar */}
              <div className={`w-2 ${getStatusColor(dlv.status).split(' ')[0]}`}></div>
              
              <div className="flex-1 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                      <Truck size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waybill</span>
                        <span className="text-xs font-black text-indigo-600">{dlv.deliveryNumber}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{dlv.vendorId?.name || "Vendor Operation"}</h3>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusColor(dlv.status)}`}>
                    {dlv.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Package size={12} /> Items
                    </p>
                    <p className="text-xs font-bold text-slate-700">{dlv.items?.length || 0} Categories</p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={12} /> Expected
                    </p>
                    <p className="text-xs font-bold text-slate-700">{dlv.expectedDate ? new Date(dlv.expectedDate).toLocaleDateString() : 'Immediate'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin size={12} /> PO Ref
                    </p>
                    <p className="text-xs font-bold text-indigo-600">{dlv.poId?.poNumber || "N/A"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                      Tracking: {dlv.tracking?.carrier || "Standard"} • <span className="text-slate-400 font-medium">ID: {dlv.tracking?.trackingNumber || "N/A"}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/procurement/po/${dlv.poId?._id || dlv.poId}`)}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-2 py-1 rounded-lg"
                  >
                    View PO
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 scale-150 opacity-50">
               <Truck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Active Logistics</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase font-medium">Wait for vendors to trigger shipments from accepted orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
