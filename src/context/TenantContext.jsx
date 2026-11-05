/**
 * Tenant runtime context.
 *
 * Responsibilities:
 *  - Load the tenants the current user may see.
 *  - Load building + tenant-effective settings.
 *  - Hold the building admin's "viewing tenant" filter.
 *  - Expose permission and effective-setting helpers.
 *
 * Security note: `viewingTenantId` is a UI filter only. The server (mock or
 * real) still derives identity from the token. A tenant user cannot widen it.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import api from "./api";
import { useAuth } from "./AuthContext";
import {
  can as userCan,
  canAccessTenant,
  getScope,
  resolveBranding,
  resolveSetting,
} from "../tenancy/scope.js";
import { DEFAULT_BRANDING, SCOPES } from "../tenancy/constants.js";

const TenantContext = createContext(null);

function readViewingTenantId() {
  try {
    return sessionStorage.getItem("viewingTenantId") || null;
  } catch {
    return null;
  }
}

function writeViewingTenantId(value) {
  try {
    if (value == null || value === "") {
      sessionStorage.removeItem("viewingTenantId");
    } else {
      sessionStorage.setItem("viewingTenantId", String(value));
    }
  } catch {
    // sessionStorage can be unavailable in hardened browsers.
  }
}

function normalizeTenantList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.tenants)) return payload.tenants;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export function TenantProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const scopeInfo = getScope(user);

  const [tenants, setTenants] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewingTenantId, setViewingTenantIdState] = useState(readViewingTenantId);

  const activeTenantId = useMemo(() => {
    if (scopeInfo.isTenant) return scopeInfo.tenantId;
    if (scopeInfo.isBuilding && viewingTenantId) return String(viewingTenantId);
    return null;
  }, [scopeInfo.isTenant, scopeInfo.tenantId, scopeInfo.isBuilding, viewingTenantId]);

  const activeTenant = useMemo(() => {
    if (activeTenantId == null) {
      return scopeInfo.isTenant ? user?.tenant ?? null : null;
    }
    return (
      tenants.find((t) => String(t.id) === String(activeTenantId)) ??
      (scopeInfo.isTenant ? user?.tenant ?? null : null)
    );
  }, [activeTenantId, tenants, scopeInfo.isTenant, user?.tenant]);

  const loadTenants = useCallback(async () => {
    if (!user?.id) {
      setTenants([]);
      return;
    }
    try {
      const response = await api.get("/tenants");
      setTenants(normalizeTenantList(response.data));
    } catch (err) {
      // A tenant user with a suspended/missing tenant may get 403 here.
      setTenants([]);
      if (err.response?.status !== 403) {
        setError(err.response?.data?.message ?? "Could not load tenants.");
      }
    }
  }, [user?.id]);

  const loadSettings = useCallback(async () => {
    if (!user?.id) {
      setSettings(null);
      return;
    }
    try {
      const response = await api.get("/settings");
      setSettings(response.data ?? null);
    } catch {
      // Settings are progressive enhancement; keep the shell usable.
      setSettings(null);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading || !user?.id) {
      setTenants([]);
      setSettings(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([loadTenants(), loadSettings()]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, loadTenants, loadSettings]);

  // Re-read the filter whenever the signed-in identity changes. `persistSession`
  // removes it on a persona switch, so this keeps state and storage in sync.
  useEffect(() => {
    setViewingTenantIdState(readViewingTenantId());
  }, [user?.id]);

  const setViewingTenant = useCallback(
    (tenantId) => {
      if (scopeInfo.isTenant) {
        // Tenant users are pinned by the token; no UI override exists.
        return;
      }
      const next = tenantId == null || tenantId === "" ? null : String(tenantId);
      setViewingTenantIdState(next);
      writeViewingTenantId(next);
    },
    [scopeInfo.isTenant]
  );

  const clearViewingTenant = useCallback(() => setViewingTenant(null), [setViewingTenant]);

  const can = useCallback(
    (permission) => userCan(user, permission),
    [user]
  );

  const canReach = useCallback(
    (tenantId) => canAccessTenant(user, tenantId),
    [user]
  );

  const buildingSettings = settings?.building ?? null;
  const tenantOverride = settings?.tenant_override ?? null;
  const overridableKeys = useMemo(
    () =>
      settings?.overridable_keys ?? buildingSettings?.allow_tenant_overrides ?? [],
    [settings, buildingSettings]
  );

  const effectiveSetting = useCallback(
    (key, fallback = null) => {
      if (settings?.effective && Object.prototype.hasOwnProperty.call(settings.effective, key)) {
        return settings.effective[key];
      }
      if (buildingSettings || tenantOverride) {
        const resolved = resolveSetting({
          key,
          buildingSettings,
          tenantOverrides: tenantOverride,
          allowOverride: overridableKeys.includes(key),
        });
        return resolved.value ?? fallback;
      }
      return fallback;
    },
    [settings, buildingSettings, tenantOverride, overridableKeys]
  );

  const branding = useMemo(() => {
    if (scopeInfo.isTenant) {
      return resolveBranding(
        buildingSettings,
        user?.tenant?.branding ?? activeTenant?.branding ?? null,
        overridableKeys.includes("branding")
      );
    }
    if (activeTenant?.branding) return activeTenant.branding;
    return buildingSettings?.branding ?? DEFAULT_BRANDING;
  }, [
    scopeInfo.isTenant,
    buildingSettings,
    user?.tenant?.branding,
    activeTenant?.branding,
    overridableKeys,
  ]);

  const gatePolicy =
    settings?.effective?.gate_policy ?? buildingSettings?.gate_policy ?? null;

  const value = useMemo(
    () => ({
      // identity / scope
      scope: scopeInfo.scope,
      tenantId: scopeInfo.tenantId,
      isBuildingScope: scopeInfo.isBuilding,
      isTenantScope: scopeInfo.isTenant,
      isLegacyScope: scopeInfo.isLegacy,

      // data
      tenants,
      activeTenant,
      activeTenantId,
      viewingTenantId,
      viewingTenant:
        scopeInfo.isBuilding && viewingTenantId
          ? tenants.find((t) => String(t.id) === String(viewingTenantId)) ?? null
          : null,
      settings,
      buildingSettings,
      tenantOverride,
      overridableKeys,
      gatePolicy,
      branding,

      // state
      loading,
      error,

      // actions
      setViewingTenant,
      clearViewingTenant,
      refresh: () => Promise.all([loadTenants(), loadSettings()]),
      can,
      canReach,
      effectiveSetting,
      saveTenantBranding: async (tenantId, nextBranding) => {
        const response = await api.patch(`/tenants/${tenantId}`, { branding: nextBranding });
        await loadTenants();
        return response.data?.tenant ?? null;
      },
    }),
    [
      scopeInfo,
      tenants,
      activeTenant,
      activeTenantId,
      viewingTenantId,
      settings,
      buildingSettings,
      tenantOverride,
      overridableKeys,
      gatePolicy,
      branding,
      loading,
      error,
      setViewingTenant,
      clearViewingTenant,
      loadTenants,
      loadSettings,
      can,
      canReach,
      effectiveSetting,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

TenantProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used inside a TenantProvider.");
  }
  return context;
}

export { SCOPES };
export default TenantContext;
