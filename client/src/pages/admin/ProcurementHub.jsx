import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ProcurementContext } from "../../context/ProcurementContext";
import procurementApi from "../../services/procurementApi";

const emptyPrItem = { description: "", quantity: 1, estimatedUnitPrice: 0, uom: "Nos", specs: "" };

export default function ProcurementHub() {
  const { loading, overview, purchaseRequests, purchaseOrders, deliveries, invoices, payments, slaBreaches, refreshAll } =
    useContext(ProcurementContext);

  const [prForm, setPrForm] = useState({
    title: "",
    description: "",
    currency: "INR",
    requiredBy: "",
    items: [{ ...emptyPrItem }],
  });
  const [rfqDraft, setRfqDraft] = useState({ quoteDeadline: "", deliveryDeadline: "", publish: true });
  const [working, setWorking] = useState(false);

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

  return (
    <div className="space-y-4 p-3 md:p-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Procurement Hub</h1>
        <p className="mt-1 text-sm text-slate-500">End-to-end flow: PR to RFQ to Quotation to Selection to PO to Delivery to Invoice to Payment.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          ["Pending PR", overview?.prPending || 0],
          ["Open RFQ", overview?.openRfqs || 0],
          ["Quotations", overview?.quotations || 0],
          ["Open PO", overview?.openPOs || 0],
          ["Deliveries", overview?.inTransitDeliveries || 0],
          ["Invoices", overview?.pendingInvoices || 0],
          ["Payments", overview?.pendingPayments || 0],
          ["SLA Breach", overview?.breachedSLAs || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
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
                  <td className="px-2 py-2">{item.paymentRef}</td>
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
