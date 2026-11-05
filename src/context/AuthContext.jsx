import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import api, { API_ORIGIN } from "./api";
import { dashboardFor, getScope } from "../tenancy/scope.js";
import { SCOPES } from "../tenancy/constants.js";

const AuthContext = createContext();

// Define user roles and their authentication path prefixes
const AUTH_PATHS = {
  admin: {
    login: "/admin/login",
    forgot: "/admin/forgot-password",
    verify: "/admin/verify-otp",
    reset: "/admin/reset-password",
    profile: "/admin/profile",
  },
  staff: {
    login: "/staff/auth/login",
    forgot: "/staff/auth/forgot-password",
    verify: "/staff/auth/verify-otp",
    reset: "/staff/auth/reset-password",
    profile: "/staff/profile",
  },
  security: {
    login: "/security/auth/login",
    forgot: "/security/auth/forgot-password",
    verify: "/security/auth/verify-otp",
    reset: "/security/auth/reset-password",
    profile: "/security/user-profile",
  },
  front_desk: {
    login: "/front-desk/auth/login",
    forgot: "/front-desk/auth/forgot-password",
    verify: "/front-desk/auth/verify-otp",
    reset: "/front-desk/auth/reset-password",
    profile: "/front-desk/profile",
  },
  self_service: {
    login: "/self-service/login",
    forgot: null,
    verify: null,
    reset: null,
    profile: "/self-service/profile",
  },
};

/**
 * The new backend contract is a single login endpoint. Until it ships, live
 * deployments keep the legacy five-probe flow. The prototype defaults to the
 * single endpoint because the mock adapter implements it.
 */
const USE_SINGLE_LOGIN =
  import.meta.env.VITE_USE_MOCK_API === "true" ||
  import.meta.env.VITE_SINGLE_LOGIN === "true";

const normalizeUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== "object") {
    return null;
  }

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const profile = rawUser.profile ?? null;
  // Raw fields override the profile, but normalized identity fields below
  // override both so a stray raw key cannot erase scope or tenant.
  const source = profile ? { ...profile, ...rawUser } : rawUser;

  const userId = rawUser.id ?? rawUser.user_id ?? profile?.id ?? storedUser?.id ?? null;
  const userRole = rawUser.role ?? profile?.role ?? storedUser?.role ?? "";

  const tenantId =
    rawUser.tenant_id ??
    rawUser.tenantId ??
    rawUser.tenant?.id ??
    profile?.tenant_id ??
    storedUser?.tenant_id ??
    null;

  const scope =
    rawUser.scope ??
    profile?.scope ??
    storedUser?.scope ??
    (tenantId != null ? SCOPES.TENANT : null);

  const tenant = rawUser.tenant ?? profile?.tenant ?? storedUser?.tenant ?? null;
  const permissions =
    rawUser.permissions ?? profile?.permissions ?? storedUser?.permissions ?? [];

  return {
    ...source,
    id: userId,
    role: userRole,
    name: profile?.fullName ?? profile?.name ?? source.name ?? "",
    email: source.email ?? "",
    phone: source.phone ?? "",
    department: source.department ?? "",
    company_name: source.company_name ?? "",
    profile_picture: source.photo ?? source.profile_picture ?? "",
    scope,
    tenant_id: tenantId,
    tenant,
    building_id:
      rawUser.building_id ?? profile?.building_id ?? storedUser?.building_id ?? null,
    permissions,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const navigate = useNavigate();
  const [resetFlowData, setResetFlowData] = useState({
    email: null,
    resetToken: null,
    userRole: null,
  });

  const getProfileEndpoint = (userRole) => AUTH_PATHS[userRole]?.profile;

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    sessionStorage.removeItem("viewingTenantId");
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  /**
   * Writes a session from either the new single-login payload or the legacy
   * role endpoint. Keeps local storage, axios headers and navigation aligned.
   */
  const persistSession = (payload, { navigateToDashboard = true } = {}) => {
    const rawUser = payload.user ?? payload;
    const userData = normalizeUser({
      ...rawUser,
      role: rawUser.role ?? payload.role,
    });

    if (!userData?.id) {
      throw new Error("Login succeeded but the user payload has no id.");
    }

    let previousUserId = null;
    try {
      previousUserId = JSON.parse(localStorage.getItem("user"))?.id ?? null;
    } catch {
      previousUserId = null;
    }
    if (String(previousUserId) !== String(userData.id)) {
      // The tenant filter belongs to the previous persona, not the new one.
      sessionStorage.removeItem("viewingTenantId");
    }

    const nextToken = payload.token ?? localStorage.getItem("token");
    const nextRole = userData.role ?? role;

    setUser(userData);
    setToken(nextToken);
    setRole(nextRole);

    if (nextToken) localStorage.setItem("token", nextToken);
    if (nextRole) localStorage.setItem("userRole", nextRole);
    localStorage.setItem("user", JSON.stringify(userData));

    if (nextToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${nextToken}`;
    }

    if (navigateToDashboard) navigate(dashboardFor(userData));
    return userData;
  };

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("userRole");
      const storedUserRaw = localStorage.getItem("user");

      if (!storedToken || !storedUserRaw) {
        if (!cancelled) setLoading(false);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      if (USE_SINGLE_LOGIN) {
        try {
          const response = await api.get("/me");
          if (!cancelled) {
            persistSession(
              { token: storedToken, user: response.data.user ?? response.data },
              { navigateToDashboard: false }
            );
          }
        } catch (error) {
          if (error.response?.status === 401) {
            if (!cancelled) logout();
          } else {
            // Offline or mock cold start: keep the cached user rather than
            // logging the person out for a transient failure.
            try {
              const storedUser = JSON.parse(storedUserRaw);
              const normalized = normalizeUser(storedUser);
              if (!cancelled && normalized?.id) {
                setUser(normalized);
                setToken(storedToken);
                setRole(storedRole ?? normalized.role);
              }
            } catch {
              if (!cancelled) logout();
            }
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      try {
        let storedUser = null;
        try {
          storedUser = JSON.parse(storedUserRaw);
        } catch {
          logout();
          return;
        }

        const profileEndpoint = getProfileEndpoint(storedRole);

        if (!profileEndpoint) {
          const normalized = normalizeUser(storedUser);
          if (normalized?.id) {
            setUser(normalized);
            setToken(storedToken);
            setRole(storedRole);
          } else {
            logout();
          }
          setLoading(false);
          return;
        }

        try {
          const response = await api.get(profileEndpoint);
          const rawUser = response.data.user ?? response.data;
          const mergedUser = {
            ...storedUser,
            ...rawUser,
            id: rawUser.id ?? storedUser.id,
            role: rawUser.role ?? storedRole,
          };
          persistSession(
            { token: storedToken, user: mergedUser },
            { navigateToDashboard: false }
          );
        } catch (profileError) {
          if (profileError.response?.status === 401) {
            logout();
            return;
          }
          const normalized = normalizeUser(storedUser);
          if (normalized?.id) {
            setUser(normalized);
            setToken(storedToken);
            setRole(storedRole);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Auth refresh failed:", error);
        logout();
      }

      if (!cancelled) setLoading(false);
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global session failures are raised by the axios interceptor.
  useEffect(() => {
    const handleUnauthorized = () => {
      if (localStorage.getItem("token")) {
        toast.error("Your session has expired. Please sign in again.");
        logout();
      }
    };
    const handleSuspended = (event) => {
      toast.error(event.detail?.message ?? "This tenant has been suspended.");
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("tenant:suspended", handleSuspended);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("tenant:suspended", handleSuspended);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRecaptcha = async (getRecaptchaToken, action = "login") => {
    if (typeof getRecaptchaToken === "function") {
      return getRecaptchaToken(action);
    }
    return getRecaptchaToken;
  };

  const login = async (email, password, getRecaptchaToken) => {
    try {
      // The mock adapter answers this harmlessly; live deployments need it
      // before the Sanctum cookie flow.
      try {
        await api.get("/sanctum/csrf-cookie", { baseURL: API_ORIGIN });
      } catch {
        // Cookie bootstrap is best-effort.
      }

      if (USE_SINGLE_LOGIN) {
        const recaptchaToken = await getRecaptcha(getRecaptchaToken, "login");
        const response = await api.post("/auth/login", {
          email,
          password,
          recaptcha_token: recaptchaToken,
        });
        persistSession(response.data);
        toast.success("Login successful!");
        return true;
      }

      // Legacy fallback: the backend does not expose /auth/login yet.
      const roles = ["admin", "staff", "security", "front_desk", "self_service"];
      for (const candidateRole of roles) {
        const path = AUTH_PATHS[candidateRole].login;
        try {
          const recaptchaToken = await getRecaptcha(getRecaptchaToken, "login");
          const response = await api.post(path, {
            email,
            password,
            recaptcha_token: recaptchaToken,
          });

          if (response.data.token) {
            const rawUser = response.data.user ?? response.data;
            persistSession({
              token: response.data.token,
              user: {
                ...rawUser,
                role: candidateRole,
                id: rawUser.id ?? rawUser.user_id ?? null,
              },
            });
            toast.success("Login successful!");
            return true;
          }
        } catch (error) {
          console.warn(
            `Failed login attempt at ${path}`,
            error.response?.data || error.message
          );
        }
      }

      toast.error("Invalid credentials or user not found.");
      return false;
    } catch (error) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "An error occurred. Please try again.";
      toast.error(message);
      return false;
    }
  };

  /** Dev-only shortcut used by the persona switcher. */
  const demoLogin = async (email) => {
    try {
      const response = await api.post("/auth/demo-login", { email });
      persistSession(response.data);
      toast.success(`Signed in as ${response.data.user?.name ?? email}`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Could not start the demo session.");
      return false;
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;
    const response = await api.get("/me");
    return persistSession(
      { token: storedToken, user: response.data.user ?? response.data },
      { navigateToDashboard: false }
    );
  };

  const updateUser = (newUserData) => {
    const normalized = normalizeUser(newUserData);
    if (normalized && normalized.id) {
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
    }
  };

  // ---- password reset flow (unchanged behaviour, cleaned logging) ----
  const forgotPassword = async (email, getRecaptchaToken) => {
    setResetFlowData({ email: null, resetToken: null, userRole: null });

    const roles = ["admin", "staff", "security", "front_desk"];
    let userRole = null;
    let mailFailed = false;

    try {
      try {
        await api.get("/sanctum/csrf-cookie", { baseURL: API_ORIGIN });
      } catch {
        // Best-effort.
      }

      for (const candidateRole of roles) {
        const path = AUTH_PATHS[candidateRole].forgot;
        try {
          const recaptchaToken = await getRecaptcha(getRecaptchaToken, "forgot_password");
          const response = await api.post(path, {
            email,
            recaptcha_token: recaptchaToken,
          });

          if (response.status >= 200 && response.status < 300) {
            userRole = candidateRole;
            break;
          }
        } catch (error) {
          if (error.response?.status === 500) {
            mailFailed = true;
          }
        }
      }

      if (mailFailed) {
        toast.error("Failed to send verification email. Please contact support.");
        return false;
      }

      if (userRole) {
        setResetFlowData({ email, resetToken: null, userRole });
        toast.success("Verification code sent to your email.");
      } else {
        toast.info("If this email is registered, a code has been sent.");
        setResetFlowData({ email, resetToken: null, userRole: null });
      }
      return true;
    } catch (error) {
      console.error("Forgot Password failed:", error);
      toast.error("An error occurred. Please try again.");
      return false;
    }
  };

  const verifyOtp = async (otp) => {
    const { email, userRole } = resetFlowData;
    if (!email || !userRole) {
      toast.error("Password reset flow expired or initiated incorrectly.");
      navigate("/forgot-password");
      return false;
    }

    try {
      const path = AUTH_PATHS[userRole].verify;
      const response = await api.post(path, { email, otp });

      if (response.data.reset_token) {
        setResetFlowData((prev) => ({
          ...prev,
          resetToken: response.data.reset_token,
        }));
        toast.success("OTP verified. Set your new password.");
        return true;
      }

      toast.error("Verification failed. Please try again.");
      return false;
    } catch (error) {
      toast.error(error.response?.data?.error ?? "Invalid or expired verification code.");
      return false;
    }
  };

  const resetPassword = async (email, resetToken, password, confirmPassword) => {
    const { userRole } = resetFlowData;

    if (!email || !resetToken || !userRole) {
      toast.error("Password reset process failed. Please restart.");
      navigate("/forgot-password");
      return false;
    }

    try {
      const path = AUTH_PATHS[userRole].reset;
      const response = await api.post(path, {
        email,
        reset_token: resetToken,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.data.message) {
        setResetFlowData({ email: null, resetToken: null, userRole: null });
        toast.success("Password successfully reset! Please sign in.");
        return true;
      }
      return false;
    } catch (error) {
      let errorMessage = "Failed to reset password. Token may have expired.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid or expired reset token. Please start again.";
      } else if (error.response?.status === 422) {
        errorMessage = "Validation failed. Please check your new password.";
      }

      toast.error(errorMessage);
      if (error.response?.status === 401) {
        setResetFlowData({ email: null, resetToken: null, userRole: null });
      }
      return false;
    }
  };

  const scopeInfo = getScope(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        scope: scopeInfo.scope,
        tenant: user?.tenant ?? null,
        isBuildingScope: scopeInfo.isBuilding,
        isTenantScope: scopeInfo.isTenant,
        login,
        demoLogin,
        refreshUser,
        updateUser,
        logout,
        loading,
        forgotPassword,
        verifyOtp,
        resetPassword,
        resetFlowData,
        singleLoginEnabled: USE_SINGLE_LOGIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
