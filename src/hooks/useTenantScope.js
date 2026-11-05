/**
 * Convenience hook for list/detail screens.
 *
 * It answers three questions in one place:
 *  - What scope is the current user in?
 *  - Which tenant filter should a request carry?
 *  - Which rows may this screen render?
 */

import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../context/TenantContext";
import { canAccessTenant, getScope, scopeRowsByTenant } from "../tenancy/scope.js";

export function useTenantScope() {
  const { user } = useAuth();
  const tenant = useTenant();
  const scopeInfo = useMemo(() => getScope(user), [user]);

  const requestParams = useMemo(() => {
    if (scopeInfo.isBuilding && tenant.viewingTenantId) {
      return { tenant_id: tenant.viewingTenantId };
    }
    return {};
  }, [scopeInfo.isBuilding, tenant.viewingTenantId]);

  const scopeRows = useCallback(
    (rows) => scopeRowsByTenant(user, rows, tenant.viewingTenantId),
    [user, tenant.viewingTenantId]
  );

  const canAccess = useCallback(
    (tenantId) => canAccessTenant(user, tenantId),
    [user]
  );

  return {
    user,
    scope: scopeInfo.scope,
    tenantId: scopeInfo.tenantId,
    isBuildingScope: scopeInfo.isBuilding,
    isTenantScope: scopeInfo.isTenant,
    isLegacyScope: scopeInfo.isLegacy,
    viewingTenantId: tenant.viewingTenantId,
    viewingTenant: tenant.viewingTenant,
    activeTenant: tenant.activeTenant,
    requestParams,
    scopeRows,
    canAccess,
    can: tenant.can,
    effectiveSetting: tenant.effectiveSetting,
  };
}

export default useTenantScope;
