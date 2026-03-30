import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Edit,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const DEFAULT_USER = {
  name: "",
  email: "",
  password: "",
  role: "vendor",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

const formatRoleLabel = (role) =>
  (role || "user")
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const getStatusTone = (status) =>
  (status || "active").toLowerCase() === "active"
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-rose-100 bg-rose-50 text-rose-700";

const UserManagement = () => {
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(["admin", "hr", "manager", "vendor"]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingChange, setPendingChange] = useState(null);
  const [newUser, setNewUser] = useState(DEFAULT_USER);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/v1/roles");
      if (res.data.success && res.data.data.length > 0) {
        setRoles(res.data.data.map((role) => role.name));
      }
    } catch (error) {
      console.log("Using default roles due to error or no custom roles found");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/v1/users");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const resetForm = () => {
    setNewUser(DEFAULT_USER);
    setIsEditing(false);
    setSelectedUserId(null);
  };

  const closeUserModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
    setPendingChange(null);
    setSelectedUser(null);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    const toastId = toast.loading(isEditing ? "Updating user..." : "Creating user...");

    try {
      let res;

      if (isEditing) {
        const updateData = { ...newUser };
        if (!updateData.password) delete updateData.password;
        res = await api.put(`/v1/users/${selectedUserId}`, updateData);
      } else {
        res = await api.post("/v1/users", newUser);
      }

      if (res.data.success) {
        toast.success(isEditing ? "User updated successfully" : "User created successfully", {
          id: toastId,
        });
        closeUserModal();
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed", { id: toastId });
    }
  };

  const handleEditClick = (user) => {
    setNewUser({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setSelectedUserId(user._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser?.id || id === currentUser?._id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this user?")) return;

    try {
      const res = await api.delete(`/v1/users/${id}`);
      if (res.data.success) {
        toast.success("User removed successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleRoleChangeRequest = (user, newRole) => {
    if (user._id === currentUser?.id || user._id === currentUser?._id) {
      toast.error("You cannot change your own role.");
      return;
    }

    if (user.role === newRole) return;

    setPendingChange({ userId: user._id, type: "role", value: newRole });
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleStatusToggle = async (user) => {
    const newStatus = (user.status || "active") === "active" ? "inactive" : "active";

    try {
      const res = await api.patch(`/v1/users/${user._id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"}`);
        setUsers((prev) =>
          prev.map((item) =>
            item._id === user._id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const confirmChange = async () => {
    if (!pendingChange) return;

    try {
      if (pendingChange.type === "role") {
        const res = await api.patch(`/v1/users/${pendingChange.userId}/role`, {
          role: pendingChange.value,
        });

        if (res.data.success) {
          toast.success("Role updated successfully");
          setUsers((prev) =>
            prev.map((item) =>
              item._id === pendingChange.userId
                ? { ...item, role: pendingChange.value }
                : item
            )
          );
        }
      }
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      closeConfirmModal();
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const currentStatus = (user.status || "active").toLowerCase();
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => (user.status || "active") === "active").length,
      inactive: users.filter((user) => (user.status || "active") !== "active").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users]
  );

  return (
    <div className="space-y-3 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                User Directory
              </span>
              <span className="rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                Admin / Users
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
              Clean user control for the admin team.
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500 xl:text-[17px]">
              Manage access, roles, and account status in the same calm dashboard style
              used across the admin workspace.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroTile icon={Users} label="Total Users" value={stats.total} />
              <HeroTile icon={Shield} label="Roles Available" value={roles.length} />
              <HeroTile
                icon={Activity}
                label="Visible Results"
                value={filteredUsers.length}
              />
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
            <QuickInfoCard
              title="Access Overview"
              value={`${stats.active} active users`}
              note="Role changes, account updates, and status control stay on the same screen."
            />
            <QuickInfoCard
              title="Directory Status"
              value={`${stats.inactive} inactive users`}
              note="Use search and filters to find the right account faster without changing the backend flow."
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                <UserPlus size={16} />
                Add User
              </button>
              <button
                onClick={() => {
                  fetchUsers();
                  fetchRoles();
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                <Activity size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Directory Total" value={stats.total} tone="slate" />
        <SummaryCard label="Active Accounts" value={stats.active} tone="emerald" />
        <SummaryCard label="Inactive Accounts" value={stats.inactive} tone="rose" />
        <SummaryCard label="Admin Accounts" value={stats.admins} tone="indigo" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 xl:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">User List</h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  Search, filter, edit, and manage account access from one place.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-3 xl:w-auto">
              <div className="relative min-w-[18rem]">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {formatRoleLabel(role)}
                  </option>
                ))}
              </select>

              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/60">
              <tr>
                {["User", "Role", "Status", "Added On", "Actions"].map((heading) => (
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                        <Users size={22} />
                      </div>
                      <p className="mt-5 text-[15px] font-semibold text-slate-900">
                        No users match the current filters.
                      </p>
                      <p className="mt-2 text-[13px] leading-6 text-slate-500">
                        Try changing the search text, selected role, or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-[14px] font-semibold text-slate-700 shadow-inner">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[12px] text-slate-500">
                            <Mail size={13} className="text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChangeRequest(user, event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {formatRoleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all hover:brightness-95 ${getStatusTone(
                          user.status
                        )}`}
                      >
                        {formatRoleLabel(user.status || "active")}
                      </button>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-[13px] font-medium text-slate-700">
                        {formatDate(user.createdAt)}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
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
          <ModalShell onClose={closeUserModal} maxWidth="max-w-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {isEditing ? "Edit User" : "Create New User"}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  Keep the same user flow, with a cleaner admin-friendly form.
                </p>
              </div>
              <button
                onClick={closeUserModal}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Full Name" span>
                  <input
                    type="text"
                    required
                    placeholder="Enter user name"
                    className="saas-input"
                    value={newUser.name}
                    onChange={(event) =>
                      setNewUser({ ...newUser, name: event.target.value })
                    }
                  />
                </Field>

                <Field label="Email Address" span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="saas-input"
                    value={newUser.email}
                    onChange={(event) =>
                      setNewUser({ ...newUser, email: event.target.value })
                    }
                  />
                </Field>

                <Field label="Role">
                  <select
                    className="saas-input"
                    value={newUser.role}
                    onChange={(event) =>
                      setNewUser({ ...newUser, role: event.target.value })
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {formatRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={isEditing ? "Password (Optional)" : "Password"}>
                  <input
                    type="password"
                    required={!isEditing}
                    placeholder={
                      isEditing ? "Leave blank to keep current password" : "Enter password"
                    }
                    className="saas-input"
                    value={newUser.password}
                    onChange={(event) =>
                      setNewUser({ ...newUser, password: event.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Account details only. Backend flow remains unchanged.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800"
                  >
                    <UserPlus size={15} />
                    {isEditing ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmOpen && pendingChange && selectedUser && (
          <ModalShell onClose={closeConfirmModal} maxWidth="max-w-lg">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <h3 className="text-xl font-semibold text-slate-900">Confirm Role Change</h3>
              <p className="mt-1 text-[13px] text-slate-500">
                Review the change before updating the user role.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">
                      {selectedUser.name}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <RolePreview label="Current Role" value={selectedUser.role} />
                  <RolePreview label="New Role" value={pendingChange.value} />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmChange}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-800"
                >
                  <ShieldCheck size={15} />
                  Confirm
                </button>
              </div>
            </div>
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
      : tone === "rose"
      ? "border-rose-100 bg-rose-50 text-rose-700"
      : tone === "indigo"
      ? "border-indigo-100 bg-indigo-50 text-indigo-700"
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

const Field = ({ label, children, span = false }) => (
  <div className={`space-y-2 ${span ? "md:col-span-2" : ""}`}>
    <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
      {label}
    </label>
    {children}
  </div>
);

const RolePreview = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-[14px] font-semibold text-slate-900">
      {formatRoleLabel(value)}
    </p>
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

export default UserManagement;
