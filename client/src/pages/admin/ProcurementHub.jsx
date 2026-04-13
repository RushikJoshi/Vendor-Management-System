import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProcurementContext } from "../../context/ProcurementContext";
import { ArrowRight, Truck } from "lucide-react";
import procurementApi from "../../services/procurementApi";

const emptyPrItem = { description: "", quantity: 1, estimatedUnitPrice: 0, uom: "Nos", specs: "" };

export default function ProcurementHub() {
  const { loading, overview, purchaseRequests, purchaseOrders, deliveries, invoices, payments, slaBreaches, refreshAll } =
    useContext(ProcurementContext);
  const navigate = useNavigate();

  const [prForm, setPrForm] = useState({
    title: "",
    description: "",
    currency: "INR",
    requiredBy: "",
    items: [{ ...emptyPrItem }],
  });
  const [rfqDraft, setRfqDraft] = useState({ quoteDeadline: "", deliveryDeadline: "", publish: true });
   const [working, setWorking] = useState(false);
   const [reviewModal, setReviewModal] = useState({ open: false, id: null, status: "", reason: "" });

  useEffect(() => {
    refreshAll().catch(() => toast.error("Failed to load procurement data"));
  }, [refreshAll]);

  const latestApprovedPr = useMemo(
    () => purchaseRequests.find((item) => item.status === "approved" && !item.rfqId),
    [purchaseRequests]
  );

  const latestRfqId = useMemo(() => purchaseOrders[0]?.rfqId?._id || purchaseOrders[0]?.rfqId || "", [purchaseOrders]);

  const handleCreatePr = async (submit = false) => {
    setWorking(true);
    try {
      await procurementApi.createPR({
        ...prForm,
        submit,
      });
      toast.success(submit ? "PR submitted" : "PR draft created");
      setPrForm({ title: "", description: "", currency: "INR", requiredBy: "", items: [{ ...emptyPrItem }] });
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create PR");
    } finally {
      setWorking(false);
    }
  };

  const approvePr = async (prId, approve) => {
    setWorking(true);
    try {
      await procurementApi.approvePR(prId, { approve, remarks: approve ? "Approved in hub" : "Rejected in hub" });
      toast.success(approve ? "PR approved" : "PR rejected");
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setWorking(false);
    }
  };

  const convertToRfq = async () => {
    if (!latestApprovedPr?._id) return toast.error("No approved PR available");
    if (!rfqDraft.quoteDeadline) return toast.error("Quote deadline is required");
    setWorking(true);
    try {
      await procurementApi.convertPRToRFQ(latestApprovedPr._id, {
        quoteDeadline: rfqDraft.quoteDeadline,
        deliveryDeadline: rfqDraft.deliveryDeadline || null,
        publish: rfqDraft.publish,
      });
      toast.success("RFQ created from PR");
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Conversion failed");
    } finally {
      setWorking(false);
    }
  };

  const runComparisonAndSelectTop = async () => {
    if (!latestRfqId) return toast.error("No RFQ with quotations found yet");
    setWorking(true);
    try {
      const comparison = await procurementApi.getComparison(latestRfqId);
      const best = comparison.data.data?.[0];
      if (!best?.quotationId) {
        toast.error("No quotations available for comparison");
      } else {
        await procurementApi.selectVendor(best.quotationId);
        toast.success("Top vendor selected and PO created");
        await refreshAll();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Comparison failed");
    } finally {
      setWorking(false);
    }
  };

  const reviewInvoice = async () => {
    if (!reviewModal.reason.trim()) return toast.error("A reason or remark is required");
    
    setWorking(true);
    try {
      await procurementApi.reviewInvoice(reviewModal.id, { 
        approve: reviewModal.status === 'approved', 
        reason: reviewModal.reason 
      });
      toast.success("Invoice status updated");
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Review failed");
    } finally {
      setWorking(false);
      setReviewModal({ open: false, id: null, status: "", reason: "" });
    }
  };

   const handlePay = (inv) => {
     navigate(`/admin/procurement/payment/${inv._id}`);
   };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Procurement Hub</h1>
          <p className="mt-1 text-sm text-slate-500">End-to-end flow: PR to RFQ to Quotation to Selection to PO to Delivery to Invoice to Payment.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/procurement/shipments")}
          className="bg-indigo-600 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
        >
          <Truck size={18} /> Manage Logistics & Shipments
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        { [
          ["Pending PR", overview?.prPending || 0, null],
          ["Open RFQ", overview?.openRfqs || 0, null],
          ["Quotations", overview?.quotations || 0, null],
          ["Open PO", overview?.openPOs || 0, null],
          ["Deliveries", overview?.inTransitDeliveries || 0, "/admin/procurement/shipments"],
          ["Invoices", overview?.pendingInvoices || 0, null],
          ["Payments", overview?.pendingPayments || 0, null],
          ["SLA Breach", overview?.breachedSLAs || 0, null],
        ].map(([label, value, link]) => (
          <div 
            key={label} 
            onClick={() => link && navigate(link)}
            className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all ${link ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md' : ''}`}
          >
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xl font-bold text-slate-900">{value}</p>
              {link && <ArrowRight size={14} className="text-indigo-500" />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">1) Create Purchase Request</h2>
          <input
            value={prForm.title}
            onChange={(e) => setPrForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="PR title"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            value={prForm.description}
            onChange={(e) => setPrForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="PR description"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={3}
          />
          {prForm.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input
                value={item.description}
                onChange={(e) =>
                  setPrForm((prev) => ({
                    ...prev,
                    items: prev.items.map((row, i) => (i === idx ? { ...row, description: e.target.value } : row)),
                  }))
                }
                placeholder="Item description"
                className="col-span-6 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  setPrForm((prev) => ({
                    ...prev,
                    items: prev.items.map((row, i) => (i === idx ? { ...row, quantity: Number(e.target.value || 1) } : row)),
                  }))
                }
                className="col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                value={item.estimatedUnitPrice}
                onChange={(e) =>
                  setPrForm((prev) => ({
                    ...prev,
                    items: prev.items.map((row, i) =>
                      i === idx ? { ...row, estimatedUnitPrice: Number(e.target.value || 0) } : row
                    ),
                  }))
                }
                className="col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPrForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyPrItem }] }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              Add Item
            </button>
            <button
              type="button"
              disabled={working}
              onClick={() => handleCreatePr(false)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={working}
              onClick={() => handleCreatePr(true)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
            >
              Submit PR
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">2) Approve PR + Convert to RFQ</h2>
          <div className="max-h-56 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-2 py-2 text-left">PR</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.map((pr) => (
                  <tr key={pr._id} className="border-t border-slate-100">
                    <td className="px-2 py-2">{pr.requestNo}</td>
                    <td className="px-2 py-2">{pr.status}</td>
                    <td className="px-2 py-2 space-x-1">
                      {pr.status === "submitted" ? (
                        <>
                          <button onClick={() => approvePr(pr._id, true)} className="rounded bg-emerald-600 px-2 py-1 text-white">
                            Approve
                          </button>
                          <button onClick={() => approvePr(pr._id, false)} className="rounded bg-rose-600 px-2 py-1 text-white">
                            Reject
                          </button>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              value={rfqDraft.quoteDeadline}
              onChange={(e) => setRfqDraft((prev) => ({ ...prev, quoteDeadline: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={rfqDraft.deliveryDeadline}
              onChange={(e) => setRfqDraft((prev) => ({ ...prev, deliveryDeadline: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button type="button" disabled={working} onClick={convertToRfq} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
            Convert Latest Approved PR to RFQ
          </button>
        </section>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">3-6) Quotation Comparison and Vendor Selection</h2>
          <button
            type="button"
            disabled={working}
            onClick={runComparisonAndSelectTop}
            className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white"
          >
            Run Comparison + Select Top Vendor
          </button>
          <p className="text-xs text-slate-500">
            Selection auto-creates Purchase Order and transitions workflow to delivery tracking.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">7-9) Downstream Status</h2>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-slate-500">PO</p>
              <p className="font-semibold">{purchaseOrders.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-slate-500">Deliveries</p>
              <p className="font-semibold">{deliveries.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-slate-500">Invoices</p>
              <p className="font-semibold">{invoices.length}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
            SLA breaches: {slaBreaches.length}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Active Purchase Orders</h2>
        <div className="max-h-56 overflow-auto border border-slate-200 rounded-lg mb-6">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 font-semibold text-slate-600">PO Number</th>
                <th className="px-3 py-3 font-semibold text-slate-600">Vendor</th>
                <th className="px-3 py-3 font-semibold text-slate-600">Total Amount</th>
                <th className="px-3 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-3 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.length > 0 ? purchaseOrders.map((po) => (
                <tr key={po._id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900">{po.poNumber}</td>
                  <td className="px-3 py-3 text-slate-600">{po.vendorId?.name || po.vendorId?.companyName || "Vendor"}</td>
                  <td className="px-3 py-3 font-medium text-slate-900">₹{(po.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-3 py-3">
                     <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        po.status === 'delivered' || po.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                     }`}>
                        {po.status}
                     </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                     <button onClick={() => navigate(`/admin/procurement/po/${po._id}`)} className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-black transition-colors shadow-sm inline-flex items-center gap-2">
                       Detail Document
                     </button>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan="5" className="px-3 py-6 text-center text-slate-400">No active purchase orders</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Invoice & Payment Actions</h2>
        <div className="max-h-56 overflow-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 font-semibold text-slate-600">Invoice ID</th>
                <th className="px-3 py-3 font-semibold text-slate-600">Amount</th>
                <th className="px-3 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-3 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length > 0 ? invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
                  <td className="px-3 py-3 font-medium text-slate-900">₹{inv.totalAmount?.toLocaleString() || 0}</td>
                  <td className="px-3 py-3">
                     <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                        inv.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                        inv.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                     }`}>
                        {inv.status}
                     </span>
                  </td>
                  <td className="px-3 py-3">
                     {inv.status === 'submitted' && (
                        reviewModal.open && reviewModal.id === inv._id ? (
                           <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2 duration-300">
                              <input 
                                type="text" 
                                placeholder={`Reason for ${reviewModal.status}...`} 
                                value={reviewModal.reason} 
                                onChange={(e) => setReviewModal(p => ({ ...p, reason: e.target.value }))} 
                                className="border border-slate-200 rounded px-2 py-1 outline-none text-xs w-48 focus:border-indigo-500" 
                                autoFocus 
                              />
                              <button disabled={working || !reviewModal.reason.trim()} onClick={reviewInvoice} className={`px-2 py-1 text-white rounded font-medium shadow-sm transition-all focus:outline-none disabled:opacity-50 ${reviewModal.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                                 Ok
                              </button>
                              <button onClick={() => setReviewModal({open: false, id: null, status: '', reason: ''})} className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded transition-colors font-medium">✕</button>
                           </div>
                        ) : (
                           <div className="space-x-2">
                              <button disabled={working} onClick={() => setReviewModal({ open: true, id: inv._id, status: 'approved', reason: '' })} className="px-2 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors">Approve</button>
                              <button disabled={working} onClick={() => setReviewModal({ open: true, id: inv._id, status: 'rejected', reason: '' })} className="px-2 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 transition-colors">Reject</button>
                           </div>
                        )
                     )}
                     {inv.status === 'approved' && (
                        <button disabled={working} onClick={() => handlePay(inv)} className="px-2 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700">Pay Now</button>
                     )}
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan="4" className="px-3 py-6 text-center text-slate-400">No invoices generated yet</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Payments</h2>
        <div className="max-h-56 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left">Payment Ref</th>
                <th className="px-2 py-2 text-left">Amount</th>
                <th className="px-2 py-2 text-left">Method</th>
                <th className="px-2 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-2 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.transactionRef || "N/A"}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.paymentRef}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">{item.amount}</td>
                  <td className="px-2 py-2">{item.method}</td>
                  <td className="px-2 py-2">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {loading ? <p className="text-xs text-slate-500">Refreshing procurement data...</p> : null}
    </div>
  );
}
