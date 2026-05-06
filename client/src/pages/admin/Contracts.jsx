import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Clock3, Search, RefreshCcw, Plus, Calendar, IndianRupee, Building2, Users } from "lucide-react";
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
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const fetchStats = async () => {
    try {
      const res = await api.get("/slm/contracts/stats");
      setStats(res.data?.data || { total: 0, active: 0, expiringSoon: 0 });
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
  }, [statusFilter, pagination.page]);

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to decommission this agreement record?")) return;
      try {
          await api.delete(`/slm/contracts/${id}`);
          toast.success("Agreement removed from registry");
          fetchContracts(pagination.page);
          fetchStats();
      } catch (err) {
          toast.error("Process failed");
      }
  };

  const range = useMemo(() => {
    const from = contracts.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const to = contracts.length ? from + contracts.length - 1 : 0;
    return { from, to };
  }, [contracts.length, pagination.limit, pagination.page]);

  const statCards = [
    { key: "total", label: "Total Agreements", value: stats.total, icon: FileText, color: "text-indigo-600" },
    { key: "active", label: "Active Commitments", value: stats.active, icon: ShieldCheck, color: "text-emerald-600" },
    { key: "expiring", label: "Expiring Soon", value: stats.expiringSoon, icon: Clock3, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-4 pb-10">
      {/* HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                  <FileText size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Legal Agreements</h1>
                <p className="text-xs font-medium text-slate-500">Master database of vendor contracts and commitments.</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  fetchStats();
                  fetchContracts(1);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95"
              >
                <RefreshCcw size={14} />
              </button>
              <button
                onClick={() => navigate("/admin/contracts/create")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
              >
                <Plus size={14} /> Register Agreement
              </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm border-l-4" style={{ borderLeftColor: stat.key === 'total' ? '#4f46e5' : stat.key === 'active' ? '#10b981' : '#f59e0b' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-tight text-slate-400">{stat.label}</p>
                <Icon size={14} className="text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </section>

      {/* LIST SECTION */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchContracts(1)}
              placeholder="Search ID, title, or vendor..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 outline-none transition focus:border-indigo-400"
          >
            <option value="All">All Agreements</option>
            <option value="Active">Operational</option>
            <option value="Expiring">Expiring Soon</option>
            <option value="Expired">Dormant</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Contract ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Vendor Entity</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Value</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Start Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">End Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-tight text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                [1, 2, 3].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td colSpan={8} className="px-4 py-4"><div className="h-4 w-full rounded bg-slate-50" /></td>
                  </tr>
                ))
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-xs font-medium text-slate-400">
                      No agreements found.
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-slate-900">
                      {contract.contractNumber || `#${String(contract._id || "").slice(-8).toUpperCase()}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 rounded">
                            {contract.contractType || "MSA"}
                        </span>
                    </td>
                    <td className="px-4 py-3.5">
                        <div className="text-[13px] font-medium text-slate-800">{contract.vendorId?.companyName || "N/A"}</div>
                        <div className="text-[10px] text-slate-400">{contract.vendorId?.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-bold text-slate-700">
                        <span className="text-[10px] text-slate-400 mr-1">{contract.currency || "INR"}</span>
                        {Number(contract.contractValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-500">{formatDate(contract.startDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-500">{formatDate(contract.endDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${badgeTone(contract.status)}`}>
                        {contract.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 text-nowrap">
                        <button 
                            onClick={() => navigate(`/admin/contracts/${contract._id}/edit`)}
                            className="p-1 px-2 text-[11px] font-bold bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-all"
                        >
                            EDIT
                        </button>
                        <button 
                            onClick={() => handleDelete(contract._id)}
                            className="p-1 px-2 text-[11px] font-bold bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded transition-all"
                        >
                            X
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/30 px-4 py-3 text-[12px] md:flex-row md:items-center md:justify-between">
          <p className="text-slate-500 font-medium">
            Showing <span className="text-slate-900">{range.from} - {range.to}</span> of <span className="text-slate-900">{pagination.total || 0}</span> agreements
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-600 disabled:opacity-30 hover:bg-slate-50 font-medium"
            >
              Prev
            </button>
            <span className="font-bold text-slate-900 mx-2">Page {pagination.page} / {pagination.pages || 1}</span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= (pagination.pages || 1)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-600 disabled:opacity-30 hover:bg-slate-50 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
