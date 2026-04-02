import { useEffect, useState } from "react";
import api from "../../services/api";

export default function VRSDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/submissions/vendor/dashboard");
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="p-6">Loading vendor dashboard...</div>;
  if (error) return <div className="p-6 text-rose-600">{error}</div>;

  const profile = data?.profile || {};
  const purchaseOrders = data?.purchaseOrders || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Vendor Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-medium text-slate-900">Profile</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <strong>Name:</strong> {profile.vendorName || "-"}
            </p>
            <p>
              <strong>Email:</strong> {profile.vendorEmail || "-"}
            </p>
            <p>
              <strong>Category:</strong> {profile.categoryName || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium text-slate-900">Assigned Purchase Orders (Mock)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">PO Number</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.poNumber} className="border-t">
                  <td className="px-4 py-3">{po.poNumber}</td>
                  <td className="px-4 py-3">{po.title}</td>
                  <td className="px-4 py-3">{po.status}</td>
                  <td className="px-4 py-3">₹{Number(po.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
