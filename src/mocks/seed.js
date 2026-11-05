/**
 * Deterministic demo data for the multi-tenant prototype.
 *
 * Rules:
 *  - IDs are stable so a reset always produces the same demo.
 *  - Dates are relative to "today" so the dashboards always look alive.
 *  - Every tenant-owned row carries tenant_id.
 *  - Cross-tenant traps are intentional. Do not remove them.
 */

import {
  MOCK_PASSWORD,
  PERMISSIONS,
  SCOPES,
  TENANT_STATUS,
  USER_STATUS,
  VISIT_SOURCE,
  VISIT_STATUS,
  GATE,
  ROLE_PERMISSIONS,
  DEFAULT_BRANDING,
} from "../tenancy/constants.js";
import { toLegacyStatus } from "../tenancy/scope.js";

export const BUILDING_ID = 1;

function at(dayOffset, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function minutesAfter(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export const tenants = [
  {
    id: 1,
    building_id: BUILDING_ID,
    name: "Acme Health",
    slug: "acme-health",
    floor: "3–4",
    suite: "East Wing",
    status: TENANT_STATUS.ACTIVE,
    own_front_desk: true,
    branding: { ...DEFAULT_BRANDING, primary_color: "#0f766e", accent_color: "#14b8a6" },
    created_at: at(-220),
  },
  {
    id: 2,
    building_id: BUILDING_ID,
    name: "Northwind Legal",
    slug: "northwind-legal",
    floor: "5",
    suite: "Suite 501",
    status: TENANT_STATUS.ACTIVE,
    own_front_desk: false,
    branding: null,
    created_at: at(-180),
  },
  {
    id: 3,
    building_id: BUILDING_ID,
    name: "Globex Labs",
    slug: "globex-labs",
    floor: "6",
    suite: "Suite 610",
    status: TENANT_STATUS.ACTIVE,
    own_front_desk: false,
    branding: { ...DEFAULT_BRANDING, primary_color: "#6d28d9", accent_color: "#8b5cf6" },
    created_at: at(-140),
  },
  {
    id: 4,
    building_id: BUILDING_ID,
    name: "Initech",
    slug: "initech",
    floor: "7",
    suite: "Suite 702",
    status: TENANT_STATUS.SUSPENDED,
    own_front_desk: false,
    branding: null,
    created_at: at(-300),
  },
];

function user({
  id,
  name,
  email,
  role,
  scope,
  tenant_id = null,
  department = "",
  status = USER_STATUS.ACTIVE,
}) {
  return {
    id,
    building_id: BUILDING_ID,
    tenant_id,
    name,
    email,
    password: MOCK_PASSWORD,
    role,
    scope,
    department,
    phone: `+234 800 000 ${String(id).padStart(4, "0")}`,
    profile_picture: "",
    status,
    permissions: ROLE_PERMISSIONS[`${role}:${scope}`] ?? [],
    created_at: at(-200 + id),
  };
}

export const users = [
  user({
    id: 1,
    name: "Amara Okafor",
    email: "building.admin@swiftentry.test",
    role: "admin",
    scope: SCOPES.BUILDING,
    department: "Building Operations",
  }),
  user({
    id: 2,
    name: "Tunde Bakare",
    email: "reception@swiftentry.test",
    role: "front_desk",
    scope: SCOPES.BUILDING,
    department: "Shared Reception",
  }),
  user({
    id: 3,
    name: "Ibrahim Musa",
    email: "security@swiftentry.test",
    role: "security",
    scope: SCOPES.BUILDING,
    department: "Security",
  }),
  user({
    id: 4,
    name: "Self-Service Kiosk",
    email: "kiosk@swiftentry.test",
    role: "self_service",
    scope: SCOPES.BUILDING,
    department: "Lobby",
  }),
  user({
    id: 5,
    name: "Chiamaka Eze",
    email: "admin@acme.test",
    role: "admin",
    scope: SCOPES.TENANT,
    tenant_id: 1,
    department: "Acme People",
  }),
  user({
    id: 6,
    name: "Sarah Cole",
    email: "admin@northwind.test",
    role: "admin",
    scope: SCOPES.TENANT,
    tenant_id: 2,
    department: "Northwind Operations",
  }),
  user({
    id: 7,
    name: "Daniel Okoro",
    email: "admin@globex.test",
    role: "admin",
    scope: SCOPES.TENANT,
    tenant_id: 3,
    department: "Globex People",
  }),
  user({
    id: 8,
    name: "Blessing Adeyemi",
    email: "reception@acme.test",
    role: "front_desk",
    scope: SCOPES.TENANT,
    tenant_id: 1,
    department: "Acme Floor Reception",
  }),
  user({ id: 9, name: "Ngozi Balogun", email: "staff1@acme.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 1, department: "Clinical Operations" }),
  user({ id: 10, name: "Femi Adebayo", email: "staff2@acme.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 1, department: "Patient Services" }),
  user({ id: 11, name: "Halima Yusuf", email: "staff3@acme.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 1, department: "Finance" }),
  user({ id: 12, name: "Emeka Nwosu", email: "staff4@acme.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 1, department: "Facilities" }),
  user({ id: 13, name: "Laura Whitfield", email: "staff1@northwind.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 2, department: "Corporate" }),
  user({ id: 14, name: "James Patel", email: "staff2@northwind.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 2, department: "Litigation" }),
  user({ id: 15, name: "Aisha Bello", email: "staff3@northwind.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 2, department: "Compliance" }),
  user({ id: 16, name: "Victor Chen", email: "staff1@globex.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 3, department: "Research" }),
  user({ id: 17, name: "Priya Raman", email: "staff2@globex.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 3, department: "Lab Operations" }),
  user({ id: 18, name: "Noah Williams", email: "staff3@globex.test", role: "staff", scope: SCOPES.TENANT, tenant_id: 3, department: "Engineering" }),
  user({
    id: 19,
    name: "Marta Klein",
    email: "admin@initech.test",
    role: "admin",
    scope: SCOPES.TENANT,
    tenant_id: 4,
    department: "Initech Operations",
    status: USER_STATUS.DISABLED,
  }),
];

export const visitors = [
  { id: 1, tenant_id: 1, name: "Ada Lovelace", email: "ada@example.test", phone: "+234 801 111 0001", company: "Analytical Engines", is_vip: true, is_blacklisted: false },
  { id: 2, tenant_id: 1, name: "Grace Hopper", email: "grace@example.test", phone: "+234 801 111 0002", company: "Navy Systems", is_vip: false, is_blacklisted: false },
  { id: 3, tenant_id: 1, name: "Alan Turing", email: "alan@example.test", phone: "+234 801 111 0003", company: "Bletchley", is_vip: false, is_blacklisted: false },
  { id: 4, tenant_id: 1, name: "Katherine Johnson", email: "katherine@example.test", phone: "+234 801 111 0004", company: "Orbital Maths", is_vip: false, is_blacklisted: false },
  { id: 5, tenant_id: 1, name: "Linus Torvalds", email: "linus@example.test", phone: "+234 801 111 0005", company: "Kernel Works", is_vip: false, is_blacklisted: false },
  { id: 6, tenant_id: 1, name: "Margaret Hamilton", email: "margaret@example.test", phone: "+234 801 111 0006", company: "Apollo Software", is_vip: false, is_blacklisted: false },
  { id: 7, tenant_id: 1, name: "Dennis Ritchie", email: "dennis@example.test", phone: "+234 801 111 0007", company: "Bell Labs", is_vip: false, is_blacklisted: false },
  { id: 8, tenant_id: 1, name: "Barbara Liskov", email: "barbara@example.test", phone: "+234 801 111 0008", company: "MIT", is_vip: false, is_blacklisted: false },
  // Same person, different tenant: the privacy trap.
  { id: 9, tenant_id: 3, name: "Ada Lovelace", email: "ada@example.test", phone: "+234 801 111 0001", company: "Analytical Engines", is_vip: true, is_blacklisted: false },
  { id: 10, tenant_id: 2, name: "Grace Hopper", email: "grace@example.test", phone: "+234 801 111 0002", company: "Navy Systems", is_vip: false, is_blacklisted: false },
  { id: 11, tenant_id: 2, name: "John von Neumann", email: "john@example.test", phone: "+234 801 111 0011", company: "IAS", is_vip: false, is_blacklisted: false },
  { id: 12, tenant_id: 2, name: "Emmy Noether", email: "emmy@example.test", phone: "+234 801 111 0012", company: "Göttingen", is_vip: false, is_blacklisted: false },
  { id: 13, tenant_id: 3, name: "Nikola Tesla", email: "nikola@example.test", phone: "+234 801 111 0013", company: "Tesla Electric", is_vip: false, is_blacklisted: false },
  { id: 14, tenant_id: 3, name: "Marie Curie", email: "marie@example.test", phone: "+234 801 111 0014", company: "Radium Institute", is_vip: true, is_blacklisted: false },
  { id: 15, tenant_id: 3, name: "Richard Feynman", email: "richard@example.test", phone: "+234 801 111 0015", company: "Caltech", is_vip: false, is_blacklisted: true },
  { id: 16, tenant_id: 4, name: "Peter Gibbons", email: "peter@example.test", phone: "+234 801 111 0016", company: "Initech", is_vip: false, is_blacklisted: false },
  { id: 17, tenant_id: 1, name: "Acme Audit Team", email: "audit@acme.test", phone: "+234 801 111 0017", company: "Acme Health", is_vip: false, is_blacklisted: false },
];

function hostName(id) {
  return users.find((u) => u.id === id)?.name ?? "Unassigned host";
}

function visit({
  id,
  tenant_id,
  visitor_id,
  host_id,
  purpose,
  at: when,
  status,
  source = VISIT_SOURCE.PRE_REGISTERED,
  gate = null,
  code,
  check_in = null,
  check_out = null,
  group_size = 1,
  visitor_type = "individual",
}) {
  return {
    id,
    tenant_id,
    visitor_id,
    host_id,
    host_name: hostName(host_id),
    purpose,
    visit_time: when,
    scheduled_at: when,
    status: toLegacyStatus(status),
    visit_status: status,
    source,
    gate,
    code,
    qr_token: `signed.${id}.${tenant_id}.${new Date(when).getTime()}`,
    check_in,
    check_out,
    group_size,
    visitor_type,
    is_vip: false,
    is_blacklisted: false,
    created_at: minutesAfter(when, -60 * 24),
  };
}

export const visits = [
  visit({ id: 1001, tenant_id: 1, visitor_id: 1, host_id: 9, purpose: "Partnership meeting", at: at(0, 10, 0), status: VISIT_STATUS.REGISTERED, code: "SE-1001" }),
  visit({ id: 1002, tenant_id: 1, visitor_id: 2, host_id: 10, purpose: "Patient services review", at: at(0, 9, 0), status: VISIT_STATUS.CHECKED_IN, gate: GATE.SHARED_FRONT_DESK, code: "SE-1002", check_in: at(0, 9, 5) }),
  visit({ id: 1003, tenant_id: 1, visitor_id: 3, host_id: 9, purpose: "Clinical audit", at: at(-1, 14, 0), status: VISIT_STATUS.CHECKED_OUT, gate: GATE.SECURITY, code: "SE-1003", check_in: at(-1, 14, 5), check_out: at(-1, 15, 10) }),
  visit({ id: 1004, tenant_id: 1, visitor_id: 4, host_id: 11, purpose: "Finance interview", at: at(1, 11, 0), status: VISIT_STATUS.REGISTERED, code: "SE-1004" }),
  visit({ id: 1005, tenant_id: 1, visitor_id: 5, host_id: 12, purpose: "Facilities walkthrough", at: at(0, 8, 30), status: VISIT_STATUS.CHECKED_IN, source: VISIT_SOURCE.WALK_IN, gate: GATE.SELF_SERVICE, code: "SE-1005", check_in: at(0, 8, 35) }),
  visit({ id: 1006, tenant_id: 1, visitor_id: 6, host_id: 10, purpose: "Software review", at: at(-1, 16, 0), status: VISIT_STATUS.CANCELLED, code: "SE-1006" }),
  visit({ id: 1007, tenant_id: 1, visitor_id: 7, host_id: 11, purpose: "Vendor meeting", at: at(-3, 13, 0), status: VISIT_STATUS.MISSED, code: "SE-1007" }),
  visit({ id: 1008, tenant_id: 1, visitor_id: 8, host_id: 9, purpose: "Compliance briefing", at: at(-7, 10, 0), status: VISIT_STATUS.CHECKED_OUT, gate: GATE.TENANT_FRONT_DESK, code: "SE-1008", check_in: at(-7, 10, 4), check_out: at(-7, 11, 2) }),
  visit({ id: 1009, tenant_id: 1, visitor_id: 17, host_id: 11, purpose: "Quarterly audit", at: at(1, 15, 0), status: VISIT_STATUS.REGISTERED, code: "SE-1009", group_size: 4, visitor_type: "group" }),
  visit({ id: 1010, tenant_id: 1, visitor_id: 3, host_id: 10, purpose: "Follow-up consultation", at: at(0, 16, 0), status: VISIT_STATUS.VERIFIED, gate: GATE.SHARED_FRONT_DESK, code: "SE-1010" }),

  visit({ id: 2001, tenant_id: 2, visitor_id: 10, host_id: 13, purpose: "Contract review", at: at(-1, 11, 0), status: VISIT_STATUS.CANCELLED, code: "SE-2001" }),
  visit({ id: 2002, tenant_id: 2, visitor_id: 11, host_id: 13, purpose: "Deposition prep", at: at(0, 11, 0), status: VISIT_STATUS.VERIFIED, gate: GATE.SECURITY, code: "SE-2002" }),
  visit({ id: 2003, tenant_id: 2, visitor_id: 12, host_id: 14, purpose: "Litigation strategy", at: at(-2, 9, 30), status: VISIT_STATUS.CHECKED_OUT, gate: GATE.SHARED_FRONT_DESK, code: "SE-2003", check_in: at(-2, 9, 35), check_out: at(-2, 10, 40) }),
  visit({ id: 2004, tenant_id: 2, visitor_id: 11, host_id: 15, purpose: "Compliance filing", at: at(0, 8, 0), status: VISIT_STATUS.CHECKED_IN, source: VISIT_SOURCE.WALK_IN, gate: GATE.SELF_SERVICE, code: "SE-2004", check_in: at(0, 8, 6) }),
  visit({ id: 2005, tenant_id: 2, visitor_id: 12, host_id: 14, purpose: "Case planning", at: at(1, 9, 0), status: VISIT_STATUS.REGISTERED, code: "SE-2005" }),

  visit({ id: 3001, tenant_id: 3, visitor_id: 9, host_id: 16, purpose: "Lab partnership", at: at(1, 13, 0), status: VISIT_STATUS.REGISTERED, code: "SE-3001" }),
  visit({ id: 3002, tenant_id: 3, visitor_id: 13, host_id: 16, purpose: "Hardware demo", at: at(0, 9, 30), status: VISIT_STATUS.CHECKED_OUT, gate: GATE.SECURITY, code: "SE-3002", check_in: at(0, 9, 35), check_out: at(0, 10, 20) }),
  visit({ id: 3003, tenant_id: 3, visitor_id: 14, host_id: 17, purpose: "Sample intake", at: at(0, 10, 15), status: VISIT_STATUS.CHECKED_IN, gate: GATE.SHARED_FRONT_DESK, code: "SE-3003", check_in: at(0, 10, 20) }),
  visit({ id: 3004, tenant_id: 3, visitor_id: 15, host_id: 18, purpose: "Engineering review", at: at(-2, 15, 0), status: VISIT_STATUS.MISSED, code: "SE-3004" }),
  visit({ id: 3005, tenant_id: 3, visitor_id: 14, host_id: 17, purpose: "Safety briefing", at: at(-1, 14, 0), status: VISIT_STATUS.CANCELLED, code: "SE-3005" }),

  visit({ id: 4001, tenant_id: 4, visitor_id: 16, host_id: 19, purpose: "Legacy system handover", at: at(-10, 10, 0), status: VISIT_STATUS.CHECKED_OUT, gate: GATE.SECURITY, code: "SE-4001", check_in: at(-10, 10, 5), check_out: at(-10, 11, 15) }),
];

/** One audit row per transition, with actor, gate and tenant. */
function buildAudit() {
  const events = [];
  let seq = 1;

  const push = (visit, from, to, actorId, gate, when) => {
    const actor = users.find((u) => u.id === actorId);
    events.push({
      id: seq++,
      tenant_id: visit.tenant_id,
      visit_id: visit.id,
      actor_id: actorId,
      actor_name: actor?.name ?? "System",
      actor_role: actor?.role ?? "system",
      gate,
      from,
      to,
      at: when,
    });
  };

  for (const v of visits) {
    const registeredAt = v.created_at;
    push(v, null, VISIT_STATUS.REGISTERED, v.host_id, GATE.SYSTEM, registeredAt);

    if (v.visit_status === VISIT_STATUS.VERIFIED) {
      push(v, VISIT_STATUS.REGISTERED, VISIT_STATUS.VERIFIED, 2, v.gate ?? GATE.SHARED_FRONT_DESK, minutesAfter(registeredAt, 30));
    }
    if (v.visit_status === VISIT_STATUS.CHECKED_IN || v.visit_status === VISIT_STATUS.CHECKED_OUT) {
      push(v, VISIT_STATUS.REGISTERED, VISIT_STATUS.VERIFIED, 2, v.gate ?? GATE.SHARED_FRONT_DESK, minutesAfter(registeredAt, 30));
      push(v, VISIT_STATUS.VERIFIED, VISIT_STATUS.CHECKED_IN, v.gate === GATE.SELF_SERVICE ? 4 : 2, v.gate ?? GATE.SHARED_FRONT_DESK, v.check_in ?? minutesAfter(registeredAt, 40));
    }
    if (v.visit_status === VISIT_STATUS.CHECKED_OUT) {
      push(v, VISIT_STATUS.CHECKED_IN, VISIT_STATUS.CHECKED_OUT, 2, v.gate ?? GATE.SHARED_FRONT_DESK, v.check_out ?? minutesAfter(registeredAt, 120));
    }
    if (v.visit_status === VISIT_STATUS.CANCELLED) {
      push(v, VISIT_STATUS.REGISTERED, VISIT_STATUS.CANCELLED, v.host_id, GATE.SYSTEM, minutesAfter(registeredAt, 60));
    }
    if (v.visit_status === VISIT_STATUS.MISSED) {
      push(v, VISIT_STATUS.REGISTERED, VISIT_STATUS.MISSED, v.host_id, GATE.SYSTEM, minutesAfter(registeredAt, 180));
    }
  }

  return events;
}

export const audit = buildAudit();

export const notifications = [
  { id: 1, user_id: 9, tenant_id: 1, title: "Visitor arrived", message: "Grace Hopper has arrived at the building.", type: "visit", read: false, created_at: at(0, 9, 6) },
  { id: 2, user_id: 5, tenant_id: 1, title: "Walk-in visitor", message: "Linus Torvalds checked in at self-service.", type: "visit", read: false, created_at: at(0, 8, 36) },
  { id: 3, user_id: 13, tenant_id: 2, title: "Visitor verified", message: "John von Neumann was verified at security.", type: "visit", read: false, created_at: at(0, 11, 4) },
  { id: 4, user_id: 16, tenant_id: 3, title: "Visitor checked in", message: "Marie Curie has arrived for Globex Labs.", type: "visit", read: false, created_at: at(0, 10, 21) },
  { id: 5, user_id: 1, tenant_id: 3, title: "Tenant visitor waiting", message: "Marie Curie is waiting in the lobby for Globex Labs.", type: "alert", read: false, created_at: at(0, 10, 22) },
  { id: 6, user_id: 5, tenant_id: 1, title: "Tomorrow's guest list", message: "Katherine Johnson is expected at 11:00.", type: "reminder", read: true, created_at: at(0, 7, 30) },
  // Deliberately mis-tagged: an Acme admin must NOT see this Globex notification.
  { id: 7, user_id: 5, tenant_id: 3, title: "Globex visitor arrived", message: "This row proves the notification tenant filter works.", type: "visit", read: false, created_at: at(0, 10, 25) },
];

export const buildingSettings = {
  id: BUILDING_ID,
  name: "Swift Entry Tower",
  company_name: "Swift Entry Tower",
  primary_color: "#053561",
  timezone: "Africa/Lagos",
  language_preference: "English",
  date_format: "DD/MM/YYYY",
  time_format: "24-hour",
  visit_purposes: ["Meeting", "Interview", "Delivery", "Maintenance", "Event", "Audit"],
  buildings: ["Swift Entry Tower"],
  floors: ["3", "4", "5", "6", "7", "Lobby"],
  special_requirements: ["Wheelchair access", "Interpreter", "Escort required"],
  gate_policy: {
    shared_front_desk: true,
    security: true,
    self_service: true,
    front_desk_verifies_code: true,
    security_verifies_qr: true,
  },
  retention_days: 90,
  allow_tenant_overrides: ["branding", "own_front_desk", "visitor_email_copy", "notification_emails"],
  notification_emails: {
    visitor_arrived: true,
    visitor_checked_out: true,
    daily_summary: true,
  },
  visitor_email_copy: {
    subject: "Your visit to Swift Entry Tower",
    body: "Hello {{visitor_name}}, your visit to {{tenant_name}} is confirmed for {{visit_time}}.",
  },
  branding: { ...DEFAULT_BRANDING },
};

export const tenantOverrides = {
  1: {
    branding: { ...DEFAULT_BRANDING, primary_color: "#0f766e", accent_color: "#14b8a6" },
    own_front_desk: true,
    visitor_email_copy: {
      subject: "Your visit to Acme Health",
      body: "Hello {{visitor_name}}, Acme Health is expecting you on {{visit_time}}.",
    },
  },
  3: {
    branding: { ...DEFAULT_BRANDING, primary_color: "#6d28d9", accent_color: "#8b5cf6" },
  },
};

/** Fresh copy so callers can mutate the mock DB without touching the seed. */
export function createSeed() {
  return {
    building: {
      id: BUILDING_ID,
      name: "Swift Entry Tower",
      timezone: "Africa/Lagos",
      logo: "/pwa-512x512.png",
      floors: [...buildingSettings.floors],
      gate_policy: { ...buildingSettings.gate_policy },
      retention_days: buildingSettings.retention_days,
      created_at: at(-400),
    },
    tenants: tenants.map((t) => ({ ...t, branding: t.branding ? { ...t.branding } : null })),
    users: users.map((u) => ({ ...u, permissions: [...u.permissions] })),
    visitors: visitors.map((v) => ({ ...v })),
    visits: visits.map((v) => ({ ...v })),
    audit: audit.map((a) => ({ ...a })),
    notifications: notifications.map((n) => ({ ...n })),
    settings: {
      building: {
        ...buildingSettings,
        gate_policy: { ...buildingSettings.gate_policy },
        notification_emails: { ...buildingSettings.notification_emails },
        visitor_email_copy: { ...buildingSettings.visitor_email_copy },
        branding: { ...buildingSettings.branding },
        visit_purposes: [...buildingSettings.visit_purposes],
        buildings: [...buildingSettings.buildings],
        floors: [...buildingSettings.floors],
        special_requirements: [...buildingSettings.special_requirements],
        allow_tenant_overrides: [...buildingSettings.allow_tenant_overrides],
      },
      tenantOverrides: Object.fromEntries(
        Object.entries(tenantOverrides).map(([id, value]) => [
          id,
          {
            ...value,
            ...(value.branding ? { branding: { ...value.branding } } : {}),
            ...(value.visitor_email_copy ? { visitor_email_copy: { ...value.visitor_email_copy } } : {}),
          },
        ])
      ),
    },
  };
}

/** Demo personas for the dev switcher, in presentation order. */
export function demoPersonas() {
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    scope: u.scope,
    tenant_id: u.tenant_id,
    tenant_name: tenants.find((t) => t.id === u.tenant_id)?.name ?? "Building-wide",
    status: u.status,
    password: MOCK_PASSWORD,
  }));
}

export const TENANT_IDS = tenants.map((t) => t.id);
export const PERMISSION_LIST = Object.values(PERMISSIONS);
