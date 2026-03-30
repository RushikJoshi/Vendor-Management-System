import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import {
  BadgeAlert,
  Ban,
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  TimerReset,
  Trash2,
  X,
} from "lucide-react";

const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, pages: 1 };
const EMPTY_FORM = { vendorId: "", contractNumber: "", contractTitle: "", startDate: "", endDate: "", contractValue: "", documentUrl: "https://example.com/contract.pdf" };

const money = (v) => `INR ${new Intl.NumberFormat("en-IN").format(Number(v) || 0)}`;
const dateText = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set";
const daysLeft = (v) => v ? Math.ceil((new Date(v) - new Date()) / 86400000) : 0;
const badgeTone = (s) => ({ active: "bg-emerald-50 text-emerald-700 border-emerald-100", expiring: "bg-amber-50 text-amber-700 border-amber-100", expired: "bg-rose-50 text-rose-700 border-rose-100", terminated: "bg-slate-100 text-slate-600 border-slate-200" }[(s || "").toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-200");

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, expiringSoon: 0 });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchStats = async () => {
    try { const res = await api.get("/slm/contracts/stats"); setStats(res.data?.data || stats); } catch (e) { console.error(e); }
  };
  const fetchContracts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/slm/contracts", { params: { page, limit: pagination.limit, search, status: statusFilter } });
      setContracts(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination(res.data?.pagination || { ...pagination, page });
    } catch {
      toast.error("Failed to load contracts");
    } finally { setLoading(false); }
  };
  const fetchVendors = async () => {
    try { const res = await api.get("/admin/vendors"); setVendors(Array.isArray(res.data?.data) ? res.data.data : []); } catch (e) { console.error(e); }
  };

  // Search and paging are intentionally controlled from this page state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStats(); fetchContracts(pagination.page); }, [statusFilter, pagination.page]);

  const createContract = async (e) => {
    e.preventDefault();
    const id = toast.loading("Creating contract...");
    try {
      await api.post("/slm/contracts", form);
      toast.success("Contract created successfully", { id });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      fetchContracts(1);
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || "Creation failed", { id });
    }
  };
  const deleteContract = async (id) => {
    if (!window.confirm("Delete this contract?")) return;
    const t = toast.loading("Deleting contract...");
    try { await api.delete(`/slm/contracts/${id}`); toast.success("Contract deleted", { id: t }); setSelected(null); fetchContracts(pagination.page); fetchStats(); } catch { toast.error("Delete failed", { id: t }); }
  };
  const terminateContract = async (id) => {
    if (!window.confirm("Terminate this contract?")) return;
    const t = toast.loading("Terminating contract...");
    try { await api.patch(`/slm/contracts/${id}/terminate`); toast.success("Contract terminated", { id: t }); setSelected(null); fetchContracts(pagination.page); fetchStats(); } catch { toast.error("Termination failed", { id: t }); }
  };

  const renewalHealth = stats.active > 0 ? Math.max(0, Math.round(((stats.active - stats.expiringSoon) / stats.active) * 100)) : 100;
  const renewals = [...contracts].filter((c) => daysLeft(c.endDate) >= 0).sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 4);
  const from = contracts.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = contracts.length ? from + contracts.length - 1 : 0;

  return (
    <div className="space-y-3 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">Contract Control Desk</span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm"><ChevronRight size={12} className="text-slate-400" />Admin / Contracts</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">Contracts that feel cleaner and easier to manage.</h1>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">Same admin dashboard family, same font and color balance, but a sharper contracts workspace with clearer hierarchy.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[{ label: "Total Contracts", value: stats.total || 0 }, { label: "Renewal Health", value: `${renewalHealth}%` }, { label: "Expiring Soon", value: stats.expiringSoon || 0 }].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Ledger Status</p><p className="mt-1 text-lg font-semibold text-slate-900">{stats.active || 0} active agreements</p><p className="mt-2 text-[13px] leading-6 text-slate-500">Calm dashboard styling, faster readability.</p></div>
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Upcoming Renewal Load</p><p className="mt-1 text-lg font-semibold text-slate-900">{renewals.length} priority items</p><p className="mt-2 text-[13px] leading-6 text-slate-500">Soonest expiring items float to the top.</p></div>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => { fetchVendors(); setShowCreate(true); }} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"><Plus size={16} />Add Contract</button>
              <button className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"><Download size={16} />Export</button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Contract Base", value: stats.total || 0, tone: "indigo", icon: FileText }, { label: "Operational", value: stats.active || 0, tone: "emerald", icon: ShieldCheck }, { label: "Renewal Watch", value: stats.expiringSoon || 0, tone: "amber", icon: Clock3 }, { label: "Closed Risk", value: stats.expired || 0, tone: "rose", icon: BadgeAlert }].map((card) => (
          <div key={card.label} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-5 flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-inner ${card.tone === "indigo" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : card.tone === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : card.tone === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}><card.icon size={21} /></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">{card.label}</span></div>
            <h3 className="text-4xl font-semibold tracking-tight text-slate-900">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 xl:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><FileText size={18} /></div><div><h2 className="text-base font-semibold text-slate-900">Contract Ledger</h2><p className="mt-1 text-[12px] text-slate-500">Browse agreements by vendor, value, timeline, and status.</p></div></div>
              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                <div className="relative min-w-[18rem]"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search contract number or title" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchContracts(1)} /></div>
                <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All Status</option><option value="Active">Active</option><option value="Expiring">Expiring</option><option value="Expired">Expired</option><option value="Terminated">Terminated</option></select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/60"><tr>{["Contract", "Vendor", "Value", "Timeline", "Status", "Action"].map((h) => <th key={h} className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? <tr><td colSpan={6} className="px-6 py-24 text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" /></td></tr> : contracts.length === 0 ? <tr><td colSpan={6} className="px-6 py-24 text-center text-[13px] font-medium text-slate-500">No contracts found.</td></tr> : contracts.map((c) => (
                  <tr key={c._id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 shadow-inner"><BriefcaseBusiness size={18} /></div><div><p className="text-[14px] font-semibold text-slate-900">{c.contractNumber}</p><p className="mt-1 text-[12px] text-slate-500">{c.contractTitle || "Untitled contract"}</p></div></div></td>
                    <td className="px-6 py-5"><p className="text-[13px] font-semibold text-slate-900">{c.vendorId?.companyName || "Unassigned vendor"}</p><p className="mt-1 text-[12px] text-slate-400">Agreement partner</p></td>
                    <td className="px-6 py-5"><p className="text-[14px] font-semibold text-slate-900">{money(c.contractValue)}</p></td>
                    <td className="px-6 py-5"><p className="text-[12px] font-medium text-slate-600">{dateText(c.startDate)} to {dateText(c.endDate)}</p><p className="mt-1 text-[12px] text-slate-400">{daysLeft(c.endDate)} days left</p></td>
                    <td className="px-6 py-5"><span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold ${badgeTone(c.status)}`}>{c.status || "Unknown"}</span></td>
                    <td className="px-6 py-5 text-right"><button onClick={() => setSelected(c)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"><Eye size={15} />View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/40 px-4 py-4 lg:flex-row lg:items-center lg:justify-between xl:px-5">
            <p className="text-[11px] font-medium text-slate-500">Showing <span className="font-semibold text-slate-900">{from}</span> to <span className="font-semibold text-slate-900">{to}</span> of <span className="font-semibold text-slate-900">{pagination.total || 0}</span> contracts</p>
            <div className="flex items-center gap-2"><button onClick={() => pagination.page > 1 && setPagination((p) => ({ ...p, page: p.page - 1 }))} disabled={pagination.page <= 1} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40">Previous</button><div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-900">Page {pagination.page} of {pagination.pages || 1}</div><button onClick={() => pagination.page < (pagination.pages || 1) && setPagination((p) => ({ ...p, page: p.page + 1 }))} disabled={pagination.page >= (pagination.pages || 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40">Next</button></div>
          </div>
        </section>

        <div className="space-y-3">
          <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 p-4 xl:p-5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><TimerReset size={18} /></div><div><h2 className="text-base font-semibold text-slate-900">Upcoming Renewals</h2><p className="mt-1 text-[12px] text-slate-500">Nearest agreements by end date</p></div></div>
            <div className="space-y-3 p-4">{renewals.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center text-[13px] font-medium text-slate-500">No immediate renewals in the current list.</div> : renewals.map((c) => <div key={c._id} className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-[14px] font-semibold text-slate-900">{c.contractTitle || c.contractNumber}</p><p className="mt-1 text-[12px] text-slate-500">{c.vendorId?.companyName || "Unassigned vendor"}</p></div><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${badgeTone(c.status)}`}>{c.status || "Unknown"}</span></div><div className="mt-4 flex items-center justify-between"><p className="text-[12px] text-slate-500">Ends {dateText(c.endDate)}</p><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600">{daysLeft(c.endDate)} days left</span></div></div>)}</div>
          </section>
          <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 p-4 xl:p-5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900"><ShieldCheck size={18} /></div><div><h2 className="text-base font-semibold text-slate-900">Contract Discipline</h2><p className="mt-1 text-[12px] text-slate-500">Simple executive summary</p></div></div>
            <div className="space-y-4 p-4">{[{ label: "Renewal health", value: `${renewalHealth}%`, tone: "text-emerald-600" }, { label: "Expiring count", value: stats.expiringSoon || 0, tone: "text-amber-600" }, { label: "Closed count", value: stats.expired || 0, tone: "text-rose-600" }].map((row) => <div key={row.label} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm"><p className="text-[12px] font-medium text-slate-500">{row.label}</p><p className={`text-[14px] font-semibold ${row.tone}`}>{row.value}</p></div>)}</div>
          </section>
        </div>
      </div>

      <AnimatePresence>{selected && <Modal onClose={() => setSelected(null)}><div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5"><div><h3 className="text-xl font-semibold text-slate-900">{selected.contractTitle || "Contract Details"}</h3><p className="mt-1 text-[12px] text-slate-500">{selected.contractNumber}</p></div><button onClick={() => setSelected(null)} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"><X size={20} /></button></div><div className="flex-1 space-y-5 overflow-y-auto p-6"><div className="grid grid-cols-1 gap-3 md:grid-cols-3">{[{ label: "Vendor Partner", value: selected.vendorId?.companyName || "Unassigned vendor" }, { label: "Contract Value", value: money(selected.contractValue) }, { label: "Days Remaining", value: `${daysLeft(selected.endDate)} days`, warn: daysLeft(selected.endDate) <= 30 }].map((card) => <div key={card.label} className={`rounded-2xl border p-5 shadow-sm ${card.warn ? "border-amber-200 bg-amber-50/70" : "border-slate-200/70 bg-white"}`}><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{card.label}</p><p className={`mt-3 text-lg font-semibold ${card.warn ? "text-amber-700" : "text-slate-900"}`}>{card.value}</p></div>)}</div><div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><h4 className="mb-5 text-[13px] font-semibold text-slate-900">Timeline</h4><div className="space-y-4"><div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-4"><p className="text-[12px] text-slate-500">Start date</p><p className="text-right text-[13px] font-semibold text-slate-900">{dateText(selected.startDate)}</p></div><div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-4"><p className="text-[12px] text-slate-500">End date</p><p className="text-right text-[13px] font-semibold text-slate-900">{dateText(selected.endDate)}</p></div><div className="flex items-start justify-between gap-5"><p className="text-[12px] text-slate-500">Document link</p><p className="max-w-[18rem] break-all text-right text-[13px] font-semibold text-slate-900">{selected.documentUrl || "Not set"}</p></div></div></div></div><div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-3"><button onClick={() => terminateContract(selected._id)} disabled={selected.status?.toLowerCase() === "terminated"} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-amber-700 transition-all hover:bg-amber-50 disabled:opacity-40"><Ban size={14} />Terminate</button><button onClick={() => deleteContract(selected._id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-rose-600 transition-all hover:bg-rose-50"><Trash2 size={14} />Delete</button></div><button onClick={() => setSelected(null)} className="rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800">Close</button></div></Modal>}</AnimatePresence>

      <AnimatePresence>{showCreate && <Modal onClose={() => setShowCreate(false)} maxWidth="max-w-2xl"><div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><h3 className="text-xl font-semibold text-slate-900">Create New Contract</h3><p className="mt-1 text-[13px] text-slate-500">Same backend flow, cleaner dashboard-friendly form.</p></div><button onClick={() => setShowCreate(false)} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"><X size={20} /></button></div><form onSubmit={createContract} className="space-y-5 p-6"><div className="grid grid-cols-1 gap-5 md:grid-cols-2"><Label label="Vendor Partner *" span><select required className="saas-input" value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}><option value="">Select Vendor</option>{vendors.map((v) => <option key={v._id} value={v._id}>{v.companyName}</option>)}</select></Label><Label label="Contract Number *"><input required type="text" placeholder="CNT-2026-001" className="saas-input" value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} /></Label><Label label="Contract Value *"><input required type="number" placeholder="Enter amount" className="saas-input" value={form.contractValue} onChange={(e) => setForm({ ...form, contractValue: e.target.value })} /></Label><Label label="Agreement Title *" span><input required type="text" placeholder="Annual maintenance agreement" className="saas-input" value={form.contractTitle} onChange={(e) => setForm({ ...form, contractTitle: e.target.value })} /></Label><Label label="Start Date *"><input required type="date" className="saas-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Label><Label label="End Date *"><input required type="date" className="saas-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Label></div><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800"><Plus size={15} />Create Contract</button></div></form></Modal>}</AnimatePresence>
    </div>
  );
}

const Label = ({ label, children, span = false }) => <div className={`space-y-2 ${span ? "md:col-span-2" : ""}`}><label className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</label>{children}</div>;
const Modal = ({ children, onClose, maxWidth = "max-w-4xl" }) => <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div onClick={onClose} className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" /><div className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-2xl ${maxWidth}`}>{children}</div></div>;
