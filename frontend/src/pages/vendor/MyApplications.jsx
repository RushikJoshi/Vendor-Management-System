import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Clock3, FileText, Search, XCircle } from "lucide-react";

import api from "../../services/api";
import {
  EmptyState,
  InfoPanel,
  PageHero,
  PageShell,
  SearchField,
  SectionCard,
  StatusBadge,
  tableCellClass,
  tableHeadClass,
} from "../../components/vendor/VendorUI";

const getStatusTone = (status) => {
  const value = status?.toLowerCase();
  if (value === "approved") return "emerald";
  if (value === "rejected") return "rose";
  return "amber";
};

const getStatusIcon = (status) => {
  const value = status?.toLowerCase();
  if (value === "approved") return CheckCircle2;
  if (value === "rejected") return XCircle;
  return Clock3;
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/applications")
      .then((res) => setApplications(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter((app) => {
      const category = typeof app.category === "object" ? app.category?.name : app.category;
      return (
        app._id?.toLowerCase().includes(query) ||
        category?.toLowerCase().includes(query) ||
        app.status?.toLowerCase().includes(query)
      );
    });
  }, [applications, search]);

  const approvedCount = applications.filter((item) => item.status?.toLowerCase() === "approved").length;

  return (
    <PageShell>
      <PageHero
        badge="Vendor applications"
        title="Track your submitted applications."
        description="Review application progress, see current approval status, and keep a clear record of vendor submissions using the same typography and spacing as the admin dashboard."
        stats={[
          { icon: FileText, label: "Total submissions", value: applications.length || 0 },
          { icon: CheckCircle2, label: "Approved", value: approvedCount || 0 },
          { icon: Clock3, label: "In review", value: Math.max((applications.length || 0) - approvedCount, 0) },
        ]}
        aside={
          <>
            <InfoPanel
              icon={Clock3}
              title="Application flow"
              value="Review in progress"
              note="Status updates appear here as admins process your submissions."
              toneClass="bg-amber-50 text-amber-600"
            />
            <InfoPanel
              icon={BriefcaseBusiness}
              title="Vendor note"
              value="Keep category details accurate"
              note="The category attached to each application affects routing and internal review."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
      />

      <SectionCard title="Application History" description="Search your application records by id, category, or status.">
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <SearchField
              placeholder="Search applications..."
              className="pl-11"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 rounded-xl border border-slate-200/60 bg-slate-50/60" />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications found"
            description="Once you submit vendor applications, they will appear here with category and approval status."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={tableHeadClass}>Application ID</th>
                  <th className={tableHeadClass}>Category</th>
                  <th className={tableHeadClass}>Submitted on</th>
                  <th className={tableHeadClass}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => {
                  const category = typeof app.category === "object" ? app.category?.name : app.category || "General";
                  const StatusIcon = getStatusIcon(app.status);

                  return (
                    <tr key={app._id} className="transition hover:bg-slate-50/60">
                      <td className={tableCellClass}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">APP-{app._id?.slice(-8)?.toUpperCase()}</p>
                            <p className="mt-1 text-[12px] text-slate-500">Submitted from vendor workspace</p>
                          </div>
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        <div className="font-medium text-slate-900">{category}</div>
                      </td>
                      <td className={tableCellClass}>
                        <div className="text-[13px] font-medium text-slate-700">
                          {new Date(app.createdAt).toLocaleDateString("en-IN")}
                        </div>
                        <div className="mt-1 text-[12px] text-slate-500">
                          {new Date(app.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        <span className="inline-flex items-center gap-2">
                          <StatusBadge tone={getStatusTone(app.status)}>
                            <span className="inline-flex items-center gap-1.5">
                              <StatusIcon size={13} />
                              {app.status || "Pending"}
                            </span>
                          </StatusBadge>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
