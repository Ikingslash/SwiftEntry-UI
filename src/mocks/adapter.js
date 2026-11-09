/**
 * Axios adapter that simulates the Laravel API.
 *
 * It is not a toy fallback: it enforces the same tenant rules the real server
 * must enforce, so the UI cannot accidentally "work" only because the mock is
 * permissive.
 */

import { getDb, nextId, saveDb } from "./db.js";
import {
  GATE,
  SCOPES,
  TENANT_STATUS,
  USER_STATUS,
  VISIT_SOURCE,
  VISIT_STATUS,
} from "../tenancy/constants.js";
import {
  assertTenantAccess,
  canAccessTenant,
  permissionsFor,
  scopeRowsByTenant,
  toCanonicalStatus,
  toLegacyStatus,
} from "../tenancy/scope.js";

const TRANSPORT_DELAY_MS = 60;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(status, message, code) {
  const error = new Error(message);
  error.isAxiosError = true;
  error.response = {
    status,
    statusText: message,
    data: { message, error: message, code },
    headers: {},
  };
  return error;
}

function headerValue(config, name) {
  const headers = config?.headers;
  if (!headers) return undefined;
  if (typeof headers.get === "function") {
    return headers.get(name) ?? headers.get(name.toLowerCase());
  }
  return headers[name] ?? headers[name.toLowerCase()];
}

function normalizePath(config) {
  let url = String(config?.url ?? "");
  const base = String(config?.baseURL ?? "");
  if (base && url.startsWith(base)) url = url.slice(base.length);
  url = url.replace(/^https?:\/\/[^/]+/i, "");
  url = url.split("?")[0];
  if (!url.startsWith("/")) url = `/${url}`;
  url = url.replace(/^\/api(?=\/|$)/, "");
  return url || "/";
}

function queryParams(config) {
  const params = { ...(config?.params ?? {}) };
  const raw = String(config?.url ?? "");
  const qs = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : "";
  if (qs) {
    new URLSearchParams(qs).forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
}

function bodyOf(config) {
  const data = config?.data;
  if (data == null) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      try {
        return Object.fromEntries(new URLSearchParams(data));
      } catch {
        return {};
      }
    }
  }
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const result = {};
    for (const [key, value] of data.entries()) {
      result[key] = typeof value === "string" ? value : value?.name;
    }
    return result;
  }
  return data;
}

function currentUser(config) {
  const auth = String(headerValue(config, "Authorization") ?? "");
  const token = auth.replace(/^Bearer\s+/i, "");
  const match = /^mock-token-(\d+)$/.exec(token);
  if (!match) throw fail(401, "Unauthenticated.", "UNAUTHENTICATED");

  const db = getDb();
  const user = db.users.find((u) => u.id === Number(match[1]));
  if (!user) throw fail(401, "Unauthenticated.", "UNAUTHENTICATED");
  if (user.status !== USER_STATUS.ACTIVE) {
    throw fail(403, "This account has been disabled.", "ACCOUNT_DISABLED");
  }
  if (user.scope === SCOPES.TENANT) {
    const tenant = db.tenants.find((t) => t.id === user.tenant_id);
    if (!tenant) throw fail(403, "Tenant not found.", "TENANT_FORBIDDEN");
    if (tenant.status !== TENANT_STATUS.ACTIVE) {
      throw fail(403, "This tenant has been suspended.", "TENANT_SUSPENDED");
    }
  }
  return user;
}

function publicUser(user) {
  const db = getDb();
  const safe = { ...user };
  delete safe.password;
  const tenant = user.tenant_id
    ? db.tenants.find((t) => t.id === user.tenant_id) ?? null
    : null;
  return {
    ...safe,
    tenant: tenant ? { ...tenant, branding: tenant.branding ?? db.settings.building.branding } : null,
    building: { ...db.building },
  };
}

function sessionFor(user) {
  const db = getDb();
  const tenant = user.tenant_id ? db.tenants.find((t) => t.id === user.tenant_id) : null;
  return {
    token: `mock-token-${user.id}`,
    user: publicUser(user),
    tenant: tenant ? { ...tenant } : null,
    building: { ...db.building },
  };
}

function tenantById(id) {
  return getDb().tenants.find((t) => t.id === Number(id)) ?? null;
}

/**
 * Login must reject disabled users and suspended tenants *before* issuing a
 * token. Otherwise the client only finds out on the next request.
 */
function assertLoginAllowed(user) {
  if (user.status !== USER_STATUS.ACTIVE) {
    throw fail(403, "This account has been disabled.", "ACCOUNT_DISABLED");
  }
  if (user.scope === SCOPES.TENANT) {
    const tenant = tenantById(user.tenant_id);
    if (!tenant) throw fail(403, "Tenant not found.", "TENANT_FORBIDDEN");
    if (tenant.status !== TENANT_STATUS.ACTIVE) {
      throw fail(403, "This tenant has been suspended.", "TENANT_SUSPENDED");
    }
  }
}

function tenantSummary(tenant) {
  const db = getDb();
  const tenantUsers = db.users.filter((u) => u.tenant_id === tenant.id);
  const tenantVisits = db.visits.filter((v) => v.tenant_id === tenant.id);
  const today = tenantVisits.filter((v) => isToday(v.visit_time));
  return {
    ...tenant,
    branding: tenant.branding ?? db.settings.building.branding,
    user_count: tenantUsers.filter((u) => u.status === USER_STATUS.ACTIVE).length,
    staff_count: tenantUsers.filter((u) => u.role === "staff").length,
    visit_count: tenantVisits.length,
    today_visits: today.length,
    active_visits: tenantVisits.filter((v) => v.visit_status === VISIT_STATUS.CHECKED_IN).length,
  };
}

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function hydrateVisit(visit) {
  const db = getDb();
  const visitor = db.visitors.find((v) => v.id === visit.visitor_id) ?? null;
  const tenant = db.tenants.find((t) => t.id === visit.tenant_id) ?? null;
  const host = db.users.find((u) => u.id === visit.host_id) ?? null;
  return {
    ...visit,
    visitor,
    host: host
      ? { id: host.id, name: host.name, email: host.email, department: host.department }
      : null,
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          floor: tenant.floor,
          status: tenant.status,
          branding: tenant.branding ?? db.settings.building.branding,
        }
      : null,
    tenant_name: tenant?.name ?? "Unknown tenant",
  };
}

function sortVisits(rows) {
  return [...rows].sort((a, b) => new Date(b.visit_time) - new Date(a.visit_time));
}

function bucketVisits(rows, bucket) {
  if (!bucket) return rows;
  switch (bucket) {
    case "today":
      return rows.filter((v) => isToday(v.visit_time));
    case "upcoming":
    case "scheduled":
      return rows.filter(
        (v) =>
          new Date(v.visit_time) >= new Date(new Date().setHours(0, 0, 0, 0)) &&
          [VISIT_STATUS.REGISTERED, VISIT_STATUS.VERIFIED].includes(v.visit_status)
      );
    case "pending":
      return rows.filter((v) => v.visit_status === VISIT_STATUS.REGISTERED);
    case "confirmed":
      return rows.filter((v) => v.visit_status === VISIT_STATUS.VERIFIED);
    case "incoming":
      return rows.filter((v) => v.visit_status === VISIT_STATUS.CHECKED_IN);
    case "outgoing":
    case "completed":
      return rows.filter((v) => v.visit_status === VISIT_STATUS.CHECKED_OUT);
    case "cancelled":
      return rows.filter((v) => v.visit_status === VISIT_STATUS.CANCELLED);
    case "missed":
      return rows.filter((v) => v.visit_status === VISIT_STATUS.MISSED);
    case "all":
      return rows;
    default:
      return rows;
  }
}

