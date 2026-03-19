import {
    LayoutDashboard,
    Users,
    Layers,
    FileText,
    Mail,
    BarChart3,
    History,
    FileSignature,
    Settings as SettingsIcon,
    ClipboardEdit,
    UserCog
} from "lucide-react";


export const sidebarItems = [
    { key: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, allowedRoles: ["admin", "hr", "manager"] },
    { key: "vendors", label: "Vendors", path: "/admin/vendors", icon: Users, allowedRoles: ["admin", "hr"] },
    { key: "applications", label: "Applications", path: "/admin/applications", icon: FileText, allowedRoles: ["admin", "hr"] },
    { key: "rfqs", label: "RFQs", path: "/admin/rfqs", icon: ClipboardEdit, allowedRoles: ["admin", "manager"] },
    { key: "contracts", label: "Contracts", path: "/admin/contracts", icon: FileSignature, allowedRoles: ["admin", "manager"] },
    { key: "form-builder", label: "Form Builder", path: "/admin/form-builder", icon: Layers, allowedRoles: ["admin"] },
    { key: "analytics", label: "Analytics", path: "/admin/analytics", icon: BarChart3, allowedRoles: ["admin"] },
    { key: "audit-logs", label: "Audit Logs", path: "/admin/audit-logs", icon: History, allowedRoles: ["admin"] },
    { key: "invitations", label: "Invitations", path: "/admin/invitations", icon: Mail, allowedRoles: ["admin"] },
    { key: "users", label: "Users", path: "/admin/users", icon: UserCog, allowedRoles: ["admin"] },
    { key: "settings", label: "Settings", path: "/admin/settings", icon: SettingsIcon, allowedRoles: ["admin"] },
];
