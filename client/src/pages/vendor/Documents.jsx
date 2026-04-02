import { useEffect, useMemo, useState } from "react";
import { Download, FileText, FolderOpen, ShieldCheck, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

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

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/vendors/documents")
      .then((res) => {
        setDocs(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => toast.error("Failed to fetch documents"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading document...");
    const data = new FormData();
    data.append("file", file);

    try {
      await api.post("/vendors/documents", data);
      setDocs((prev) => [...prev, { name: file.name, url: URL.createObjectURL(file), createdAt: new Date() }]);
      toast.success("Document uploaded successfully", { id: toastId });
    } catch {
      toast.error("Failed to upload document", { id: toastId });
    }
  };

  const filteredDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return docs;
    return docs.filter((doc) => doc.name?.toLowerCase().includes(query));
  }, [docs, search]);

  return (
    <PageShell>
      <PageHero
        badge="Vendor documents"
        title="Manage your compliance documents."
        description="Review uploaded files, keep required documents current, and maintain a clean document library that matches the admin dashboard style."
        stats={[
          { icon: FolderOpen, label: "Total files", value: docs.length || 0 },
          { icon: ShieldCheck, label: "Status", value: "Document vault" },
          { icon: FileText, label: "Search ready", value: filteredDocs.length || 0 },
        ]}
        aside={
          <>
            <InfoPanel
              icon={ShieldCheck}
              title="Document health"
              value="Ready for review"
              note="Upload certificates, agreements, and compliance files here for easy access."
              toneClass="bg-emerald-50 text-emerald-600"
            />
            <InfoPanel
              icon={Upload}
              title="Upload guidance"
              value="One file at a time"
              note="Use clear file names so admins can identify the document quickly."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
        primaryAction={
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-slate-800">
            <Upload size={16} />
            Upload document
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        }
      />

      <SectionCard title="Document Library" description="Search and open uploaded vendor documents.">
        <div className="border-b border-slate-100 p-4">
          <SearchField placeholder="Search documents by file name..." onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 rounded-xl border border-slate-200/60 bg-slate-50/60" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents available"
            description="Upload your first compliance or onboarding document to start building the vendor document library."
            action={
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-slate-800">
                <Upload size={16} />
                Upload now
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={tableHeadClass}>Document</th>
                  <th className={tableHeadClass}>Type</th>
                  <th className={tableHeadClass}>Uploaded on</th>
                  <th className={`${tableHeadClass} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc, index) => {
                  const extension = doc.name?.split(".").pop()?.toUpperCase() || "FILE";
                  const uploadedOn = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-IN") : "Just now";

                  return (
                    <tr key={`${doc.name}-${index}`} className="transition hover:bg-slate-50/60">
                      <td className={tableCellClass}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{doc.name}</p>
                            <p className="mt-1 text-[12px] text-slate-500">Stored in your vendor document library</p>
                          </div>
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        <StatusBadge tone="indigo">{extension}</StatusBadge>
                      </td>
                      <td className={tableCellClass}>
                        <div className="text-[13px] font-medium text-slate-700">{uploadedOn}</div>
                      </td>
                      <td className={`${tableCellClass} text-right`}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Download size={15} />
                          Download
                        </a>
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