function filterVisits(actor, params = {}, bucket = null) {
  const db = getDb();
  let rows = db.visits;

  // Server-side tenant scoping. Tenant actors cannot widen it with params.
  rows = scopeRowsByTenant(actor, rows, params.tenant_id);

  if (bucket) rows = bucketVisits(rows, bucket);
  if (params.scope) rows = bucketVisits(rows, String(params.scope));
  if (params.status) {
    const wanted = toCanonicalStatus(String(params.status));
    rows = rows.filter((v) => v.visit_status === wanted);
  }
  if (params.visit_status) {
    const wanted = toCanonicalStatus(String(params.visit_status));
    rows = rows.filter((v) => v.visit_status === wanted);
  }
  if (params.source) {
    rows = rows.filter((v) => v.source === params.source);
  }
  if (params.host_id) {
    rows = rows.filter((v) => String(v.host_id) === String(params.host_id));
  }
  if (params.visitor_type && params.visitor_type !== "all") {
    rows = rows.filter((v) => v.visitor_type === params.visitor_type);
  }
  if (params.visitor_id) {
    rows = rows.filter((v) => String(v.visitor_id) === String(params.visitor_id));
  }
  if (params.search) {
    const q = String(params.search).trim().toLowerCase();
    if (q) {
      rows = rows.filter((v) => {
        const visitor = db.visitors.find((x) => x.id === v.visitor_id);
        return (
          String(v.code).toLowerCase().includes(q) ||
          String(v.host_name).toLowerCase().includes(q) ||
          String(visitor?.name ?? "").toLowerCase().includes(q) ||
          String(visitor?.email ?? "").toLowerCase().includes(q)
        );
      });
    }
  }

  return sortVisits(rows).map(hydrateVisit);
}

function paginate(rows, params = {}) {
  const perPage = Math.max(1, Number(params.per_page ?? params.limit ?? 10) || 10);
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const start = (page - 1) * perPage;
  const data = rows.slice(start, start + perPage);
  return {
    data,
    pagination: {
      current_page: page,
      last_page: Math.max(1, Math.ceil(rows.length / perPage)),
      per_page: perPage,
      total: rows.length,
    },
  };
}

function visitListPayload(actor, params = {}, bucket = null) {
  const rows = filterVisits(actor, params, bucket);
  const paged = paginate(rows, params);
  return {
    visits: paged.data,
    data: paged.data,
    pagination: paged.pagination,
    total: rows.length,
  };
}

function findVisit(actor, id, { allowPortal = false } = {}) {
  const db = getDb();
  const visit = db.visits.find((v) => String(v.id) === String(id));
  if (!visit) throw fail(404, "Visit not found.", "VISIT_NOT_FOUND");
  if (allowPortal && actor.role === "self_service") return visit;
  assertTenantAccess(actor, visit.tenant_id);
  return visit;
}

function gateFor(actor, requested) {
  if (requested) return requested;
  if (actor.role === "security") return GATE.SECURITY;
  if (actor.role === "self_service") return GATE.SELF_SERVICE;
  if (actor.role === "front_desk") {
    return actor.scope === SCOPES.BUILDING
      ? GATE.SHARED_FRONT_DESK
      : GATE.TENANT_FRONT_DESK;
  }
  return GATE.SYSTEM;
}

const ALLOWED_TRANSITIONS = {
  [VISIT_STATUS.REGISTERED]: [
    VISIT_STATUS.VERIFIED,
    VISIT_STATUS.CHECKED_IN,
    VISIT_STATUS.CANCELLED,
    VISIT_STATUS.MISSED,
    VISIT_STATUS.EXPIRED,
  ],
  [VISIT_STATUS.VERIFIED]: [
    VISIT_STATUS.CHECKED_IN,
    VISIT_STATUS.CANCELLED,
    VISIT_STATUS.MISSED,
    VISIT_STATUS.EXPIRED,
  ],
  [VISIT_STATUS.CHECKED_IN]: [VISIT_STATUS.CHECKED_OUT, VISIT_STATUS.CANCELLED],
  [VISIT_STATUS.CHECKED_OUT]: [],
  [VISIT_STATUS.CANCELLED]: [],
  [VISIT_STATUS.MISSED]: [],
  [VISIT_STATUS.EXPIRED]: [],
};

function pushNotification(visit, title, message) {
  const db = getDb();
  db.notifications.unshift({
    id: nextId(db.notifications),
    user_id: visit.host_id,
    tenant_id: visit.tenant_id,
    title,
    message,
    type: "visit",
    read: false,
    created_at: new Date().toISOString(),
  });
}

function transition(visit, to, actor, gate) {
  const from = visit.visit_status;
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw fail(409, `Cannot move a ${from} visit to ${to}.`, "INVALID_TRANSITION");
  }

  const db = getDb();
  const at = new Date().toISOString();
  visit.visit_status = to;
  visit.status = toLegacyStatus(to);

  if (to === VISIT_STATUS.CHECKED_IN) visit.check_in = at;
  if (to === VISIT_STATUS.CHECKED_OUT) visit.check_out = at;

  db.audit.push({
    id: nextId(db.audit),
    tenant_id: visit.tenant_id,
    visit_id: visit.id,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    gate,
    from,
    to,
    at,
  });

  if (to === VISIT_STATUS.CHECKED_IN) {
    const visitor = db.visitors.find((v) => v.id === visit.visitor_id);
    pushNotification(
      visit,
      "Visitor arrived",
      `${visitor?.name ?? "Your visitor"} has arrived at the building.`
    );
  }

  return hydrateVisit(visit);
}

function resolveWriteTenant(actor, body, host) {
  if (actor.scope === SCOPES.TENANT) return actor.tenant_id;
  if (body.tenant_id != null && body.tenant_id !== "") return Number(body.tenant_id);
  if (host?.tenant_id != null) return host.tenant_id;
  const active = getDb().tenants.find((t) => t.status === TENANT_STATUS.ACTIVE);
  return active?.id ?? null;
}

function upsertVisitor(tenantId, body) {
  const db = getDb();
  const name = String(body.name ?? body.group_leader_name ?? "Unknown visitor").trim();
  const email = String(body.email ?? body.group_leader_email ?? "").trim().toLowerCase();
  const phone = String(body.contact_number ?? body.group_leader_contact ?? "").trim();

  let visitor = db.visitors.find(
    (v) =>
      v.tenant_id === tenantId &&
      (email ? v.email === email : v.name.toLowerCase() === name.toLowerCase())
  );

  if (!visitor) {
    visitor = {
      id: nextId(db.visitors),
      tenant_id: tenantId,
      name,
      email,
      phone,
      company: body.organization_name ?? body.company ?? "",
      is_vip: false,
      is_blacklisted: false,
      created_at: new Date().toISOString(),
    };
    db.visitors.push(visitor);
  }

  return visitor;
}

function createVisit(actor, body, { source, gate, status, group = false }) {
  const db = getDb();
  const host = body.host_id
    ? db.users.find((u) => u.id === Number(body.host_id))
    : actor.role === "staff"
      ? actor
      : null;

  const tenantId = resolveWriteTenant(actor, body, host);
  if (tenantId == null) throw fail(422, "A tenant is required.", "TENANT_REQUIRED");
  assertTenantAccess(actor, tenantId);

  const tenant = tenantById(tenantId);
  if (!tenant || tenant.status !== TENANT_STATUS.ACTIVE) {
    throw fail(403, "This tenant is not active.", "TENANT_SUSPENDED");
  }
  if (host && Number(host.tenant_id) !== Number(tenantId)) {
    throw fail(422, "The host does not belong to this tenant.", "HOST_TENANT_MISMATCH");
  }

  const visitor = upsertVisitor(tenantId, body);
  const id = nextId(db.visits);
  const visit = {
    id,
    tenant_id: tenantId,
    visitor_id: visitor.id,
    host_id: host?.id ?? null,
    host_name: host?.name ?? "Unassigned host",
    purpose: body.purpose ?? "Visit",
    visit_time: body.visit_time ?? new Date().toISOString(),
    scheduled_at: body.visit_time ?? new Date().toISOString(),
    status: toLegacyStatus(status),
    visit_status: status,
    source,
    gate,
    code: `SE-${1000 + id}`,
    qr_token: `signed.${id}.${tenantId}.${Date.now()}`,
    check_in: null,
    check_out: null,
    group_size: group ? Number(body.group_size ?? 1) : 1,
    visitor_type: group ? "group" : "individual",
    is_vip: false,
    is_blacklisted: false,
    created_at: new Date().toISOString(),
  };
  db.visits.push(visit);

  db.audit.push({
    id: nextId(db.audit),
    tenant_id: tenantId,
    visit_id: visit.id,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    gate: GATE.SYSTEM,
    from: null,
    to: VISIT_STATUS.REGISTERED,
    at: new Date().toISOString(),
  });

  // No approval step: registering a visit notifies the host immediately.
  pushNotification(
    visit,
    "New visitor registered",
    `${visitor.name} has been registered for ${tenant.name}.`
  );

  return visit;
}

