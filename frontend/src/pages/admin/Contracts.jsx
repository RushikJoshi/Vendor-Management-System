import { useEffect, useMemo, useState } from "react";
import { FileText, ShieldCheck, Clock3, Search, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, pages: 1 };

const formatMoney = (value) => `INR ${new Intl.NumberFormat("en-IN").format(Number(value) || 0)}`;
const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Not set";

const badgeTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (normalized === "expiring") return "bg-amber-50 text-amber-700 border-amber-100";
  if (normalized === "expired") return "bg-rose-50 text-rose-700 border-rose-100";
  if (normalized === "terminated") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const fetchStats = async () => {
    try {
      const res = await api.get("/slm/contracts/stats");
      const data = res.data?.data || {};
      setStats({
        total: Number(data.total || 0),
        active: Number(data.active || 0),
        expiringSoon: Number(data.expiringSoon || 0),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContracts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/slm/contracts", {
        params: { page, limit: pagination.limit, search, status: statusFilter },
      });
      setContracts(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination(res.data?.pagination || { ...pagination, page });
    } catch (err) {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchContracts(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.page]);

  const range = useMemo(() => {
    const from = contracts.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const to = contracts.length ? from + contracts.length - 1 : 0;
    return { from, to };
  }, [contracts.length, pagination.limit, pagination.page]);

  const statCards = [
    { key: "total", label: "Total Contracts", value: stats.total, icon: FileText },
    { key: "active", label: "Active", value: stats.active, icon: ShieldCheck },
    { key: "expiring", label: "Expiring Soon", value: stats.expiringSoon, icon: Clock3 },
  ];

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Contracts Management</h1>
            <p className="mt-1 text-sm text-slate-500">Simple, readable view of all vendor contracts.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchContracts(1);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw size={15} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <Icon size={16} className="text-slate-400" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchContracts(1)}
              placeholder="Search contract number, title, vendor"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Expired">Expired</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Contract ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Value</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading &&
                [1, 2, 3, 4].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                  </tr>
                ))}

              {!loading && contracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                    No contracts found.
                  </td>
                </tr>
              )}

              {!loading &&
                contracts.map((contract) => (
                  <tr key={contract._id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-800">
                      {contract.contractNumber || `#${String(contract._id || "").slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{contract.vendorId?.companyName || "Unassigned vendor"}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{formatMoney(contract.contractValue)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(contract.startDate)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(contract.endDate)}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeTone(contract.status)}`}>
                        {contract.status || "unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-slate-500">
            Showing <span className="font-semibold text-slate-800">{range.from}</span> to{" "}
            <span className="font-semibold text-slate-800">{range.to}</span> of{" "}
            <span className="font-semibold text-slate-800">{pagination.total || 0}</span> contracts
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pagination.page > 1 && setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              type="button"
              onClick={() => pagination.page < (pagination.pages || 1) && setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= (pagination.pages || 1)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
