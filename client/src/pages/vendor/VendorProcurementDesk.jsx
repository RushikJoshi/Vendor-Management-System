import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { ProcurementContext } from "../../context/ProcurementContext";
import { 
  Package, 
  Truck, 
  FileText, 
  CreditCard, 
  Clock, 
  ArrowUpRight, 
  Download,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  Calendar,
  Building2,
  ShieldCheck,
  Search,
  Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function VendorProcurementDesk() {
  const { loading, purchaseOrders, serviceOrders, deliveries, invoices, payments, refreshAll } =
    useContext(ProcurementContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders"); // orders, service, shipping, billing, payment, statement
  const printRef = useRef(null);

  useEffect(() => {
    refreshAll().catch(() => toast.error("Failed to sync procurement data"));
  }, [refreshAll]);

  // Calculations for Statement
  const totalBilled = useMemo(() => invoices.filter(i => i.status !== 'rejected').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0), [invoices]);
  const totalReceived = useMemo(() => payments.filter(p => p.status === 'completed' || p.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0), [payments]);
  const balance = totalBilled - totalReceived;

  const handlePrint = () => {
    window.print();
  };

  const StatusPill = ({ status }) => {
    const colors = {
      sent: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accepted: "bg-blue-50 text-blue-700 border-blue-100",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
      approved: "bg-indigo-100 text-indigo-700 border-indigo-100",
      rejected: "bg-rose-100 text-rose-700 border-rose-100",
      submitted: "bg-amber-50 text-amber-700 border-amber-100",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${colors[status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 space-y-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-xs font-black uppercase tracking-widest animate-pulse">Syncing Procurement Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Section - Hide on Print */}
      <div className="print:hidden bg-white border-b border-slate-200 px-6 py-8 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                <Building2 className="text-white" size={24} />
              </div>
              Procurement Desk
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage orders, deliveries and invoicing central hub.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate("shipment/update")} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
                <Truck size={16} /> Update Shipment
             </button>
             <button onClick={() => navigate("invoice/new")} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                <Plus size={16} /> New Invoice
             </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1400px] mx-auto mt-10 flex items-center gap-6 border-b border-slate-100">
          {[
            { id: "orders", label: "Purchase Orders", icon: Package, count: purchaseOrders.length },
            { id: "service", label: "Service Orders", icon: ShieldCheck, count: serviceOrders.length },
            { id: "shipping", label: "Deliveries", icon: Truck, count: deliveries.length },
            { id: "billing", label: "Invoices", icon: FileText, count: invoices.length },
            { id: "payment", label: "Payments", icon: CreditCard, count: payments.length },
            { id: "statement", label: "Statement", icon: Wallet, count: 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count > 0 && <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.3)]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1400px] mx-auto p-6">
        
        {/* STATEMENT VIEW - Professional Layout */}
        {activeTab === "statement" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Header - Hide on Print */}
            <div className="print:hidden flex items-center justify-between mb-2">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Financial Reconciliation</h3>
               <button 
                  onClick={handlePrint}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
               >
                  <Download size={16} /> Download PDF Statement
               </button>
            </div>

            {/* Summary Cards - Hide on Print */}
            <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Billed</p>
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">₹{totalBilled.toLocaleString()}</h4>
                  <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase">{invoices.length} Valid Invoices</p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Received</p>
                  <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">₹{totalReceived.toLocaleString()}</h4>
                  <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase">{payments.length} Successful Transfers</p>
               </div>
               <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Outstanding Balance</p>
                  <h4 className="text-4xl font-black tracking-tighter">₹{balance.toLocaleString()}</h4>
                  <div className="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(100, (totalReceived / (totalBilled || 1)) * 100)}%` }} />
                  </div>
               </div>
            </div>

            {/* THE PROFESSIONAL STATEMENT (Visible on screen and optimized for Print) */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
               {/* Print Header - ONLY VISIBLE ON PRINT */}
               <div className="hidden print:block p-10 border-b-4 border-slate-900 bg-white">
                  <div className="flex justify-between items-start">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-slate-900 rounded-2xl">
                              <Building2 className="text-white" size={32} />
                           </div>
                           <div>
                              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Statement of Account</h1>
                              <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Procurement Ledger • Audit Ready</p>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Reconciliation For</p>
                           <p className="text-xl font-black text-slate-900 uppercase">{invoices[0]?.vendorId?.companyName || invoices[0]?.vendorId?.name || "VENDOR NODE"}</p>
                           <p className="text-[10px] font-bold text-slate-500">{invoices[0]?.vendorId?.email}</p>
                        </div>
                     </div>
                     <div className="text-right space-y-4">
                        <div className="space-y-1">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date Generated</p>
                           <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase">{new Date().toLocaleTimeString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Outstanding</p>
                           <p className="text-2xl font-black text-indigo-600 tracking-tighter">₹{balance.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Table Header (Shared for screen and print) */}
               <div className="p-6 bg-slate-900 text-white flex items-center justify-between print:bg-slate-50 print:text-slate-900 print:border-b-2 print:border-slate-200">
                  <div className="flex items-center gap-3">
                     <Calendar size={16} className="text-indigo-400 print:text-slate-400" />
                     <h5 className="text-[11px] font-black uppercase tracking-widest">Transaction History & Settlements</h5>
                  </div>
                  <p className="text-[9px] font-bold uppercase opacity-60">Showing all records since account inception</p>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 print:bg-white print:border-b-2 print:border-slate-900">
                           <th className="px-8 py-5">Date</th>
                           <th className="px-8 py-5">Particulars / Ref No</th>
                           <th className="px-8 py-5 text-center">Type</th>
                           <th className="px-8 py-5 text-right">Debit (Billed)</th>
                           <th className="px-8 py-5 text-right">Credit (Paid)</th>
                           <th className="px-8 py-5 text-right">Balance</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {/* Combine Invoices and Payments for a chronological ledger */}
                        {(() => {
                           const combined = [
                              ...invoices.filter(i => i.status !== 'rejected').map(i => ({ date: new Date(i.date), type: 'invoice', ref: i.invoiceNumber, amount: i.totalAmount, label: 'Invoice Generated' })),
                              ...payments.filter(p => p.status === 'completed' || p.status === 'paid').map(p => ({ date: new Date(p.createdAt), type: 'payment', ref: p.transactionRef || p.paymentRef, amount: p.amount, label: 'Payment Settlement' }))
                           ].sort((a, b) => a.date - b.date);

                           let runningBalance = 0;
                           return combined.map((entry, idx) => {
                              if (entry.type === 'invoice') runningBalance += entry.amount;
                              else runningBalance -= entry.amount;

                              return (
                                 <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs font-bold print:hover:bg-transparent">
                                    <td className="px-8 py-4 text-slate-500">{entry.date.toLocaleDateString('en-GB')}</td>
                                    <td className="px-8 py-4">
                                       <p className="text-slate-900 uppercase font-black tracking-tight">{entry.label}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase">Ref: {entry.ref}</p>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${entry.type === 'invoice' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                          {entry.type}
                                       </span>
                                    </td>
                                    <td className="px-8 py-4 text-right font-black text-slate-900">
                                       {entry.type === 'invoice' ? `₹${entry.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-8 py-4 text-right font-black text-emerald-600">
                                       {entry.type === 'payment' ? `₹${entry.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-8 py-4 text-right font-black text-slate-900 bg-slate-50/30 print:bg-transparent">
                                       ₹{runningBalance.toLocaleString()}
                                    </td>
                                 </tr>
                              );
                           });
                        })()}
                     </tbody>
                  </table>
               </div>

               {/* Statement Footer - ONLY VISIBLE ON PRINT */}
               <div className="hidden print:block p-10 mt-10 border-t-2 border-slate-100">
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Declaration</h6>
                        <p className="text-[9px] font-bold text-slate-500 text-justify leading-relaxed uppercase">This is a computer generated statement and does not require a physical signature. The values shown represent the reconciliation between digital invoices submitted and bank settlement records verified by Gitakshmi Technologies.</p>
                     </div>
                     <div className="text-right space-y-2">
                        <div className="inline-block border-b-2 border-slate-900 w-48 mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest">System Authenticated By</p>
                        <p className="text-xs font-black text-indigo-600">VMSPRO CENTRAL HUB</p>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Disclaimer for screen */}
            <div className="print:hidden flex items-center gap-3 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-[11px] font-bold leading-relaxed">
                  <span className="font-black uppercase">Note:</span> For official audit purposes, please use the "Download PDF Statement" button above. The printed version is formatted specifically for financial records.
               </p>
            </div>
          </div>
        )}

        {/* Other Tabs - Hide on Print */}
        <div className="print:hidden">
          {activeTab === "orders" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {purchaseOrders.length > 0 ? purchaseOrders.map((po) => (
                <div key={po._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-indigo-400 transition-all group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Package size={24} />
                    </div>
                    <StatusPill status={po.status} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{po.poNumber}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Issued: {new Date(po.createdAt).toLocaleDateString()}</p>
                  
                  <div className="space-y-3 mb-8">
                     <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase">Items</span>
                        <span className="text-slate-900">{po.items?.length || 0} Lines</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase">Total Value</span>
                        <span className="text-indigo-600 font-black">₹{po.totalAmount?.toLocaleString()}</span>
                     </div>
                  </div>

                  <button onClick={() => navigate(`po/${po._id}`)} className="w-full py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    Review Order <ArrowRight size={14} />
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                   <Package size={48} className="mb-4 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">No active purchase orders found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "service" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {serviceOrders.length > 0 ? serviceOrders.map((so) => (
                <div key={so._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-sky-400 transition-all group shadow-sm hover:shadow-xl hover:shadow-sky-500/5">
                   <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-sky-600 group-hover:text-white transition-all">
                      <ShieldCheck size={24} />
                    </div>
                    <StatusPill status={so.status} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{so.poNumber}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Service Contract: {new Date(so.createdAt).toLocaleDateString()}</p>
                  
                  <div className="space-y-3 mb-8 text-xs font-bold">
                     <div className="flex justify-between"><span className="text-slate-400 uppercase">Service Status</span><span className="text-slate-900">Active</span></div>
                     <div className="flex justify-between"><span className="text-slate-400 uppercase">Commitment</span><span className="text-sky-600 font-black">₹{so.totalAmount?.toLocaleString()}</span></div>
                  </div>

                  <button onClick={() => navigate(`po/${so._id}`)} className="w-full py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    Open Contract <ArrowUpRight size={14} />
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                   <ShieldCheck size={48} className="mb-4 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">No service orders currently mapped</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-5">Shipment ID</th>
                        <th className="px-8 py-5">Carrier / Reference</th>
                        <th className="px-8 py-5">Expected Date</th>
                        <th className="px-8 py-5 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {deliveries.length > 0 ? deliveries.map(dl => (
                        <tr key={dl._id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-5 text-xs font-black text-slate-900 uppercase tracking-tight">{dl.deliveryNumber}</td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase">{dl.carrier || "Standard Freight"} • {dl.trackingNumber || "N/A"}</td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(dl.expectedDate).toLocaleDateString()}</td>
                           <td className="px-8 py-5 text-right"><StatusPill status={dl.status} /></td>
                        </tr>
                     )) : (
                        <tr><td colSpan="4" className="py-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">No active shipments in transit</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-5">Invoice #</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5">PO Link</th>
                        <th className="px-8 py-5 text-right">Amount</th>
                        <th className="px-8 py-5 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {invoices.length > 0 ? invoices.map(inv => (
                        <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-5 text-xs font-black text-slate-900 uppercase tracking-tight">{inv.invoiceNumber}</td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                           <td className="px-8 py-5 text-xs font-bold text-indigo-600 uppercase tracking-tighter cursor-pointer hover:underline">{inv.poId?.poNumber || "N/A"}</td>
                           <td className="px-8 py-5 text-right text-xs font-black text-slate-900">₹{inv.totalAmount?.toLocaleString()}</td>
                           <td className="px-8 py-5 text-right"><StatusPill status={inv.status} /></td>
                        </tr>
                     )) : (
                        <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">No billing records found</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {payments.length > 0 ? payments.map((p) => (
                <div key={p._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                         <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                            <CreditCard size={24} />
                         </div>
                         <StatusPill status={p.status || 'paid'} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Transaction Settled</p>
                      <h4 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter">₹{p.amount?.toLocaleString()}</h4>
                      <div className="pt-6 border-t border-slate-100 space-y-2">
                         <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-slate-400">Date</span><span className="text-slate-900">{new Date(p.createdAt).toLocaleDateString()}</span></div>
                         <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-slate-400">Ref</span><span className="text-slate-900">{p.transactionRef || p.paymentRef}</span></div>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                   <CreditCard size={48} className="mb-4 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">No payment history available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global CSS for Printing Statement */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide EVERYTHING by default */
          .print\\:hidden, 
          nav, 
          header, 
          footer, 
          .sidebar, 
          aside,
          button,
          .Toaster {
            display: none !important;
          }
          /* Show only the statement content */
          .min-h-screen {
            background: white !important;
            padding: 0 !important;
          }
          .max-w-\\[1400px\\] {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-slate-50\\/50, .bg-slate-50 {
            background: white !important;
          }
          .rounded-\\[2rem\\], .rounded-\\[2\\.5rem\\] {
            border-radius: 0 !important;
          }
          .shadow-sm, .shadow-xl {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #eee !important;
          }
          /* Professional Table Printing */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #f1f5f9 !important;
            padding: 12px 15px !important;
          }
          thead th {
            background-color: #f8fafc !important;
            color: #0f172a !important;
            border-bottom: 2px solid #0f172a !important;
          }
        }
      `}} />
    </div>
  );
}
