// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "./api";
import { toast } from "react-toastify";

const AuthContext = createContext();

// Define user roles and their authentication path prefixes
const AUTH_PATHS = {
  admin: { login: "/admin/login", forgot: "/admin/forgot-password", verify: "/admin/verify-otp", reset: "/admin/reset-password", profile: "/admin/profile" },
  staff: { login: "/staff/auth/login", forgot: "/staff/auth/forgot-password", verify: "/staff/auth/verify-otp", reset: "/staff/auth/reset-password", profile: "/staff/profile" },
  security: { login: "/security/auth/login", forgot: "/security/auth/forgot-password", verify: "/security/auth/verify-otp", reset: "/security/auth/reset-password", profile: "/security/user-profile" },
  front_desk: { login: "/front-desk/auth/login", forgot: "/front-desk/auth/forgot-password", verify: "/front-desk/auth/verify-otp", reset: "/front-desk/auth/reset-password", profile: "/front-desk/profile" },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const navigate = useNavigate();

  // New state to store user email and reset token during the password reset flow
  const [resetFlowData, setResetFlowData] = useState({
    email: null,
    resetToken: null,
    userRole: null
  });


  const getProfileEndpoint = (userRole) => AUTH_PATHS[userRole]?.profile;


  // ... (useEffect for loading user remains unchanged) ...

  const login = async (email, password) => {
    // ... (Existing login logic remains unchanged, using AUTH_PATHS[role].login) ...
    const roles = ['admin', 'staff', 'security', 'front_desk'];
    let dashboard = '/'; // Default fallback

    try {
      for (const role of roles) {
        const path = AUTH_PATHS[role].login;
        try {
          const response = await api.post(path, { email, password });

          if (response.data.token) {
            setUser(response.data.user);
            setToken(response.data.token);
            setRole(role);

            // Set dashboard based on role
            switch (role) {
                case 'admin': dashboard = "/admin-dashboard"; break;
                case 'staff': dashboard = "/staff-dashboard"; break;
              case 'security': dashboard = "/security-dashboard"; break;
              case 'front_desk': dashboard = '/front-desk-dashboard'; break;
              default: dashboard = '/';
            }

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userRole", role);
            api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

            navigate(dashboard);
            return true;
          }
        } catch (error) {
          console.error(`Failed login attempt at ${path}`, error.response?.data || error.message);
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
    setUser(null);
       setToken(null);
       setRole(null); // Clear role
       localStorage.removeItem("token");
       localStorage.removeItem("userRole"); // Clear stored role
       delete api.defaults.headers.common["Authorization"];
       navigate("/login");
  };

const updateUser = (newUserData) => {
  setUser(newUserData);
  localStorage.setItem("user", JSON.stringify(newUserData));
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
             console.error(`Mail sending failed for ${role} path:`, error.response?.data || error.message);
             mailFailed = true;
          } else {
            // Expected errors: 404/401 (user not found in this role's table)
            console.warn(`Forgot password check failed for ${role}:`, error.response?.data || error.message);
          }
       }
     }

      if (mailFailed) {
        // A hard failure occurred (e.g., mail server down) - this MUST be reported to the user as a failure.
        toast.error(
          "Failed to send verification email. Please contact support."
        );
        return false;
      }

     if (userRole) {
       setResetFlowData({ email: email, resetToken: null, userRole: userRole });
       toast.success("Verification code sent to your email.");
       return true;
     } else {
       toast.info("If this email is registered, a code has been sent.");
        setResetFlowData({ email: email, resetToken: null, userRole: "admin" });
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
      navigate('/forgot-password');
      return false;
    }

    try {
      const path = AUTH_PATHS[userRole].verify;
      const response = await api.post(path, { email, otp });

      if (response.data.reset_token) {
        // Store the reset token and navigate to SetNewPassword
        setResetFlowData(prev => ({ ...prev, resetToken: response.data.reset_token }));
        toast.success("OTP verified. Set your new password.");
        return true;
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Invalid or expired verification code.";
      toast.error(errorMessage);
      console.error("OTP verification failed:", error);
      return false;
    }
  };

 const resetPassword = async (email, resetToken, password, confirmPassword) => {
   // Note: userRole is pulled from resetFlowData in state
   const { userRole } = resetFlowData;

   if (!email || !resetToken || !userRole) {
     toast.error("Password reset process failed. Please restart.");
     navigate("/forgot-password");
     return false;
   }

   try {
     const path = AUTH_PATHS[userRole].reset;
     // Note: Backend resetPassword route for Security uses PUT, others use POST
     const method = userRole === "security" ? api.put : api.post;

     const response = await method(path, {
       email,
       reset_token: resetToken,
       password,
       password_confirmation: confirmPassword,
     });

     if (response.data.message) {
       // Clear all reset flow data upon success
       setResetFlowData({ email: null, resetToken: null, userRole: null });
       toast.success("Password successfully reset! Please sign in.");
       return true;
     }
   } catch (error) {
     const errorMessage =
       error.response?.data?.error ||
       "Failed to reset password. Token may have expired.";
     toast.error(errorMessage);
     console.error("Password reset failed:", error);
     return false;
   }
 };
  // END: NEW FUNCTIONS

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
        forgotPassword, // Add new functions
        verifyOtp,      // Add new functions
        resetPassword,  // Add new functions
        resetFlowData,  // Add reset flow state
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
