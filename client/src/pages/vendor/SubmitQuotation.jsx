import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

const DEFAULT_FORM = {
  rfqId: "",
  totalAmount: "",
  validUntil: "",
};

export default function SubmitQuotation() {
  const [rfqs, setRfqs] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/rfqs")
      .then((res) => setRfqs(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => toast.error("Failed to load RFQs"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rfqId) {
      toast.error("Please select an RFQ");
      return;
    }
    if (!form.totalAmount || Number(form.totalAmount) <= 0) {
      toast.error("Enter a valid quotation amount");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting quotation...");
    try {
      await api.post("/quotations", {
        rfqId: form.rfqId,
        totalAmount: Number(form.totalAmount),
        validUntil: form.validUntil || undefined,
        items: [],
      });
      toast.success("Quotation submitted successfully", { id: toastId });
      setForm(DEFAULT_FORM);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit quotation", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Submit Quotation</h1>
        <p className="mt-1 text-sm text-slate-500">Submit quotations only for RFQs assigned to your vendor account.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">RFQ</label>
            <select
              value={form.rfqId}
              onChange={(e) => setForm((prev) => ({ ...prev, rfqId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            >
              <option value="">Select RFQ</option>
              {rfqs.map((rfq) => (
                <option key={rfq._id} value={rfq._id}>
                  {rfq.title || "Untitled RFQ"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Total Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.totalAmount}
              onChange={(e) => setForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
              placeholder="Enter quotation amount"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Valid Until (Optional)</label>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Quotation"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
