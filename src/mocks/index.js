import { mockAdapter } from "./adapter.js";
import { resetDb } from "./db.js";
import { demoPersonas } from "./seed.js";

/**
 * The mock layer is opt-in. Production builds must leave VITE_USE_MOCK_API
 * unset (or false) so no demo data can be served.
 */
export const isMockEnabled = import.meta.env?.VITE_USE_MOCK_API === "true";

export { mockAdapter, demoPersonas };
export const resetMockDb = resetDb;
