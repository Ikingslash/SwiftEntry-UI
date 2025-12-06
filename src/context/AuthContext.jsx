import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "./api";
import { toast } from "react-toastify";

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
};

const normalizeUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== "object") {
    return null;
  }

  // Get user data from localStorage as fallback
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    console.warn("Failed to parse stored user from localStorage");
  }

  // CASE 1: Profile endpoint shape (from /profile)
  const profile = rawUser.profile ?? null;

  if (profile) {
    // Try to get ID from multiple possible sources
    const userId = rawUser.id ??
                   profile.id ??
                   (storedUser && storedUser.id) ??
                   null;

    // Try to get role from multiple possible sources
    const userRole = rawUser.role ??
                     profile.role ??
                     (storedUser && storedUser.role) ??
                     "";

    if (!userId) {
      console.warn("normalizeUser: Could not determine user ID", {
        rawUser,
        profile,
        storedUser
      });
    }

    const normalized = {
      id: userId,
      role: userRole,
      name: profile.fullName ?? profile.name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      department: profile.department ?? "",
      company_name: profile.company_name ?? "",
      profile_picture: profile.photo ?? profile.profile_picture ?? "",
      // Keep raw fields for safety
      ...profile,
      ...rawUser,
    };

    // console.log("normalizeUser: Profile case result", normalized);
    return normalized;
  }

  // CASE 2: Login endpoint shape or already normalized
  const userId = rawUser.id ?? (storedUser && storedUser.id) ?? null;
  const userRole = rawUser.role ?? (storedUser && storedUser.role) ?? "";

  if (!userId) {
    console.warn("normalizeUser: Login case - missing ID", {
      rawUser,
      storedUser
    });
  }

  const normalized = {
    id: userId,
    name: rawUser.name ?? "",
    email: rawUser.email ?? "",
    role: userRole,
    department: rawUser.department ?? "",
    profile_picture: rawUser.profile_picture ?? rawUser.photo ?? "",
    company_name: rawUser.company_name ?? "",
    phone: rawUser.phone ?? "",
    ...rawUser,
  };

  return normalized;
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

useEffect(() => {
  const checkAuth = async () => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("userRole");
    const storedUserRaw = localStorage.getItem("user");

    // No auth data → stop and exit
    if (!storedToken || !storedRole || !storedUserRaw) {
      console.log("checkAuth: Missing auth data in localStorage");
      setLoading(false);
      return;
    }

    try {
      // Parse stored user first
      let storedUser = null;
      try {
        storedUser = JSON.parse(storedUserRaw);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        logout();
        return;
      }

      // Attach token for API requests
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      const profileEndpoint = getProfileEndpoint(storedRole);

      if (!profileEndpoint) {
        console.warn("No profile endpoint for role:", storedRole);

        // Use stored user data
        const normalized = normalizeUser(storedUser);

        if (normalized?.id) {
          setUser(normalized);
          setToken(storedToken);
          setRole(storedRole);
          console.log("checkAuth: Using stored user data", normalized);
        } else {
          console.error("checkAuth: Invalid stored user data");
          logout();
        }

        setLoading(false);
        return;
      }

      try {
        // Fetch profile from backend
        const response = await api.get(profileEndpoint);
        const rawUser = response.data.user ?? response.data;

        // Merge with stored user data to ensure we have ID and role
        const mergedUser = {
          ...storedUser,
          ...rawUser,
          id: rawUser.id ?? storedUser.id,
          role: rawUser.role ?? storedRole, // Use storedRole as fallback
        };

        const normalized = normalizeUser(mergedUser);

        if (!normalized || !normalized.id) {
          console.error("Invalid normalized user after profile fetch:", normalized);
          // Try with just stored data as fallback
          const fallbackNormalized = normalizeUser(storedUser);
          if (fallbackNormalized?.id) {
            console.log("Using fallback stored user data");
            setUser(fallbackNormalized);
            setToken(storedToken);
            setRole(storedRole);
          } else {
            logout();
          }
          return;
        }

        // Store fresh normalized user
        setUser(normalized);
        setToken(storedToken);
        setRole(storedRole);

        // Update localStorage with the fresh data
        localStorage.setItem("user", JSON.stringify(normalized));

        console.log("User authenticated via profile endpoint:", normalized);
      } catch (profileError) {
        console.error("Profile fetch failed:", profileError);

        // If profile fetch fails, use stored user data
        const normalized = normalizeUser(storedUser);
        if (normalized?.id) {
          setUser(normalized);
          setToken(storedToken);
          setRole(storedRole);
          console.log("Using stored user after profile fetch failure", normalized);
        } else {
          logout();
        }
      }

    } catch (error) {
      console.error("Auth refresh failed:", error);
      logout();
    }

    setLoading(false);
  };

  checkAuth();
}, []);


