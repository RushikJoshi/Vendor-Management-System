import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Box, FileText, Upload } from "lucide-react";
import procurementApi from "../../services/procurementApi";
import { ProcurementContext } from "../../context/ProcurementContext";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { purchaseOrders, refreshAll } = useContext(ProcurementContext);
  const [working, setWorking] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    poId: "",
    invoiceNumber: "",
    dueDate: "",
    taxAmount: 0,
    lines: [{ itemName: "General Supplied Goods", quantity: 1, unitPrice: 0 }],
  });

  const myPos = purchaseOrders || [];

  const submitInvoice = async () => {
    if (!invoiceForm.poId || !invoiceForm.invoiceNumber || !invoiceForm.dueDate) {
      return toast.error("PO Reference, Invoice Number, and Due Date are required");
    }
    setWorking(true);
    try {
      await procurementApi.createInvoice({
        ...invoiceForm,
        invoiceDate: new Date().toISOString(),
      });
      toast.success("Invoice successfully submitted");
      await refreshAll();
      navigate("/vendor/procurement");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invoice submission failed");
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
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Generate Digital Invoice</h1>
                <p className="text-xs font-medium text-slate-500">Create and submit an invoice against an active purchase order.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Form Container */}
      <div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
           <div className="border-b border-slate-100 bg-slate-50 p-6 flex flex-col gap-2">
               <div className="h-12 w-12 bg-white flex items-center justify-center rounded-xl shadow-sm mb-2 text-indigo-600">
                    <FileText size={24} />
               </div>
               <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
               <p className="text-sm text-slate-500">Please provide accurate billing information to ensure prompt payment.</p>
           </div>
           
           <div className="p-8 space-y-8">
              {/* Order Reference */}
              <div className="space-y-4">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Purchase Reference</h3>
                 <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Select Purchase Order <span className="text-rose-500">*</span></label>
                    <select
                      value={invoiceForm.poId}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, poId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                    >
                       <option value="">Select Order to Invoice</option>
                       {myPos.map(po => <option key={po._id} value={po._id}>{po.poNumber}</option>)}
                    </select>
                 </div>
              </div>

              {/* Invoice Information */}
              <div className="space-y-4">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Billing Information</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Invoice Identifier <span className="text-rose-500">*</span></label>
                        <input
                          placeholder="e.g. INV-2026-XXXX"
                          value={invoiceForm.invoiceNumber}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Payment Due Date <span className="text-rose-500">*</span></label>
                        <input
                          type="date"
                          value={invoiceForm.dueDate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Tax Component (%)</label>
                        <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={invoiceForm.taxAmount}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, taxAmount: Number(e.target.value) })}
                              className="w-full rounded-xl border border-slate-200 py-3.5 pl-3.5 pr-10 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50"
                            />
                            <div className="absolute right-4 top-3.5 text-slate-400 font-bold">%</div>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">Total payable tax percentage to be applied</p>
                    </div>
                 </div>
              </div>

              {/* Form Action */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                 <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                 >
                    Cancel
                 </button>
                 <button
                    onClick={submitInvoice}
                    disabled={working}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {working ? (
                      <span className="flex items-center gap-2">Processing...</span>
                    ) : (
                      <>
                        <Upload size={16} />
                        Submit Digital Invoice
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
