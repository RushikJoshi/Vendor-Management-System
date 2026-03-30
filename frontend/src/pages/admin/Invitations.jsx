import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Calendar,
  ChevronRight,
  Clock3,
  Mail,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ email: "", categoryId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([api.get("/invitations"), api.get("/categories")]);
      setInvitations(invRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch {
      setInvitations([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invitations;

    return invitations.filter((invitation) => {
      const email = invitation.email?.toLowerCase() || "";
      const category = invitation.category?.name?.toLowerCase() || "";
      const status = invitation.status?.toLowerCase() || "";
      return email.includes(query) || category.includes(query) || status.includes(query);
    });
  }, [invitations, search]);

  const summary = useMemo(() => {
    const total = invitations.length;
    const pending = invitations.filter((item) => item.status?.toLowerCase() === "pending").length;
    const accepted = invitations.filter((item) => item.status?.toLowerCase() === "accepted").length;
    const expired = invitations.filter((item) => {
      const expiresAt = item.expiresAt ? new Date(item.expiresAt).getTime() : 0;
      return expiresAt && expiresAt < Date.now();
    }).length;
    return { total, pending, accepted, expired };
  }, [invitations]);

  const latestInvitations = [...filteredInvitations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending invitation...");
    try {
      await api.post("/invitations/send", formData);
      toast.success("Invitation sent successfully.", { id: toastId });
      setShowModal(false);
      setFormData({ email: "", categoryId: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send invitation", { id: toastId });
    }
  };

  return (
    <div className="space-y-3 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                Invitation desk
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                <ChevronRight size={12} className="text-slate-400" />
                Admin / Invitations
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
              Invite vendors with a cleaner, calmer control panel.
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
              Same admin dashboard feel, same font and color balance, but with better visual hierarchy for invitation activity.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MiniStat label="Total Invitations" value={summary.total} />
              <MiniStat label="Pending" value={summary.pending} />
              <MiniStat label="Accepted" value={summary.accepted} />
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
            <InfoCard
              title="Queue Status"
              value={`${summary.pending} active sends`}
              note="A simpler invitation summary that still matches the rest of the admin workspace."
            />
            <InfoCard
              title="Expiry Watch"
              value={`${summary.expired} expired links`}
              note="Quick visibility into invitation links that may need to be resent."
            />

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                <Plus size={16} />
                Issue Invitation
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-[11px] font-semibold text-slate-600 shadow-sm">
                <ShieldCheck size={15} />
                {categories.length} categories available
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Send} tone="indigo" label="Dispatched" value={summary.total} />
        <MetricCard icon={Clock3} tone="amber" label="Awaiting Action" value={summary.pending} />
        <MetricCard icon={Users} tone="emerald" label="Accepted" value={summary.accepted} />
        <MetricCard icon={Mail} tone="rose" label="Expired" value={summary.expired} />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 xl:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Invitation Ledger</h2>
                    <p className="mt-1 text-[12px] text-slate-500">
                      Track who was invited, to which category, and when their access expires.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative min-w-[18rem]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search email, category, or status"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[24%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-slate-50/60">
                <tr>
                  {["Recipient", "Category", "Sent On", "Valid Till", "Status"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                    </td>
                  </tr>
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                          <Send size={24} />
                        </div>
                        <h3 className="mt-5 text-xl font-semibold text-slate-900">No invitations found</h3>
                        <p className="mt-2 text-[13px] leading-6 text-slate-500">
                          Try a different search or issue a fresh vendor invitation.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((invitation) => (
                    <tr key={invitation._id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 shadow-inner">
                            <Mail size={17} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-slate-900">{invitation.email}</p>
                            <p className="mt-1 text-[12px] text-slate-400">Invitation recipient</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <CategoryChip name={invitation.category?.name || "Unassigned"} />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-600">
                          <Calendar size={13} className="text-slate-400" />
                          {dateText(invitation.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-600">
                          <Clock3 size={13} className="text-slate-400" />
                          {dateText(invitation.expiresAt)}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={invitation.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-3">
          <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 p-4 xl:p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Recent Dispatches</h2>
                <p className="mt-1 text-[12px] text-slate-500">Newest invitation activity</p>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {latestInvitations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center text-[13px] font-medium text-slate-500">
                  No invitation activity yet.
                </div>
              ) : (
                latestInvitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-semibold text-slate-900">{invitation.email}</p>
                        <div className="mt-2">
                          <CategoryChip name={invitation.category?.name || "Unassigned category"} compact />
                        </div>
                      </div>
                      <StatusBadge status={invitation.status} />
                    </div>
                    <p className="mt-4 text-[12px] text-slate-500">Sent on {dateText(invitation.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 p-4 xl:p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Invitation Snapshot</h2>
                <p className="mt-1 text-[12px] text-slate-500">A quick operational read</p>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <InsightRow label="Total queue" value={summary.total} />
              <InsightRow label="Pending actions" value={summary.pending} tone="text-amber-600" />
              <InsightRow label="Expired links" value={summary.expired} tone="text-rose-600" />
            </div>
          </section>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Invitation" size="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <Field label="Recipient Email">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="vendor@company.com"
                className="saas-input"
              />
            </Field>

            <Field label="Category">
              <select
                required
                value={formData.categoryId}
                onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                className="saas-input"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800"
            >
              <Send size={15} />
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function dateText(value) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Not set";
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoCard({ title, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p>
    </div>
  );
}

function MetricCard({ icon, tone, label, value }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const Glyph = icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-inner ${tones[tone]}`}>
          <Glyph size={21} />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">{label}</span>
      </div>
      <h3 className="text-4xl font-semibold tracking-tight text-slate-900">{value}</h3>
    </div>
  );
}

function InsightRow({ label, value, tone = "text-slate-900" }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
      <p className="text-[12px] font-medium text-slate-500">{label}</p>
      <p className={`text-[14px] font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function CategoryChip({ name, compact = false }) {
  return (
    <span
      className={`inline-flex border border-slate-200 bg-slate-50/70 text-slate-700 ${
        compact
          ? "max-w-full rounded-2xl px-3 py-1.5 text-[11px] leading-5"
          : "max-w-[16rem] rounded-2xl px-3.5 py-2 text-[11px] leading-5"
      } whitespace-normal break-words font-semibold shadow-sm`}
      title={name}
    >
      {name}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</label>
      {children}
    </div>
  );
}
