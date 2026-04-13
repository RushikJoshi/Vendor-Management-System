import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, CreditCard, Building2, CheckCircle2, ReceiptText, ShieldCheck } from "lucide-react";
import { ProcurementContext } from "../../context/ProcurementContext";
import procurementApi from "../../services/procurementApi";

export default function PaymentCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, refreshAll } = useContext(ProcurementContext);
  
  const [invoice, setInvoice] = useState(null);
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState({
    method: "bank_transfer",
    reference: "",
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const found = invoices.find(inv => inv._id === id);
      if (found) {
        setInvoice(found);
      }
    }
  }, [invoices, id]);

  const handlePay = async () => {
    if (!form.reference.trim()) return toast.error("Transaction reference/UTR is mandatory");
    
    setWorking(true);
    try {
      await procurementApi.payInvoice(id, {
        method: form.method,
        reference: form.reference,
        paymentDate: form.paymentDate
      });
      toast.success("Payment recorded and invoice settled");
      await refreshAll();
      navigate("/admin/procurement");
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment processing failed");
    } finally {
      setWorking(false);
    }
  };

  if (!invoice) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-20 fade-in p-3 md:p-5">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 px-2 border-b border-slate-200">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Checkout</h1>
          <p className="text-xs text-slate-500 font-medium tracking-tight">Process and record official disbursement to vendor bank accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form & Bank Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Bank Details Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-indigo-50/30 px-6 py-4 border-b border-indigo-100/50 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                  <Building2 size={14} /> Vendor Bank Beneficiary
                </h2>
                <span className="text-[10px] font-bold text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-100">Verified Destination</span>
             </div>
             <div className="p-6">
                {invoice.vendorId?.bankAccount ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Holder Name</p>
                        <p className="text-sm font-bold text-slate-800 uppercase">{invoice.vendorId.bankAccount.accountHolderName || invoice.vendorId.name}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bank Name</p>
                        <p className="text-sm font-bold text-slate-800 uppercase">{invoice.vendorId.bankAccount.bankName || "N/A"}</p>
                     </div>
                     <div className="space-y-1 group bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Number</p>
                        <div className="flex items-center justify-between">
                           <p className="text-lg font-black text-slate-900 tracking-tight">{invoice.vendorId.bankAccount.accountNumber}</p>
                           <button 
                              onClick={() => {
                                 navigator.clipboard.writeText(invoice.vendorId.bankAccount.accountNumber);
                                 toast.success("Account number copied");
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:bg-white px-2 py-1 rounded-lg transition-all"
                           >
                              COPY
                           </button>
                        </div>
                     </div>
                     <div className="space-y-1 group bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">IFSC Code</p>
                        <div className="flex items-center justify-between">
                           <p className="text-lg font-black text-slate-900 tracking-tight">{invoice.vendorId.bankAccount.ifscCode}</p>
                           <button 
                              onClick={() => {
                                 navigator.clipboard.writeText(invoice.vendorId.bankAccount.ifscCode);
                                 toast.success("IFSC code copied");
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:bg-white px-2 py-1 rounded-lg transition-all"
                           >
                              COPY
                           </button>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bank details not provided by vendor</p>
                     <p className="text-[10px] text-slate-400 mt-1 italic">Please contact the vendor to update their financial profile.</p>
                  </div>
                )}
             </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
               <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                 <CreditCard size={14} /> Recording Payment Reference
               </h2>
            </div>
            <div className="p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Payment Method</label>
                    <select 
                       value={form.method} 
                       onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    >
                       <option value="bank_transfer">Bank Transfer / NEFT</option>
                       <option value="rtgs">RTGS</option>
                       <option value="imps">IMPS</option>
                       <option value="upi">UPI Transfer</option>
                       <option value="cheque">Corporate Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Payment Date</label>
                    <input 
                       type="date"
                       value={form.paymentDate}
                       onChange={(e) => setForm(p => ({ ...p, paymentDate: e.target.value }))}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Transaction Reference / UTR Number</label>
                  <input 
                     type="text" 
                     placeholder="e.g. TXN1234567890"
                     value={form.reference}
                     onChange={(e) => setForm(p => ({ ...p, reference: e.target.value }))}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                     autoFocus
                  />
                  <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Please ensure UTR is exactly as per bank records for audit verification.</p>
               </div>
            </div>
          </section>

          <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                   <ShieldCheck className="text-emerald-400" size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-lg mb-1">Final Approval & Disbursement</h3>
                   <p className="text-slate-400 text-xs leading-relaxed">By clicking the button below, you confirm that the funds have been disbursed to the vendor's bank account. This action will settle the invoice and notify the vendor.</p>
                </div>
             </div>
             <button 
                disabled={working || !form.reference.trim()}
                onClick={handlePay}
                className="w-full mt-6 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
             >
                {working ? "Recording Transfer..." : "Settle & Release Funds"}
             </button>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
           <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                 <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Disbursement Summary</h2>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-medium">Invoice Number</span>
                       <span className="text-slate-900 font-black">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-medium">Vendor Target</span>
                       <span className="text-indigo-600 font-black uppercase">{invoice.vendorId?.name || "Vendor"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-medium">Due Date</span>
                       <span className="text-slate-900 font-black">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                 </div>

                 <div className="border-t border-dashed border-slate-200 pt-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Net Payable Amount</p>
                       <p className="text-3xl font-black text-slate-900">₹{invoice.totalAmount?.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 items-start">
                    <ReceiptText className="text-orange-600 shrink-0" size={16} />
                    <p className="text-[10px] text-orange-700 font-bold leading-relaxed uppercase italic">
                       This payment is tax inclusive. Please ensure TDS compliance as per local laws before submission.
                    </p>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
