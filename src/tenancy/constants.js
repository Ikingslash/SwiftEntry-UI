/**
 * Shared tenancy vocabulary.
 *
 * These values are the contract between the UI, the mock API and (later) the
 * real Laravel API. Keep them in sync with the backend enum columns.
 */

export const SCOPES = Object.freeze({
  BUILDING: "building",
  TENANT: "tenant",
});

export const ROLES = Object.freeze({
  ADMIN: "admin",
  STAFF: "staff",
  FRONT_DESK: "front_desk",
  SECURITY: "security",
  SELF_SERVICE: "self_service",
});

export const ROLE_LABELS = Object.freeze({
  admin: "Administrator",
  staff: "Staff",
  front_desk: "Front desk",
  security: "Security",
  self_service: "Self-service",
});

export const TENANT_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
});

export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  INVITED: "invited",
  DISABLED: "disabled",
});

/** Canonical visit statuses for the new approval-free flow. */
export const VISIT_STATUS = Object.freeze({
  REGISTERED: "registered",
  VERIFIED: "verified",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  MISSED: "missed",
  EXPIRED: "expired",
});

export const VISIT_STATUS_LABEL = Object.freeze({
  registered: "Registered",
  verified: "Verified",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
  missed: "Missed",
  expired: "Expired",
});

/** Legacy statuses still returned by the current backend. */
export const LEGACY_STATUS = Object.freeze({
  SCHEDULED: "scheduled",
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  MISSED: "missed",
});

export const LEGACY_TO_CANONICAL = Object.freeze({
  scheduled: VISIT_STATUS.REGISTERED,
  pending: VISIT_STATUS.REGISTERED,
  completed: VISIT_STATUS.CHECKED_OUT,
  cancelled: VISIT_STATUS.CANCELLED,
  missed: VISIT_STATUS.MISSED,
});

export const CANONICAL_TO_LEGACY = Object.freeze({
  registered: LEGACY_STATUS.SCHEDULED,
  verified: LEGACY_STATUS.SCHEDULED,
  checked_in: LEGACY_STATUS.PENDING,
  checked_out: LEGACY_STATUS.COMPLETED,
  cancelled: LEGACY_STATUS.CANCELLED,
  missed: LEGACY_STATUS.MISSED,
  expired: LEGACY_STATUS.MISSED,
});

/** Who acted at the gate. */
export const GATE = Object.freeze({
  SHARED_FRONT_DESK: "front_desk_shared",
  TENANT_FRONT_DESK: "front_desk_tenant",
  SECURITY: "security",
  SELF_SERVICE: "self_service",
  SYSTEM: "system",
});

export const VISIT_SOURCE = Object.freeze({
  PRE_REGISTERED: "pre_registered",
  WALK_IN: "walk_in",
});

export const VISIT_SOURCE_LABEL = Object.freeze({
  pre_registered: "Pre-registered",
  walk_in: "Walk-in",
});

/**
 * Permissions are intentionally coarse. A permission always implies the
 * tenant scope check; it never grants cross-tenant access on its own.
 */
export const PERMISSIONS = Object.freeze({
  BUILDING_MANAGE: "building.manage",
  BUILDING_SETTINGS: "building.settings.manage",
  TENANT_MANAGE: "tenant.manage",
  TENANT_READ_OWN: "tenant.read.own",
  TENANT_STAFF_MANAGE: "tenant.staff.manage",
  TENANT_SETTINGS: "tenant.settings.manage",
  VISITS_READ_ALL: "visits.read.all",
  VISITS_READ_OWN: "visits.read.own",
  VISITS_REGISTER: "visits.register",
  VISITS_VERIFY: "visits.verify",
  VISITS_VERIFY_QR: "visits.verify.qr",
  VISITS_CHECKIN: "visits.checkin",
  VISITS_CHECKOUT: "visits.checkout",
  VISITS_CANCEL: "visits.cancel",
  VISITS_WALKIN: "visits.walkin",
  REPORTS_ALL: "reports.all",
  REPORTS_OWN: "reports.own",
  AUDIT_READ: "audit.read",
  NOTIFICATIONS_READ: "notifications.read",
});

/** Permission bundles per role + scope. */
export const ROLE_PERMISSIONS = Object.freeze({
  "admin:building": [
    PERMISSIONS.BUILDING_MANAGE,
    PERMISSIONS.BUILDING_SETTINGS,
    PERMISSIONS.TENANT_MANAGE,
    PERMISSIONS.VISITS_READ_ALL,
    PERMISSIONS.VISITS_REGISTER,
    PERMISSIONS.VISITS_VERIFY,
    PERMISSIONS.VISITS_CHECKIN,
    PERMISSIONS.VISITS_CHECKOUT,
    PERMISSIONS.VISITS_CANCEL,
    PERMISSIONS.REPORTS_ALL,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  "admin:tenant": [
    PERMISSIONS.TENANT_READ_OWN,
    PERMISSIONS.TENANT_STAFF_MANAGE,
    PERMISSIONS.TENANT_SETTINGS,
    PERMISSIONS.VISITS_READ_OWN,
    PERMISSIONS.VISITS_REGISTER,
    PERMISSIONS.VISITS_CANCEL,
    PERMISSIONS.REPORTS_OWN,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  "staff:tenant": [
    PERMISSIONS.TENANT_READ_OWN,
    PERMISSIONS.VISITS_READ_OWN,
    PERMISSIONS.VISITS_REGISTER,
    PERMISSIONS.VISITS_CANCEL,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  "front_desk:building": [
    PERMISSIONS.VISITS_READ_ALL,
    PERMISSIONS.VISITS_VERIFY,
    PERMISSIONS.VISITS_CHECKIN,
    PERMISSIONS.VISITS_CHECKOUT,
    PERMISSIONS.VISITS_CANCEL,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  "front_desk:tenant": [
    PERMISSIONS.TENANT_READ_OWN,
    PERMISSIONS.VISITS_READ_OWN,
    PERMISSIONS.VISITS_VERIFY,
    PERMISSIONS.VISITS_CHECKIN,
    PERMISSIONS.VISITS_CHECKOUT,
    PERMISSIONS.VISITS_CANCEL,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  "security:building": [
    PERMISSIONS.VISITS_READ_ALL,
    PERMISSIONS.VISITS_VERIFY_QR,
    PERMISSIONS.VISITS_CHECKIN,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  "self_service:building": [
    PERMISSIONS.VISITS_WALKIN,
    PERMISSIONS.VISITS_READ_OWN,
  ],
});

/** Settings a tenant may override when the building allows it. */
export const OVERRIDABLE_SETTINGS = Object.freeze([
  "branding",
  "own_front_desk",
  "visitor_email_copy",
  "notification_emails",
]);

export const DEFAULT_BRANDING = Object.freeze({
  primary_color: "#053561",
  accent_color: "#1888ed",
  logo: "/pwa-512x512.png",
});

export const MOCK_PASSWORD = "Demo1234!";
