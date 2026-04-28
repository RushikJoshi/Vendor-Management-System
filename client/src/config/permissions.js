export const PERMISSION_GROUPS = [
  {
    title: "Users",
    items: [
      { key: "users_view", label: "View Users" },
      { key: "users_create", label: "Create User" },
      { key: "users_edit", label: "Edit User" },
      { key: "users_delete", label: "Delete User" },
    ],
  },
  {
    title: "Vendors",
    items: [
      { key: "vendors_view", label: "View Vendors" },
      { key: "vendors_add", label: "Add Vendor" },
      { key: "vendors_edit", label: "Edit Vendor" },
    ],
  },
  {
    title: "RFQ",
    items: [
      { key: "rfq_view", label: "View RFQ" },
      { key: "rfq_create", label: "Create RFQ" },
      { key: "rfq_approve", label: "Approve RFQ" },
    ],
  },
  {
    title: "Contracts",
    items: [
      { key: "contracts_view", label: "View Contracts" },
      { key: "contracts_manage", label: "Manage Contracts" },
    ],
  },
  {
    title: "Settings",
    items: [{ key: "settings_access", label: "Access Settings" }],
  },
  {
    title: "Vendor Portal",
    items: [
      { key: "vendor_dashboard", label: "Vendor Dashboard" },
      { key: "vendor_rfq_view", label: "Vendor RFQ View" },
      { key: "vendor_quote_submit", label: "Vendor Quote Submit" },
    ],
  },
];

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
  { value: "procurement", label: "Procurement" },
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "sales", label: "Sales" },
  { value: "viewer", label: "Viewer" },
  { value: "vendor", label: "Vendor" },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: ["*"],
  hr: ["dashboard_view", "users_view", "users_create", "users_edit", "vendors_view", "vendors_add", "vendors_edit"],
  procurement: ["dashboard_view", "vendors_view", "vendors_add", "vendors_edit", "rfq_view", "rfq_create", "rfq_approve", "contracts_view", "contracts_manage"],
  manager: ["dashboard_view", "vendors_view", "rfq_view", "rfq_approve", "contracts_view", "users_view"],
  sales: ["dashboard_view", "rfq_view", "rfq_create", "contracts_view"],
  finance: ["dashboard_view", "rfq_view", "rfq_approve", "contracts_view", "contracts_manage"],
  viewer: ["dashboard_view"],
  vendor: ["vendor_dashboard", "vendor_rfq_view", "vendor_quote_submit"],
};

const PERMISSION_ALIASES = {
  "users.view": "users_view",
  "users.create": "users_create",
  "users.edit": "users_edit",
  "users.delete": "users_delete",
  "vendors.view": "vendors_view",
  "vendors.add": "vendors_add",
  "vendors.edit": "vendors_edit",
  "rfq.view": "rfq_view",
  "rfq.create": "rfq_create",
  "rfq.approve": "rfq_approve",
  "contracts.view": "contracts_view",
  "contracts.manage": "contracts_manage",
  "settings.access": "settings_access",
  "vendor.dashboard": "vendor_dashboard",
  "vendor.rfq.view": "vendor_rfq_view",
  "vendor.quote.submit": "vendor_quote_submit",
};

export const normalizePermissionKey = (raw) => {
  const key = String(raw || "").trim().toLowerCase();
  if (!key) return "";
  const aliasMapped = PERMISSION_ALIASES[key] || key;
  return aliasMapped.replace(/[.\s]+/g, "_");
};

export const sanitizePermissions = (permissions = []) => [
  ...new Set((Array.isArray(permissions) ? permissions : []).map(normalizePermissionKey).filter(Boolean)),
];

export const getEffectivePermissions = (user) => {
  const direct = sanitizePermissions(user?.permissions || []);
  if (direct.length > 0) return direct;
  const role = String(user?.role || "").toLowerCase();
  return sanitizePermissions(DEFAULT_ROLE_PERMISSIONS[role] || []);
};

export const hasPermission = (user, permissionKey) => {
  const normalizedRequired = normalizePermissionKey(permissionKey);
  if (!normalizedRequired) return false;
  const effective = getEffectivePermissions(user);
  return effective.includes("*") || effective.includes(normalizedRequired);
};

export const hasAnyPermission = (user, permissionKeys = []) => {
  return permissionKeys.some((key) => hasPermission(user, key));
};
