import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit,
  Layers,
  LockKeyhole,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

import api from "../../services/api";

const MODULES = [
  "Dashboard",
  "Vendors",
  "Forms",
  "Applications",
  "Categories",
  "Invitations",
  "SLM",
  "Contracts",
  "RFQs",
  "Quotations",
  "Departments",
  "Purchase Orders",
  "Users",
  "Roles",
  "Audit Logs",
  "Analytics",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  minLimit: 0,
  maxLimit: 0,
  accessibleModules: [],
  permissions: [],
};

const formatCurrency = (value) =>
  Number(value) > 0 ? `INR ${new Intl.NumberFormat("en-IN").format(Number(value))}` : "No limit";

const formatCount = (value, singular, plural = `${singular}s`) =>
  `${value} ${value === 1 ? singular : plural}`;

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/v1/roles");
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/v1/roles/permissions");
      if (res.data.success) {
        setPermissions(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch permissions");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const resetForm = () => {
    setSelectedRole(null);
    setFormData(EMPTY_FORM);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        minLimit: role.minLimit || 0,
        maxLimit: role.maxLimit || 0,
        accessibleModules: role.accessibleModules || [],
        permissions: role.permissions ? role.permissions.map((item) => item._id || item) : [],
      });
    } else {
      resetForm();
    }

    setIsModalOpen(true);
  };

  const handleModuleToggle = (moduleName) => {
    setFormData((prev) => {
      const exists = prev.accessibleModules.includes(moduleName);
      return {
        ...prev,
        accessibleModules: exists
          ? prev.accessibleModules.filter((item) => item !== moduleName)
          : [...prev.accessibleModules, moduleName],
      };
    });
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((item) => item !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading(selectedRole ? "Updating role..." : "Creating role...");

    try {
      let res;
      if (selectedRole) {
        res = await api.put(`/v1/roles/${selectedRole._id}`, formData);
      } else {
        res = await api.post("/v1/roles", formData);
      }

      if (res.data.success) {
        toast.success(selectedRole ? "Role updated successfully" : "Role created successfully", {
          id: toastId,
        });
        closeModal();
        fetchRoles();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save role", {
        id: toastId,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await api.delete(`/v1/roles/${id}`);
      if (res.data.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
      }
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const filteredRoles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return roles.filter((role) => {
      if (!query) return true;

      return (
        role.name?.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        role.accessibleModules?.some((item) => item.toLowerCase().includes(query))
      );
    });
  }, [roles, searchTerm]);

  const stats = useMemo(() => {
    const activeModules = new Set();

    roles.forEach((role) => {
      (role.accessibleModules || []).forEach((moduleName) => activeModules.add(moduleName));
    });

    return {
      totalRoles: roles.length,
      unrestrictedRoles: roles.filter((role) => !Number(role.maxLimit)).length,
      permissionNodes: permissions.length,
      moduleCoverage: activeModules.size,
    };
  }, [roles, permissions]);

  return (
    <div className="space-y-3 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                Access Levels
              </span>
              <span className="rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                Admin / Roles
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
              Roles That Stay Clear, Readable, And Easy To Manage.
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
              Keep Access Levels, Module Visibility, And Approval Ranges In One Dashboard-Friendly
              Workspace Without Changing The Backend Flow.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroTile icon={Shield} label="Total Levels" value={stats.totalRoles} />
              <HeroTile icon={Layers} label="Module Coverage" value={stats.moduleCoverage} />
              <HeroTile
                icon={LockKeyhole}
                label="Permission Nodes"
                value={stats.permissionNodes}
              />
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
            <QuickInfoCard
              title="Open Access Levels"
              value={formatCount(stats.unrestrictedRoles, "level")}
              note="These roles do not currently use a maximum approval limit."
            />
            <QuickInfoCard
              title="Filtered Results"
              value={formatCount(filteredRoles.length, "role")}
              note="Use search to quickly find a role by name, description, or module."
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                <Plus size={16} />
                Add Role
              </button>
              <button
                onClick={() => {
                  fetchRoles();
                  fetchPermissions();
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                <CheckCircle2 size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Role Directory" value={stats.totalRoles} tone="slate" />
        <SummaryCard label="Unlimited Range" value={stats.unrestrictedRoles} tone="emerald" />
        <SummaryCard label="Permission Catalog" value={stats.permissionNodes} tone="indigo" />
        <SummaryCard label="Visible Modules" value={stats.moduleCoverage} tone="amber" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 xl:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Role List</h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  Browse approval ranges, module visibility, and permission counts.
                </p>
              </div>
            </div>

            <div className="relative min-w-[18rem] xl:w-[22rem]">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search roles, modules, or description"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/60">
              <tr>
                {["Role", "Approval Range", "Modules", "Permissions", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
                  >
                    {heading}
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
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                        <Shield size={22} />
                      </div>
                      <p className="mt-5 text-[15px] font-semibold text-slate-900">
                        No roles match the current search.
                      </p>
                      <p className="mt-2 text-[13px] leading-6 text-slate-500">
                        Try a different role name, description, or module keyword.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, index) => (
                  <motion.tr
                    key={role._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-[14px] font-semibold text-slate-700 shadow-inner">
                          {role.name?.charAt(0)?.toUpperCase() || "R"}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-slate-900">{role.name}</p>
                          <p className="mt-1 max-w-[26rem] text-[12px] leading-5 text-slate-500">
                            {role.description || "No description added for this role."}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <p className="text-[13px] font-semibold text-slate-900">
                          Max: {formatCurrency(role.maxLimit)}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          Min: {Number(role.minLimit) > 0 ? formatCurrency(role.minLimit) : "INR 0"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex max-w-[20rem] flex-wrap gap-2">
                        {(role.accessibleModules || []).slice(0, 3).map((moduleName) => (
                          <span
                            key={moduleName}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600"
                          >
                            {moduleName}
                          </span>
                        ))}
                        {(role.accessibleModules || []).length > 3 && (
                          <span className="rounded-full border border-slate-900 bg-slate-900 px-3 py-1 text-[10px] font-semibold text-white">
                            +{role.accessibleModules.length - 3}
                          </span>
                        )}
                        {(!role.accessibleModules || role.accessibleModules.length === 0) && (
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                            Full access
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                          Assigned
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-slate-900">
                          {formatCount(role.permissions?.length || 0, "permission")}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-rose-600 transition-all hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <ModalShell onClose={closeModal} maxWidth="max-w-5xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedRole ? "Edit Role" : "Create New Role"}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  Same role APIs, cleaner admin dashboard layout.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
              <div className="grid gap-6 overflow-y-auto p-6 xl:grid-cols-[1fr_1fr]">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                    <h4 className="text-[15px] font-semibold text-slate-900">Basic Details</h4>
                    <div className="mt-5 grid grid-cols-1 gap-5">
                      <Field label="Role Name">
                        <input
                          type="text"
                          required
                          placeholder="Enter role name"
                          className="saas-input"
                          value={formData.name}
                          onChange={(event) =>
                            setFormData({ ...formData, name: event.target.value })
                          }
                        />
                      </Field>

                      <Field label="Description">
                        <textarea
                          rows="4"
                          placeholder="Add a short role description"
                          className="saas-input resize-none"
                          value={formData.description}
                          onChange={(event) =>
                            setFormData({ ...formData, description: event.target.value })
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                    <h4 className="text-[15px] font-semibold text-slate-900">Approval Range</h4>
                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="Minimum Limit">
                        <input
                          type="number"
                          className="saas-input"
                          value={formData.minLimit}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              minLimit: parseInt(event.target.value, 10) || 0,
                            })
                          }
                        />
                      </Field>

                      <Field label="Maximum Limit">
                        <input
                          type="number"
                          className="saas-input"
                          value={formData.maxLimit}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              maxLimit: parseInt(event.target.value, 10) || 0,
                            })
                          }
                        />
                      </Field>
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                      Enter `0` in maximum limit if the role should not have an approval cap.
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[15px] font-semibold text-slate-900">
                          Module Access
                        </h4>
                        <p className="mt-1 text-[12px] text-slate-500">
                          Choose which sections this role can access.
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600">
                        {formatCount(formData.accessibleModules.length, "module")}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
                      {MODULES.map((moduleName) => {
                        const active = formData.accessibleModules.includes(moduleName);

                        return (
                          <button
                            key={moduleName}
                            type="button"
                            onClick={() => handleModuleToggle(moduleName)}
                            className={`rounded-xl border px-4 py-3 text-left text-[11px] font-semibold transition-all ${
                              active
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {moduleName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[15px] font-semibold text-slate-900">
                          Permissions
                        </h4>
                        <p className="mt-1 text-[12px] text-slate-500">
                          Assign permission entries available from the backend catalog.
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600">
                        {formatCount(formData.permissions.length, "permission")}
                      </span>
                    </div>

                    {permissions.length === 0 ? (
                      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[13px] text-slate-500">
                        No permission items available right now.
                      </div>
                    ) : (
                      <div className="mt-5 grid max-h-[18rem] grid-cols-1 gap-3 overflow-y-auto pr-1">
                        {permissions.map((permission) => {
                          const permissionId = permission._id || permission.id;
                          const active = formData.permissions.includes(permissionId);

                          return (
                            <button
                              key={permissionId}
                              type="button"
                              onClick={() => handlePermissionToggle(permissionId)}
                              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                active
                                  ? "border-indigo-200 bg-indigo-50"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-[13px] font-semibold text-slate-900">
                                    {permission.name || permission.action || "Permission"}
                                  </p>
                                  <p className="mt-1 text-[12px] text-slate-500">
                                    {permission.description ||
                                      permission.resource ||
                                      "Permission entry from backend"}
                                  </p>
                                </div>
                                {active && (
                                  <span className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                                    Selected
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-[12px] text-slate-500">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Role UI updated only. API behavior remains unchanged.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800"
                  >
                    <ShieldCheck size={15} />
                    {selectedRole ? "Save Changes" : "Create Role"}
                  </button>
                </div>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
};

const HeroTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-inner">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const QuickInfoCard = ({ title, value, note }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
      {title}
    </p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p>
  </div>
);

const SummaryCard = ({ label, value, tone }) => {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "indigo"
      ? "border-indigo-100 bg-indigo-50 text-indigo-700"
      : tone === "amber"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between">
        <span
          className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${toneClass}`}
        >
          {label}
        </span>
      </div>
      <h3 className="text-4xl font-semibold tracking-tight text-slate-900">{value}</h3>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
      {label}
    </label>
    {children}
  </div>
);

const ModalShell = ({ children, onClose, maxWidth = "max-w-4xl" }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div onClick={onClose} className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" />
    <div
      className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-2xl ${maxWidth}`}
    >
      {children}
    </div>
  </div>
);

export default RoleManagement;
