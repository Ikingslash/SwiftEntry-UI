# VMS Frontend — Technical Reference

> **Repo:** `vms-frontend-` · **Package name:** `guest-management` (private, v0.0.0) · **ESM** (`"type": "module"`)
> **HEAD:** `6b7c6d3 feat: enhance auth handling, update design tokens, and clean up components`
> **Branches:** `main`, `origin/main`, `origin/VMS_APP`, `origin/browncon`
> **Purpose:** a complete technical map of the codebase so you can make UI + functional changes without breaking things.

---

## Table of Contents

1. [What this app is](#1-what-this-app-is)
2. [Running it locally](#2-running-it-locally)
3. [Tech stack](#3-tech-stack)
4. [Directory map](#4-directory-map)
5. [Application shell & routing](#5-application-shell--routing)
6. [Authentication & authorization](#6-authentication--authorization)
7. [Data layer](#7-data-layer)
8. [Realtime & push notifications](#8-realtime--push-notifications)
9. [Design system (the truth)](#9-design-system-the-truth)
10. [Feature modules by role](#10-feature-modules-by-role)
11. [API endpoint catalogue](#11-api-endpoint-catalogue)
12. [Build, Docker, nginx, CI](#12-build-docker-nginx-ci)
13. [Environment variables](#13-environment-variables)
14. [Lint baseline](#14-lint-baseline)
15. [Known issues register (prioritized)](#15-known-issues-register-prioritized)
16. [Dead code & duplication inventory](#16-dead-code--duplication-inventory)
17. [Pre-flight checklist for the UI + functional update](#17-pre-flight-checklist-for-the-ui--functional-update)
18. [Conventions & gotchas](#18-conventions--gotchas)

---

## 1. What this app is

A **Visitor Management System (VMS)** PWA. Five user roles, each with its own dashboard:

| Role string | Who | Dashboard root |
|---|---|---|
| `admin` | System administrator | `/admin-dashboard` |
| `staff` | Employee / host | `/staff-dashboard` |
| `front_desk` | Receptionist | `/front-desk-dashboard` |
| `security` | Security gate officer | `/security-dashboard` |
| `self_service` | Visitor / walk-in | `/visitor-dashboard` |

Core domain: **guests** → **visits** (scheduled / pending / completed / cancelled / missed) → **notifications** → **reports/analytics**.

The backend is a **Laravel** API (Sanctum bearer tokens, Laravel Echo + Pusher for realtime). This repo is **frontend only** — there is no backend source here.

---

## 2. Running it locally

```bash
npm install
npm run dev                        # http://localhost:5173
npm run dev -- --host 127.0.0.1    # bind to 127.0.0.1 explicitly
npm run build                      # -> dist/
npm run preview                    # serve dist/ on :4173
npm run lint                       # eslint (flat config)
```

### ⚠️ The `--host` flag trap (this is probably what bit you)

Vite's CLI signature is `vite [root]`. A **bare** argument is the **project root directory**, not the host:

| Command | What actually happens |
|---|---|
| `npm run dev -- --host 127.0.0.1` | ✅ Serves the project at `http://127.0.0.1:5173` |
| `npm run dev -- 127.0.0.1` | ❌ **Serves the directory `127.0.0.1`** (which doesn't exist) — this is what your earlier `vite 127.0.0.1` processes did |
| `npm run dev -- --host 0.0.0.0` | Binds all interfaces (use for LAN/phone testing) |

### ⚠️ The API does **not** point at your local backend

`src/context/api.jsx:6` hardcodes the **production** API host. Your `.env` says `VITE_API_BASE_URL=http://127.0.0.1:8000` but **nothing reads that variable** — it is dead config.

```
src/context/api.jsx:6          baseURL: "https://api.theswiftentry.com/api"   // ACTIVE
src/context/api.jsx:5          // baseURL: "http://127.0.0.1:8000/api"        // commented
src/context/AuthContext.jsx:282  baseURL: "https://api.theswiftentry.com"    // Sanctum CSRF (hardcoded)
src/context/AuthContext.jsx:414  baseURL: "https://api.theswiftentry.com"    // Sanctum CSRF (hardcoded)
```

There is **no `server.proxy` block** in `vite.config.js`, so nothing is proxied locally. To point dev at a local backend you must either edit those two files or add a proxy + env-driven baseURL (recommended — see §17).

### Environment

| Tool | Version in use | Requirement |
|---|---|---|
| Node | v22.14.0 | **Node ≥ 18.18** (Vite 6 wants `^18 \|\| ^20 \|\| >=22`; ESLint 9 wants `^18.18 \|\| ^20.9 \|\| >=21.1`) |
| npm | 11.4.2 | — |
| Docker image | `node:20` | Bun is used as the package manager inside the image |

---

## 3. Tech stack

**Runtime:** React **19.0.0**, ReactDOM 19, `react-router-dom` **7.1.5**, Vite **6.1.0**, `@vitejs/plugin-react` 4.3.4.

| Category | Packages |
|---|---|
| Routing | `react-router-dom@7.1.5` |
| HTTP | `axios@1.7.9` |
| UI framework | `bootstrap@5.3.3` (CSS via npm import in `main.jsx`; **JS bundle via CDN** in `index.html`) |
| Toasts | `react-toastify@11.0.5` (used in 106 files) |
| Charts | `recharts@2.15.1` (admin dashboard + reports only) |
| QR | `react-qr-code@2.0.15` (11 files), `html5-qrcode@2.3.8` (security QR scanner) |
| PDF | `html2pdf.js@0.10.3` (visitor badge PDF, 8 files) |
| Dates | `date-fns@4.1.0` (7 admin tables only) |
| Realtime | `laravel-echo@2.2.0` + `pusher-js@8.4.0` |
| Push | `firebase@12.1.0` (FCM) |
| CAPTCHA | `react-google-recaptcha-v3@1.11.5` |
| Icons | `lucide-react@0.536.0` (10 files), `react-icons@5.4.2` (6 files) |
| Select | `react-select@5.10.2` (1 file — visitor walk-in only) |
| Toggle | `@headlessui/react@2.2.7` (`Switch` in 3 admin settings pages) |
| PWA | `vite-plugin-pwa@1.1.0` (Workbox) |

**Dead dependencies (installed, zero imports):** `@reduxjs/toolkit`, `react-redux`, `redux`, `react-to-print`.
There is **no Redux** in this app — state is Context + local component state. Don't reach for Redux.

**No TypeScript.** 0 `.ts`/`.tsx` files, no `tsconfig.json`, no `jsconfig.json`. `@types/react` is declared but unused.

**Source volume:** 167 JS/JSX files under `src/` (165 `.jsx` + 2 `.js`) + 55 assets.

---

## 4. Directory map

```
vms-frontend-/
├── index.html              61 L   fonts/CDN scripts/Google Translate/reCAPTCHA bootstrap
├── vite.config.js          53 L   esbuild drop, react(), VitePWA, @ alias  (NO server/build block)
├── eslint.config.js        42 L   ESLint 9 flat config
├── package.json            51 L
├── .env                     8 L   ⚠️ COMMITTED TO GIT
├── Dockerfile              25 L   node:20 + bun build -> nginx:alpine
├── nginx.conf              16 L   SPA fallback via try_files
├── .github/workflows/deploy.yml  63 L  rsync to VPS (⚠️ excludes public/ and .env)
├── public/                        22 files (~21.5 MB) — copied verbatim to dist/
│   ├── image.png           7 KB   site logo  (⚠️ referenced with relative paths → breaks on nested routes)
│   ├── video3.mp4          17.8 MB sign-in background video
│   ├── Group2.png          favicon
│   ├── pwa-192x192.png / pwa-512x512.png / apple-touch-icon.png
│   ├── images/*.png        11 files
│   └── firebase-messaging-sw.js   ⚠️ NEVER REGISTERED (Workbox sw.js is used instead)
└── src/
    ├── main.jsx            31 L   entry: BrowserRouter + registerSW + bootstrap CSS
    ├── App.jsx            227 L   ALL routes + provider nesting
    ├── App.css             58 L   (only Google-Translate banner suppression + dead Vite template CSS)
    ├── index.css          347 L   ⚠️ DESIGN TOKENS — NOT IMPORTED (main.jsx:7 is commented)
    ├── components/         UserAvatar.jsx
    ├── context/            api.jsx, AuthContext.jsx, AuthContext1.jsx*, echo.js,
    │                       firebase.jsx, NotificationContext.jsx, FlashProvider.jsx*   (* = dead)
    ├── customRoute/        PrivateRoute.jsx, PublicRoute.jsx*  (* = broken + unused)
    ├── layout/             AdminLayout, StaffLayout, FrontDeskLayout, SecurityLayout,
    │                       VisitorLayout, FlashMessage.jsx*
    ├── pages/              ~190 files — see §10
    └── utils/              avatarUtils.js
```

---

## 5. Application shell & routing

### 5.1 Provider nesting (`src/App.jsx:74-224`)

```
React.StrictMode                        (main.jsx:26)
└─ BrowserRouter                         (main.jsx:27)
   └─ GoogleReCaptchaProvider             (App.jsx:76)  key 6LfIP1AsAAAAAL06_8oGFfAquyg879TXvZ7fYhb7
      └─ AuthProvider                    (App.jsx:85)   src/context/AuthContext.jsx
         └─ NotificationProvider          (App.jsx:86)   src/context/NotificationContext.jsx
            └─ <Routes>                  (App.jsx:87)
   └─ <ToastContainer position="top-right" autoClose={5000}>  (App.jsx:221)
```

> **`ToastContainer` is mounted once at `App.jsx:221`** and several pages mount their *own* `ToastContainer` too (e.g. `AdminRegister.jsx:83`). You can end up with duplicate toasts.

### 5.2 Route table (`src/App.jsx:87-218`)

**Public**

| Path | Component | Line |
|---|---|---|
| `/` | `SignIn` | 89 |
| `/admin-register` | `AdminRegister` | 90 |
| `/loading` | `Loading` | 91 |
| `/password-success` | `PasswordSuccessAlert` | 92 |
| `/forgot-password` | `ForgotPassword` | 93 |
| `/verify-account` | `VerifyAccount` | 94 |
| `/set-new-password` | `SetNewPassword` | 95 |
| `/setup-password` | `SetupPassword` (staff) | 96 |
| `/frontdesk-setup-password` | `FrontdeskSetupPassword` | 97 |
| `/security-setup-password` | `SecuritySetupPassword` | 98 |

**Protected** — each is `<PrivateRoute requiredRole="X"><Layout/></PrivateRoute>` with nested children

| Base path | Layout | `requiredRole` (⚠️ ignored — see §6.3) | Children |
|---|---|---|---|
| `/staff-dashboard/*` | `StaffLayout` | `staff` | `index`→`Dashboard`, `new-guest`, `manage-guest`, `notifications`, `profile`, `staff-settings` |
| `/front-desk-dashboard/*` | `FrontDeskLayout` | `front_desk` | `index`→`FrontDeskDashboard`, `register-guest`, `history`, `notifications`, `manage-frontdesk-guests`, `profile`, `front-desk-settings`, `confirm-visitor` |
| `/admin-dashboard/*` | `AdminLayout` | `admin` | `index`→`AdminDashboard`, `visitors`, `staffs`, `admins`, `frontdesk`, `security`, `self-service`, `analytical-report`, `settings`, `new-guest`, `profile`, `notifications`, `alerts`, `updates` |
| `/security-dashboard/*` | `SecurityLayout` | `security` | `index`→`SecurityDashboard`, `generate-qr-code`, `generate-by-unique-code`, `register-new-guest`, `history`, `notifications`, `manage-security-guests`, `profile`, `security-settings` |
| `/visitor-dashboard/*` | *(none — page is its own shell)* | `self_service` | `VisitorSelfServiceDashboard` |
| `/visitor-dashboard/register-visit` | — | `self_service` | `VisitorWalkInRegistration` |
| `/visitor-dashboard/profile` | — | `self_service` | `VisitorProfile` |

### 5.3 🚨 Stray top-level `<Route>` (`src/App.jsx:71`)

```jsx
71: <Route path="/admin/new-guest" element={<AdminNewGuest />} />   // ← OUTSIDE <Routes>, outside App()
```

This is a bare JSX expression at **module scope**. It never mounts. The live route is `/admin-dashboard/new-guest` (`App.jsx:161`). **Safe to delete.** It also means `/admin/new-guest` is a blank page.

### 5.4 Layouts

| Layout | Lines | Structure |
|---|---|---|
| `AdminLayout.jsx` | 15 | `<div className="">` → `<Outlet/>`. `<FlashMessage/>` **commented out** |
| `StaffLayout.jsx` | 14 | same |
| `FrontDeskLayout.jsx` | 13 | same (has a malformed `className="#"` at line 6) |
| `SecurityLayout.jsx` | 13 | same |
| `VisitorLayout.jsx` | 142 | **The only real layout.** Takes `{ children }` (not `<Outlet/>`), renders its own navbar + `<div style={{marginTop:"80px", padding:"20px"}}>` |

> **All navigation lives in per-dashboard `NavBar.jsx` components**, not in the layouts. The 4 dashboard layouts are empty passthroughs. If you want to change nav structure, edit `src/pages/<role>/include/NavBar.jsx`.

### 5.5 The Google Translate widget (`index.html:25-59`)

`index.html` injects the Google Translate script with languages `en,ha,yo,ig,ff,es,fr,ar`, hides the banner via a 1s polling loop, and `App.css` hides `.goog-te-*` elements. `src/pages/admin/LanguageSwitcher.jsx` exists but is **not imported anywhere**.

---

## 6. Authentication & authorization

### 6.1 The provider — `src/context/AuthContext.jsx` (631 lines)

**State (5 pieces):**

```jsx
const [user, setUser]   = useState(() => { /* lazily parsed from localStorage "user" */ });
const [loading, setLoading] = useState(true);
const [token, setToken]   = useState(localStorage.getItem("token") || null);
const [role, setRole]     = useState(localStorage.getItem("userRole") || null);
const [resetFlowData, setResetFlowData] = useState({ email: null, resetToken: null, userRole: null });
```

**Context value (lines 606-624):** `user`, `token`, `role`, `login`, `updateUser`, `logout`, `loading`, `forgotPassword`, `verifyOtp`, `resetPassword`, `resetFlowData`.

> There is **no `isAuthenticated`**, no `isAdmin`/`isStaff` helper, and no role-guard helper anywhere in the codebase (grep: 0 hits).

### 6.2 The `AUTH_PATHS` map (`AuthContext.jsx:10-46`)

| Role | login | forgot | verify | reset | profile |
|---|---|---|---|---|---|
| `admin` | `/admin/login` | `/admin/forgot-password` | `/admin/verify-otp` | `/admin/reset-password` | `/admin/profile` |
| `staff` | `/staff/auth/login` | `/staff/auth/forgot-password` | `/staff/auth/verify-otp` | `/staff/auth/reset-password` | `/staff/profile` |
| `security` | `/security/auth/login` | `/security/auth/forgot-password` | `/security/auth/verify-otp` | `/security/auth/reset-password` | `/security/user-profile` |
| `front_desk` | `/front-desk/auth/login` | `/front-desk/auth/forgot-password` | `/front-desk/auth/verify-otp` | `/front-desk/auth/reset-password` | `/front-desk/profile` |
| `self_service` | `/self-service/login` | `null` | `null` | `null` | `/self-service/profile` |

### 6.3 🚨 Login works by **probing every role endpoint**

`login()` (`AuthContext.jsx:273-374`) does **not** read the role from the server. It loops:

```jsx
const roles = ["admin", "staff", "security", "front_desk", "self_service"];  // :274
for (const role of roles) {
  const recaptchaToken = await executeRecaptcha('login');   // fresh token per attempt (v3 = single-use)
  const response = await api.post(AUTH_PATHS[role].login, { email, password, recaptcha_token });
  if (response.data.token) {
    const userWithRole = { ...rawUser, role, id: rawUser.id || rawUser.user_id || null };  // role INJECTED locally
    ...
  }
}
```

**The first endpoint that returns a token wins.** Consequences you must know before touching login:

- **Up to 5 HTTP round-trips + 5 reCAPTCHA token fetches** for a single sign-in.
- A **wrong password for an `admin` account** costs 5 failed requests before the error surfaces.
- The **role is client-assigned**, not server-asserted. The backend must independently authorize (it does — endpoints are role-prefixed).
- Order matters: `admin` is probed first, `self_service` last.

**After success (`AuthContext.jsx:352-363`):**

```jsx
localStorage.setItem("token", response.data.token);
localStorage.setItem("userRole", role);
localStorage.setItem("user", JSON.stringify(userData));
api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
navigate(dashboard);   // role → /admin-dashboard | /staff-dashboard | /security-dashboard
                      //       | /front-desk-dashboard | /visitor-dashboard
```

### 6.4 🚨 `PrivateRoute` ignores `requiredRole` entirely

```jsx
// src/customRoute/PrivateRoute.jsx  (19 lines — verified)
export default function PrivateRoute({ children }) {   // ← requiredRole NOT destructured
  const { user } = useAuth();
  const location = useLocation();
  if (user === undefined) { return null; }             // dead: user is null, never undefined
  else if (user) { return children; }                  // ← truthiness only
  else { return <Navigate to="/" state={{ next: url }} />; }
}
```

**There is no client-side role isolation.** Any authenticated user can navigate to any dashboard by URL. The 7 `requiredRole` props in `App.jsx` are dead.

Also note:
- `loading` is never consulted → on a hard refresh the protected children render immediately from the cached `localStorage` user, before the server profile fetch resolves.
- `PublicRoute.jsx` is **broken and unused**: it imports `useAuth` from `'../../contexts/AuthProvider'` (path doesn't exist), references roles `patient`/`facility`/`doctor` from a different project, and reads a non-existent `authData` field. **There is currently no "redirect logged-in users away from `/`" behaviour.**

### 6.5 `normalizeUser()` (`AuthContext.jsx:48-127`)

Two branches depending on whether `rawUser.profile` exists.

```jsx
{
  id, name, email, role, department, profile_picture, company_name, phone,
  ...rawUser        // ← spread LAST, so raw fields OVERRIDE the normalized ones
}
```

⚠️ The `...rawUser` spread at lines 95-96 / 123 can overwrite the carefully-normalized `id`/`role`/`name`. If you touch normalization, keep this in mind.

### 6.6 Logout (`AuthContext.jsx:381-391`)

```jsx
setUser(null); setToken(null); setRole(null);
localStorage.removeItem("token"); removeItem("userRole"); removeItem("user");
delete api.defaults.headers.common["Authorization"];
navigate("/");
```

**No backend revocation call.** Purely client-side. `AuthContext1.jsx:152` (dead file) navigates to `"/login"` — a route that **does not exist**.

### 6.7 🔴 Sensitive data in logs

`AuthContext.jsx` has **34 console statements**. Two leak credentials:

- `AuthContext.jsx:545-551` — logs the **first 10 chars of the password-reset token**.
- `AuthContext.jsx:578-583` — re-parses and logs the **raw request body including the plaintext password** on reset failure.

> `vite.config.js:7-9` sets `esbuild.drop: ['console','debugger']`, which **strips console calls in `.jsx` files even in dev** (esbuild's default filter excludes only plain `.js`). So `console.log` in any `.jsx` file is invisible — use `window.console.log` or a `.js` file while debugging. **This also means the leaks above never reach production bundles.**

### 6.8 `localStorage` key inventory (5 keys, whole app)

| Key | Written | Read | Removed | Notes |
|---|---|---|---|---|
| `token` | `AuthContext.jsx:352` | `api.jsx:18` (per-request ✅), `AuthContext.jsx:141,154`, `echo.js:20` (once at load ⚠️), `AnalyticalAndReport.jsx:103` | `AuthContext.jsx:386` | Sanctum bearer token |
| `userRole` | `AuthContext.jsx:353` | `AuthContext.jsx:142,155` | `:387` | Set from the *successful endpoint*, not the server |
| `user` | `AuthContext.jsx:354,237,397` | `AuthContext.jsx:56,133,156` + 4 register pages | `:388` | Normalized user JSON |
| `user_id` | **NEVER WRITTEN** | `staffDashboard/Notifications.jsx:122,130`, `securityDashboard/SecurityNotifications.jsx:122,130` | — | ⚠️ Orphan. Always `null` → those pages subscribe to channel `notifications.null` |
| `selectedLanguage` | `admin/LanguageSwitcher.jsx:26`, `admin/settings/GeneralSettings.jsx:54` | `LanguageSwitcher.jsx:7`, `GeneralSettings.jsx:58` | never | UI pref, unrelated to auth |

No `sessionStorage`. No `document.cookie`. No `localStorage.clear()`.

---

## 7. Data layer

### 7.1 The single axios instance — `src/context/api.jsx` (25 lines)

```jsx
const api = axios.create({
  baseURL: "https://api.theswiftentry.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");       // re-read per request ✅
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- **This is the only axios instance in the codebase.** `axios.create` appears exactly once.
- `withCredentials: true` → the Laravel backend must send `Access-Control-Allow-Credentials: true` and a **non-`*`** `Access-Control-Allow-Origin` for the Sanctum CSRF cookie to work in dev.
- `import.meta.env` is **not used in this file** — `VITE_API_BASE_URL` is dead.
- There is **no response interceptor** → no global 401 handling / auto-logout.

### 7.2 ⚠️ Missing leading slashes break ~20 endpoints

With `baseURL = "https://api.theswiftentry.com/api"`, axios resolves a **relative** path by replacing the last URL segment. So `api.get("admin/staff")` hits `https://api.theswiftentry.com/admin/staff` — **not** `.../api/admin/staff`.

Affected (partial list): `admin/staff*`, `admin/frontdesk*`, `admin/security*`, `admin/admins*`, `staff/profile`, `staff/settings`, `staff/guests/staff-pending-visits`, `front-desk/profile`, `front-desk/frontdesk_setting`, `front-desk/guests/frontdesk-pending-visits`, `front-desk/guests/visit/${id}/approve-frontdesk-host`, `security/settings`, `security/history`, `security/guest/host-pending-visits`, `security/guest/visit/${id}/approve-host`.

> **If you touch the API layer, grep for `api.get("` / `api.post("` without a leading slash.** This is probably a batch of real 404s in production right now.

### 7.3 `NotificationContext.jsx` (166 lines)

Provides: `notifications`, `unreadCount`, `latestUnread`, `fetchNotificationCount`, `fetchLatestUnread`, `addNotification`, `clearNotifications`, `markNotificationsAsRead`, `markAsRead`, `setUnreadCount`.

**Role → API prefix (`getRolePrefix`, lines 15-30):** `staff`→`staff`, `front_desk`→`front-desk`, `security`→`security`, `admin`→`admin`, **`self_service`→`null` (no notifications at all for visitors)**.

**Endpoints:**
- `GET /{prefix}/notifications/unread-count` (`:46`)
- `GET /{prefix}/notifications/latest-unread` (`:60`)
- `POST /{prefix}/notifications/mark-all-read` (`:77`)
- `POST /{prefix}/notifications/mark-read` body `{ notification_id }` (`:89`)

⚠️ `isUnauthorized` (`:41`) latches `true` on any 401 and is **never reset** → after one 401 all further notification fetches are permanently skipped.

⚠️ All four NavBars destructure **`markAllAsRead`** from `useNotifications()`, but the provider exposes **`markNotificationsAsRead`** → `markAllAsRead` is `undefined`. It survives only because it's used solely as a `useEffect` dependency. Calling it throws.

---

## 8. Realtime & push notifications

### 8.1 Laravel Echo + Pusher — `src/context/echo.js` (26 lines)

```js
const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,               // 8a728cd26ae422539269
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,       // ap2
  wsHost: import.meta.env.VITE_ECHO_HOST.replace(/^https?:\/\//, ""),  // "127.0.0.1"
  wsPort: import.meta.env.VITE_ECHO_PORT,                 // "6001" (string!)
  wssPort: import.meta.env.VITE_ECHO_PORT,                // "6001" (string!)
  forceTLS: import.meta.env.VITE_PUSHER_FORCE_TLS === "true",  // true
  enabledTransports: ["ws", "wss"],
  authEndpoint: `${import.meta.env.VITE_BACKEND_URL}/api/broadcasting/auth`,
  auth: { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, ... } },  // ⚠️
});
```

**Three independent problems:**

1. 🔴 **`Authorization` is captured once at module load** (line 20). On any page load before login it becomes the literal string `"Bearer null"`, and it never refreshes after login or token rotation. **Fix:** `Authorization: () => \`Bearer ${localStorage.getItem("token")}\`` (laravel-echo supports a function).
2. 🔴 **`wsHost` is `127.0.0.1`** (from `VITE_ECHO_HOST=http://127.0.0.1:8000`). In a browser `127.0.0.1` = *the visitor's own machine* → the socket can never connect in any deployed environment. Combined with `wsPort: "6001"` (a string) and `forceTLS: true`.
3. The instance is created at **module scope**, so it's constructed even when realtime isn't used, and `window.Pusher = Pusher` (line 5) is a global side effect.

**This is why `NotificationContext` carries a 3-second polling fallback** (`:125-142`) — the WebSocket path doesn't work, so polling does all the real work.

### 8.2 Channel & event contract

- **Channel:** `notifications.{userId}` — private channel (`echo.private(...)`)
- **Event:** `.new-notification` (leading dot = Laravel broadcast convention)
- **Payload:** `{ notification: {...}, unreadCount?: number }`

Subscribed in three places:
- `NotificationContext.jsx:109-120` → `notifications.${user.id}` ✅ (correct)
- `staffDashboard/Notifications.jsx:122-130` → `notifications.${localStorage.getItem("user_id")}` ❌ (always `null`)
- `securityDashboard/SecurityNotifications.jsx:122-130` → same ❌

### 8.3 FCM push — `src/context/firebase.jsx` (68 lines)

- `initializeApp` + `getMessaging` run at **module import time** (lines 23-24) → throws if `window.Notification` is unavailable.
- `requestForToken()` → `Notification.requestPermission()` → `getToken(messaging, { vapidKey })` → **`POST /save-fcm-token`** (line 34).
- `onMessageListener()` → `toast.info(payload.notification.body)`.
- **Used by 9 files** — all the "Register/New Guest" pages.
- Firebase `apiKey` (line 8) and **VAPID key** (line 19) are hardcoded in source.
- ⚠️ `public/firebase-messaging-sw.js` has a **different `appId`** (`...0781a`) and `measurementId` (`G-ZF4MTBLW8Z`) than `firebase.jsx` (`...0787e` / `G-J5P7B1C8D9`) — and the SW is never registered anyway.

---

## 9. Design system (the truth)

### 9.1 🔴 `src/index.css` is **NOT loaded**

```js
// src/main.jsx
import "bootstrap/dist/css/bootstrap.min.css";  // line 2  ← real Bootstrap CSS source
import "./App.css";                             // line 6  ← only Google-Translate CSS
// import "./index.css";                        // line 7  ← COMMENTED OUT
```

`index.css` (347 lines) holds the *entire* design-token system — but **none of it reaches the browser**. Consequently:

- **No CSS variables are available.** `--color-primary`, `--radius-md`, `--shadow-lg`, `--space-*`, `--transition-*` are all dead.
- The `.signin-*` classes (lines 197-347) are dead → **the sign-in page relies on its own inline styles / Bootstrap**.
- **The Inter webfont is never loaded** — the only `@import` of Google Fonts lives in `index.css:1`. `App.css` has no `font-family`. So the app renders in the system sans stack.
- The `.stat-card`, `.card-modern`, `.input-modern`, `.btn-modern`, `.skeleton`, `.animate-fade-in` utilities are all dead.

### 9.2 What styling is actually in effect

| Layer | Reality |
|---|---|
| **Bootstrap 5.3.3** | CSS imported from npm (`main.jsx:2`); **JS bundle from CDN** (`index.html:10`, v5.3.0, unpinned, render-blocking) |
| **bootstrap-icons** | CSS from jsDelivr CDN (`index.html:8`), unpinned version |
| **Inline styles** | **Dominant.** Hard-coded hex everywhere |
| **Tailwind-ish class names** | Used but **inert** — e.g. `FlashMessage.jsx` uses `bg-[#FFFFFF]`, `w-[300px]`, `font-poppins`, `text-[18px]`. There is no Tailwind. |

**The two de-facto brand colours (hard-coded, not tokens):**

| Colour | Where |
|---|---|
| `#053561` (navy) | `VisitorLayout.jsx:32`, all 4 NavBars (`:34`), `VisitorWalkInRegistration.jsx` (5×), `SecurityDashboard12.jsx:195` |
| `#F5FAFE` (page bg) | `index.html:19` (`<body>`), `Loading.jsx:7`, `AdminRegister.jsx:89` |

Other frequent: `#0d6efd` (Bootstrap primary / PWA `theme_color`), `#007bff`.

### 9.3 The token file exists but is dormant — `src/index.css:3-39`

If you re-enable it, these are the tokens:

```css
:root {
  --primary: #007bff;  --secondary: #6c757d;
  --background: #ffffff;  --highlight: #e6f2ff;

  --color-primary: #1a6fc4;  --color-primary-dark: #125599;  --color-primary-light: #e6f2ff;
  --color-bg: #f5fafe;  --color-surface: #ffffff;  --color-surface-2: #f0f4f8;
  --color-border: #e2e8f0;  --color-border-focus: #58a6ff;
  --color-text: #1e293b;    --color-text-muted: #64748b;

  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-xl: 24px;  --radius-full: 9999px;
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;  --space-lg: 24px;  --space-xl: 32px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,.08);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.12);
  --transition-fast: .15s ease;  --transition-base: .25s ease;
}
```

Theme variants (data-attribute, **not** dark mode): `[data-theme="blue"]` (default), `[data-theme="orange"]` (`--primary:#fd7e14`), `[data-theme="purple"]` (`--primary:#6f42c1`). **There is no `prefers-color-scheme` support anywhere.**

### 9.4 Asset resolution bug ⚠️

Relative `src="./image.png"` / `src="../image.png"` in JSX is **not** processed by Vite's asset pipeline (Vite only rewrites `import` specifiers and HTML attrs). The browser resolves them against the **current URL path**:

| Route | `./image.png` resolves to | Result |
|---|---|---|
| `/` | `/image.png` | ✅ |
| `/admin-dashboard/visitors` | `/admin-dashboard/image.png` | ❌ → nginx `try_files` → **HTML served as an image** |
| `/staff-dashboard/notifications` (`../images/notification_bucket.png`) | `/staff-dashboard/images/...` | ❌ |

**Affected:** the NavBar logo (`../image.png` in all 4 NavBars) and the notification-bucket illustration break on **every nested route**. Only the bare dashboard index routes work. **Fix: use `/image.png` (root-absolute) or `import logo from '../../public/...'`.**

### 9.5 Missing assets

| Path | Referenced at | Status |
|---|---|---|
| `/favicon.ico` | `vite.config.js:14`, `firebase-messaging-sw.js:42` | ❌ **MISSING** |
| `masked-icon.svg` | `vite.config.js:14` | ❌ **MISSING** (silently skipped) |
| `./image2.png` | `SignIn.jsx:89`, `AdminRegister.jsx:116` | ❌ **MISSING** — broken logo on the two entry screens |
| `images/school/*.jpg`, `students*.jpeg` | `SchoolLandingPage.jsx` | ❌ MISSING (dead page, no impact) |

---

## 10. Feature modules by role

### 10.1 Admin — `/admin-dashboard`

| Nav label | Path | NavBar line |
|---|---|---|
| Dashboard | `/admin-dashboard` | 67 |
| Visitors | `/admin-dashboard/visitors` | 78 |
| ▾ Staff Management | dropdown | 85-104 |
| ↳ Staff / Admin / Frontdesk / Security / Self-Service Users | `/admin-dashboard/staffs` · `/admins` · `/frontdesk` · `/security` · `/self-service` | 112 / 123 / 134 / 145 / 159 |
| Reports & Analytics | `/admin-dashboard/analytical-report` | 174 |
| Settings | `/admin-dashboard/settings` | 185 |
| Register Guest | `/admin-dashboard/new-guest` | 197 |
| Profile | `/admin-dashboard/profile` | 336 |

**Key pages**
- `AdminDashboard.jsx` — Daily/Weekly/Monthly filter → `GET /admin/analytics?filter=`; 4 KPI cards (Visitors Today / Checked In / Checked Out / Pending); Priority Alerts (`GET /admin/alerts/priority/quick`); Latest Updates (`GET /admin/updates/latest`).
- `admin/visitorsManagment/AdminVisitors.jsx` — tabs **Visitors** / **Visit**; `POST /admin/visitors`.
  - `AdminVisitorsTab.jsx` → All / VIP / Blacklisted (each with `PUT`, `/vip`, `/blacklist`, `DELETE`).
  - `admin/visitorsManagment/AdminVisit.jsx` → tabs Scheduled / Completed / **Upcoming** / Missed.
  - `admin/include/visit/*` → the 4 visit tables with check-in / check-out / cancel / mark-missed / invite-again.
- `admin/staffManagment/` — `AdminStaff`, `AdminFrontdesk`, `AdminSecurity` (add user + invite email), `AdminSelfService` (self-service users).
- `admin/adminManagement/` — `AdminManagement`, `ManageAdminsTable`.
- `admin/analytical_report/AnalyticalAndReport.jsx` — **6 recharts charts** (Visitors Tariff, Visitor Type Distribution, Purpose of Visit, Most Visited Staff, Peak Visitors Hour, Most Frequent Visitors) + PDF export (`GET /admin/analytics/export`) + filter modal.
- `admin/settings/AdminSettings.jsx` — tabs General / Notification / Data & Privacy / System Security / Profile. *(User Role & Permission is commented out.)*
- `admin/settings/GeneralSettings.jsx` — CRUD for **purposes, buildings, floors, special requirements** (`/admin/settings/add-purpose` etc.).

### 10.2 Staff — `/staff-dashboard`

Nav: Home · Register Guest · Manage Guest · Notification · Profile · Settings

- `Dashboard.jsx` → `include/components/MainDashboard`, `RecentActivitiesPage`, `TodaysGuestsPage`, `AddGuestModal`. Endpoints `/staff/dashboard/summary`, `/staff/dashboard/recents`, `/staff/dashboard/todays-guests`.
- `NewGuest.jsx` → tabs **Individual** / **Group** → `NewGuestIndividual.jsx` / `NewGuestGroup.jsx` (each ~650-755 lines, with `html2pdf.js` badge + `react-qr-code`).
- `ManageGuestsIndividual.jsx` → tabs Individual / Group → `include/TabIndividual` / `include/TabGroup`.
  - Both have 5 tabs: **Scheduled / Pending / Completed / Cancelled / Missed** — the difference is only the `visitType` prop (`"individual"` vs `"group"`).
  - Tables live in `include/manageGuestIndividual/*` and `include/manageGuestGroup/*` — **byte-identical duplicates**.

### 10.3 Front Desk — `/front-desk-dashboard`

Nav: Guest Confirmation · Confirm Visit · Register Guest · History · Manage Guests · Profile · Settings
*(the Notifications nav item is **commented out** at `include/NavBar.jsx:120-131` — route + page exist)*

- `FrontDeskDashboard.jsx` — tabs **Registered / Confirmed / Checked In / Checked Out** → `TabPendingVisits`, `TabConfirmedVisits`, `TabIncoming`, `TabOutgoing`.
- `ConfirmVisitor.jsx` — `GET /front-desk/guests/visit/scan/${otp}` → `POST .../security-confirm/${visit_id}` → auto check-in.
- `RegisterGuest.jsx` — tabs Individual / Group.
- `VisitHistory.jsx` — tab Pre-Registered Visitors.
- `ManageFrontdeskGuestsIndividual.jsx` — same 5-tab structure as staff.

### 10.4 Security — `/security-dashboard`

Nav: Guest Confirmation · Register Guest · History · Manage Guests · Profile · Settings
*(Notifications nav item also **commented out** at `include/NavBar.jsx:109-120`)*

- `SecurityDashboard.jsx` — **camera QR scan** via `Html5QrcodeScanner` → `GET /security/visit/scan/${code}` → `POST /security/visit/confirm/${visit_id}`.
- `GenerateQRCode.jsx` — **client-side only**, builds `guest-${email}`; no API call.
- `GenerateByUniqueCode.jsx` — code → scan → confirm.
- `RegisterNewGuest.jsx` — tabs Individual / Group.
- `VisitSecurityHistory.jsx` — tabs Pre-Registered / Walk-In Visitors.

### 10.5 Visitor / Self-Service — `/visitor-dashboard`

- `VisitorSelfServiceDashboard.jsx` — search → `GET /self-service/visits/search?query=`; `include/VisitorVisitCard` with check-in / check-out.
- `VisitorWalkInRegistration.jsx` — `react-select` host picker, `react-qr-code` pass, `POST /self-service/visits/walk-in-register`. ⚠️ Two hard-coded prod redirects to `https://app.theswiftentry.com/visitor-dashboard` (`:431`, `:554`) — these will **bounce the user off your local dev server**.
- `VisitorProfile.jsx` — `GET /self-service/profile`.
- `VisitorLayout.jsx` — the only layout with a real navbar (navy `#053561`, fixed-top, 80px content offset).

### 10.6 Individual vs Group — the data model

| | Individual | Group |
|---|---|---|
| Admin endpoint | `POST /admin/register-individual-guest` | `POST /admin/register-group-guest` |
| Staff | `POST /staff/guests/register` | `POST /staff/guests/register-group` |
| Front desk | `POST /front-desk/guests/register` | `POST /front-desk/guests/register-group` |
| Security | `POST /security/guest/register-guest` | `POST /security/guest/register-group` |
| Host notify | `POST /genereal-notify-host` (staff/FD/security) · `POST /admin/notify-admin-host` (admin) | `POST /admin/notify-admin-host` (staff/admin) · `POST /genereal-notify-host` (FD/security) — **inconsistent** |
| Identity fields | `name`, `email`, `contact_number`, `address`, `emergency_contact` | `group_leader_name`, `group_leader_contact`, `group_leader_email`, `organization_name`, `group_size`, `address`, `previsit_instruction` |
| Count endpoint | `/staff/guests/individual-counts` · `/front-desk/guests/individual/counts` · `/security/guest/individual/counts` | `/staff/guests/group-counts` · `/front-desk/guests/group/counts` · `/security/guest/group/counts` |

> 8 near-duplicate registration files (2 per role) ≈ 5,600 lines of copy-pasted code. **Prime refactor target.**

---

## 11. API endpoint catalogue

Base URL: `https://api.theswiftentry.com/api` (hardcoded). ~283 call sites.

### Auth
| Method | Endpoint | Source |
|---|---|---|
| GET | `/sanctum/csrf-cookie` (baseURL override → API root) | `AuthContext.jsx:280,412` |
| POST | `/admin/login` `/staff/auth/login` `/security/auth/login` `/front-desk/auth/login` `/self-service/login` | `AuthContext.jsx:301` |
| POST | `/admin/forgot-password` `/staff/auth/forgot-password` `/security/auth/forgot-password` `/front-desk/auth/forgot-password` | `:433` |
| POST | `/admin/verify-otp` `/staff/auth/verify-otp` `/security/auth/verify-otp` `/front-desk/auth/verify-otp` | `:501` |
| POST | `/admin/reset-password` `/staff/auth/reset-password` `/security/auth/reset-password` `/front-desk/auth/reset-password` | `:567` |
| GET | `/admin/profile` `/staff/profile` `/security/user-profile` `/front-desk/profile` `/self-service/profile` | `:203` |
| POST | `/admin/register` | `AdminRegister.jsx:50` |
| POST | `/admin/staff/validate-setup-token`, `/admin/staff/setup-password` | `SetupPassword.jsx:36,78` |
| POST | `/admin/frontdesk/validate-setup-token` ⚠️×3 variants, `/admin/frontdesk/setup-password` | `FrontdeskSetupPassword.jsx:49-55,132` |
| POST | `/admin/security/validate-setup-token` ⚠️×3 variants, `/admin/security/setup-password` | `SecuritySetupPassword.jsx:49-55,134` |
| POST | `/save-fcm-token`, `/staff/save-fcm-token` | `firebase.jsx:34` + register pages |

### Admin — visitors
`POST /admin/visitors` · `GET /admin/visitors` · `/admin/visitors/vip` · `/admin/visitors/blacklisted` · `PUT /admin/visitors/{id}` · `POST /admin/visitors/{id}/vip` · `POST /admin/visitors/{id}/blacklist` · `DELETE /admin/visitors/{id}`

### Admin — visits
`GET /admin/visits/scheduled|upcoming|completed|missed?page=` · `GET|PUT|DELETE /admin/visits/{id}` · `POST /admin/visits/{id}/invite-again|check-in|check-out|cancel|mark-missed`

### Admin — analytics
`GET /admin/analytics?filter=daily|weekly|monthly` · `GET /admin/analytics?{queryParams}` · `GET /admin/analytics/export?{queryParams}` (blob/PDF) · `GET /admin/alerts/priority[/quick]` · `GET /admin/updates/latest`

### Admin — user management
`GET|PUT|DELETE admin/staff[/{id}]` · `POST admin/staff` · `POST admin/staff/{id}/{activate|deactivate}`
`GET|PUT|DELETE admin/frontdesk[/{id}]` · `POST admin/frontdesk` · `POST admin/frontdesk/{id}/{action}`
`GET|PUT|DELETE admin/security[/{id}]` · `POST admin/security` · `POST admin/security/{id}/{action}`
`GET|PUT|DELETE admin/admins[/{id}]` · `POST admin/admins`
`GET|POST|DELETE /admin/self-service-users[/{id}]`
`GET /admin/users/bulk-template/{userType}` · `POST /admin/users/bulk-upload/{userType}` · `GET /admin/users/onboarding-stats?user_type=` · `POST /admin/users/bulk-delete`

### Admin — settings
`GET /admin/settings` · `POST /admin/settings/update`
`POST /admin/settings/{add,update,delete}-{purpose|building|floor|special-requirement}`
`GET /admin/data-privacy` · `POST /admin/data-privacy/update-single` · `GET /admin/data-export`
`GET /admin/security/settings` · `POST /admin/settings/update-single` · `POST /admin/security/password-reset`
`GET /admin/profile` · `GET /admin/list-admins` · `GET /admin/settings/company` · `POST /admin/settings/profile` · `POST /admin/settings/company`
`GET /admin/roles-with-permissions` · `POST /admin/roles/update-permissions` *(tab commented out)*

### Admin — guest registration
`GET /admin/settings/buildings|floors|special-requirements` · `POST /admin/register-individual-guest` · `POST /admin/register-group-guest` · `POST /admin/notify-admin-host`

### Staff
`GET /staff/dashboard/summary|recents|todays-guests` · `POST /staff/guests/add`
`GET /staff/guests/individual-counts|group-counts|staff-pending-visits`
`GET /staff/guests/{visitType}/{scheduled,completed,cancelled,missed}-visits`
`POST /staff/guests/visit/{id}/approve-staff-host|reject-staff-host|cancel` · `PUT /staff/guests/reschedule/{id}`
`GET /staff/settings/buildings|floors|special-requirements` · `POST /staff/guests/register|register-group` · `POST /genereal-notify-host` · `GET|POST /staff/settings` · `GET /staff/profile`

### Front desk
`GET /front-desk/guests/individual/counts|group/counts|frontdesk-pending-visits`
`GET /front-desk/guests/{visitType}/{scheduled,completed,cancelled,missed}-visits`
`POST /front-desk/guests/visit/{id}/approve-frontdesk-host|reject-frontdesk-host|cancel|reschedule`
`GET /front-desk/guests/visits/pending|confirmed|incoming|outgoing`
`POST /front-desk/guests/visits/{id}/confirm|check-in|check-out`
`GET /front-desk/guests/visit/scan/{otp}` · `POST /front-desk/guests/visit/security-confirm/{visit_id}`
`GET /front-desk/guests/settings/buildings|floors|special-requirements` · `POST /front-desk/guests/register|register-group`
`GET /front-desk/history/visits` · `GET /front-desk/profile` · `GET|POST /front-desk/frontdesk_setting`

### Security
`GET /security/guest/individual/counts|group/counts|host-pending-visits`
`GET /security/guest/{visitType}/{scheduled,completed,cancelled,missed}-visits`
`POST /security/guest/visit/{id}/approve-host|reject-host|cancel|reschedule`
`GET /security/visit/scan/{code}` · `POST /security/visit/confirm/{visit_id}`
`GET /security/settings/buildings|floors|special-requirements` · `POST /security/guest/register-guest|register-group`
`GET /security/history` · `GET /security/user-profile` · `GET|POST /security/settings`

### Self-service
`GET /self-service/visits/search?query=` · `POST /self-service/visits/walk-in-register` · `POST /self-service/visits/{id}/check-in|check-out` · `GET /self-service/profile`

### Notifications
`GET /{prefix}/notifications/unread-count|latest-unread` · `POST /{prefix}/notifications/mark-all-read|mark-read`
`GET /staff/notifications` · `GET /front-desk/notifications` · `GET /security/notifications` · `GET /admin/admin-notifications`

---

## 12. Build, Docker, nginx, CI

### 12.1 `vite.config.js` (53 lines) — the whole thing

```js
export default defineConfig({
  esbuild: { drop: ['console', 'debugger'] },
  plugins: [ react(), VitePWA({ /* ... */ }) ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

**Absent:** `server`, `preview`, `build`, `base`, `proxy`, `define`, `envPrefix`, `optimizeDeps`.

| Setting | Effective value |
|---|---|
| Dev host | `localhost` (loopback only) — pass `--host` to expose |
| Dev port | `5173` (`strictPort: false` → auto-increments if busy) |
| Preview port | `4173` |
| `server.proxy` | **none** |
| `build.outDir` | `dist` |
| `build.target` | `modules` (es2020/edge88/firefox78/chrome87/safari14) |
| `build.sourcemap` | `false` |
| `base` | `/` (root-absolute asset URLs) |
| `envPrefix` | `VITE_` |

**`esbuild.drop` behaviour (important):**
- **Dev:** applied to `.jsx`/`.tsx`/`.ts` (esbuild's default filter excludes plain `.js`). → **`console.log` is stripped from every `.jsx` file in dev.**
- **Build:** applied to the whole final chunk, including `node_modules`.
- `.js` source files (`src/context/echo.js`, `src/utils/avatarUtils.js`) keep console calls in dev.

**`resolve.alias`:** `@` → `<root>/src`. **Currently unused** — zero `@/...` imports exist. Available for your refactor.

**VitePWA:** `registerType: "autoUpdate"` → the `onNeedRefresh` confirm dialog in `main.jsx:12-16` is **dead** (auto mode reloads silently). `includeAssets: ["favicon.ico","apple-touch-icon.png","masked-icon.svg"]` → only `apple-touch-icon.png` exists; the other two are **silently skipped**. `maximumFileSizeToCacheInBytes: 10MB` is a **no-op** because workbox's default `globPatterns` is `['**/*.{js,wasm,css,html}']` — media is never precached. **No `runtimeCaching` rules** → API responses are never cached.

### 12.2 `Dockerfile` (25 lines) — verbatim

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
RUN bun install
RUN bun add react-router-dom
RUN bun add @types/react-router-dom
COPY . .
RUN bun run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

⚠️ Uses **Bun**, not npm → `package-lock.json` is not enforced (`--frozen-lockfile` absent). **No `.dockerignore`** → `node_modules/`, `.git/`, `.env` all go into the build context. `bun add @types/react-router-dom` mutates `package.json` **inside the image only** (not reproducible outside Docker). No `ARG`/`ENV` for build config → `.env` is copied in and `VITE_*` values are baked into `dist/assets/*.js` at **image build time**. No `HEALTHCHECK`, no `USER` (runs as root).

### 12.3 `nginx.conf` (16 lines) — verbatim

```nginx
server {
    listen 80;
    server_name vms.194.62.99.202.sslip.io;

    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /usr/share/nginx/html;
    }

    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
```

| Aspect | Reality |
|---|---|
| SPA fallback | `try_files $uri /index.html` ✅ — deep links work |
| **`proxy_pass`** | **NONE.** No `/api` proxy, no WebSocket upgrade block. All API traffic is browser→`https://api.theswiftentry.com` cross-origin. |
| Cache headers | **NONE.** The 17.8 MB `video3.mp4` and hashed assets are revalidated every request. A `location ~* \.(js\|css\|woff2)$ { expires 1y; add_header Cache-Control "public, immutable"; }` rule is missing. |
| gzip | `gzip on` comes from the `nginx:alpine` base `/etc/nginx/nginx.conf`, but **no `gzip_types`** extension for JSON/SVG/manifest. |
| Security headers | **NONE.** No CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS. This app loads scripts from 3 CDNs and renders user-supplied HTML via `html2pdf`. |
| `client_max_body_size` | default **1 MB** → **bulk guest upload will 413** |
| `server_name` | `vms.194.62.99.202.sslip.io` (194.62.99.202) — **does not match** the CI target `85.9.202.212` |

### 12.4 CI — `.github/workflows/deploy.yml` (63 lines)

| Aspect | Detail |
|---|---|
| Trigger | `push` to `main` and `browncon` |
| Steps | `actions/checkout@v3` (⚠️ deprecated) → `webfactory/ssh-agent@v0.7.0` (secret `SYDANI_WEB_SSH_PRIVATE_KEY`) → `ssh-keyscan` → `rsync -avz --delete` → `ssh … bash ./deploy.sh` |
| `DEPLOY_PATH` | `main` → `/var/www/vms-frontend`; `browncon` → `/var/www/browncon/frontend` |
| Target | `root@85.9.202.212` with `StrictHostKeyChecking=no` |

🔴 **Three deployment-breaking issues:**

1. **`public/` is excluded from the rsync** → the deployed build has **no logo, no sign-in video, no favicon, no PWA icons**. Every image 404s. It also means `rsync --delete` **removes** the existing `public/` on the server.
2. **`.env` is excluded from the rsync** → the remote build has no env → `import.meta.env.VITE_ECHO_HOST` is `undefined` → **`echo.js:11` throws `TypeError: Cannot read properties of undefined (reading 'replace')` at module load → the whole app fails to boot.**
3. **`deploy.sh` is not in the repo.** It's excluded from the rsync and must be pre-seeded on the VPS. **The actual build script is unversion-controlled.**

There is also **no build/test/lint gate** — CI deploys whatever is on the branch without running `npm run build` or `npm run lint`.

---

## 13. Environment variables

`.env` (8 lines) — **⚠️ committed to git, not in `.gitignore`**

```ini
VITE_BACKEND_URL=https://api.theswiftentry.com
VITE_PUSHER_APP_KEY=8a728cd26ae422539269
VITE_PUSHER_APP_CLUSTER=ap2
VITE_PUSHER_FORCE_TLS=true
VITE_ECHO_HOST=http://127.0.0.1:8000
VITE_ECHO_PORT=6001
VITE_API_BASE_URL=http://127.0.0.1:8000
```

`import.meta.env` appears **only** in `src/context/echo.js` (7 references).

| Var | Status | Notes |
|---|---|---|
| `VITE_BACKEND_URL` | LIVE | Builds `…/api/broadcasting/auth` (`echo.js:17`) |
| `VITE_PUSHER_APP_KEY` | LIVE | Public Pusher key. **Committed to git.** |
| `VITE_PUSHER_APP_CLUSTER` | LIVE | `ap2` |
| `VITE_PUSHER_FORCE_TLS` | LIVE | `=== "true"` → `true` |
| `VITE_ECHO_HOST` | LIVE **but misconfigured** | `127.0.0.1` in a browser = the visitor's machine → socket can never connect |
| `VITE_ECHO_PORT` | LIVE **but misconfigured** | `6001` used for **both** `wsPort` and `wssPort`, as a **string** |
| `VITE_API_BASE_URL` | 🔴 **DEAD** | **Zero references.** The REST base URL is hardcoded. This is the knob you actually want. |

### Other hard-coded secrets / URLs in source

| Value | Location |
|---|---|
| `https://api.theswiftentry.com/api` | `api.jsx:6` |
| `https://api.theswiftentry.com` | `AuthContext.jsx:282,414` |
| reCAPTCHA v3 site key `6LfIP1AsAAAAAL06_8oGFfAquyg879TXvZ7fYhb7` | `App.jsx:77` |
| Firebase apiKey `AIzaSyC0exeQOxXe08I2ydDbNNmAa_86YgB-yKk` | `firebase.jsx:8`, `public/firebase-messaging-sw.js:14` |
| Firebase VAPID key | `firebase.jsx:19` |
| `https://app.theswiftentry.com/visitor-dashboard` | `VisitorWalkInRegistration.jsx:431,554` |

---

## 14. Lint baseline

```bash
npm run lint
# ✖ 169 problems (118 errors, 51 warnings)
```

**ESLint 9 flat config** (`eslint.config.js`): `js.recommended` + `react.recommended` + `react/jsx-runtime` + `react-hooks.recommended`, with `react/jsx-no-target-blank: off` and `react/prop-types: off`.

- **Errors** — mostly `no-unused-vars` (e.g. `staffDashboard/include/manageGuestIndividual/CancelledVisitTable.jsx:58`).
- **Warnings** — mostly `react-hooks/exhaustive-deps` (missing `fetchVisits` dependency) across every visit table.
- **Not enabled:** `jsx-a11y` (no alt-text enforcement), `no-console`, `import/`, `simple-import-sort`.
- `settings.react.version: '18.3'` — **stale**, the app runs React 19.
- Ignores only `dist` → `npm run lint` also lints `vite.config.js`, `eslint.config.js`, `public/firebase-messaging-sw.js`.

> **Know your baseline: 118 errors / 51 warnings before you start.** If your change increases the count, that's on you. Snapshot it before you begin.

---

## 15. Known issues register (prioritized)

### 🔴 P0 — breaks the app

| # | Issue | Location |
|---|---|---|
| 1 | **`requiredRole` ignored** → zero client-side role isolation | `PrivateRoute.jsx:5` |
| 2 | **Echo `Authorization` captured once at module load** → `"Bearer null"`, realtime dead | `echo.js:20` |
| 3 | **`wsHost = 127.0.0.1`** → socket unreachable in any deployed env | `.env:6`, `echo.js:11` |
| 4 | **CI excludes `public/`** → all images + video 404 in production | `deploy.yml:51` |
| 5 | **CI excludes `.env`** → `echo.js:11` throws at module load → **app won't boot** | `deploy.yml:58` |
| 6 | **`deploy.sh` not in repo** → build script unversion-controlled | `deploy.yml:63` |
| 7 | **`.env` committed to git**, not gitignored | `.gitignore` |
| 8 | **`index.css` not imported** → the whole design system is inert | `main.jsx:7` |
| 9 | **Relative asset paths break on nested routes** → broken logo/video/illustration | all 4 NavBars, `VisitorLayout.jsx:37` |
| 10 | **Missing leading slashes** on ~20 endpoint calls → wrong URLs | §7.2 |
| 11 | **`loading` stuck `true`** on 401 profile fetch (`return` before `setLoading(false)`) | `AuthContext.jsx:246,228,266` |
| 12 | **Stray top-level `<Route>`** (dead) + `/admin/new-guest` is a blank page | `App.jsx:71` |

### 🟠 P1 — wrong behaviour, no crash

| # | Issue | Location |
|---|---|---|
| 13 | `markAllAsRead` destructured but never provided → `undefined` | 4 NavBars vs `NotificationContext.jsx:152` |
| 14 | `user_id` localStorage key read but never written → channel `notifications.null` | `Notifications.jsx:122,130` (staff + security) |
| 15 | `isUnauthorized` latches forever after one 401 | `NotificationContext.jsx:41` |
| 16 | Security NavBar links `/security-dashboard/settings` but the route is `/security-dashboard/security-settings` | `securityDashboard/include/NavBar.jsx:281` vs `App.jsx:190` |
| 17 | Staff NavBar checks `location.pathname === "/notifications"` (wrong path) | `staffDashboard/include/NavBar.jsx:17` |
| 18 | Front-desk + security **Notifications nav items are commented out** although routes/pages exist | `frontDeskDashboard/include/NavBar.jsx:120`, `securityDashboard/include/NavBar.jsx:109` |
| 19 | Orphan `admin/settings/AdminVisit.jsx` renders `<UpcomingVisit/>` under the **Cancelled** tab | `admin/settings/AdminVisit.jsx:65` |
| 20 | `admin/VisitHistory.jsx` imports 2 non-existent files → would fail to compile if wired | `admin/VisitHistory.jsx` |
| 21 | `...rawUser` spread overrides normalized `id`/`role`/`name` | `AuthContext.jsx:95-96,123` |
| 22 | Plaintext password + reset-token prefix logged | `AuthContext.jsx:545-551,578-583` |
| 23 | `VisitorWalkInRegistration` hard-redirects to prod (`app.theswiftentry.com`) | `:431,554` |
| 24 | `nginx` `client_max_body_size` = 1 MB → bulk upload 413 | `nginx.conf` |
| 25 | No CSP / security headers in nginx | `nginx.conf` |
| 26 | Firebase `appId` mismatch between app and SW | `firebase.jsx:13` vs `firebase-messaging-sw.js:19` |
| 27 | `react/jsx-no-target-blank: off` → reverse-tabnabbing on share links | `eslint.config.js:34` |
| 28 | Duplicate `ToastContainer` (App + per-page) → duplicate toasts | `App.jsx:221`, `AdminRegister.jsx:83` |

### 🟡 P2 — code quality

| # | Issue | Location |
|---|---|---|
| 29 | `react-to-print` installed, unused | `package.json:34` |
| 30 | Redux (3 packages) installed, unused | `package.json` |
| 31 | `resolve.alias "@"` configured, unused | `vite.config.js:37` |
| 32 | `onNeedRefresh` confirm dialog is dead (autoUpdate mode) | `main.jsx:12-16` |
| 33 | `public/firebase-messaging-sw.js` never registered | `public/` |
| 34 | `settings.react.version: '18.3'` but React 19 | `eslint.config.js:23` |
| 35 | `README.md` is the untouched Vite template | `README.md` |
| 36 | No `test` / `typecheck` / `format` script | `package.json:6-11` |
| 37 | No `.dockerignore` | repo root |
| 38 | `package-lock.json` has uncommitted local modifications | git status |

---

## 16. Dead code & duplication inventory

### Files with **no importer** (verified by resolving every relative import path)

```
src/context/AuthContext1.jsx              ← superseded by AuthContext.jsx
src/customRoute/PublicRoute.jsx           ← broken import path + wrong project's roles
src/layout/FlashMessage.jsx               ← legacy flash system, never rendered
src/context/FlashProvider.jsx             ← never mounted
src/pages/admin/settings/AdminVisit.jsx   ← duplicate of visitorsManagment/AdminVisit.jsx
src/pages/admin/settings/UserRolePermission.jsx
src/pages/admin/LanguageSwitcher.jsx
src/pages/admin/ManageGuestsGroup.jsx
src/pages/admin/VisitHistory.jsx          ← ALSO has broken imports
src/pages/frontDeskDashboard/include/AddGuestModal.jsx
src/pages/frontDeskDashboard/include/HostVisitsTable.jsx
src/pages/frontDeskDashboard/include/TabWalkInVisitors.jsx
src/pages/frontDeskDashboard/ManageFrontdeskGuestsGroup.jsx
src/pages/frontDeskDashboard/ManageGuestsGroup.jsx
src/pages/securityDashboard/include/HostVisitsTable.jsx
src/pages/securityDashboard/include/TabIncoming.jsx      ← 478 lines
src/pages/securityDashboard/include/TabOutgoing.jsx      ← 478 lines
src/pages/securityDashboard/ManageSecurityGuestsGroup.jsx
src/pages/staffDashboard/include/HostVisitsTable.jsx
src/pages/staffDashboard/ManageGuestsGroup.jsx
src/pages/SchoolLandingPage.jsx           ← 658 lines
src/pages/SecurityDashboard12.jsx         ← duplicate of SecurityDashboard.jsx (same export name!)
```

### Byte-identical duplicate components (MD5-verified)

| Component | Copies |
|---|---|
| `CancelledVisitTable` | staff/manageGuest{Individual,Group} + frontDesk/manageFrontdeskGuest{Individual,Group} + security/manageSecurityGuest{Individual,Group} |
| `MissedVisitTable` | frontDesk/manageFrontdeskGuest{Individual,Group} + security/manageSecurityGuest{Individual,Group} |
| `PreScheduledVisitTable` | staff/manageGuest{Individual,Group} + security/manageSecurityGuest{Individual,Group} |

The Individual/Group folder split exists **only** to swap a `visitType` prop, but the endpoints are the same template (`/staff/guests/${visitType}/completed-visits`) → the split is functionally redundant.

### Other duplication
- **8 near-identical guest-registration files** (Individual/Group × 4 roles) ≈ 5,600 lines.
- **4 near-identical NavBar files** (admin/staff/frontDesk/security) ≈ 290 lines each.
- **4 near-identical shell layouts** that render nothing but `<Outlet/>`.
- **4 near-identical "manage guests" page trees** (staff/frontDesk/security + admin) with the same 5-tab structure.

---

## 17. Pre-flight checklist for the UI + functional update

### Before you write any code

- [ ] **Snapshot the lint baseline:** `npm run lint` → note the count (**118 errors / 51 warnings**). Do not increase it.
- [ ] **Verify your dev server actually serves the app:** `npm run dev -- --host 127.0.0.1` → open `http://127.0.0.1:5173`. If you see a directory listing or 404, you passed the host as a positional arg.
- [ ] **Decide your API target.** Right now everything hits `https://api.theswiftentry.com`. If you want a local backend, you must change `api.jsx:6` + `AuthContext.jsx:282,414` (or add a proxy).
- [ ] **Check the backend CORS config** allows `http://127.0.0.1:5173` with credentials (`Access-Control-Allow-Credentials: true`, explicit origin, not `*`).
- [ ] **Create a branch.** Never work on `main` — CI deploys `main` and `browncon` on every push.
- [ ] **Know your role's route prefix** so you don't break navigation.

### Minimal, low-risk infrastructure fixes worth doing first

These unblock everything else and are all small:

1. **Make the API base URL env-driven.**
   ```js
   // src/context/api.jsx
   baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.theswiftentry.com/api",
   ```
   and the same for the Sanctum CSRF root in `AuthContext.jsx:282,414`.
2. **Add a `server` block to `vite.config.js`** (optional but recommended):
   ```js
   server: {
     host: "127.0.0.1",
     port: 5173,
     strictPort: true,   // fail loudly instead of silently moving to 5174
     proxy: {
       "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
     },
   },
   ```
3. **Uncomment `import "./index.css"`** in `main.jsx:7` — **but check for visual regressions first**; it activates ~150 lines of previously-dormant CSS. Alternatively, extract just the `:root` variables into a new `tokens.css` and import that.
4. **Fix `PrivateRoute`** to honour `requiredRole`:
   ```jsx
   export default function PrivateRoute({ children, requiredRole }) {
     const { user, loading } = useAuth();
     const location = useLocation();
     if (loading) return null;
     if (!user) return <Navigate to="/" state={{ next: location.pathname }} />;
     if (requiredRole && user.role !== requiredRole) return <Navigate to={homeFor(user.role)} />;
     return children;
   }
   ```
   *(This also requires `loading` to be correctly reset — fix issue #11.)*
5. **Fix `echo.js:20`** → `Authorization: () => \`Bearer ${localStorage.getItem("token")}\`` and set `VITE_ECHO_HOST` to a public hostname.
6. **Fix the relative asset paths** → use `/image.png` (root-absolute) instead of `../image.png`.
7. **Delete the stray `<Route>`** at `App.jsx:71`.
8. **Add `.env` to `.gitignore`** and create `.env.example`; rotate the Pusher key if the repo is public.

### UI work checklist

- [ ] **Know the styling reality:** Bootstrap classes + heavy inline styles. **There is no working token system.** Either enable `index.css` or build your own token layer — don't mix.
- [ ] **Don't use Tailwind-style class names** (`bg-[#FFF]`, `w-[300px]`) — there is no Tailwind; they silently do nothing.
- [ ] **Nav lives in `include/NavBar.jsx`**, not in the layouts. The layouts are empty `<Outlet/>` wrappers.
- [ ] **Active-link highlighting is done with `location.pathname === "..."`** string comparison (not `NavLink`'s `isActive`), so any new route must be added in **two** places (the `to=` and the ternary) to highlight correctly.
- [ ] **Use `react-toastify`** (`toast.success/error/info`) for feedback — that's the established pattern in 106 files. The `FlashProvider`/`FlashMessage` system is dead.
- [ ] **Never mount a second `<ToastContainer>`** — the app-level one at `App.jsx:221` already exists.
- [ ] **Use `UserAvatar`** (`src/components/UserAvatar.jsx`) with `getInitials` / `getAvatarColor` from `src/utils/avatarUtils.js` for consistent avatars.
- [ ] **Brand colours:** `#053561` (navy navbars) and `#F5FAFE` (page bg) are hard-coded throughout — match them or introduce tokens properly.
- [ ] **Icons:** `lucide-react` is the newer choice (10 files); `react-icons` (6 files) is legacy. `bootstrap-icons` is available via CDN classes.
- [ ] **Charts:** `recharts` — follow the existing pattern in `AdminDashboard.jsx` / `AnalyticalAndReport.jsx`.
- [ ] **Forms:** plain Bootstrap `form-control` + `useState`; validation is manual (no form library).

### Functional work checklist

- [ ] **Every API call goes through the shared `api` instance** (`src/context/api.jsx`) — never create a new axios instance.
- [ ] **Always use a leading slash** in the path (`api.get("/admin/visitors")`, not `api.get("admin/visitors")`).
- [ ] **Use `import.meta.env` for anything environment-specific** — do not hard-code a new URL.
- [ ] **The auth token is attached automatically** by the interceptor; don't add `Authorization` headers manually.
- [ ] **After login, `role` is client-inferred** by endpoint probing. If you add a role, add it to `AUTH_PATHS` **and** to the `roles` array at `AuthContext.jsx:274` **and** to the `switch` at `:331-349`.
- [ ] **Guard against `user === null`** — `useAuth()` consumers must handle the logged-out state.
- [ ] **Notifications:** use `useNotifications()`, not raw fetches. Remember `self_service` has **no** notification endpoints (`getRolePrefix` returns `null`).
- [ ] **Realtime:** `echo.private(\`notifications.${user.id}\`).listen(".new-notification", ...)` — channel `notifications.{id}`, event `.new-notification`.
- [ ] **`console.log` is stripped in dev** for `.jsx` files — use `window.console.log` while debugging.
- [ ] **New PWA assets** must be added to `public/` and referenced root-absolute (`/foo.png`) — relative paths break on nested routes.

---

## 18. Conventions & gotchas

| Convention / gotcha | Detail |
|---|---|
| **File naming** | Mixed: `ManageGuestsIndividual.jsx` (PascalCase), `NavBar.jsx`, `MissedVisitTbale.jsx` (**typo preserved**), `visitorsManagment/` (**typo**), `staffManagment/` (**typo**), `analytical_report/` (snake_case), `genereal-notify-host` (**typo in the API path**). Don't "fix" these casually — they're in URLs and imports. |
| **Route naming** | kebab-case for URLs (`/admin-dashboard/analytical-report`, `/front-desk-dashboard/manage-frontdesk-guests`), camelCase for route segments (`/setup-password`, `/security-setup-password`). |
| **Component style** | Function components + `useState`/`useEffect`. No Redux. No TypeScript. No CSS-in-JS (no styled-components/emotion). |
| **Data fetching** | Hand-rolled `useEffect` + `axios` + local `useState`. No react-query/SWR. No loading-state abstraction — each page manages its own `loading`/`error` flags. |
| **Toast pattern** | `import { toast } from 'react-toastify'` → `toast.success(...)`, `toast.error(...)`. |
| **Modal pattern** | Bootstrap markup + `window.bootstrap.Modal` from the CDN bundle (`index.html:10`) — not the React `Modal` component. E.g. `SecurityDashboard.jsx:56,87`, `ConfirmVisitor.jsx:44,211`, `GenerateByUniqueCode.jsx:40,66`. |
| **Conditional styling** | Template-literal ternaries on `location.pathname`, e.g. `` className={`nav-link px-3 ${location.pathname === "/staff-dashboard" ? "text-white fw-bold" : "text-white-50"}`} ``. |
| **Imports** | Always relative (`../../context/echo`). The `@` alias exists but is unused. |
| **Asset imports** | SVG icons are imported as raw URLs: `import check from "../assets/icons/check.svg"`. |
| **Effect deps** | `useEffect(..., [])` with a missing dependency is the norm here (51 lint warnings). Don't try to fix all of them as part of a UI change — but don't add more. |
| **PropTypes** | `react/prop-types` is **off** in ESLint. Only `FlashProvider` uses PropTypes. |
| **Nested routing** | The 4 dashboard routes use `path=".../*"` with a layout rendering `<Outlet/>`. Add new pages as **children** of the wildcard route, not as siblings. |
| **The visitor routes are flat** | `/visitor-dashboard/*`, `/visitor-dashboard/register-visit`, `/visitor-dashboard/profile` are **separate top-level routes**, not nested children. `VisitorLayout` takes `children`, not `<Outlet/>`. |
| **`git` state** | `package-lock.json` is locally modified. `.env` is tracked. `main` and `browncon` auto-deploy on push. |

---

*Generated by reading the codebase at commit `6b7c6d3`. Line numbers refer to that commit.*
