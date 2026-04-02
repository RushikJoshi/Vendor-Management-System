import React, { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import api from "../../services/api";

const MODULE_OPTIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "vendor_forms", label: "Vendors" },
  { key: "rfq", label: "RFQ" },
  { key: "contracts", label: "Contracts" },
  { key: "users", label: "Users" },
  { key: "analytics", label: "Analytics" },
  { key: "form_builder", label: "Forms" },
  { key: "settings", label: "Settings" },
];

const PERMISSION_GROUPS = [
  {
    title: "Users",
    actions: [
      { key: "users.view", label: "View Users", permissionNames: ["MANAGE_USERS"] },
      { key: "users.create", label: "Create User", permissionNames: ["MANAGE_USERS"] },
      { key: "users.edit", label: "Edit User", permissionNames: ["MANAGE_USERS"] },
      { key: "users.delete", label: "Delete User", permissionNames: ["MANAGE_USERS"] },
    ],
  },
  {
    title: "Vendors",
    actions: [
      { key: "vendors.view", label: "View Vendors", permissionNames: ["MANAGE_VENDORS"] },
      { key: "vendors.add", label: "Add Vendor", permissionNames: ["MANAGE_VENDORS"] },
      { key: "vendors.edit", label: "Edit Vendor", permissionNames: ["MANAGE_VENDORS"] },
    ],
  },
  {
    title: "RFQ",
    actions: [
      { key: "rfq.view", label: "View RFQ", permissionNames: [] },
      { key: "rfq.create", label: "Create RFQ", permissionNames: [] },
      { key: "rfq.approve", label: "Approve RFQ", permissionNames: [] },
    ],
  },
  {
    title: "Contracts",
    actions: [
      { key: "contracts.view", label: "View Contracts", permissionNames: ["MANAGE_CONTRACTS"] },
      { key: "contracts.manage", label: "Manage Contracts", permissionNames: ["MANAGE_CONTRACTS"] },
    ],
  },
  {
    title: "Settings",
    actions: [{ key: "settings.access", label: "Access Settings", permissionNames: ["MANAGE_ROLES"] }],
  },
];

const ACTIONS = PERMISSION_GROUPS.flatMap((group) => group.actions);
const ACTION_KEYS = ACTIONS.map((action) => action.key);
const MODULE_KEYS = MODULE_OPTIONS.map((module) => module.key);

const DEFAULT_FORM = {
  name: "",
  description: "",
  minLimit: 0,
  maxLimit: 0,
  selectedModules: [],
  selectedActions: [],
};

