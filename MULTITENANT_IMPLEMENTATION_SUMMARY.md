# Multi-Tenant Implementation — Step-by-Step Summary

The Swift Entry VMS prototype now runs on seeded demo data and enforces tenant isolation through the same path the real Laravel API will use. The app is live at **http://127.0.0.1:5173**.

## Step 1 — Tenancy Vocabulary and Rules

### Files

- `src/tenancy/constants.js`
- `src/tenancy/scope.js`

### What it does

- Defines building vs tenant scope, shared vs tenant roles, canonical visit statuses, permissions, and overridable settings.
- Centralizes the actual security rules:
  - Building users can reach every tenant.
  - Tenant users can only reach their own tenant.
  - A `tenant_id` request parameter is a filter, never an identity claim.
  - Tenant users with no `tenant_id` are invalid.
  - Suspended tenants are blocked.
- Pure functions are shared by the UI, mock API, and tests.

## Step 2 — Deterministic Demo Data

### File

- `src/mocks/seed.js`

### What it does

- Seeds one building, four tenants, 19 users, visitors, visits, audit rows, notifications, and settings.
- Includes deliberate isolation traps:
  - Ada Lovelace exists at both Acme and Globex.
  - One notification is mis-tagged to Globex for an Acme admin.
  - Initech is suspended.
- Demo accounts all use password: **`Demo1234!`**

## Step 3 — Mock API with Server-Side Tenant Enforcement

### Files

- `src/mocks/db.js`
- `src/mocks/adapter.js`
- `src/mocks/index.js`

### What it does

- Serves the existing API endpoints from seeded data through a custom axios adapter.
- Derives identity from `mock-token-<userId>`.
- Rejects cross-tenant detail requests with **403**.
- Ignores tenant-widening attempts from tenant users.
- Rejects login for disabled users and suspended tenants.
- Supports login, tenants, users, visits, visitors, notifications, settings, dashboards, audit, and walk-in registration.
- Registration immediately notifies the host — there is no approval step.

## Step 4 — API Client Boundary

### File

- `src/context/api.jsx`

### What it does

- Switches to the mock adapter when `VITE_USE_MOCK_API=true`.
- Keeps every page calling the same endpoints.
- Adds the building-admin tenant filter to GET requests.
- Dispatches global `auth:unauthorized` and `tenant:suspended` events.

This is why the tenant switcher works without rewriting every screen.

## Step 5 — Authentication

### File

- `src/context/AuthContext.jsx`

### What it does

- Adds the single `POST /auth/login` contract and `GET /me`.
- Keeps the legacy five-probe login as a fallback.
- Normalizes `scope`, `tenant_id`, `tenant`, and `permissions`.
- Adds `demoLogin` and `refreshUser`.
- Handles global 401/suspension events.
- Clears the tenant filter when switching personas.
- Skips reCAPTCHA in mock mode so the demo works offline.

## Step 6 — Tenant Runtime Context

### Files

- `src/context/TenantContext.jsx`
- `src/hooks/useTenantScope.js`

### What it does

- Loads the tenants and settings the user may see.
- Tracks the building admin's `viewingTenantId`.
- Exposes `activeTenant`, `branding`, `effectiveSetting`, `can`, and `canReach`.
- Provides list-filtering helpers for screens.
- Resets the filter when the signed-in identity changes.

## Step 7 — Route Guard

### Files

- `src/customRoute/PrivateRoute.jsx`
- `src/pages/Forbidden.jsx`

### What it does

- Checks authentication, role, and scope.
- Blocks tenant users without a tenant.
- Blocks suspended tenants.
- Blocks tenant admins from the building admin workspace.
- Shows a clear "Access denied / Different workspace" page instead of leaking data.

## Step 8 — Tenant-Aware UI

### Files

- `src/components/tenancy/TenantBadge.jsx`
- `src/components/tenancy/TenantSwitcher.jsx`
- `src/components/tenancy/ScopeBanner.jsx`
- `src/components/tenancy/TenantGuard.jsx`
- `src/pages/admin/include/AdminSidebar.jsx`
- `src/pages/admin/include/AdminTopHeader.jsx`
- `src/layout/AdminLayout.jsx`

