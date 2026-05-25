import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProcurementContext } from "../../context/ProcurementContext";
import { FileText, Calendar, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ServiceOrders() {
  const { serviceOrders, loading, refreshAll } = useContext(ProcurementContext);
  const navigate = useNavigate();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  if (loading && serviceOrders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Orders</h1>
          <p className="text-slate-500 text-sm">Manage labor, consultancy, and project-based service contracts (SO).</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-bold text-xs uppercase tracking-widest">
           <FileText size={14} /> {serviceOrders.length} Active Orders
        </div>
      </div>

      <div className="grid gap-4">
        {serviceOrders.length > 0 ? (
          serviceOrders.map((so) => (
            <div 
              key={so._id} 
              className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{so.poNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                         {so.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">{so.vendorId?.companyName || "Service Partner"}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <MapPin size={12} className="text-indigo-400" /> {so.serviceLocation || "Main Site"}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Calendar size={12} className="text-indigo-400" /> 
                          {so.servicePeriod?.startDate ? new Date(so.servicePeriod.startDate).toLocaleDateString() : 'N/A'} - 
                          {so.servicePeriod?.endDate ? new Date(so.servicePeriod.endDate).toLocaleDateString() : 'N/A'}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Contract Value</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">
                        ₹{(so.totalAmount || 0).toLocaleString('en-IN')}
                      </p>
                   </div>
                    <div className="flex items-center gap-2">
                      <button 
                         onClick={() => navigate(`/admin/procurement/po/${so._id}`)}
                         className="h-10 px-5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-100"
                      >
                         Manage <ArrowRight size={14} />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                <FileText size={32} />
             </div>
             <p className="text-lg font-black text-slate-300 uppercase tracking-widest leading-none">No Service Orders</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active service mandates will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
