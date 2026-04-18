import { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, MapPin } from "lucide-react";
import { ProcurementContext } from "../../context/ProcurementContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import StatusPill from "../../components/StatusBadge";

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, serviceOrders, refreshAll, loading } = useContext(ProcurementContext);
  const { user } = useContext(AuthContext);
  const [docSettings, setDocSettings] = useState(null);
  const [po, setPo] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    refreshAll();
    // Fetch customization settings
    api.get("/procurement-settings").then(res => setDocSettings(res.data.data)).catch(console.error);
  }, [refreshAll]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const allOrders = [...(purchaseOrders || []), ...(serviceOrders || [])];
    if (allOrders.length > 0) {
      const found = allOrders.find(p => p._id === id);
      setPo(found);
    }
  }, [purchaseOrders, serviceOrders, id]);



  if (!po && !loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
       <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold uppercase tracking-widest text-xs">
         Document Reference Not Found
       </div>
       <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 underline">Go Back</button>
    </div>
  );

  if (!po) return (
    <div className="flex h-[80vh] items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* Screen Only Headers (Hidden in Print) */}
      <div className="print:hidden flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <ArrowLeft size={18} className="text-slate-600"/>
           </button>
             <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {po.orderType === "SO" ? "Service Order Details" : "Purchase Order Details"}
                </h1>
                <p className="text-xs text-slate-500">View and print official document records.</p>
             </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all focus:ring-4 focus:ring-slate-100">
             <Printer size={16} /> Print Official Document
           </button>
        </div>
      </div>

      {/* Printable Area - Rendered exactly like A4 */}
      <div 
        ref={printRef} 
        className="w-full bg-white p-6 md:p-10 shadow-sm rounded-2xl border border-slate-200 min-h-[1024px] print:min-h-0 print:shadow-none print:border-none print:max-w-none print:p-0 print:m-0"
      >
         
         {/* Document Header */}
         <div 
            className="border-b-4 pb-8 flex justify-between items-start"
            style={{ borderBottomColor: docSettings?.themeColor || '#4f46e5' }}
         >
            <div>
               {/* Replace this with Company logo image usually */}
               <div className="flex items-center gap-2 mb-4">
                  <div 
                      className="h-10 w-10 rounded flex items-center justify-center text-white font-black text-xl"
                      style={{ backgroundColor: docSettings?.themeColor || '#4f46e5' }}
                  >
                    {docSettings?.companyName?.charAt(0) || "GT"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{docSettings?.companyName || "Global Tech Enterprise"}</h2>
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Procurement Division</p>
                  </div>
               </div>
               <div className="text-sm text-slate-600 space-y-1">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {docSettings?.companyAddress || "HQ Address Line 1, Business Park"}</p>
                  <p className="pl-5">GSTIN: {docSettings?.gstNumber || "27AABCT#8XX9Z1"}</p>
               </div>
            </div>
            <div className="text-right">
               <h1 
                  className="text-4xl font-black uppercase tracking-tight mb-2"
                  style={{ color: docSettings?.themeColor || '#1e293b' }}
               >
                 {po.orderType === "SO" ? "Service Order" : "Purchase Order"}
               </h1>
               <div className="inline-flex flex-col text-right items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Reference No.</p>
                  <p className="text-xl font-bold mb-3" style={{ color: docSettings?.themeColor || '#4f46e5' }}>{po.poNumber}</p>
                  
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="text-sm font-bold text-slate-800 mb-3">{new Date(po.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Status</p>
                  <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${po.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {po.status || "Released"}
                  </div>
               </div>
            </div>
         </div>

         {/* Addresses Grid */}
         <div className="grid grid-cols-2 gap-12 mt-10">
            <div className="space-y-3">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Issued To (Vendor)</h3>
               <div>
                  <p className="font-bold text-lg text-slate-900">{po.vendorId?.name || po.vendorId?.companyName || "Vendor Operations"}</p>
                  {po.vendorId?.companyName && <p className="text-sm text-slate-600 font-medium">Business: {po.vendorId.companyName}</p>}
                  <p className="text-sm text-slate-500 mt-2">Attn: Sales / Order Fulfillment</p>
               </div>
            </div>
            <div className="space-y-3">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                 {po.orderType === "SO" ? "Service Site & Period" : "Ship To / Billing Address"}
               </h3>
               <div>
                  {po.orderType === "SO" ? (
                    <div className="space-y-2">
                      <p className="font-bold text-lg text-slate-900">{po.serviceLocation || "Project Site"}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                         <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Duration:</span>
                         {po.servicePeriod?.startDate ? new Date(po.servicePeriod.startDate).toLocaleDateString() : 'TBD'} — {po.servicePeriod?.endDate ? new Date(po.servicePeriod.endDate).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-slate-900">{docSettings?.companyName || "Global Tech Enterprise"}</p>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{docSettings?.companyAddress || "Central Warehouse Operations"}</p>
                    </>
                  )}
               </div>
            </div>
         </div>

         {/* Line Items Table */}
         <div className="mt-12 rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                     <th className="py-3 px-4 font-bold text-slate-700 w-12 text-center">#</th>
                     <th className="py-3 px-4 font-bold text-slate-700">Item Description</th>
                     <th className="py-3 px-4 font-bold text-slate-700 text-right">Qty</th>
                     <th className="py-3 px-4 font-bold text-slate-700 text-right">Unit Price</th>
                     <th className="py-3 px-4 font-bold text-slate-700 text-right">Line Total</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {po.items?.map((item, index) => (
                     <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{item.name || "Standard Supply"}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-700">₹{(item.unitPrice || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">₹{(item.totalPrice || 0).toLocaleString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Totals Section */}
         <div className="flex justify-end mt-6">
            <div className="w-72 space-y-4">
               <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Subtotal</span>
                  <span className="text-sm font-bold text-slate-900">₹{po.totalAmount?.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Est. Tax (0%)</span>
                  <span className="text-sm font-bold text-slate-900">₹0</span>
               </div>
               <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Grand Total</span>
                  <span className="text-xl font-black text-indigo-600">₹{po.totalAmount?.toLocaleString()}</span>
               </div>
            </div>
         </div>

         {/* Footer & T&C */}
         <div className="mt-16 pt-8 border-t border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Conditions</h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 marker:text-indigo-400">
               {(po.orderType === "SO" ? docSettings?.soTerms : docSettings?.poTerms)?.map((term, i) => (
                   <li key={i}>{term}</li>
               )) || (
                   <li>Standard terms apply as per the framework agreement.</li>
               )}
            </ul>

            <div className="mt-16 flex justify-between items-end">
               <div>
                  <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Authorized Signatory</p>
                  <p className="text-xs text-slate-500 mt-1">For {docSettings?.companyName || "Global Tech Enterprise"}</p>
               </div>
               <div className="text-right flex items-center justify-end text-emerald-600 gap-2 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                  <span className="text-lg">✓</span>
                  System Generated & Autho-Approved Document
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
