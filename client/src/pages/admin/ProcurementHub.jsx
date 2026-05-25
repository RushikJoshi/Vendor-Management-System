import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProcurementContext } from "../../context/ProcurementContext";
import { 
  ArrowRight, 
  Truck, 
  LayoutDashboard, 
  FileSearch, 
  PackageCheck, 
  WalletCards,
  Plus,
  ArrowUpRight,
  Clock,
  Search,
  Download,
  Loader2,
  Users,
  AlertCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  Ban,
  Receipt,
  Building2,
  Calendar,
  Wallet,
  MessageCircle,
  FileSignature,
  History,
  TrendingUp,
  ChevronRight,
  UserCheck
} from "lucide-react";
import procurementApi from "../../services/procurementApi";
import api from "../../services/api";

const emptyPrItem = { description: "", quantity: 1, estimatedUnitPrice: 0, uom: "Nos", specs: "" };

export default function ProcurementHub() {
  const { loading, overview, purchaseRequests, purchaseOrders, serviceOrders, deliveries, invoices, payments, slaBreaches, refreshAll } =
    useContext(ProcurementContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [allComments, setAllComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorStatement, setVendorStatement] = useState(null);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [working, setWorking] = useState(false);
  const [reviewModal, setReviewModal] = useState({ open: false, id: null, status: "", reason: "" });

  useEffect(() => {
    refreshAll().catch(() => toast.error("Failed to load procurement data"));
    fetchVendors();
    fetchAllComments();
  }, [refreshAll]);

  const fetchAllComments = async () => {
     setLoadingComments(true);
     try {
        const res = await procurementApi.getAllComments();
        setAllComments(res.data.data || []);
     } catch (err) {
        console.error("Failed to load discussion stream", err);
     } finally {
        setLoadingComments(false);
     }
  };

  const fetchVendors = async () => {
     try {
        const res = await api.get("/vendors");
        setVendors(res.data.data || []);
     } catch (err) {
        console.error("Failed to fetch vendors", err);
     }
  };

  const fetchVendorStatement = async (vId) => {
     if (!vId) return;
     setLoadingStatement(true);
     try {
        const res = await procurementApi.getVendorStatementForAdmin(vId);
        setVendorStatement(res.data.data);
     } catch (err) {
        toast.error("Failed to load vendor statement");
     } finally {
        setLoadingStatement(false);
     }
  };

  useEffect(() => {
     if (selectedVendorId) fetchVendorStatement(selectedVendorId);
     else setVendorStatement(null);
  }, [selectedVendorId]);

  const StatusPill = ({ status }) => {
    const colors = {
      sent: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accepted: "bg-blue-50 text-blue-700 border-blue-100",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
      approved: "bg-indigo-100 text-indigo-700 border-indigo-100",
      rejected: "bg-rose-100 text-rose-700 border-rose-100",
      submitted: "bg-amber-50 text-amber-700 border-amber-100",
      verified: "bg-sky-100 text-sky-700 border-sky-200",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${colors[status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
        {status}
      </span>
    );
  };

  const pendingInvoices = useMemo(() => invoices.filter(i => i.status === 'approved' || i.status === 'submitted'), [invoices]);

  const handlePrint = () => {
     window.print();
  };

  if (loading && !overview) {
     return (
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
           <Loader2 className="animate-spin text-indigo-600" size={40} />
           <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Global Procurement Node...</p>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="print:hidden bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
         <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl">
                     <PackageCheck className="text-white" size={24} />
                  </div>
                  Procurement Hub
               </h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">End-to-End Enterprise Procurement Workflow</p>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => navigate("/admin/procurement/shipments")}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95"
               >
                  <Truck size={16} /> Track Logistics
               </button>
               <button onClick={refreshAll} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                  <Clock size={18} />
               </button>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="max-w-[1600px] mx-auto mt-8 flex items-center gap-8 border-b border-slate-100">
            {[
               { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
               { id: "sourcing", label: "Sourcing & Bidding", icon: FileSearch },
               { id: "operations", label: "Orders & Delivery", icon: PackageCheck },
               { id: "financials", label: "Financials & SOA", icon: WalletCards },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
               >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.3)]" />}
               </button>
            ))}
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
         
         {/* --- DASHBOARD TAB --- */}
         {activeTab === "dashboard" && (
            <div className="print:hidden space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     { label: "Pending PRs", value: overview?.prPending, color: "text-amber-600", bg: "bg-amber-50" },
                     { label: "Open RFQs", value: overview?.openRfqs, color: "text-indigo-600", bg: "bg-indigo-50" },
                     { label: "Pending Shipments", value: overview?.inTransitDeliveries, color: "text-sky-600", bg: "bg-sky-50" },
                     { label: "Unpaid Invoices", value: pendingInvoices.length, color: "text-rose-600", bg: "bg-rose-50" },
                  ].map(stat => (
                     <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                           <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value || 0}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                           <ArrowUpRight size={20} />
                        </div>
                     </div>
                  ))}
               </div>

               {/* Quick Payment Action */}
               <div className="bg-white rounded-2xl border-2 border-indigo-500/10 p-6 space-y-4 shadow-xl shadow-indigo-500/5">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Receipt size={16} /></div>
                        Pending Payments Quick Action
                     </h3>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50">
                           <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                              <th className="px-4 py-3">Invoice #</th>
                              <th className="px-4 py-3">Vendor & Bank Details</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                              <th className="px-4 py-3 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {pendingInvoices.length > 0 ? pendingInvoices.map(inv => (
                              <tr key={inv._id} className="text-xs hover:bg-slate-50 transition-colors">
                                 <td className="px-4 py-4 font-black text-slate-900">{inv.invoiceNumber}</td>
                                 <td className="px-4 py-4">
                                    <p className="font-bold text-slate-700">{inv.vendorId?.companyName || inv.vendorId?.name}</p>
                                    <p className="text-[9px] text-indigo-600 font-black uppercase">Bank: {inv.vendorId?.bankAccount?.bankName || "N/A"} • Acc: {inv.vendorId?.bankAccount?.accountNumber || "N/A"}</p>
                                 </td>
                                 <td className="px-4 py-4 text-right font-black text-slate-900">₹{inv.totalAmount?.toLocaleString()}</td>
                                 <td className="px-4 py-4 text-right">
                                    <button onClick={() => navigate(`/admin/procurement/payment/${inv._id}`)} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-all">
                                       Pay Now
                                    </button>
                                 </td>
                              </tr>
                           )) : (
                              <tr><td colSpan="4" className="py-10 text-center text-slate-300 font-black uppercase text-[10px]">No pending invoices</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Real-time Discussion Ledger */}
               <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 text-white rounded-lg"><MessageCircle size={16} /></div>
                        Real-time Discussion Ledger
                     </h3>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                     {loadingComments ? (
                        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
                     ) : allComments.length > 0 ? (
                        allComments.map(comment => (
                           <div key={comment._id} className="p-5 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start gap-4">
                                 <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${comment.userId?.role === 'vendor' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                                    {comment.userId?.name?.charAt(0).toUpperCase()}
                                 </div>
                                 <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[11px] font-black text-slate-900 uppercase">{comment.userId?.name}</span>
                                       <span className="text-[10px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{comment.content}</p>
                                    <button onClick={() => navigate(comment.targetModel === 'PurchaseOrder' ? `/admin/procurement/po/${comment.targetId}` : `/admin/rfqs`)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 hover:underline">
                                       View Context →
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-10 text-center text-slate-300 font-black uppercase text-[10px]">No recent messages</div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* --- SOURCING TAB --- */}
         {activeTab === "sourcing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Procurement Requests (PR)</h3>
                  <button onClick={() => navigate("/admin/rfqs/create")} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black">
                     <Plus size={16} /> New Sourcing Event
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchaseRequests.map(pr => (
                     <div key={pr._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                              <FileSearch size={24} />
                           </div>
                           <StatusPill status={pr.status} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">{pr.title}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Ref: #{pr._id.slice(-6).toUpperCase()}</p>
                        <div className="space-y-3 mb-6">
                           <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase">Items</span><span className="text-slate-900">{pr.items?.length || 0} Lines</span></div>
                           <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase">Priority</span><span className="text-indigo-600 uppercase">Standard</span></div>
                        </div>
                        <button className="w-full py-3.5 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                           Review Request
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* --- OPERATIONS TAB --- */}
         {activeTab === "operations" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Purchase Orders */}
               <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                     <div className="h-2 w-2 bg-indigo-600 rounded-full"></div> Purchase Orders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {purchaseOrders.map(po => (
                        <div key={po._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-600 transition-all">
                           <div className="flex justify-between mb-4">
                              <span className="text-[10px] font-black uppercase text-indigo-600">{po.poNumber}</span>
                              <StatusPill status={po.status} />
                           </div>
                           <h4 className="text-lg font-black text-slate-900 mb-4">{po.vendorId?.companyName || "Vendor"}</h4>
                           <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Order Value</span>
                                 <span className="text-xl font-black text-slate-900">₹{po.totalAmount?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 {po.status !== 'paid' && (
                                    <button 
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          const inv = (invoices || []).find(i => String(i.poId?._id || i.poId) === String(po._id));
                                          if (inv) navigate(`/admin/procurement/payment/${inv._id}`);
                                          else navigate(`/admin/procurement/po/${po._id}`);
                                       }}
                                       className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-all flex items-center gap-2"
                                    >
                                       <CreditCard size={12} /> Pay
                                    </button>
                                 )}
                                 <button onClick={() => navigate(`/admin/procurement/po/${po._id}`)} className="p-2 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-xl transition-all">
                                    <ArrowRight size={18} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Service Orders */}
               <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                     <div className="h-2 w-2 bg-emerald-600 rounded-full"></div> Service Orders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {serviceOrders.map(so => (
                        <div key={so._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-emerald-600 transition-all">
                           <div className="flex justify-between mb-4">
                              <span className="text-[10px] font-black uppercase text-emerald-600">{so.poNumber}</span>
                              <StatusPill status={so.status} />
                           </div>
                           <h4 className="text-lg font-black text-slate-900 mb-4">{so.vendorId?.companyName || "Service Partner"}</h4>
                           <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                              <span className="text-xl font-black text-slate-900">₹{so.totalAmount?.toLocaleString()}</span>
                              <button onClick={() => navigate(`/admin/procurement/po/${so._id}`)} className="p-2 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-xl transition-all">
                                 <ArrowRight size={18} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            </div>
         )}

         {/* --- FINANCIALS & SOA TAB --- */}
         {activeTab === "financials" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="print:hidden bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                     <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                           <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Users size={20} /></div>
                           Vendor Statement of Account (SOA)
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Financial Reconciliation & Audit</p>
                     </div>
                     <div className="w-full md:w-80">
                        <select value={selectedVendorId} onChange={e => setSelectedVendorId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 appearance-none focus:ring-2 ring-indigo-500/20">
                           <option value="">Select a Vendor to Audit...</option>
                           {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.companyName})</option>)}
                        </select>
                     </div>
                  </div>

                  {selectedVendorId && vendorStatement && (
                     <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Exposure</p>
                              <h4 className="text-3xl font-black text-slate-900">₹{vendorStatement.totalBilled?.toLocaleString()}</h4>
                           </div>
                           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Settlements</p>
                              <h4 className="text-3xl font-black text-emerald-600">₹{vendorStatement.totalPaid?.toLocaleString()}</h4>
                           </div>
                           <div className="p-6 bg-indigo-900 rounded-2xl text-white shadow-xl text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Net Outstanding</p>
                              <h4 className="text-3xl font-black">₹{vendorStatement.balance?.toLocaleString()}</h4>
                           </div>
                        </div>
                        <div className="flex justify-end gap-3">
                           <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200">
                              <Download size={16} /> Export Official SOA PDF
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* Professional Statement Table */}
               {selectedVendorId && vendorStatement && (
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
                     <div className="hidden print:block p-10 border-b-4 border-slate-900 bg-white">
                        <div className="flex justify-between items-start">
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="p-3 bg-slate-900 rounded-2xl"><Building2 className="text-white" size={32} /></div>
                                 <div>
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Statement of Account</h1>
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Administrative Audit Ledger</p>
                                 </div>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Audited Vendor</p>
                                 <p className="text-xl font-black text-slate-900 uppercase">{vendors.find(v => v._id === selectedVendorId)?.companyName || "N/A"}</p>
                              </div>
                           </div>
                           <div className="text-right space-y-4">
                              <div className="space-y-1">
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date Generated</p>
                                 <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Exposure</p>
                                 <p className="text-2xl font-black text-indigo-600 tracking-tighter">₹{vendorStatement.balance?.toLocaleString()}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-slate-900 text-white flex items-center justify-between print:bg-slate-50 print:text-slate-900 print:border-b-2 print:border-slate-200">
                        <div className="flex items-center gap-3"><Calendar size={16} className="text-indigo-400" /><h5 className="text-[11px] font-black uppercase tracking-widest">Master Transaction History</h5></div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 print:bg-white print:border-b-2 print:border-slate-900">
                                 <th className="px-8 py-5">Date</th><th className="px-8 py-5">Description</th><th className="px-8 py-5 text-right">Billed (DR)</th><th className="px-8 py-5 text-right">Settled (CR)</th><th className="px-8 py-5 text-right">Running Balance</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {(() => {
                                 const combined = [
                                    ...vendorStatement.invoices.map(i => ({ date: new Date(i.date), type: 'invoice', ref: i.number, amount: i.amount, label: 'Invoice Submission' })),
                                    ...vendorStatement.payments.map(p => ({ date: new Date(p.date), type: 'payment', ref: p.ref, amount: p.amount, label: 'Bank Settlement' }))
                                 ].sort((a, b) => a.date - b.date);
                                 let runningBalance = 0;
                                 return combined.map((entry, idx) => {
                                    if (entry.type === 'invoice') runningBalance += entry.amount;
                                    else runningBalance -= entry.amount;
                                    return (
                                       <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs font-bold print:hover:bg-transparent">
                                          <td className="px-8 py-4 text-slate-500">{entry.date.toLocaleDateString('en-GB')}</td>
                                          <td className="px-8 py-4 uppercase font-black tracking-tight">{entry.label} <span className="text-[9px] text-slate-400 ml-2">REF: {entry.ref}</span></td>
                                          <td className="px-8 py-4 text-right font-black text-slate-900">{entry.type === 'invoice' ? `₹${entry.amount.toLocaleString()}` : '-'}</td>
                                          <td className="px-8 py-4 text-right font-black text-emerald-600">{entry.type === 'payment' ? `₹${entry.amount.toLocaleString()}` : '-'}</td>
                                          <td className="px-8 py-4 text-right font-black text-slate-900 bg-slate-50/30 print:bg-transparent">₹{runningBalance.toLocaleString()}</td>
                                       </tr>
                                    );
                                 });
                              })()}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>

      {/* Global CSS for Printing Statement */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .print\\:hidden, nav, header, footer, .sidebar, aside, button, .Toaster { display: none !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          .max-w-\\[1600px\\] { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .bg-slate-50\\/50, .bg-slate-50 { background: white !important; }
          .rounded-\\[2rem\\], .rounded-2xl { border-radius: 0 !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #f1f5f9 !important; padding: 12px 15px !important; }
          thead th { background-color: #f8fafc !important; color: #0f172a !important; border-bottom: 2px solid #0f172a !important; }
        }
      `}} />
    </div>
  );
}
