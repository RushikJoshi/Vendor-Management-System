import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Reply, Search, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../../services/api";
import {
  EmptyState,
  InfoPanel,
  PageHero,
  PageShell,
  SearchField,
  SectionCard,
  tableCellClass,
  tableHeadClass,
} from "../../components/vendor/VendorUI";

export default function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/vendors/messages")
      .then((res) => setMsgs(res.data.data || []))
      .catch(() => toast.error("Failed to fetch messages"))
      .finally(() => setLoading(false));
  }, []);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return msgs;
    return msgs.filter((item) => item.subject?.toLowerCase().includes(query));
  }, [msgs, search]);

  const handleReply = () => {
    toast.success("Reply flow is ready for the next UI step.");
  };

  return (
    <PageShell>
      <PageHero
        badge="Vendor messages"
        title="Stay aligned with admin communication."
        description="Read vendor messages, monitor important communication subjects, and keep your inbox consistent with the admin dashboard visual system."
        stats={[
          { icon: MessageSquare, label: "Messages", value: msgs.length || 0 },
          { icon: Mail, label: "Channel", value: "Admin inbox" },
          { icon: ShieldCheck, label: "Security", value: "Protected" },
        ]}
        aside={
          <>
            <InfoPanel
              icon={Mail}
              title="Inbox status"
              value="Synchronized"
              note="Messages from admins and reviewers appear here for vendor follow-up."
              toneClass="bg-indigo-50 text-indigo-600"
            />
            <InfoPanel
              icon={ShieldCheck}
              title="Access"
              value="Vendor only"
              note="This view is limited to vendor-side communication and does not change backend behavior."
              toneClass="bg-emerald-50 text-emerald-600"
            />
          </>
        }
      />

      <SectionCard title="Message Center" description="Search by subject and review your admin communication history.">
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <SearchField
              placeholder="Search messages by subject..."
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
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages available"
            description="When admins send vendor updates or follow-up items, they will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={tableHeadClass}>From</th>
                  <th className={tableHeadClass}>Subject</th>
                  <th className={tableHeadClass}>Received</th>
                  <th className={`${tableHeadClass} text-right`}>Reply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((message) => (
                  <tr key={message._id} className="transition hover:bg-slate-50/60">
                    <td className={tableCellClass}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Admin Team</p>
                          <p className="mt-1 text-[12px] text-slate-500">Internal vendor communication</p>
                        </div>
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <p className="font-medium text-slate-900">{message.subject}</p>
                    </td>
                    <td className={tableCellClass}>
                      <div className="text-[13px] font-medium text-slate-700">
                        {new Date(message.createdAt).toLocaleDateString("en-IN")}
                      </div>
                      <div className="mt-1 text-[12px] text-slate-500">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <button
                        onClick={() => handleReply(message._id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Reply size={15} />
                        Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
