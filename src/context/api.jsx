// Last updated: 2026-11-04
import axios from "axios";
import { isMockEnabled, mockAdapter } from "../mocks/index.js";

const configuredBase = import.meta.env.VITE_API_BASE_URL || "https://api.theswiftentry.com/api";
const normalisedBase = /\/api\/?$/.test(configuredBase)
  ? configuredBase.replace(/\/$/, "")
  : `${configuredBase.replace(/\/$/, "")}/api`;

export const API_BASE_URL = normalisedBase;
export const API_ORIGIN = normalisedBase.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// The prototype can run entirely on seeded data. Page code does not change:
// only the transport is swapped.
if (isMockEnabled) {
  api.defaults.adapter = mockAdapter;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // This is a *filter* for building-level users, never an identity claim.
  // Tenant users are pinned by the server to their token's tenant, which
  // ignores this parameter entirely.
  //
  // Existing pages call `api.get` without extra options, so the filter is
  // applied to every GET while a building admin is viewing a tenant. That keeps
  // the switcher functional without rewriting each screen.
  const viewingTenantId = sessionStorage.getItem("viewingTenantId");
  const isGet = String(config.method ?? "get").toLowerCase() === "get";
  if (viewingTenantId && (config.tenantScoped || isGet)) {
    config.params = { ...(config.params || {}), tenant_id: viewingTenantId };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401) {
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { message: error.response?.data?.message ?? "Your session has expired." },
        })
      );
    }

    if (status === 403 && code === "TENANT_SUSPENDED") {
      window.dispatchEvent(
        new CustomEvent("tenant:suspended", {
          detail: { message: error.response?.data?.message ?? "This tenant has been suspended." },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;
