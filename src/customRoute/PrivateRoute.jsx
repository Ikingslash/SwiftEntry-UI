import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getScope, isValidUserScope, dashboardFor } from "../tenancy/scope.js";
import { SCOPES, TENANT_STATUS } from "../tenancy/constants.js";
import Forbidden from "../pages/Forbidden";

function asArray(value) {
  if (value == null) return null;
  return Array.isArray(value) ? value : [value];
}

/**
 * Route guard with three independent checks:
 *   1. authenticated
 *   2. role allowed for the route
 *   3. scope allowed for the route (and tenant scope is actually usable)
 */
export default function PrivateRoute({ children, requiredRole, requiredScope }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!user) {
    if (loading) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-[#edf5ff] text-sm text-slate-500">
          Checking your session…
        </div>
      );
    }
    const url = location.pathname + location.search + location.hash;
    return <Navigate to="/" state={{ next: url }} replace />;
  }

  const scopeInfo = getScope(user);

  if (!isValidUserScope(user)) {
    return (
      <Forbidden
        title="Account not fully set up"
        message="This account is tenant-scoped but has no tenant assigned. Ask your building administrator to fix the account before signing in."
        reason="Missing tenant assignment"
      />
    );
  }

  if (scopeInfo.isTenant) {
    const status = user.tenant?.status;
    if (status && status !== TENANT_STATUS.ACTIVE) {
      return (
        <Forbidden
          title="Tenant suspended"
          message="Your organisation has been suspended. Contact the building administrator to restore access."
          reason="Tenant status: suspended"
        />
      );
    }
  }

  const roles = asArray(requiredRole);
  if (roles && !roles.includes(user.role)) {
    return (
      <Forbidden
        title="Wrong account type"
        message={`This area is for ${roles.join(" or ")} accounts. You are signed in as ${user.role || "an unknown role"}.`}
        reason={`Route requires role: ${roles.join(", ")}`}
      />
    );
  }

  const scopes = asArray(requiredScope);
  if (scopes) {
    const legacyBuildingAdmin =
      scopeInfo.isLegacy &&
      user.role === "admin" &&
      scopes.includes(SCOPES.BUILDING);

    if (!scopes.includes(scopeInfo.scope) && !legacyBuildingAdmin) {
      return (
        <Forbidden
          title="Different workspace"
          message="This workspace belongs to another scope. Use the dashboard for your own account."
          reason={`Route requires scope: ${scopes.join(", ")} · your scope: ${scopeInfo.scope ?? "legacy"}`}
        />
      );
    }
  }

  // Tenant users must never be able to open a building-wide landing page.
  if (!requiredScope && scopeInfo.isTenant) {
    const path = location.pathname;
    const home = dashboardFor(user);
    // A tenant user's own dashboard (e.g. /front-desk-dashboard for a tenant
    // front desk, /staff-dashboard for tenant staff) must always be allowed;
    // otherwise the redirect below points at the current page and loops.
    const allowedPrefixes = [home, "/tenant-dashboard", "/visitor-dashboard", "/forbidden"];
    if (!allowedPrefixes.some((prefix) => path.startsWith(prefix))) {
      return <Navigate to={home} replace />;
    }
  }

  return children;
}
