import { createSeed } from "./seed.js";

/**
 * The mock database is kept in localStorage so things you create (tenants,
 * users, visits) survive a page refresh. "Reset data" restores the seed.
 *
 * Seed dates are relative to the day they were generated. When a saved copy
 * is loaded on a later day, every timestamp is moved forward by the same
 * number of days so "today" on the dashboards still has activity.
 */
const STORAGE_KEY = "swiftentry.mockDb.v1";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const DAY_MS = 24 * 60 * 60 * 1000;

function storage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function localDayStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Recursively move every ISO timestamp by `ms`. */
function shiftDates(value, ms) {
  if (Array.isArray(value)) return value.map((item) => shiftDates(item, ms));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shiftDates(item, ms)])
    );
  }
  if (typeof value === "string" && ISO_DATE.test(value)) {
    const t = Date.parse(value);
    return Number.isNaN(t) ? value : new Date(t + ms).toISOString();
  }
  return value;
}

function load() {
  const store = storage();
  if (!store) return createSeed();
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    const saved = JSON.parse(raw);
    if (!saved?.db?.tenants || !saved?.db?.users) return createSeed();

    const days = Math.round(
      (localDayStart().getTime() - localDayStart(saved.savedOn).getTime()) / DAY_MS
    );
    return days > 0 ? shiftDates(saved.db, days * DAY_MS) : saved.db;
  } catch {
    return createSeed();
  }
}

let state = load();

export function getDb() {
  return state;
}

/** Called by the adapter after every successful write. */
export function saveDb() {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedOn: new Date().toISOString(), db: state })
    );
  } catch {
    // Quota or privacy mode: keep working in memory.
  }
}

export function resetDb() {
  state = createSeed();
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return state;
}

export function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}
