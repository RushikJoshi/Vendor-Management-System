import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSignature,
  Users,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "hr", "sales", "finance", "procurement", "viewer"],
    requiredAnyPermissions: ["dashboard_view"],
  },
  {
    key: "vendor_forms",
    label: "Vendors",
    path: "/admin/vendor-forms",
    icon: Building2,
    allowedRoles: ["admin", "procurement", "hr", "manager"],
    requiredAnyPermissions: ["vendors_view", "vendors_add", "vendors_edit"],
  },
  {
    key: "rfq",
    label: "RFQs",
    path: "/admin/rfqs",
    icon: FileText,
    allowedRoles: ["admin", "sales", "procurement", "manager"],
    requiredAnyPermissions: ["rfq_view", "rfq_create", "rfq_approve"],
  },
  {
    key: "contracts",
    label: "Contracts",
    path: "/admin/contracts",
    icon: FileSignature,
    allowedRoles: ["admin", "sales", "procurement", "finance", "manager"],
    requiredAnyPermissions: ["contracts_view", "contracts_manage"],
  },
  {
    key: "users",
    label: "Users",
    path: "/admin/users",
    icon: Users,
    allowedRoles: ["admin", "hr", "manager"],
    requiredAnyPermissions: ["users_view", "users_create", "users_edit", "users_delete"],
  },
  {
    key: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
    allowedRoles: ["admin", "hr", "finance", "procurement", "viewer"],
    requiredAnyPermissions: ["settings_access"],
  },
];