const titleCase = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const labelForAction = (actionKey) => ACTIONS.find((item) => item.key === actionKey)?.label || actionKey;

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissionCatalog, setPermissionCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/roles");
      if (res.data?.success) {
        setRoles(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (error) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionCatalog = async () => {
    try {
      const res = await api.get("/v1/roles/permissions");
      if (res.data?.success) {
        setPermissionCatalog(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (error) {
      setPermissionCatalog([]);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissionCatalog();
  }, []);

  const openCreateModal = () => {
    setSelectedRole(null);
    setForm(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    const stored = Array.isArray(role.accessibleModules) ? role.accessibleModules : [];
    setSelectedRole(role);
    setForm({
      name: role.name || "",
      description: role.description || "",
      minLimit: Number(role.minLimit || 0),
      maxLimit: Number(role.maxLimit || 0),
      selectedModules: stored.filter((item) => MODULE_KEYS.includes(item)),
      selectedActions: stored.filter((item) => ACTION_KEYS.includes(item)),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setForm(DEFAULT_FORM);
  };

  const toggleModule = (moduleKey) => {
    setForm((prev) => {
      const exists = prev.selectedModules.includes(moduleKey);
      return {
        ...prev,
        selectedModules: exists
          ? prev.selectedModules.filter((item) => item !== moduleKey)
          : [...prev.selectedModules, moduleKey],
      };
    });
  };

  const toggleAction = (actionKey) => {
    setForm((prev) => {
      const exists = prev.selectedActions.includes(actionKey);
      return {
        ...prev,
        selectedActions: exists
          ? prev.selectedActions.filter((item) => item !== actionKey)
          : [...prev.selectedActions, actionKey],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim().toLowerCase();
    if (!name) {
      toast.error("Role name is required");
      return;
    }

    const selectedActionDefs = ACTIONS.filter((action) => form.selectedActions.includes(action.key));
    const permissionNames = [...new Set(selectedActionDefs.flatMap((action) => action.permissionNames))];
    const permissionIds = permissionCatalog
      .filter((permission) => permissionNames.includes(permission.name))
      .map((permission) => permission._id);

    const payload = {
      name,
      description: form.description.trim(),
      minLimit: Number(form.minLimit || 0),
      maxLimit: Number(form.maxLimit || 0),
      accessibleModules: [...new Set([...form.selectedModules, ...form.selectedActions])],
      permissions: permissionIds,
    };

    const toastId = toast.loading(selectedRole ? "Updating role..." : "Creating role...");
    try {
      if (selectedRole?._id) {
        await api.put(`/v1/roles/${selectedRole._id}`, payload);
        toast.success("Role updated successfully", { id: toastId });
      } else {
        await api.post("/v1/roles", payload);
        toast.success("Role created successfully", { id: toastId });
      }
      closeModal();
      fetchRoles();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save role", { id: toastId });
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await api.delete(`/v1/roles/${roleId}`);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const filteredRoles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return roles.filter((role) => {
      if (!query) return true;
      return (
        String(role.name || "").toLowerCase().includes(query) ||
        String(role.description || "").toLowerCase().includes(query) ||
        (role.accessibleModules || []).some((item) => String(item).toLowerCase().includes(query))
      );
    });
  }, [roles, searchTerm]);

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Role & Permission Management</h1>
            <p className="mt-1 text-sm text-slate-500">Create enterprise roles with module access and fine-grained action permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                fetchRoles();
                fetchPermissionCatalog();
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Create Role
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 p-4">
          <div className="relative w-full md:max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Modules</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Permissions</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading &&
                [1, 2, 3].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-52 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-36 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-8 w-24 rounded bg-slate-100" /></td>
                  </tr>
                ))}

              {!loading && filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-500">No roles found.</td>
                </tr>
              )}

              {!loading &&
                filteredRoles.map((role) => {
                  const stored = Array.isArray(role.accessibleModules) ? role.accessibleModules : [];
                  const modules = stored.filter((item) => MODULE_KEYS.includes(item));
                  const actions = stored.filter((item) => ACTION_KEYS.includes(item));
                  return (
                    <tr key={role._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">{titleCase(role.name)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{role.description || "No description"}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{modules.length} selected</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{actions.length} selected</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Edit size={13} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(role._id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={isModalOpen} onClose={closeModal} title={selectedRole ? "Edit Role" : "Create Role"} size="max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Role Info</h3>
              <div className="mt-4 space-y-4">
                <Field label="Role Name">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. hr, finance, procurement"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief role purpose"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Minimum Limit (Optional)">
                    <input
                      type="number"
                      value={form.minLimit}
                      onChange={(e) => setForm((prev) => ({ ...prev, minLimit: Number(e.target.value || 0) }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </Field>
                  <Field label="Maximum Limit (Optional)">
                    <input
                      type="number"
                      value={form.maxLimit}
                      onChange={(e) => setForm((prev) => ({ ...prev, maxLimit: Number(e.target.value || 0) }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Module Access</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {form.selectedModules.length} selected
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Selected modules control sidebar visibility and page availability.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                {MODULE_OPTIONS.map((module) => {
                  const active = form.selectedModules.includes(module.key);
                  return (
                    <button
                      key={module.key}
                      type="button"
                      onClick={() => toggleModule(module.key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {module.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Permissions</h3>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {form.selectedActions.length} selected
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Permissions control actions such as buttons, operations, and protected APIs.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">{group.title}</h4>
                  <div className="mt-3 space-y-2">
                    {group.actions.map((action) => {
                      const checked = form.selectedActions.includes(action.key);
                      return (
                        <label
                          key={action.key}
                          className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                            checked
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAction(action.key)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{action.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <ShieldCheck size={14} className="text-emerald-600" />
              Modules control sidebar access, permissions control actions and APIs.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={14} className="mr-1 inline" />
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                {selectedRole ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
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
