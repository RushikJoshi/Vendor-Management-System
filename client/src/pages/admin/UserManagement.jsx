import React, { useContext, useEffect, useMemo, useState } from "react";
import { Edit, Mail, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import {
  PERMISSION_GROUPS,
  ROLE_OPTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  normalizePermissionKey,
  sanitizePermissions,
  hasPermission as hasUserPermission,
} from "../../config/permissions";

const ACTION_MAP = PERMISSION_GROUPS.flatMap((group) => group.items);

const DEFAULT_USER = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
  permissions: [],
};

const statusLabel = (status) => ((status || "active").toLowerCase() === "active" ? "Active" : "Inactive");
const statusTone = (status) =>
  (status || "active").toLowerCase() === "active"
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-rose-100 bg-rose-50 text-rose-700";

const hasPermission = (user, key) => {
  return hasUserPermission(user, key);
};

const getAccess = (currentUser) => ({
  canCreate: String(currentUser?.role || "").toLowerCase() === "admin" || hasPermission(currentUser, "users_create"),
  canEdit: String(currentUser?.role || "").toLowerCase() === "admin" || hasPermission(currentUser, "users_edit"),
  canDelete: String(currentUser?.role || "").toLowerCase() === "admin" || hasPermission(currentUser, "users_delete"),
  canToggleStatus: String(currentUser?.role || "").toLowerCase() === "admin" || hasPermission(currentUser, "users_edit"),
  canView: hasPermission(currentUser, "users_view") || String(currentUser?.role || "").toLowerCase() === "admin",
});

export default function UserManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const access = useMemo(() => getAccess(currentUser), [currentUser]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/users");
      if (res.data?.success) setUsers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access.canView) fetchUsers();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access.canView]);

  const handleCreateUser = () => {
    if (!access.canCreate) {
      toast.error("You do not have permission to create users.");
      return;
    }
    navigate("/admin/users/create");
  };

  const handleEditUser = (user) => {
    if (!access.canEdit) {
      toast.error("You do not have permission to edit users.");
      return;
    }
    navigate(`/admin/users/${user._id}/edit`);
  };

  const handleDelete = async (userId) => {
    if (!access.canDelete) {
      toast.error("You do not have permission to delete users.");
      return;
    }
    if (userId === currentUser?.id || userId === currentUser?._id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/v1/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleStatusToggle = async (user) => {
    if (!access.canToggleStatus) {
      toast.error("You do not have permission to change user status.");
      return;
    }
    if (user._id === currentUser?.id || user._id === currentUser?._id) {
      toast.error("You cannot change your own status.");
      return;
    }
    const nextStatus = (user.status || "active").toLowerCase() === "active" ? "inactive" : "active";

    try {
      await api.patch(`/v1/users/${user._id}/status`, { status: nextStatus });
      setUsers((prev) => prev.map((item) => (item._id === user._id ? { ...item, status: nextStatus } : item)));
      toast.success(`User ${nextStatus === "active" ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !query ||
        String(user.name || "").toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || String(user.status || "active").toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => String(user.status || "active").toLowerCase() === "active").length,
      inactive: users.filter((user) => String(user.status || "active").toLowerCase() !== "active").length,
    }),
    [users]
  );

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">Assign permissions directly to each user for flexible enterprise access control.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchUsers}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleCreateUser}
              disabled={!access.canCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={16} />
              Create User
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={stats.total} icon={Users} />
        <StatCard label="Active Users" value={stats.active} icon={ShieldCheck} />
        <StatCard label="Inactive Users" value={stats.inactive} icon={ShieldCheck} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Name", "Email", "Permissions", "Status", "Actions"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading &&
                [1, 2, 3, 4].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-36 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-52 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-36 rounded bg-slate-100" /></td>
                  </tr>
                ))}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-500">No users found.</td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user) => {
                  const userPermissions = sanitizePermissions(Array.isArray(user.permissions) ? user.permissions : []);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">{user.name || "-"}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <Mail size={13} className="text-slate-400" />
                          {user.email || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-[28rem] flex-wrap gap-2">
                          {userPermissions.length === 0 ? (
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-600">No permissions</span>
                          ) : (
                            userPermissions.slice(0, 3).map((permission) => (
                              <span key={permission} className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                                {ACTION_MAP.find((item) => item.key === permission)?.label || permission}
                              </span>
                            ))
                          )}
                          {userPermissions.length > 3 && (
                            <span className="rounded-full border border-slate-900 bg-slate-900 px-2.5 py-1 text-xs text-white">
                              +{userPermissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(user)}
                          disabled={!access.canToggleStatus}
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                            !access.canToggleStatus ? "cursor-not-allowed opacity-60" : "hover:brightness-95"
                          } ${statusTone(user.status)}`}
                        >
                          {statusLabel(user.status)}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            disabled={!access.canEdit}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit size={13} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user._id)}
                            disabled={!access.canDelete}
                            className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
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

    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <Icon size={16} className="text-slate-400" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children, span = false }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}
