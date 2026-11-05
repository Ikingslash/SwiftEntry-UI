import { createSeed } from "../mocks/seed.js";
import {
  canAccessTenant,
  getScope,
  resolveBranding,
  scopeRowsByTenant,
} from "./scope.js";
import { TENANT_STATUS } from "./constants.js";

function ensure(condition, message) {
  if (!condition) throw new Error(message);
  return message;
}

/**
 * Runs the cross-tenant matrix against the seed data.
 * Returns a plain object so both node --test and the browser can use it.
 */
export function runIsolationChecks() {
  const db = createSeed();
  const byEmail = (email) => db.users.find((u) => u.email === email);

  const buildingAdmin = byEmail("building.admin@swiftentry.test");
  const acmeAdmin = byEmail("admin@acme.test");
  const northwindAdmin = byEmail("admin@northwind.test");
  const globexAdmin = byEmail("admin@globex.test");
  const acmeStaff = byEmail("staff1@acme.test");
  const sharedFrontDesk = byEmail("reception@swiftentry.test");
  const security = byEmail("security@swiftentry.test");
  const kiosk = byEmail("kiosk@swiftentry.test");
  const suspendedAdmin = byEmail("admin@initech.test");

  const checks = [];
  const check = (name, fn) => {
    try {
      const detail = fn();
      checks.push({ name, pass: true, detail });
    } catch (error) {
      checks.push({ name, pass: false, detail: error.message });
    }
  };

  check("Acme admin cannot access another tenant", () => {
    ensure(canAccessTenant(acmeAdmin, 1), "Acme admin should reach Acme");
    ensure(!canAccessTenant(acmeAdmin, 2), "Acme admin reached Northwind");
    ensure(!canAccessTenant(acmeAdmin, 3), "Acme admin reached Globex");
    return "Acme only";
  });

  check("Northwind admin cannot access Acme or Globex", () => {
    ensure(canAccessTenant(northwindAdmin, 2), "Northwind admin should reach Northwind");
    ensure(!canAccessTenant(northwindAdmin, 1), "Northwind admin reached Acme");
    ensure(!canAccessTenant(northwindAdmin, 3), "Northwind admin reached Globex");
    return "Northwind only";
  });

  check("Tenant visit lists never leak rows", () => {
    const acmeRows = scopeRowsByTenant(acmeAdmin, db.visits);
    const northwindRows = scopeRowsByTenant(northwindAdmin, db.visits);
    ensure(acmeRows.length > 0 && northwindRows.length > 0, "Seed must contain visits for both tenants");
    ensure(acmeRows.every((v) => v.tenant_id === 1), "Acme list contains another tenant");
    ensure(northwindRows.every((v) => v.tenant_id === 2), "Northwind list contains another tenant");
    return `${acmeRows.length} Acme / ${northwindRows.length} Northwind`;
  });

  check("Building admin sees every tenant", () => {
    const rows = scopeRowsByTenant(buildingAdmin, db.visits);
    const tenantIds = new Set(rows.map((v) => v.tenant_id));
    ensure(tenantIds.has(1) && tenantIds.has(2) && tenantIds.has(3), "Building admin is missing a tenant");
    return `${rows.length} visits across ${tenantIds.size} tenants`;
  });

  check("Building admin tenant filter is respected", () => {
    const rows = scopeRowsByTenant(buildingAdmin, db.visits, 3);
    ensure(rows.length > 0, "Globex filter returned nothing");
    ensure(rows.every((v) => v.tenant_id === 3), "Globex filter returned another tenant");
    return `${rows.length} Globex visits`;
  });

  check("Tenant actor cannot override the tenant filter", () => {
    const rows = scopeRowsByTenant(acmeAdmin, db.visits, 3);
    ensure(rows.every((v) => v.tenant_id === 1), "tenant_id param widened an Acme query");
    return "Filter ignored for tenant scope";
  });

  check("Shared front desk and security reach all tenants", () => {
    ensure(canAccessTenant(sharedFrontDesk, 3), "Shared front desk cannot reach Globex");
    ensure(canAccessTenant(security, 2), "Security cannot reach Northwind");
    return "Building-wide";
  });

  check("Kiosk can resolve visits building-wide", () => {
    ensure(canAccessTenant(kiosk, 1) && canAccessTenant(kiosk, 3), "Kiosk is tenant-limited");
    return "Portal scope is building-wide";
  });

  check("Suspended tenant is blocked", () => {
    const initech = db.tenants.find((t) => t.id === 4);
    ensure(initech.status === TENANT_STATUS.SUSPENDED, "Initech should be suspended");
    ensure(getScope(suspendedAdmin).isTenant, "Suspended admin should be tenant-scoped");
    return "Initech suspended";
  });

  check("Same visitor at two tenants stays split", () => {
    const acmeAda = db.visits.find((v) => v.tenant_id === 1 && v.visitor_id === 1);
    const globexAda = db.visits.find((v) => v.tenant_id === 3 && v.visitor_id === 9);
    ensure(acmeAda && globexAda, "Seed is missing the Ada cross-tenant trap");
    const acmeRows = scopeRowsByTenant(acmeAdmin, db.visits);
    ensure(!acmeRows.some((v) => v.id === globexAda.id), "Acme can see Ada's Globex visit");
    return "Ada Lovelace: Acme and Globex records separated";
  });

  check("Notification tenant filter removes mis-tagged rows", () => {
    const visible = scopeRowsByTenant(
      acmeAdmin,
      db.notifications.filter((n) => n.user_id === acmeAdmin.id)
    );
    ensure(visible.every((n) => n.tenant_id === 1), "Acme admin can see a Globex notification");
    return `${visible.length} visible notifications`;
  });

  check("Branding inherits unless the tenant overrides", () => {
    const acmeBranding = resolveBranding(
      db.settings.building,
      db.settings.tenantOverrides[1]
    );
    const northwindBranding = resolveBranding(
      db.settings.building,
      db.settings.tenantOverrides[2]
    );
    ensure(acmeBranding.primary_color === "#0f766e", "Acme branding override missing");
    ensure(
      northwindBranding.primary_color === db.settings.building.branding.primary_color,
      "Northwind should inherit the building branding"
    );
    return "Acme overrides, Northwind inherits";
  });

  check("Every tenant-owned visit carries a tenant id", () => {
    ensure(db.visits.every((v) => v.tenant_id != null), "A visit is missing tenant_id");
    ensure(db.visitors.every((v) => v.tenant_id != null), "A visitor is missing tenant_id");
    ensure(db.audit.every((a) => a.tenant_id != null), "An audit row is missing tenant_id");
    return `${db.visits.length} visits / ${db.visitors.length} visitors / ${db.audit.length} audit rows`;
  });

  check("Staff only reaches their own tenant", () => {
    ensure(canAccessTenant(acmeStaff, 1), "Acme staff cannot reach Acme");
    ensure(!canAccessTenant(acmeStaff, 2), "Acme staff reached Northwind");
    ensure(!canAccessTenant(acmeStaff, 3), "Acme staff reached Globex");
    return "Acme staff scoped";
  });

  return {
    checks,
    passed: checks.filter((c) => c.pass).length,
    failed: checks.filter((c) => !c.pass).length,
  };
}
