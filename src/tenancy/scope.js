/**
 * Framework-free tenancy rules.
 *
 * Every function here is deliberately pure so the same rules can run in:
 *  - the UI (route guards, list filters),
 *  - the mock API (simulated server-side enforcement),
 *  - the isolation test suite (node --test).
 */

import {
  SCOPES,
  TENANT_STATUS,
  USER_STATUS,
  LEGACY_TO_CANONICAL,
  CANONICAL_TO_LEGACY,
  ROLES,
  ROLE_PERMISSIONS,
} from "./constants.js";

export class TenantAccessError extends Error {
  constructor(message = "You do not have access to this tenant.") {
    super(message);
    this.name = "TenantAccessError";
    this.code = "TENANT_FORBIDDEN";
  }
}

export class TenantSuspendedError extends Error {
  constructor(message = "This tenant has been suspended.") {
    super(message);
    this.name = "TenantSuspendedError";
    this.code = "TENANT_SUSPENDED";
  }
}

/** Normalize the scope fields that can arrive from different API shapes. */
export function getScope(user) {
  if (!user || typeof user !== "object") {
    return {
      scope: null,
      tenantId: null,
      isBuilding: false,
      isTenant: false,
      isLegacy: true,
    };
  }

  const scope = user.scope ?? user.user_scope ?? null;
  const rawTenantId = user.tenant_id ?? user.tenantId ?? user.tenant?.id ?? null;
  const tenantId = rawTenantId == null ? null : String(rawTenantId);

  return {
    scope,
    tenantId,
    isBuilding: scope === SCOPES.BUILDING,
    isTenant: scope === SCOPES.TENANT,
    // Legacy accounts have no scope yet. They must not be silently treated
    // as building-wide; the UI keeps the old role-only behaviour for them.
    isLegacy: scope !== SCOPES.BUILDING && scope !== SCOPES.TENANT,
  };
}

export function isTenantActive(tenant) {
  return !!tenant && tenant.status === TENANT_STATUS.ACTIVE;
}

export function isUserActive(user) {
  return !!user && (user.status == null || user.status === USER_STATUS.ACTIVE);
}

/**
 * Can this user touch this tenant's data?
 * Building scope reaches every tenant; tenant scope reaches only its own.
 */
export function canAccessTenant(user, tenantId) {
  const { scope, tenantId: ownTenantId, isLegacy } = getScope(user);

  if (scope === SCOPES.BUILDING) return true;

  if (scope === SCOPES.TENANT) {
    if (ownTenantId == null || tenantId == null) return false;
    return String(ownTenantId) === String(tenantId);
  }

  // Legacy accounts: only a building-level admin may cross tenants. Everyone
  // else stays scoped to whatever single tenant the account exposes.
  if (isLegacy) {
    if (user?.role === ROLES.ADMIN && ownTenantId == null) return true;
    if (ownTenantId != null && tenantId != null) {
      return String(ownTenantId) === String(tenantId);
    }
  }

  return false;
}

/** Throws the correct error instead of returning a boolean. */
export function assertTenantAccess(user, tenantId) {
  if (!canAccessTenant(user, tenantId)) {
    throw new TenantAccessError();
  }
  return true;
}

/**
 * Filter rows that carry a tenant_id.
 * Building admins see all rows unless a tenant filter is active.
 */
export function scopeRowsByTenant(user, rows, requestedTenantId = null) {
  const list = Array.isArray(rows) ? rows : [];
  const { scope, tenantId: ownTenantId, isLegacy } = getScope(user);

  if (scope === SCOPES.BUILDING) {
    if (requestedTenantId == null || requestedTenantId === "") return list;
    return list.filter((row) => String(row.tenant_id) === String(requestedTenantId));
  }

  if (scope === SCOPES.TENANT) {
    if (ownTenantId == null) return [];
    return list.filter((row) => String(row.tenant_id) === ownTenantId);
  }

  if (isLegacy) {
    if (ownTenantId == null) return user?.role === ROLES.ADMIN ? list : [];
    return list.filter((row) => String(row.tenant_id) === ownTenantId);
  }

  return [];
}

/** Add the tenant filter to a request payload, never as an identity claim. */
export function withTenantFilter(params, user, viewingTenantId = null) {
  const next = { ...(params || {}) };
  const { scope, tenantId, isBuilding } = getScope(user);

  if (isBuilding) {
    if (viewingTenantId != null && viewingTenantId !== "") {
      next.tenant_id = viewingTenantId;
    }
    return next;
  }

  if (scope === SCOPES.TENANT && tenantId != null) {
    // The server must ignore this and use the token. Sending it keeps legacy
    // read endpoints honest while the backend catches up.
    next.tenant_id = tenantId;
  }

  return next;
}

/** Building default, then tenant override when allowed. */
export function resolveSetting({
  key,
  buildingSettings,
  tenantOverrides,
  allowOverride = true,
}) {
  const buildingValue = buildingSettings?.[key];
  const hasOverride =
    allowOverride &&
    tenantOverrides != null &&
    Object.prototype.hasOwnProperty.call(tenantOverrides, key);

  return {
    value: hasOverride ? tenantOverrides[key] : buildingValue,
    source: hasOverride ? "tenant_override" : "building_default",
    canOverride: allowOverride,
  };
}

export function resolveBranding(buildingSettings, tenantOverrides, allowOverride = true) {
  const base = buildingSettings?.branding ?? {};
  const override = allowOverride ? tenantOverrides?.branding ?? {} : {};
  return { ...base, ...override };
}

export function toCanonicalStatus(status) {
  if (!status) return null;
  return LEGACY_TO_CANONICAL[status] ?? status;
}

export function toLegacyStatus(status) {
  if (!status) return null;
  return CANONICAL_TO_LEGACY[status] ?? status;
}

export function permissionsFor(role, scope) {
  return ROLE_PERMISSIONS[`${role}:${scope}`] ?? [];
}

export function can(user, permission) {
  if (!user || !permission) return false;
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }
  return permissionsFor(user.role, user.scope).includes(permission);
}

/** Where a user should land after login. */
export function dashboardFor(user) {
  const role = user?.role;
  const { isTenant } = getScope(user);

  if (role === ROLES.ADMIN) {
    return isTenant ? "/tenant-dashboard" : "/admin-dashboard";
  }
  if (role === ROLES.STAFF) return "/staff-dashboard";
  if (role === ROLES.FRONT_DESK) return "/front-desk-dashboard";
  if (role === ROLES.SECURITY) return "/security-dashboard";
  if (role === ROLES.SELF_SERVICE) return "/visitor-dashboard";
  return "/";
}

/** A tenant user must always carry a tenant id. */
export function isValidUserScope(user) {
  const { scope, tenantId } = getScope(user);
  if (scope === SCOPES.TENANT) return tenantId != null;
  if (scope === SCOPES.BUILDING) return true;
  return true; // legacy accounts are validated by the old role rules
}
