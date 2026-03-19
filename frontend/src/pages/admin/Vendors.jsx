import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import VendorDetailsModal from "./VendorDetailsModal";
import { toast } from "react-hot-toast";
import { Search, Trash2, Check, X, Eye, Building2, UserCircle2, Filter, Download, Upload, FileSpreadsheet } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors", {
        params: { status: "approved" }
      });
      setVendors(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch vendors from infrastructure registry");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const toastId = toast.loading("Preparing Excel export...");
    try {
      const response = await api.get("/admin/vendors/export", {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Vendor_Registry_Export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Registry exported successfully", { id: toastId });
    } catch (err) {
      toast.error("Export failed", { id: toastId });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Processing bulk import...");
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/vendors/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(res.data.message, { id: toastId });
      fetchVendors(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed", { id: toastId });
    } finally {
      setImporting(false);
      e.target.value = ""; // Reset input
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const updateStatus = async (id, status) => {
    const toastId = toast.loading(`Updating node authorization...`);
    try {
      await api.patch(`/vendors/${id}/status`, { lifecycleStatus: status });
      setVendors((v) => v.map((x) => (x._id === id ? { ...x, status } : x)));
      toast.success(`Node ${status}`, { id: toastId });
    } catch (err) {
      toast.error("Operation failed", { id: toastId });
    }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Confirm permanent removal from registry?")) return;
    const toastId = toast.loading("Purging record...");
    try {
      await api.delete(`/admin/vendors/${id}`);
      setVendors((v) => v.filter((x) => x._id !== id));
      toast.success("Record purged", { id: toastId });
    } catch (err) {
      toast.error("Purge failure", { id: toastId });
    }
  };

  const filtered = vendors.filter(v =>
    v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-corp-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tighter">Vendor Registry</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Master Database of Registered Infrastructure Partners</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group mr-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-corp-dark transition-colors" size={17} />
            <input
              type="text"
              placeholder="Search by company or email..."
              className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-[6px] text-xs font-semibold w-64 focus:border-corp-dark focus:ring-1 focus:ring-corp-dark outline-none transition-all placeholder-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={handleExport}
            className="h-10 px-4 bg-emerald-50 text-[#0F7B4D] border border-emerald-100 rounded-[6px] flex items-center gap-2 hover:bg-[#0F7B4D] hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
          >
            <Download size={14} /> Export Registry
          </button>

          <label className="h-10 px-4 bg-white border border-gray-200 text-gray-600 rounded-[6px] flex items-center gap-2 hover:border-[#0F7B4D] hover:text-[#0F7B4D] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer">
            <Upload size={14} /> Import Excel
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} disabled={importing} />
          </label>

          <button className="h-10 px-4 bg-white border border-gray-200 rounded-[6px] flex items-center gap-2 text-gray-500 hover:text-corp-dark hover:border-corp-dark transition-all text-xs font-bold uppercase tracking-wider">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <Table
        headers={["Partner Details", "Primary Contact", "Service Category", "Lifecycle Status", "Actions"]}
        data={filtered}
        loading={loading}
        renderRow={(v) => (
          <>
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[6px] bg-gray-50 border border-gray-200 flex items-center justify-center text-corp-dark">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900 leading-none">{v.companyName}</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tighter">{v.email}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <UserCircle2 size={14} className="text-gray-400" />
                <span className="text-gray-700 font-semibold text-xs tracking-tight">{v.contactPerson || v.contactDetails?.name || "N/A"}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{v.category?.name || v.serviceType || "Infrastructure"}</span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase border ${v.lifecycleStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    v.lifecycleStatus === 'blacklisted' ? 'bg-gray-900 text-white border-gray-700' :
                      v.lifecycleStatus === 'suspended' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                  {v.lifecycleStatus || "active"}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(v)}
                  className="p-2 bg-white border border-gray-200 rounded-[4px] text-gray-400 hover:text-corp-dark hover:border-corp-dark transition-all"
                  title="View Profile"
                >
                  <Eye size={16} />
                </button>
              </div>
            </td>
          </>
        )}
      />

      <VendorDetailsModal vendor={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
