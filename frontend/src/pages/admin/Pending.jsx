import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import { Clock, CheckSquare } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Pending() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/vendors?status=pending")
      .then((res) => setVendors(res.data.data))
      .catch(() => toast.error("Failed to load pending requests"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Clock className="text-amber-400" size={32} />
          Pending Approvals
        </h1>
        <p className="text-slate-400 mt-1">Review and verify new vendor applications.</p>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <Table
          headers={["Company", "Contact", "Email", "Service", "Applied Date"]}
          data={vendors}
          loading={loading}
          renderRow={(v) => (
            <>
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-200">{v.companyName}</div>
              </td>
              <td className="px-6 py-4 text-slate-300">{v.contactPerson}</td>
              <td className="px-6 py-4 text-slate-400 text-sm">{v.email}</td>
              <td className="px-6 py-4 text-slate-300">
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs border border-slate-700">
                  {v.serviceType}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">
                {new Date(v.createdAt).toLocaleDateString("en-US", {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
}