const login = async (email, password) => {
  const roles = ["admin", "staff", "security", "front_desk"];
  let dashboard = "/";

  try {
    for (const role of roles) {
      const path = AUTH_PATHS[role].login;
      try {
        const response = await api.post(path, { email, password });

        if (response.data.token) {
          const rawUser = response.data.user || response.data;

          // Ensure the user object has role and id
          const userWithRole = {
            ...rawUser,
            role: role,
            // Make sure ID is included
            id: rawUser.id || rawUser.user_id || null,
          };

          const userData = normalizeUser(userWithRole);

          // Validate that we have an ID
          if (!userData.id) {
            console.error("Login succeeded but user ID is missing:", userData);
            toast.error("Login failed: User data incomplete");
            return false;
          }

          setUser(userData);
          setToken(response.data.token);
          setRole(role);

          switch (role) {
            case "admin":
              dashboard = "/admin-dashboard";
              break;
            case "staff":
              dashboard = "/staff-dashboard";
              break;
            case "security":
              dashboard = "/security-dashboard";
              break;
            case "front_desk":
              dashboard = "/front-desk-dashboard";
              break;
            default:
              dashboard = "/";
          }

          // Store in localStorage
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userRole", role);
          localStorage.setItem("user", JSON.stringify(userData));

          // Set authorization header
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;

          navigate(dashboard);
          toast.success("Login successful!");
          return true;
        }
      } catch (error) {
        console.error(
          `Failed login attempt at ${path}`,
          error.response?.data || error.message
        );
      }
    }

    toast.error("Invalid credentials or user not found.");
    return false;
  } catch (error) {
    console.error("Login failed due to unexpected error:", error);
    toast.error("An error occurred. Please try again.");
    return false;
  }
};
  const logout = () => {
    console.log("Logging out user...");
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const updateUser = (newUserData) => {
    const normalized = normalizeUser(newUserData);
    if (normalized && normalized.id) {
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
    }
  };

  // NEW FUNCTIONS FOR PASSWORD RESET FLOW
  const forgotPassword = async (email) => {
    setResetFlowData({ email: null, resetToken: null, userRole: null });

    const roles = ["admin", "staff", "security", "front_desk"];
    let userRole = null;
    let mailFailed = false;

    try {
      for (const role of roles) {
        const path = AUTH_PATHS[role].forgot;
        try {
          const response = await api.post(path, { email });

          if (response.status >= 200 && response.status < 300) {
            userRole = role;
            console.log("Matched role:", role);
            break;
          }
        } catch (error) {
          if (error.response?.status === 500) {
            console.error(
              `Mail sending failed for ${role} path:`,
              error.response?.data || error.message
            );
            mailFailed = true;
          } else {
            // Expected errors: 404/401 (user not found in this role's table)
            console.warn(
              `Forgot password check failed for ${role}:`,
              error.response?.data || error.message
            );
          }
        }
      }

      if (mailFailed) {
        toast.error(
          "Failed to send verification email. Please contact support."
        );
        return false;
      }

      if (userRole) {
        setResetFlowData({
          email: email,
          resetToken: null,
          userRole: userRole,
        });
        toast.success("Verification code sent to your email.");
        return true;
      } else {
        toast.info("If this email is registered, a code has been sent.");
        setResetFlowData({
          email: email,
          resetToken: null,
          userRole: null,
        });
        return true;
      }
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
      } else {
        console.error("No reset_token in response:", response.data);
        toast.error("Verification failed. Please try again.");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Invalid or expired verification code.";
      toast.error(errorMessage);
      console.error("OTP verification failed:", error);
      return false;
    }
  };

 const resetPassword = async (
  email,
  resetToken,
  password,
  confirmPassword
) => {
  const { userRole } = resetFlowData;

  if (!email || !resetToken || !userRole) {
    console.error("Missing reset flow data:", {
      email,
      resetToken,
      userRole,
    });
    toast.error("Password reset process failed. Please restart.");
    navigate("/forgot-password");
    return false;
  }

  try {
    const path = AUTH_PATHS[userRole].reset;
    console.log("Reset password attempt:", {
      email,
      userRole,
      path,
      token_length: resetToken.length,
      token_prefix: resetToken.substring(0, 10) + "...",
    });

    // Prepare request data based on role
    const requestData = userRole === "security"
      ? {
          email,
          reset_token: resetToken,
          password,
          password_confirmation: confirmPassword,
        }
      : {
          email,
          token: resetToken, // Other roles might use 'token' instead of 'reset_token'
          password,
          password_confirmation: confirmPassword,
        };

    console.log("Sending request data:", {
      ...requestData,
      password: "***", // Hide password in logs
      password_confirmation: "***"
    });

    // Use appropriate method based on role
    const response = userRole === "security"
      ? await api.put(path, requestData)
      : await api.post(path, requestData);

    console.log("Reset password response:", response.data);

    if (response.data.message) {
      // Clear all reset flow data upon success
      setResetFlowData({ email: null, resetToken: null, userRole: null });
      toast.success("Password successfully reset! Please sign in.");
      return true;
    }
  } catch (error) {
    console.error("Password reset failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config?.data ? JSON.parse(error.config.data) : null
    });

    let errorMessage = "Failed to reset password. Token may have expired.";

    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.status === 401) {
      errorMessage = "Invalid or expired reset token. Please start the process again.";
    } else if (error.response?.status === 422) {
      errorMessage = "Validation failed: " + JSON.stringify(error.response.data.errors);
    }

    toast.error(errorMessage);

    // If token is invalid, clear reset flow data
    if (error.response?.status === 401) {
      setResetFlowData({ email: null, resetToken: null, userRole: null });
    }

    return false;
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        login,
        updateUser,
        logout,
        loading,
        forgotPassword,
        verifyOtp,
        resetPassword,
        resetFlowData,
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
