import { useEffect, useState } from "react";
import { FileText, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

export default function MyRFQs() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rfqs");
      setRfqs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error("Failed to load assigned RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My RFQs</h1>
            <p className="mt-1 text-sm text-slate-500">Only RFQs assigned to your vendor account are listed here.</p>
          </div>
          <button
            type="button"
            onClick={fetchRFQs}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">RFQ</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && rfqs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-14 text-center text-sm text-slate-500">
                    No assigned RFQs found.
                  </td>
                </tr>
              )}
              {rfqs.map((rfq) => (
                <tr key={rfq._id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-4 text-sm text-slate-800">
                    <div className="inline-flex items-center gap-2 font-semibold">
                      <FileText size={14} className="text-slate-400" />
                      {rfq.title || "Untitled RFQ"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm capitalize text-slate-700">{String(rfq.status || "draft")}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {rfq.quoteDeadline ? new Date(rfq.quoteDeadline).toLocaleDateString("en-IN") : "Not set"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
