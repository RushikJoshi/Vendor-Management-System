import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Lock, Smartphone, Building2 } from "lucide-react";
import api from "../../services/api";

export default function ClientPaymentCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [working, setWorking] = useState(false);
  const [paymentMode, setPaymentMode] = useState('card'); // card, upi, netbanking
  
  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    upiId: "",
    bank: ""
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/sales-orders/${id}`);
      setOrder(res.data.data);
      if (res.data.data?.status === 'Paid') {
        toast.success("This order is already paid.");
        navigate(`/client/orders/${id}`);
      }
    } catch (err) {
      toast.error("Failed to fetch order details");
      navigate(-1);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    
    if (paymentMode === 'card') {
      if (!form.cardNumber || !form.expiry || !form.cvv || !form.name) {
        return toast.error("Please fill in all card details");
      }
    } else if (paymentMode === 'upi') {
      if (!form.upiId) return toast.error("Please enter your UPI ID");
    } else if (paymentMode === 'netbanking') {
      if (!form.bank) return toast.error("Please select a bank");
    }
    
    setWorking(true);
    const toastId = toast.loading("Processing your payment securely...");
    
    const methodStr = paymentMode === 'card' ? 'Credit/Debit Card' : paymentMode === 'upi' ? 'UPI' : 'Netbanking';
    
    try {
      await api.post(`/sales-orders/${id}/pay`, {
        paymentMethod: methodStr,
        reference: `TXN-${Math.floor(Math.random() * 1000000000)}`
      });
      toast.success("Payment successful! Order is now paid.", { id: toastId });
      navigate(`/client/orders/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment processing failed", { id: toastId });
    } finally {
      setWorking(false);
    }
  };

  if (!order) return (
    <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Loading secure checkout...</p>
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Secure Payment Checkout <Lock size={18} className="text-slate-400" />
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-tight">Complete your payment to finalize the sales order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Payment Mode Tabs */}
            <div className="bg-slate-50 flex gap-6 px-6 pt-2 border-b border-slate-200 overflow-x-auto hide-scrollbar">
               <button 
                  onClick={() => setPaymentMode('card')} 
                  className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${paymentMode === 'card' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                  <CreditCard size={16} /> Credit / Debit Card
               </button>
               <button 
                  onClick={() => setPaymentMode('upi')} 
                  className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${paymentMode === 'upi' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                  <Smartphone size={16} /> UPI
               </button>
               <button 
                  onClick={() => setPaymentMode('netbanking')} 
                  className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${paymentMode === 'netbanking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                  <Building2 size={16} /> Netbanking
               </button>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-5">
               
               {/* CARD FORM */}
               {paymentMode === 'card' && (
                 <div className="space-y-5 fade-in">
                   <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                      <input 
                         type="text" 
                         placeholder="John Doe"
                         value={form.name}
                         onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                      />
                   </div>
                   
                   <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Card Number</label>
                      <div className="relative">
                        <input 
                           type="text" 
                           placeholder="0000 0000 0000 0000"
                           maxLength={16}
                           value={form.cardNumber}
                           onChange={(e) => setForm(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, '') }))}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all tracking-widest"
                        />
                        <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                        <input 
                           type="text" 
                           placeholder="MM/YY"
                           maxLength={5}
                           value={form.expiry}
                           onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
                              setForm(p => ({ ...p, expiry: val }));
                           }}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all tracking-widest"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">CVV</label>
                        <input 
                           type="password" 
                           placeholder="123"
                           maxLength={4}
                           value={form.cvv}
                           onChange={(e) => setForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all tracking-widest"
                        />
                      </div>
                   </div>
                 </div>
               )}

               {/* UPI FORM */}
               {paymentMode === 'upi' && (
                 <div className="space-y-5 fade-in py-4">
                   <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-6">
                     <p className="text-xs font-bold text-indigo-600">Enter your UPI ID to receive a payment request on your app.</p>
                   </div>
                   <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Virtual Payment Address (UPI ID)</label>
                      <input 
                         type="text" 
                         placeholder="e.g. john@upi or 9876543210@paytm"
                         value={form.upiId}
                         onChange={(e) => setForm(p => ({ ...p, upiId: e.target.value }))}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                      />
                   </div>
                 </div>
               )}

               {/* NETBANKING FORM */}
               {paymentMode === 'netbanking' && (
                 <div className="space-y-5 fade-in py-4">
                   <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Your Bank</label>
                      <select 
                         value={form.bank}
                         onChange={(e) => setForm(p => ({ ...p, bank: e.target.value }))}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                      >
                         <option value="">Select bank...</option>
                         <option value="sbi">State Bank of India</option>
                         <option value="hdfc">HDFC Bank</option>
                         <option value="icici">ICICI Bank</option>
                         <option value="axis">Axis Bank</option>
                         <option value="kotak">Kotak Mahindra Bank</option>
                         <option value="pnb">Punjab National Bank</option>
                      </select>
                   </div>
                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                     <p className="text-xs font-bold text-amber-700">You will be securely redirected to your bank's portal to complete this transaction.</p>
                   </div>
                 </div>
               )}
               
               <div className="pt-6">
                 <button 
                    type="submit"
                    disabled={working}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                 >
                    {working ? "Processing..." : `PAY ₹${order.totalAmount?.toLocaleString()}`}
                 </button>
                 <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                   <ShieldCheck size={14} /> 256-bit SSL Encrypted
                 </div>
               </div>
            </form>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
           <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                 <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Order Summary</h2>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-medium">Order Number</span>
                       <span className="text-slate-900 font-black">{order.soNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-medium">Date</span>
                       <span className="text-slate-900 font-black">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                 </div>

                 <div className="border-t border-dashed border-slate-200 pt-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Payable</p>
                       <p className="text-4xl font-black text-indigo-600">₹{order.totalAmount?.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-3 items-start">
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
                    <p className="text-[10px] text-emerald-700 font-bold leading-relaxed uppercase">
                       Your payment is securely processed. An invoice receipt will be generated automatically.
                    </p>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
