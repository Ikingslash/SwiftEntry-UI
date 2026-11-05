/**
 * Helpers that let visit tables accept both API shapes:
 *  - legacy Laravel: `visits` grouped by date, rows carry pre-formatted fields
 *    (visitor_name, visit_date_formatted, check_in_time_formatted, ...)
 *  - new / mock API: `visits` is a flat array of hydrated rows
 *    (visitor.name, visit_time, check_in, check_out as ISO strings)
 *
 * Existing values always win; we only fill in what is missing.
 */
import { format, isValid } from "date-fns";

function fmt(iso, pattern) {
  if (!iso) return null;
  const d = new Date(iso);
  return isValid(d) ? format(d, pattern) : null;
}

/** Local calendar day, so "today" groups match the user's clock (not UTC). */
export function localDateKey(iso) {
  return fmt(iso, "yyyy-MM-dd");
}

export function normalizeVisitRow(visit) {
  if (!visit || typeof visit !== "object") return visit;
  const when = visit.visit_time ?? visit.scheduled_at ?? null;
  return {
    ...visit,
    visitor_name:
      visit.visitor_name ?? visit.visitor?.name ?? visit.name ?? "Visitor",
    host_name: visit.host_name ?? visit.host?.name ?? "—",
    visitor_type: visit.visitor_type ?? "individual",
    visit_date_formatted: visit.visit_date_formatted ?? fmt(when, "MMM d, yyyy") ?? "—",
    visit_time_formatted: visit.visit_time_formatted ?? fmt(when, "h:mm a") ?? "—",
    check_in_time_formatted:
      visit.check_in_time_formatted ?? fmt(visit.check_in, "h:mm a") ?? "—",
    check_out_time_formatted:
      visit.check_out_time_formatted ?? fmt(visit.check_out, "h:mm a") ?? "—",
  };
}

/** Always returns `{ [yyyy-MM-dd]: visit[] }`. */
export function groupVisitsByDate(visits) {
  if (Array.isArray(visits)) {
    return visits.reduce((groups, raw) => {
      const visit = normalizeVisitRow(raw);
      // Tables pass the key to `new Date()` + date-fns `format`, so it must
      // always be a real date (a label like "Unscheduled" would throw).
      const key =
        localDateKey(visit.visit_time ?? visit.scheduled_at ?? visit.created_at) ??
        localDateKey(new Date());
      (groups[key] ||= []).push(visit);
      return groups;
    }, {});
  }
  if (visits && typeof visits === "object") {
    return Object.fromEntries(
      Object.entries(visits).map(([date, rows]) => [
        date,
        Array.isArray(rows) ? rows.map(normalizeVisitRow) : [],
      ])
    );
  }
  return {};
}

/** Always returns a flat, normalized array. */
export function flattenVisits(visits) {
  if (Array.isArray(visits)) return visits.map(normalizeVisitRow);
  if (visits && typeof visits === "object") {
    return Object.values(visits).flat().map(normalizeVisitRow);
  }
  return [];
}

/** Pagination is optional in some responses; never hand `undefined` to a page. */
export function paginationOf(data) {
  return data?.pagination ?? data?.meta ?? {};
}