function effectiveSettings(actor) {
  const db = getDb();
  const building = db.settings.building;
  const allow = building.allow_tenant_overrides ?? [];

  if (actor.scope !== SCOPES.TENANT) {
    return {
      building,
      effective: building,
      tenant_override: null,
      overridable_keys: allow,
      tenants: db.tenants.map(tenantSummary),
    };
  }

  const raw = db.settings.tenantOverrides[actor.tenant_id] ?? {};
  const override = {};
  for (const key of allow) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) override[key] = raw[key];
  }

  const effective = { ...building, ...override };
  effective.branding = {
    ...(building.branding ?? {}),
    ...(override.branding ?? {}),
  };

  return {
    building,
    effective,
    tenant_override: override,
    overridable_keys: allow,
    tenant: tenantSummary(tenantById(actor.tenant_id)),
  };
}

/** Local calendar date (yyyy-mm-dd). toISOString() would shift to UTC. */
function localDay(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDuration(minutes) {
  if (!minutes) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

const truthy = (v) => v === true || v === "true" || v === "1" || v === 1;

/**
 * Period windows for the analytics screen.
 *  - daily:   cards = today,        chart = last 7 days
 *  - weekly:  cards = last 7 days,  chart = last 8 weeks
 *  - monthly: cards = last 30 days, chart = last 6 months
 */
function analyticsWindow(period) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const buckets = [];
  let since;

  if (period === "monthly") {
    since = new Date(today);
    since.setDate(since.getDate() - 29);
    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      buckets.push({ start, end });
    }
  } else if (period === "weekly") {
    since = new Date(today);
    since.setDate(since.getDate() - 6);
    for (let i = 7; i >= 0; i -= 1) {
      const end = new Date(tomorrow);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      buckets.push({ start, end });
    }
  } else {
    since = today;
    for (let i = 6; i >= 0; i -= 1) {
      const start = new Date(today);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      buckets.push({ start, end });
    }
  }

  return { since, until: tomorrow, buckets };
}

/** VIP / blacklist / walk-in / pre-registered toggles. Several = any match. */
function applyVisitorTypeFilters(rows, params) {
  const wanted = [];
  if (truthy(params.vip)) wanted.push((v) => v.is_vip || v.visitor?.is_vip);
  if (truthy(params.blacklist)) wanted.push((v) => v.is_blacklisted || v.visitor?.is_blacklisted);
  if (truthy(params.walkins)) wanted.push((v) => v.source === VISIT_SOURCE.WALK_IN);
  if (truthy(params.preregistered)) wanted.push((v) => v.source === VISIT_SOURCE.PRE_REGISTERED);
  if (wanted.length === 0) return rows;
  return rows.filter((v) => wanted.some((test) => test(v)));
}

function analyticsRows(actor, params) {
  // Only the tenant filter is forwarded; analytics options are not visit filters.
  const scoped = filterVisits(actor, { tenant_id: params.tenant_id });
  return applyVisitorTypeFilters(scoped, params);
}

