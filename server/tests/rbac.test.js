const test = require("node:test");
const assert = require("node:assert/strict");

const { canAccessModule, getAllowedModules, normalizeRole } = require("../config/roles");
const {
  deriveAllowedModulesFromPermissions,
  getDefaultPermissionsForRole,
  hasPermission,
  normalizePermissionKey,
} = require("../config/userPermissions");

test("role aliases normalize to the canonical role used by guards", () => {
  assert.equal(normalizeRole("Super Admin"), "admin");
  assert.equal(normalizeRole("company_admin"), "admin");
  assert.equal(normalizeRole("Procurement"), "procurement");
  assert.equal(normalizeRole("vendor"), "vendor");
});

test("default role permissions expose RFQ manage only to internal buyer roles", () => {
  const procurement = getDefaultPermissionsForRole("procurement");
  const finance = getDefaultPermissionsForRole("finance");
  const vendor = getDefaultPermissionsForRole("vendor");

  assert.equal(hasPermission(procurement, "rfq.manage"), true);
  assert.equal(hasPermission(finance, "rfq.manage"), true);
  assert.equal(hasPermission(vendor, "rfq.manage"), false);
});

test("permission aliases derive the expected module access", () => {
  const permission = normalizePermissionKey("rfq.manage");
  assert.equal(permission, "rfq_manage");
  assert.deepEqual(deriveAllowedModulesFromPermissions([permission]), ["rfq"]);
  assert.deepEqual(deriveAllowedModulesFromPermissions(["sales.manage"]), ["sales"]);
});

test("vendors are limited to vendor-facing modules by default", () => {
  assert.equal(canAccessModule("vendor", "vendor_dashboard"), true);
  assert.equal(canAccessModule("vendor", "rfq"), false);
  assert.deepEqual(getAllowedModules("admin"), ["*"]);
});
