import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import api from "../../services/api";

const initialForm = {
  title: "",
  description: "",
  categoryId: "",
  budget: "",
  quoteDeadline: "",
  targetedVendors: [],
  attachment: null,
};

export default function CreateRFQModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [categoriesRes, vendorsRes] = await Promise.all([api.get("/categories"), api.get("/vendors")]);
        setCategories(Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data : []);
        setVendors(Array.isArray(vendorsRes.data?.data) ? vendorsRes.data.data : []);
      } catch (err) {
        toast.error("Unable to load category/vendor options");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [open]);

  const selectedVendors = useMemo(
    () => vendors.filter((vendor) => form.targetedVendors.includes(vendor._id)),
    [vendors, form.targetedVendors]
  );

  const toggleVendor = (vendorId) => {
    setForm((prev) => {
      const exists = prev.targetedVendors.includes(vendorId);
      return {
        ...prev,
        targetedVendors: exists ? prev.targetedVendors.filter((id) => id !== vendorId) : [...prev.targetedVendors, vendorId],
      };
    });
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setVendorsOpen(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.quoteDeadline) {
      toast.error("Please fill in Title, Description, and Closing Date");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating RFQ...");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        quoteDeadline: form.quoteDeadline,
        items: [],
        budget: { amount: Number(form.budget) || 0, currency: "USD" },
        vendorSelection: {
          type: form.targetedVendors.length > 0 ? "targeted" : "open",
          targetedVendors: form.targetedVendors,
        },
        status: "draft",
      };

      await api.post("/rfqs", payload);
      toast.success("RFQ created successfully", { id: toastId });
      handleClose();
      if (typeof onCreated === "function") onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create RFQ", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create RFQ" size="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5">
          <Field label="Title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter RFQ title"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your requirement"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Category">
              <select
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Budget">
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                placeholder="Enter budget amount"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </Field>
          </div>

          <Field label="Closing Date">
            <input
              type="date"
              value={form.quoteDeadline}
              onChange={(e) => setForm((prev) => ({ ...prev, quoteDeadline: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </Field>

          <Field label="Vendors">
            <div className="relative">
              <button
                type="button"
                onClick={() => setVendorsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span>{selectedVendors.length > 0 ? `${selectedVendors.length} vendor(s) selected` : "Select vendors"}</span>
                <ChevronDown size={16} className={`transition ${vendorsOpen ? "rotate-180" : ""}`} />
              </button>

              {vendorsOpen && (
                <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {loadingOptions ? (
                    <div className="px-3 py-3 text-sm text-slate-500">Loading vendors...</div>
                  ) : vendors.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-slate-500">No vendors available</div>
                  ) : (
                    vendors.map((vendor) => {
                      const selected = form.targetedVendors.includes(vendor._id);
                      return (
                        <button
                          type="button"
                          key={vendor._id}
                          onClick={() => toggleVendor(vendor._id)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                            selected ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{vendor.companyName || vendor.name}</span>
                          {selected && <Check size={14} />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {selectedVendors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedVendors.map((vendor) => (
                  <span
                    key={vendor._id}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                  >
                    {vendor.companyName || vendor.name}
                    <button type="button" onClick={() => toggleVendor(vendor._id)} className="rounded-full p-0.5 hover:bg-indigo-100">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="File Upload (Optional)">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
              <Upload size={16} />
              <span className="truncate">{form.attachment ? form.attachment.name : "Choose a file"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setForm((prev) => ({ ...prev, attachment: e.target.files?.[0] || null }))}
              />
            </label>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Create RFQ
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}