function analytics(actor, params) {
  const period = ["daily", "weekly", "monthly"].includes(params.filter) ? params.filter : "daily";
  const { since, until, buckets } = analyticsWindow(period);
  const allRows = analyticsRows(actor, params);

  const inRange = (v, from, to) => {
    const t = new Date(v.visit_time);
    return t >= from && t < to;
  };

  // Cards and breakdowns cover the selected period.
  const rows = allRows.filter((v) => inRange(v, since, until));
  const checkedIn = rows.filter((v) => v.visit_status === VISIT_STATUS.CHECKED_IN);
  const checkedOut = rows.filter((v) => v.visit_status === VISIT_STATUS.CHECKED_OUT);
  const pending = rows.filter((v) =>
    [VISIT_STATUS.REGISTERED, VISIT_STATUS.VERIFIED].includes(v.visit_status)
  );

  // The trend chart looks further back than the cards.
  // Buckets stop at the end of today so future bookings don't inflate them.
  const chart = buckets.map(({ start, end }) => ({
    date: localDay(start),
    visitors_count: allRows.filter((v) => inRange(v, start, end < until ? end : until)).length,
  }));

  const completed = rows.filter(
    (v) => v.visit_status === VISIT_STATUS.CHECKED_OUT && v.check_in && v.check_out
  );
  const avg =
    completed.length > 0
      ? Math.round(
          completed.reduce(
            (sum, v) => sum + (new Date(v.check_out) - new Date(v.check_in)) / 60000,
            0
          ) / completed.length
        )
      : 0;

  const typeCounts = {};
  rows.forEach((v) => {
    const type =
      v.visitor_type === "group"
        ? "Group"
        : v.is_vip || v.visitor?.is_vip
          ? "VIP"
          : v.source === VISIT_SOURCE.WALK_IN
            ? "Walk-in"
            : "Pre-registered";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const visitor_types = Object.entries(typeCounts).map(([visitor_type, count]) => ({ visitor_type, count }));

  const purposeCounts = {};
  rows.forEach((v) => {
    const purpose = v.purpose || "Official Visit";
    purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
  });
  const purpose_of_visit = Object.entries(purposeCounts)
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count);

  const hourCounts = {};
  for (let h = 8; h <= 18; h++) hourCounts[h] = 0;
  rows.forEach((v) => {
    if (v.visit_time) {
      const hour = new Date(v.visit_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  const peak_visitor_hours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  const staffCounts = {};
  rows.forEach((v) => {
    if (v.host_name) staffCounts[v.host_name] = (staffCounts[v.host_name] || 0) + 1;
  });
  const most_visited_staff = Object.entries(staffCounts)
    .map(([name, visits_count]) => ({ name, visits_count }))
    .sort((a, b) => b.visits_count - a.visits_count)
    .slice(0, 5);

  const visitorMap = {};
  rows.forEach((v) => {
    const name = v.visitor?.name || v.visitor_name || "Guest";
    if (!visitorMap[name]) {
      visitorMap[name] = {
        visitor_name: name,
        visitor_photo: v.visitor?.profile_picture || null,
        last_visit: v.visit_time ? new Date(v.visit_time).toLocaleDateString() : "Recent",
        count: 0,
      };
    }
    visitorMap[name].count += 1;
  });
  const most_frequent_visitors = Object.values(visitorMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    period,
    // Field names kept for the legacy page; values follow the selected period.
    total_visitors_today: rows.length,
    checked_in_today: checkedIn.length,
    checked_out_today: checkedOut.length,
    pending_today: pending.length,
    avg_visit_duration_minutes: avg,
    avg_visit_duration: formatDuration(avg),
    visits_chart_data: chart,
    total_visits: allRows.length,
    visitor_types,
    purpose_of_visit,
    peak_visitor_hours,
    most_visited_staff,
    most_frequent_visitors,
  };
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** The mock can only produce CSV; it says so through the content-type. */
function analyticsExport(actor, params) {
  const period = ["daily", "weekly", "monthly"].includes(params.filter) ? params.filter : "daily";
  const { since, until } = analyticsWindow(period);
  const rows = analyticsRows(actor, params).filter((v) => {
    const t = new Date(v.visit_time);
    return t >= since && t < until;
  });
  const header = ["Code", "Tenant", "Visitor", "Host", "Purpose", "Visit time", "Status", "Source", "Checked in", "Checked out"];
  const lines = rows.map((v) =>
    [v.code, v.tenant_name, v.visitor?.name, v.host_name, v.purpose, v.visit_time, v.visit_status, v.source, v.check_in, v.check_out]
      .map(csvCell)
      .join(",")
  );
  return {
    data: [header.join(","), ...lines].join("\n"),
    headers: { "content-type": "text/csv" },
  };
}

function notificationsFor(actor, params = {}) {
  const db = getDb();
  let rows = db.notifications.filter((n) => n.user_id === actor.id);
  rows = scopeRowsByTenant(actor, rows, params.tenant_id);
  return [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/** Same shape as the Laravel notification index: rows + pagination. */
function notificationPage(actor, params = {}) {
  const paged = paginate(notificationsFor(actor, params), params);
  return {
    notifications: paged.data,
    pagination: paged.pagination,
    message: paged.data.length ? "Notifications fetched successfully." : "No Notifications Yet",
  };
}

function route(method, pattern, handler, options = {}) {
  return { method, pattern, handler, ...options };
}

const routes = [
  // ---- auth ----
  route("post", /^\/sanctum\/csrf-cookie$/, () => ({ status: 204, data: null }), { public: true }),
  route(
    "post",
    /^\/auth\/login$/,
    ({ body }) => {
      const db = getDb();
      const email = String(body.email ?? "").trim().toLowerCase();
      const user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user || user.password !== body.password) {
        throw fail(422, "Invalid email or password.", "INVALID_CREDENTIALS");
      }
      assertLoginAllowed(user);
      return { data: sessionFor(user) };
    },
    { public: true }
  ),
  route(
    "post",
    /^\/auth\/demo-login$/,
    ({ body }) => {
      const db = getDb();
      const email = String(body.email ?? "").trim().toLowerCase();
      const user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user) throw fail(404, "Demo user not found.", "USER_NOT_FOUND");
      assertLoginAllowed(user);
      return { data: sessionFor(user) };
    },
    { public: true }
  ),
  route("get", /^\/me$/, ({ user }) => ({ data: publicUser(user) })),
  route(
    "post",
    /^\/(admin|staff|front-desk|security|self-service)\/(?:auth\/)?login$/,
    ({ body, match }) => {
      const prefix = match[1];
      const role =
        prefix === "front-desk"
          ? "front_desk"
          : prefix === "self-service"
            ? "self_service"
            : prefix;
      const db = getDb();
      const email = String(body.email ?? "").trim().toLowerCase();
      const user = db.users.find(
        (u) => u.email.toLowerCase() === email && u.role === role
      );
      if (!user || user.password !== body.password) {
        throw fail(422, "Invalid email or password.", "INVALID_CREDENTIALS");
      }
      assertLoginAllowed(user);
      return { data: sessionFor(user) };
    },
    { public: true }
  ),

  // ---- profile (legacy endpoints) ----
  route("get", /^\/(admin\/profile|staff\/profile|security\/user-profile|front-desk\/profile|self-service\/profile)$/, ({ user }) => ({
    data: { user: publicUser(user), ...publicUser(user) },
  })),

  // ---- tenants ----
  route("get", /^\/tenants$/, ({ user }) => {
    const db = getDb();
    if (user.scope === SCOPES.BUILDING) {
      return { data: { tenants: db.tenants.map(tenantSummary), data: db.tenants.map(tenantSummary) } };
    }
    const own = tenantById(user.tenant_id);
    return { data: { tenants: own ? [tenantSummary(own)] : [], data: own ? [tenantSummary(own)] : [] } };
  }),
  route("get", /^\/tenants\/(\d+)$/, ({ user, match }) => {
    assertTenantAccess(user, match[1]);
    const tenant = tenantById(match[1]);
    if (!tenant) throw fail(404, "Tenant not found.", "TENANT_NOT_FOUND");
    return { data: { tenant: tenantSummary(tenant) } };
  }),
  route("post", /^\/tenants$/, ({ user, body }) => {
    if (user.scope !== SCOPES.BUILDING) throw fail(403, "Only the building admin can create tenants.", "TENANT_FORBIDDEN");
    const db = getDb();
    const tenant = {
      id: nextId(db.tenants),
      building_id: db.building.id,
      name: String(body.name ?? "New tenant").trim(),
      slug: String(body.name ?? "new-tenant").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      floor: body.floor ?? "",
      suite: body.suite ?? "",
      status: TENANT_STATUS.ACTIVE,
      own_front_desk: Boolean(body.own_front_desk),
      branding: body.branding ?? null,
      created_at: new Date().toISOString(),
    };
    db.tenants.push(tenant);
    return { status: 201, data: { tenant: tenantSummary(tenant) } };
  }),
  route("patch", /^\/tenants\/(\d+)$/, ({ user, match, body }) => {
    assertTenantAccess(user, match[1]);
    const tenant = tenantById(match[1]);
    if (!tenant) throw fail(404, "Tenant not found.", "TENANT_NOT_FOUND");
    if (user.scope === SCOPES.TENANT) {
      const allowed = ["branding", "own_front_desk", "visitor_email_copy"];
      for (const key of Object.keys(body)) {
        if (allowed.includes(key)) tenant[key] = body[key];
      }
    } else {
      Object.assign(tenant, body);
    }
    return { data: { tenant: tenantSummary(tenant) } };
  }),
  route("post", /^\/tenants\/(\d+)\/(suspend|activate)$/, ({ user, match }) => {
    if (user.scope !== SCOPES.BUILDING) throw fail(403, "Only the building admin can change tenant status.", "TENANT_FORBIDDEN");
    const tenant = tenantById(match[1]);
    if (!tenant) throw fail(404, "Tenant not found.", "TENANT_NOT_FOUND");
    tenant.status = match[2] === "suspend" ? TENANT_STATUS.SUSPENDED : TENANT_STATUS.ACTIVE;
    return { data: { tenant: tenantSummary(tenant) } };
  }),
  route("delete", /^\/tenants\/(\d+)$/, ({ user, match }) => {
    if (user.scope !== SCOPES.BUILDING) throw fail(403, "Only the building admin can delete tenants.", "TENANT_FORBIDDEN");
    const db = getDb();
    const id = Number(match[1]);
    const tenant = tenantById(id);
    if (!tenant) throw fail(404, "Tenant not found.", "TENANT_NOT_FOUND");
    const summary = tenantSummary(tenant);
    // Hard delete: the tenant and every row it owns.
    db.tenants = db.tenants.filter((t) => t.id !== id);
    for (const key of ["users", "visitors", "visits", "audit", "notifications"]) {
      if (Array.isArray(db[key])) db[key] = db[key].filter((row) => Number(row.tenant_id) !== id);
    }
    if (db.settings?.tenantOverrides) delete db.settings.tenantOverrides[id];
    return { data: { tenant: summary, deleted: true } };
  }),

  // ---- users ----
  route("get", /^\/users$/, ({ user, params }) => {
    const db = getDb();
    let rows = scopeRowsByTenant(user, db.users, params.tenant_id);
    if (params.role) rows = rows.filter((u) => u.role === params.role);
    if (params.search) {
      const q = String(params.search).toLowerCase();
      rows = rows.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    const safe = rows.map(publicUser);
    return { data: { users: safe, data: safe, total: safe.length } };
  }),
  route("post", /^\/users$/, ({ user, body }) => {
    const db = getDb();
    const scope = body.scope ?? (body.tenant_id ? SCOPES.TENANT : SCOPES.BUILDING);
    const tenantId = scope === SCOPES.TENANT ? Number(body.tenant_id) : null;
    if (scope === SCOPES.TENANT) {
      if (tenantId == null) throw fail(422, "tenant_id is required for tenant users.", "TENANT_REQUIRED");
      assertTenantAccess(user, tenantId);
    } else if (user.scope !== SCOPES.BUILDING) {
      throw fail(403, "Tenant admins cannot create building-level users.", "SCOPE_FORBIDDEN");
    }
    if (!["admin", "staff", "front_desk"].includes(body.role)) {
      throw fail(422, "Only tenant-level roles can be created here.", "ROLE_FORBIDDEN");
    }
    const created = {
      id: nextId(db.users),
      building_id: db.building.id,
      tenant_id: tenantId,
      name: body.name ?? "New user",
      email: String(body.email ?? "").toLowerCase(),
      password: body.password ?? "Demo1234!",
      role: body.role,
      scope,
      department: body.department ?? "",
      phone: body.phone ?? "",
      profile_picture: "",
      status: USER_STATUS.INVITED,
      permissions: permissionsFor(body.role, scope),
      created_at: new Date().toISOString(),
    };
    db.users.push(created);
    return { status: 201, data: { user: publicUser(created) } };
  }),
  route("put", /^\/users\/(\d+)$/, ({ user, match, body }) => {
    const db = getDb();
    const target = db.users.find((u) => u.id === Number(match[1]));
    if (!target) throw fail(404, "User not found.", "USER_NOT_FOUND");
    assertTenantAccess(user, target.tenant_id);
    const allowed = ["name", "email", "role", "department", "phone", "status"];
    for (const key of allowed) if (body[key] !== undefined) target[key] = body[key];
    return { data: { user: publicUser(target) } };
  }),
  route("delete", /^\/users\/(\d+)$/, ({ user, match }) => {
    const db = getDb();
    const index = db.users.findIndex((u) => u.id === Number(match[1]));
    if (index === -1) throw fail(404, "User not found.", "USER_NOT_FOUND");
    assertTenantAccess(user, db.users[index].tenant_id);
    const [removed] = db.users.splice(index, 1);
    return { data: { user: publicUser(removed) } };
  }),
  route("post", /^\/users\/(\d+)\/(activate|deactivate)$/, ({ user, match }) => {
    const db = getDb();
    const target = db.users.find((u) => u.id === Number(match[1]));
    if (!target) throw fail(404, "User not found.", "USER_NOT_FOUND");
    assertTenantAccess(user, target.tenant_id);
    target.status = match[2] === "activate" ? USER_STATUS.ACTIVE : USER_STATUS.DISABLED;
    return { data: { user: publicUser(target) } };
  }),
  route("post", /^\/users\/bulk-delete$/, ({ user, body }) => {
    const db = getDb();
    const ids = (body.ids ?? []).map(Number);
    let removed = 0;
    for (const id of ids) {
      const target = db.users.find((u) => u.id === id);
      if (target && canAccessTenant(user, target.tenant_id)) {
        db.users = db.users.filter((u) => u.id !== id);
        removed += 1;
      }
    }
    return { data: { deleted: removed } };
  }),
  route("get", /^\/users\/bulk-template\/[^/]+$/, () => ({
    data: "name,email,role,department\nJane Doe,jane@example.test,staff,Operations\n",
  })),
  route("post", /^\/users\/bulk-upload\/[^/]+$/, () => ({
    data: { created: 0, skipped: 0, errors: [], message: "Mock upload accepted." },
  })),

  // ---- manage admins (invite flow used by the Tenants Admin screen) ----
  route("post", /^\/admin\/admins$/, ({ user, body }) => {
    if (user.scope !== SCOPES.BUILDING) {
      throw fail(403, "Only the building admin can add tenant admins.", "SCOPE_FORBIDDEN");
    }
    const tenantId =
      body.tenant_id != null && body.tenant_id !== "" ? Number(body.tenant_id) : null;
    if (tenantId == null) {
      throw fail(422, "Choose the tenant this admin belongs to.", "TENANT_REQUIRED");
    }
    assertTenantAccess(user, tenantId);
    const db = getDb();
    const created = {
      id: nextId(db.users),
      building_id: db.building.id,
      tenant_id: tenantId,
      name: body.name ?? "New admin",
      email: String(body.email ?? "").toLowerCase(),
      password: body.password ?? "Demo1234!",
      role: "admin",
      scope: SCOPES.TENANT,
      department: body.department ?? "",
      phone: body.phone ?? "",
      profile_picture: "",
      status: USER_STATUS.INVITED,
      permissions: permissionsFor("admin", SCOPES.TENANT),
      created_at: new Date().toISOString(),
    };
    db.users.push(created);
    return { status: 201, data: { user: publicUser(created) } };
  }),

  // ---- role-scoped user lists used by the current admin screens ----
  route("get", /^\/(admin\/staff|admin\/frontdesk|admin\/security|admin\/admins|admin\/self-service-users)$/, ({ user, params, match }) => {
    const roleMap = {
      "/admin/staff": "staff",
      "/admin/frontdesk": "front_desk",
      "/admin/security": "security",
      "/admin/admins": "admin",
      "/admin/self-service-users": "self_service",
    };
    // Each management page reads its own key (staff, frontdesk, ...).
    const listKey = {
      "/admin/staff": "staff",
      "/admin/frontdesk": "frontdesk",
      "/admin/security": "security",
      "/admin/admins": "admins",
      "/admin/self-service-users": "users",
    };
    const db = getDb();
    let rows = scopeRowsByTenant(user, db.users, params.tenant_id).filter(
      (u) => u.role === roleMap[`/${match[1]}`]
    );
    const contains = (value, q) => String(value ?? "").toLowerCase().includes(String(q).toLowerCase());
    if (params.search) {
      rows = rows.filter((u) => contains(u.name, params.search) || contains(u.email, params.search));
    }
    if (params.name) rows = rows.filter((u) => contains(u.name, params.name));
    if (params.email) rows = rows.filter((u) => contains(u.email, params.email));
    if (params.department) rows = rows.filter((u) => contains(u.department, params.department));

    const safe = rows.map((u) => {
      const pub = publicUser(u);
      return {
        ...pub,
        account_status: u.status,
        // Tables render `status` as a boolean Active/Inactive badge.
        status: u.status === USER_STATUS.ACTIVE,
        invitation_status: u.status === USER_STATUS.INVITED ? "sent" : "accepted",
        password_setup_at: u.status === USER_STATUS.INVITED ? null : u.created_at,
        last_login: u.status === USER_STATUS.ACTIVE ? new Date().toISOString() : null,
        company_name: pub.tenant?.name ?? db.building.name,
        employee_id: `EMP-${String(u.id).padStart(4, "0")}`,
        position: u.department,
      };
    });
    const paged = paginate(safe, { per_page: params.per_page ?? 50, page: params.page });
    return {
      data: {
        [listKey[`/${match[1]}`]]: paged.data,
        users: paged.data,
        data: paged.data,
        pagination: paged.pagination,
        total: safe.length,
      },
    };
  }),

  // ---- visits ----
  route("get", /^\/visits$/, ({ user, params }) => ({ data: visitListPayload(user, params) })),
  route("get", /^\/visits\/(\d+)$/, ({ user, match }) => ({
    data: { visit: hydrateVisit(findVisit(user, match[1])) },
  })),
  route("post", /^\/visits$/, ({ user, body }) => {
    const visit = createVisit(user, body, {
      source: body.source ?? VISIT_SOURCE.PRE_REGISTERED,
      gate: null,
      status: VISIT_STATUS.REGISTERED,
      group: body.visitor_type === "group",
    });
    return { status: 201, data: { visit: hydrateVisit(visit) } };
  }),
  route("post", /^\/visits\/(\d+)\/(verify|check-in|check-out|cancel|mark-missed)$/, ({ user, match, body }) => {
    const visit = findVisit(user, match[1]);
    const map = {
      verify: VISIT_STATUS.VERIFIED,
      "check-in": VISIT_STATUS.CHECKED_IN,
      "check-out": VISIT_STATUS.CHECKED_OUT,
      cancel: VISIT_STATUS.CANCELLED,
      "mark-missed": VISIT_STATUS.MISSED,
    };
    const updated = transition(visit, map[match[2]], user, gateFor(user, body.gate));
    return { data: { visit: updated } };
  }),
  route("get", /^\/visits\/(?:scan|code)\/([^/]+)$/, ({ user, match }) => {
    const db = getDb();
    const code = decodeURIComponent(match[1]).toLowerCase();
    const visit = db.visits.find((v) => String(v.code).toLowerCase() === code);
    if (!visit) throw fail(404, "Visit code not found.", "VISIT_NOT_FOUND");
    assertTenantAccess(user, visit.tenant_id);
    return { data: { visit: hydrateVisit(visit) } };
  }),

  // ---- building-admin visit buckets ----
  route("get", /^\/admin\/visits\/(scheduled|upcoming|completed|missed|cancelled|today)$/, ({ user, params, match }) => ({
    data: visitListPayload(user, params, match[1]),
  })),
  route("get", /^\/admin\/visits$/, ({ user, params }) => ({ data: visitListPayload(user, params) })),
  route("post", /^\/admin\/visits\/(\d+)\/(invite-again|check-in|check-out|cancel|mark-missed)$/, ({ user, match }) => {
    const visit = findVisit(user, match[1]);
    const map = {
      "invite-again": VISIT_STATUS.REGISTERED,
      "check-in": VISIT_STATUS.CHECKED_IN,
      "check-out": VISIT_STATUS.CHECKED_OUT,
      cancel: VISIT_STATUS.CANCELLED,
      "mark-missed": VISIT_STATUS.MISSED,
    };
    return { data: { visit: transition(visit, map[match[2]], user, GATE.SYSTEM) } };
  }),

  // ---- staff / front desk / security visit buckets ----
  route(
    "get",
    /^\/(staff\/guests|front-desk\/guests|security\/guest)\/(individual|group|all)\/(scheduled|completed|cancelled|missed)-visits$/,
    ({ user, params, match }) => ({
      data: visitListPayload(user, { ...params, visitor_type: match[2] }, match[3]),
    })
  ),
  route("get", /^\/staff\/guests\/staff-pending-visits$/, ({ user, params }) => ({
    data: visitListPayload(user, params, "pending"),
  })),
  route("get", /^\/front-desk\/guests\/frontdesk-pending-visits$/, ({ user, params }) => ({
    data: visitListPayload(user, params, "pending"),
  })),
  route("get", /^\/security\/guest\/host-pending-visits$/, ({ user, params }) => ({
    data: visitListPayload(user, params, "pending"),
  })),
  route("get", /^\/(staff\/guests|front-desk\/guests|security\/guest)\/(?:individual|group)\/counts$/, ({ user, params }) => {
    const rows = filterVisits(user, params);
    return {
      data: {
        scheduled: rows.filter((v) => v.visit_status === VISIT_STATUS.REGISTERED).length,
        pending: rows.filter((v) => v.visit_status === VISIT_STATUS.REGISTERED).length,
        confirmed: rows.filter((v) => v.visit_status === VISIT_STATUS.VERIFIED).length,
        completed: rows.filter((v) => v.visit_status === VISIT_STATUS.CHECKED_OUT).length,
        cancelled: rows.filter((v) => v.visit_status === VISIT_STATUS.CANCELLED).length,
        missed: rows.filter((v) => v.visit_status === VISIT_STATUS.MISSED).length,
        total: rows.length,
      },
    };
  }),
  route("get", /^\/front-desk\/guests\/visits\/(pending|confirmed|incoming|outgoing)$/, ({ user, params, match }) => ({
    data: visitListPayload(user, params, match[1]),
  })),
  route("get", /^\/front-desk\/visits\/(pending|confirmed|incoming|outgoing|completed)$/, ({ user, params, match }) => ({
    data: visitListPayload(user, params, match[1]),
  })),
  route("post", /^\/front-desk\/visits\/(\d+)\/confirm$/, ({ user, match }) => {
    const visit = findVisit(user, match[1]);
    const gate = gateFor(user);
    let updated = transition(visit, VISIT_STATUS.VERIFIED, user, gate);
    updated = transition(visit, VISIT_STATUS.CHECKED_IN, user, gate);
    return { data: { visit: updated } };
  }),
  route("post", /^\/front-desk\/guests\/visit\/security-confirm\/(\d+)$/, ({ user, match }) => {
    const visit = findVisit(user, match[1]);
    const gate = gateFor(user);
    let updated = transition(visit, VISIT_STATUS.VERIFIED, user, gate);
    updated = transition(visit, VISIT_STATUS.CHECKED_IN, user, gate);
    return { data: { visit: updated } };
  }),
  route("get", /^\/front-desk\/guests\/visit\/scan\/([^/]+)$/, ({ user, match }) => {
    const db = getDb();
    const code = decodeURIComponent(match[1]).toLowerCase();
    const visit = db.visits.find((v) => String(v.code).toLowerCase() === code);
    if (!visit) throw fail(404, "Visit code not found.", "VISIT_NOT_FOUND");
    assertTenantAccess(user, visit.tenant_id);
    return { data: { visit: hydrateVisit(visit) } };
  }),
  route("post", /^\/security\/visit\/confirm\/(\d+)$/, ({ user, match }) => {
    const visit = findVisit(user, match[1]);
    const gate = GATE.SECURITY;
    let updated = transition(visit, VISIT_STATUS.VERIFIED, user, gate);
    updated = transition(visit, VISIT_STATUS.CHECKED_IN, user, gate);
    return { data: { visit: updated } };
  }),
  route("get", /^\/security\/visit\/scan\/([^/]+)$/, ({ user, match }) => {
    const db = getDb();
    const code = decodeURIComponent(match[1]).toLowerCase();
    const visit = db.visits.find((v) => String(v.code).toLowerCase() === code);
    if (!visit) throw fail(404, "Visit code not found.", "VISIT_NOT_FOUND");
    assertTenantAccess(user, visit.tenant_id);
    return { data: { visit: hydrateVisit(visit) } };
  }),
  route("get", /^\/security\/history$/, ({ user, params }) => ({
    data: visitListPayload(user, params),
  })),

  // ---- registration endpoints ----
  route(
    "post",
    /^\/(admin\/register-individual-guest|staff\/guests\/register|front-desk\/guests\/register|security\/guest\/register-guest|staff\/guests\/add|staff\/guests\/add-guest)$/,
    ({ user, body }) => {
      const visit = createVisit(user, body, {
        source: VISIT_SOURCE.PRE_REGISTERED,
        gate: null,
        status: VISIT_STATUS.REGISTERED,
      });
      return { status: 201, data: { visit: hydrateVisit(visit), message: "Visit registered." } };
    }
  ),
  route(
    "post",
    /^\/(admin\/register-group-guest|staff\/guests\/register-group|front-desk\/guests\/register-group|security\/guest\/register-group)$/,
    ({ user, body }) => {
      const visit = createVisit(user, body, {
        source: VISIT_SOURCE.PRE_REGISTERED,
        gate: null,
        status: VISIT_STATUS.REGISTERED,
        group: true,
      });
      return { status: 201, data: { visit: hydrateVisit(visit), message: "Group visit registered." } };
    }
  ),
  route("post", /^\/(genereal-notify-host|admin\/notify-admin-host)$/, ({ user, body }) => {
    const visit = body.visit_id ? getDb().visits.find((v) => String(v.id) === String(body.visit_id)) : null;
    if (visit) {
      pushNotification(visit, "Visit notification", body.message ?? "A visitor is on the way.");
    }
    return { data: { message: "Host notified.", sent_by: user.id } };
  }),

  // ---- self-service ----
  route("get", /^\/self-service\/visits\/search$/, ({ user, params }) => {
    const q = String(params.query ?? "").trim().toLowerCase();
    const db = getDb();
    let rows = db.visits.filter((v) => {
      const visitor = db.visitors.find((x) => x.id === v.visitor_id);
      return (
        !q ||
        String(v.code).toLowerCase().includes(q) ||
        String(visitor?.email ?? "").toLowerCase().includes(q) ||
        String(visitor?.name ?? "").toLowerCase().includes(q)
      );
    });
    if (user.scope === SCOPES.TENANT) rows = scopeRowsByTenant(user, rows);
    return { data: { visits: sortVisits(rows).map(hydrateVisit) } };
  }),
  route("post", /^\/self-service\/visits\/walk-in-register$/, ({ user, body }) => {
    const db = getDb();
    const host = db.users.find((u) => u.id === Number(body.host_id));
    if (!host) throw fail(422, "Choose a host.", "HOST_REQUIRED");
    if (!host.tenant_id) throw fail(422, "The host is not assigned to a tenant.", "HOST_TENANT_MISSING");

    const visit = createVisit(
      user,
      { ...body, tenant_id: host.tenant_id, host_id: host.id },
      {
        source: VISIT_SOURCE.WALK_IN,
        gate: GATE.SELF_SERVICE,
        status: VISIT_STATUS.REGISTERED,
      }
    );

    transition(visit, VISIT_STATUS.VERIFIED, user, GATE.SELF_SERVICE);
    transition(visit, VISIT_STATUS.CHECKED_IN, user, GATE.SELF_SERVICE);

    return {
      status: 201,
      data: { visit: hydrateVisit(visit), message: "Walk-in checked in." },
    };
  }),
  route("post", /^\/self-service\/visits\/(\d+)\/(check-in|check-out)$/, ({ user, match }) => {
    const visit = findVisit(user, match[1], { allowPortal: true });
    if (match[2] === "check-in" && visit.visit_status === VISIT_STATUS.REGISTERED) {
      transition(visit, VISIT_STATUS.VERIFIED, user, GATE.SELF_SERVICE);
    }
    const updated = transition(
      visit,
      match[2] === "check-in" ? VISIT_STATUS.CHECKED_IN : VISIT_STATUS.CHECKED_OUT,
      user,
      GATE.SELF_SERVICE
    );
    return { data: { visit: updated } };
  }),

  // ---- visitors ----
  route("get", /^\/admin\/visitors(\/vip|\/blacklisted)?$/, ({ user, params, match }) => {
    const db = getDb();
    let rows = scopeRowsByTenant(user, db.visitors, params.tenant_id);
    if (match[1] === "/vip") rows = rows.filter((v) => v.is_vip);
    if (match[1] === "/blacklisted") rows = rows.filter((v) => v.is_blacklisted);
    if (params.search) {
      const q = String(params.search).toLowerCase();
      rows = rows.filter(
        (v) => v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
      );
    }

    const decorated = rows.map((visitor) => {
      const latestVisit = db.visits
        .filter(
          (visit) =>
            visit.visitor_id === visitor.id &&
            String(visit.tenant_id) === String(visitor.tenant_id)
        )
        .sort((a, b) => new Date(b.visit_time) - new Date(a.visit_time))[0];

      return {
        ...visitor,
        contact_number: visitor.contact_number ?? visitor.phone ?? "",
        address: visitor.address ?? visitor.company ?? "",
        visitDate:
          latestVisit?.visit_time?.slice(0, 10) ??
          visitor.created_at?.slice(0, 10) ??
          new Date().toISOString().slice(0, 10),
      };
    });

    // The visitors log screen expects an object keyed by date. VIP and
    // blacklist screens accept the flatter `{ visitors, data }` shape.
    if (!match[1]) {
      const grouped = decorated.reduce((groups, visitor) => {
        (groups[visitor.visitDate] ||= []).push(visitor);
        return groups;
      }, {});
      return { data: grouped };
    }

    return { data: { visitors: decorated, data: decorated, total: decorated.length } };
  }),
  route("post", /^\/admin\/visitors$/, ({ user, body }) => {
    const tenantId = user.scope === SCOPES.TENANT ? user.tenant_id : Number(body.tenant_id ?? 1);
    assertTenantAccess(user, tenantId);
    const db = getDb();
    const visitor = {
      id: nextId(db.visitors),
      tenant_id: tenantId,
      name: body.name ?? "New visitor",
      email: body.email ?? "",
      phone: body.phone ?? body.contact_number ?? "",
      company: body.company ?? "",
      is_vip: false,
      is_blacklisted: false,
      created_at: new Date().toISOString(),
    };
    db.visitors.push(visitor);
    return { status: 201, data: { visitor } };
  }),

  // ---- notifications ----
  route("get", /^\/(?:admin|staff|front-desk|security)\/notifications$/, ({ user, params }) => ({
    data: notificationPage(user, params),
  })),
  route("get", /^\/(?:admin|staff|front-desk|security)\/notifications\/unread-count$/, ({ user }) => {
    const rows = notificationsFor(user).filter((n) => !n.read);
    return { data: { unread_count: rows.length, count: rows.length } };
  }),
  route("get", /^\/(?:admin|staff|front-desk|security)\/notifications\/latest-unread$/, ({ user }) => ({
    data: { notifications: notificationsFor(user).filter((n) => !n.read).slice(0, 3) },
  })),
  route("get", /^\/admin\/admin-notifications$/, ({ user, params }) => ({
    data: notificationPage(user, params),
  })),
  route("get", /^\/notifications$/, ({ user, params }) => ({
    data: { notifications: notificationsFor(user, params) },
  })),
  route("post", /^\/(?:admin|staff|front-desk|security)\/notifications\/mark-all-read$/, ({ user }) => {
    for (const n of getDb().notifications) if (n.user_id === user.id) n.read = true;
    return { data: { message: "All notifications marked as read." } };
  }),
  route("post", /^\/(?:admin|staff|front-desk|security)\/notifications\/mark-read$/, ({ user, body }) => {
    const target = getDb().notifications.find(
      (n) => n.user_id === user.id && String(n.id) === String(body.notification_id ?? body.id)
    );
    if (target) target.read = true;
    return { data: { message: "Notification marked as read." } };
  }),

  // ---- settings ----
  route("get", /^\/settings$/, ({ user }) => ({ data: effectiveSettings(user) })),
  route("get", /^\/admin\/settings$/, ({ user }) => {
    const effective = effectiveSettings(user);
    return {
      data: {
        general_settings: effective.effective,
        settings: effective,
        gate_policy: effective.effective.gate_policy,
      },
    };
  }),
  route("get", /^\/admin\/settings\/company$/, ({ user }) => ({
    data: { company: effectiveSettings(user).effective },
  })),
  route("get", /^\/admin\/data-privacy$/, ({ user }) => ({
    data: { retention_days: effectiveSettings(user).effective.retention_days },
  })),
  route("get", /^\/admin\/security\/settings$/, ({ user }) => ({
    data: { gate_policy: effectiveSettings(user).effective.gate_policy },
  })),

  // ---- dashboards ----
  route("get", /^\/admin\/analytics$/, ({ user, params }) => ({ data: analytics(user, params) })),
  route("get", /^\/admin\/analytics\/export$/, ({ user, params }) => analyticsExport(user, params)),
  route("get", /^\/admin\/alerts\/priority(\/quick)?$/, ({ user, params, match }) => {
    // Visits that need attention: missed, blacklisted or VIP visitors.
    const rows = filterVisits(user, { tenant_id: params.tenant_id }).filter(
      (v) =>
        v.visit_status === VISIT_STATUS.MISSED ||
        v.is_blacklisted ||
        v.visitor?.is_blacklisted ||
        v.visitor?.is_vip
    );
    const alerts = rows.map((v) => {
      const blacklisted = v.is_blacklisted || v.visitor?.is_blacklisted;
      return {
        id: v.id,
        visitor_name: v.visitor?.name ?? "Visitor",
        host_name: v.host_name,
        purpose: v.purpose,
        check_in: v.check_in ?? v.visit_time,
        tenant_name: v.tenant_name,
        title: blacklisted ? "Blacklisted visitor" : v.visitor?.is_vip ? "VIP visitor" : "Missed visit",
        message: `${v.visitor?.name ?? "Visitor"} · ${v.tenant_name}`,
        severity: blacklisted ? "high" : "medium",
      };
    });
    if (match[1]) {
      const top = Number(params.top ?? 3) || 3;
      return { data: { alerts: alerts.slice(0, top), data: alerts.slice(0, top) } };
    }
    const paged = paginate(alerts, params);
    return { data: { alerts: paged.data, data: paged.data, pagination: paged.pagination } };
  }),
  route("get", /^\/admin\/updates\/latest$/, ({ user, params }) => {
    // Most recent visitor activity (arrivals first, then newest bookings).
    const rows = filterVisits(user, { tenant_id: params.tenant_id })
      .map((v) => ({ ...v, activity_at: v.check_out ?? v.check_in ?? v.created_at }))
      .filter((v) => new Date(v.activity_at) <= new Date())
      .sort((a, b) => new Date(b.activity_at) - new Date(a.activity_at));
    const visitors = rows.map((v) => ({
      id: v.id,
      name: v.visitor?.name ?? "Visitor",
      photo: v.visitor?.profile_picture || null,
      created_at: v.activity_at,
      tenant_name: v.tenant_name,
      status: v.visit_status,
    }));
    const paged = paginate(visitors, params);
    return {
      data: {
        visitors: paged.data,
        updates: paged.data,
        pagination: paged.pagination,
      },
    };
  }),
  route("get", /^\/staff\/dashboard\/summary$/, ({ user }) => {
    const rows = filterVisits(user, { host_id: user.id });
    return {
      data: {
        total_visitors_today: rows.filter((v) => isToday(v.visit_time)).length,
        upcoming_visits: rows.filter(
          (v) => new Date(v.visit_time) >= new Date() && v.visit_status === VISIT_STATUS.REGISTERED
        ).length,
        pending_guests: rows.filter((v) =>
          [VISIT_STATUS.REGISTERED, VISIT_STATUS.VERIFIED].includes(v.visit_status)
        ).length,
      },
    };
  }),
  route("get", /^\/staff\/dashboard\/recents$/, ({ user, params }) => {
    const rows = filterVisits(user, { host_id: user.id }).slice(0, Number(params.per_page ?? 5));
    return {
      data: {
        recents: {
          visits: rows,
          notifications: notificationsFor(user).slice(0, Number(params.per_page ?? 5)),
        },
      },
    };
  }),
  route("get", /^\/staff\/dashboard\/todays-guests$/, ({ user, params }) => {
    const rows = filterVisits(user, { host_id: user.id }).filter((v) => isToday(v.visit_time));
    return { data: { guests: rows.slice(0, Number(params.per_page ?? 3)) } };
  }),

  // ---- admin misc ----
  route("get", /^\/admin\/list-admins$/, ({ user }) => {
    const rows = scopeRowsByTenant(user, getDb().users).filter((u) => u.role === "admin");
    return { data: { admins: rows.map(publicUser), data: rows.map(publicUser) } };
  }),
  route("get", /^\/admin\/users\/onboarding-stats$/, ({ user, params }) => {
    const rows = scopeRowsByTenant(user, getDb().users, params.tenant_id);
    return {
      data: {
        total: rows.length,
        active: rows.filter((u) => u.status === USER_STATUS.ACTIVE).length,
        invited: rows.filter((u) => u.status === USER_STATUS.INVITED).length,
        disabled: rows.filter((u) => u.status === USER_STATUS.DISABLED).length,
        by_role: {
          admin: rows.filter((u) => u.role === "admin").length,
          staff: rows.filter((u) => u.role === "staff").length,
          front_desk: rows.filter((u) => u.role === "front_desk").length,
          security: rows.filter((u) => u.role === "security").length,
        },
      },
    };
  }),
  route("get", /^\/admin\/roles-with-permissions$/, () => ({
    data: {
      roles: [
        { role: "admin", scope: "building", permissions: permissionsFor("admin", "building") },
        { role: "admin", scope: "tenant", permissions: permissionsFor("admin", "tenant") },
        { role: "staff", scope: "tenant", permissions: permissionsFor("staff", "tenant") },
        { role: "front_desk", scope: "building", permissions: permissionsFor("front_desk", "building") },
        { role: "front_desk", scope: "tenant", permissions: permissionsFor("front_desk", "tenant") },
        { role: "security", scope: "building", permissions: permissionsFor("security", "building") },
      ],
    },
  })),

  // ---- audit ----
  route("get", /^\/audit$/, ({ user, params }) => {
    const db = getDb();
    let rows = scopeRowsByTenant(user, db.audit, params.tenant_id);
    if (params.visit_id) rows = rows.filter((a) => String(a.visit_id) === String(params.visit_id));
    return { data: { audit: rows, data: rows } };
  }),
];

function settingsMutation(path, body) {
  const db = getDb();
  const settings = db.settings.building;
  const listKeyMap = {
    purpose: "visit_purposes",
    building: "buildings",
    floor: "floors",
    "special-requirement": "special_requirements",
  };

  const add = path.match(/\/add-(purpose|building|floor|special-requirement)$/);
  const update = path.match(/\/update-(purpose|building|floor|special-requirement)$/);
  const remove = path.match(/\/delete-(purpose|building|floor|special-requirement)$/);

  const keyFor = (kind) => listKeyMap[kind];
  const valueOf = (kind, suffix) =>
    body[suffix] ??
    body[kind] ??
    body.requirement ??
    body.floor ??
    body.building ??
    body.purpose;

  if (add) {
    const key = keyFor(add[1]);
    const value = valueOf(add[1], `new_${add[1] === "special-requirement" ? "requirement" : add[1]}`);
    if (value && !settings[key].includes(value)) settings[key].push(value);
    return { data: { settings } };
  }
  if (update) {
    const key = keyFor(update[1]);
    const oldValue = valueOf(update[1], `old_${update[1] === "special-requirement" ? "requirement" : update[1]}`);
    const newValue = valueOf(update[1], `new_${update[1] === "special-requirement" ? "requirement" : update[1]}`);
    settings[key] = settings[key].map((v) => (v === oldValue ? newValue : v));
    return { data: { settings } };
  }
  if (remove) {
    const key = keyFor(remove[1]);
    const value = valueOf(remove[1], remove[1] === "special-requirement" ? "requirement" : remove[1]);
    settings[key] = settings[key].filter((v) => v !== value);
    return { data: { settings } };
  }
  return null;
}

function dispatch(config) {
  const method = String(config.method ?? "get").toLowerCase();
  const path = normalizePath(config);
  const params = queryParams(config);
  const body = bodyOf(config);

  if (path === "/admin/settings/update" || path === "/admin/settings/update-single") {
    const user = currentUser(config);
    const db = getDb();
    if (user.scope !== SCOPES.BUILDING) {
      throw fail(403, "Only the building admin can change building settings.", "SCOPE_FORBIDDEN");
    }
    if (body.key) {
      db.settings.building[body.key] = body.value;
    } else {
      Object.assign(db.settings.building, body);
    }
    return { data: { settings: effectiveSettings(user) } };
  }

  const settingsResult = settingsMutation(path, body);
  if (settingsResult && method === "post") {
    currentUser(config);
    return settingsResult;
  }

  for (const r of routes) {
    if (r.method !== method) continue;
    const match = r.pattern.exec(path);
    if (!match) continue;
    const user = r.public ? null : currentUser(config);
    return r.handler({ match, config, params, body, user, path });
  }

  // Generic fallback keeps legacy screens from crashing while the prototype
  // is being built. It never returns another tenant's rows.
  if (method === "get") {
    return {
      data: {
        data: [],
        visits: [],
        users: [],
        notifications: [],
        message: "Mock endpoint not implemented yet.",
        path,
      },
    };
  }

  return { data: { message: "Mock action accepted.", path, success: true } };
}

export async function mockAdapter(config) {
  await delay(TRANSPORT_DELAY_MS);
  try {
    const result = await dispatch(config);
    if ((config.method ?? "get").toLowerCase() !== "get") saveDb();
    return {
      data: result.data,
      status: result.status ?? 200,
      statusText: "OK",
      headers: result.headers ?? { "content-type": "application/json" },
      config,
      request: { mock: true },
    };
  } catch (error) {
    if (!error.response) {
      const mapped =
        error.code === "TENANT_FORBIDDEN" || error.code === "TENANT_SUSPENDED"
          ? fail(403, error.message, error.code)
          : fail(500, error.message || "Mock error.");
      mapped.config = config;
      throw mapped;
    }
    error.config = config;
    throw error;
  }
}
