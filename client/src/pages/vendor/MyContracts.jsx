import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FileText, 
    ShieldCheck, 
    Clock3, 
    Search, 
    RefreshCcw, 
    Info,
    Calendar,
    DollarSign,
    Building2,
    X,
    Eye
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, pages: 1 };

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Not set";

const badgeTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (normalized === "expired") return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function MyContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const fetchContracts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/slm/contracts", {
        params: { page, limit: pagination.limit, search, status: "Active" },
      });
      setContracts(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination(res.data?.pagination || { ...pagination, page });
    } catch (err) {
      toast.error("Failed to load your agreements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts(pagination.page);
  }, [pagination.page]);

  const range = useMemo(() => {
    const from = contracts.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const to = contracts.length ? from + contracts.length - 1 : 0;
    return { from, to };
  }, [contracts.length, pagination.limit, pagination.page]);

  return (
    <div className="space-y-4 pb-10">
      {/* HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                  <ShieldCheck size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Active Agreements</h1>
                <p className="text-xs font-medium text-slate-500">Official legal commitments and procurement contracts.</p>
              </div>
          </div>
          <button
            onClick={() => fetchContracts(1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </section>

      {/* SEARCH */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative w-full md:max-w-md">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchContracts(1)}
                placeholder="Search by Agreement #"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-400"
                />
           </div>
           <p className="text-[11px] font-medium text-slate-400">
               Official agreements are immutable and issued by the corporate procurement team.
           </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Registry ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Value (Commitment)</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Validity</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-tight text-slate-500">Registry Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                [1, 2, 3].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-4"><div className="h-4 w-full rounded bg-slate-50" /></td>
                  </tr>
                ))
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-medium text-slate-400 italic">
                      No active agreements found in your profile.
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-slate-900">
                      {contract.contractNumber || `#${String(contract._id || "").slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3.5">
                        <div className="text-[13px] font-medium text-slate-800">{contract.contractTitle}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{contract.contractType || "MSA"}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-bold text-slate-700">
                        <span className="text-[10px] text-slate-400 mr-1">{contract.currency || "INR"}</span>
                        {Number(contract.contractValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="text-[11px] text-slate-500 font-medium">Until {formatDate(contract.endDate)}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${badgeTone(contract.status)}`}>
                        {contract.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                        <button 
                            onClick={() => navigate(`/vendor/contracts/${contract._id}`, { state: { contract } })}
                            className="p-1 px-3 text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-slate-900 hover:text-white rounded transition-all"
                        >
                            VIEW 
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

      {/* DETAIL MODAL REMOVED - using dedicated page instead */}
    </div>
  );
}
