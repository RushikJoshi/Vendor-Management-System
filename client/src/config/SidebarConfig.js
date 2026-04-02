import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSignature,
  Users,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, allowedRoles: ["admin", "hr", "sales", "finance", "procurement", "viewer"] },
  { key: "applications", label: "Applications", path: "/admin/applications", icon: FileText, allowedRoles: ["admin", "hr"] },
  { key: "vendors", label: "Vendors", path: "/admin/vendors", icon: Building2, allowedRoles: ["admin", "procurement"] },
  { key: "vendor_forms", label: "Form Builder", path: "/admin/vendor-forms", icon: LayoutDashboard, allowedRoles: ["admin", "procurement"] },
  { key: "rfq", label: "RFQs", path: "/admin/rfqs", icon: FileText, allowedRoles: ["admin", "sales", "procurement"] },
  { key: "contracts", label: "Contracts", path: "/admin/contracts", icon: FileSignature, allowedRoles: ["admin", "sales", "procurement", "finance"] },
  { key: "users", label: "Users", path: "/admin/users", icon: Users, allowedRoles: ["admin", "hr"] },
  { key: "settings", label: "Settings", path: "/admin/settings", icon: Settings, allowedRoles: ["admin", "hr", "finance", "procurement", "viewer"] },
];
