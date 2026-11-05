import { lazy, Suspense } from "react";
import { isMockEnabled } from "../../mocks/index.js";

const DevTenantPanel = lazy(() => import("./DevTenantPanel.jsx"));

/**
 * Keeps the persona switcher out of the production bundle path.
 * It returns nothing at all when mock mode is off.
 */
export default function DevTenantDock() {
  // Hidden unless explicitly switched on, so the demo signs in like the real app.
  const showPanel = import.meta.env.VITE_SHOW_DEMO_PANEL === "true";
  if (!isMockEnabled || !showPanel) return null;

  return (
    <Suspense fallback={null}>
      <DevTenantPanel />
    </Suspense>
  );
}