### What it does

- Adds a tenant badge and tenant filter.
- Shows a banner whenever a building admin is viewing a filtered tenant.
- Makes the sidebar scope-driven:
  - Building admins see the full menu.
  - Tenant admins see only tenant-safe links.
- Tenant admins get no building settings or security/self-service links.

## Step 9 — Tenant Dashboard

### File

- `src/pages/TenantHome.jsx`

### What it does

- Provides a `/tenant-dashboard` workspace for tenant admins.
- Shows tenant-specific visit counts and recent visits.
- Links to guest registration, visitor history, and staff management.

## Step 10 — Dev Persona Switcher and Isolation Screen

### Files

- `src/components/dev/DevTenantPanel.jsx`
- `src/components/dev/DevTenantDock.jsx`
- `src/pages/DevIsolationCheck.jsx`

### What it does

- Adds a floating "Demo personas" panel.
- Lets you switch instantly between building admin, shared front desk, security, kiosk, and tenant admins.
- Includes a data reset button.
- Adds `/dev/isolation`, which runs the same isolation matrix as `npm run test:tenancy`.

## Step 11 — App Wiring

### File

- `src/App.jsx`

### What it does

- Wraps the app in:
  - `AuthProvider`
  - `TenantProvider`
  - `NotificationProvider`
- Adds:
  - `/tenant-dashboard/*`
  - `/forbidden`
  - `/dev/isolation`
- Guards `/admin-dashboard` as building scope.
- Guards `/tenant-dashboard` as tenant scope.
- Removes the stray module-level route.

## Step 12 — Notifications

### File

- `src/context/NotificationContext.jsx`

### What it does

- Fixes the latest-unread response shape.
- Resets notification state when the user changes.
- Skips Echo/WebSocket subscription in mock mode.
- Adds `markAllAsRead` as an alias.

## Step 13 — Configuration

### Files

- `.env`
- `.env.example`
- `package.json`

### Added

```env
VITE_USE_MOCK_API=true
VITE_SINGLE_LOGIN=true
VITE_MOCK_SCENARIO=normal
```

Script:

```json
"test:tenancy": "node --test scripts/test-tenancy.mjs"
```

## Step 14 — Verification

Passed:

- `npm run test:tenancy`
- `npm run build`
- Scoped ESLint: **0 errors**
- Mock API smoke test:
  - building admin sees all tenants
  - Acme admin cannot widen via `tenant_id`
  - cross-tenant detail returns **403**
  - Acme notifications exclude Globex
  - tenant branding overrides resolve correctly
  - suspended tenant login is blocked
  - walk-in tenant is derived from the host
  - pre-registration notifies the host
- Headless Chrome smoke test:
  - tenant admin lands on `/tenant-dashboard`
  - building admin blocked from tenant workspace
  - building admin lands on `/admin-dashboard`
  - tenant filter appears and works
  - filtered visitor list shows Acme rows and hides Globex rows

Also fixed during testing:

- suspended accounts could previously obtain a token
- cross-tenant detail access returned 500 instead of 403
- the visitors log crashed because the mock response shape did not match the page
- stale tenant filters survived persona switching
- tenant filter was not being applied to existing page requests

## Step 15 — How to Use the Prototype

Open:

**http://127.0.0.1:5173**

Demo password for every account:

**`Demo1234!`**

| Persona | Email |
| --- | --- |
| Building admin | `building.admin@swiftentry.test` |
| Shared front desk | `reception@swiftentry.test` |
| Security | `security@swiftentry.test` |
| Self-service kiosk | `kiosk@swiftentry.test` |
| Acme tenant admin | `admin@acme.test` |
| Northwind tenant admin | `admin@northwind.test` |
| Globex tenant admin | `admin@globex.test` |
| Acme staff | `staff1@acme.test` |

After login, use the floating **Demo personas** button to switch identities. Use the sidebar **Tenant filter** as the building admin. Visit `/dev/isolation` to see the isolation matrix.
