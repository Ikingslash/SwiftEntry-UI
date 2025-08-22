// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "./api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Retrieve token and role from localStorage on initial load
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null); // New state for user role
  const navigate = useNavigate();

  const getProfileEndpoint = (userRole) => {
    switch (userRole) {
      case "admin":
        return "/admin/profile"; // Assuming 'me' is the profile endpoint for admin
      case "staff":
        return "/staff/profile";
      case "security":
        return "/security/user-profile";
      case "front_desk":
        return "front-desk/profile";
      default:
        return null;
    }
  };

  // useEffect hook to handle authentication on initial load
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("userRole"); // Get stored role

      if (storedToken && storedRole) {
        // Set the Authorization header for the API call
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setToken(storedToken);
        setRole(storedRole); // Set role state

        const profileEndpoint = getProfileEndpoint(storedRole);
        if (profileEndpoint) {
          try {
            // Fetch user data from the dynamically determined protected route
            const response = await api.get(profileEndpoint);
            setUser(response.data);
          } catch (error) {
            console.error(
              "Token is invalid or expired, or profile fetch failed:",
              error
            );
            // Clear token and role if profile fetch fails
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            setToken(null);
            setRole(null);
            setUser(null);
          }
        } else {
          // No valid profile endpoint for the stored role
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          setToken(null);
          setRole(null);
          setUser(null);
        }
      }
      setLoading(false); // Authentication check is complete
    };
    loadUser();
  }, []); // Empty dependency array means this runs only once on mount

  // Login function
  const login = async (email, password) => {
    try {
      await api.get("/sanctum/csrf-cookie", {
        baseURL: "https://vms-api.85.9.202.212.nip.io",
      });

      const endpoints = [
        {
          path: "/front-desk/auth/login",
          role: "front_desk",
          dashboard: "/front-desk-dashboard",
        },
        {
          path: "/staff/auth/login",
          role: "staff",
          dashboard: "/staff-dashboard",
        },
        {
          path: "/security/auth/login",
          role: "security",
          dashboard: "/security-dashboard",
        },
        {
          path: "/admin/login",
          role: "admin",
          dashboard: "/admin-dashboard",
        },
      ];

      for (const { path, role, dashboard } of endpoints) {
        try {
          const response = await api.post(path, { email, password });

          if (response.data.token) {
            setUser(response.data.user);
            setToken(response.data.token);
            setRole(role); // Store the determined role
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userRole", role); // Store the user's role
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${response.data.token}`;

            // Navigate based on user role
            navigate(dashboard);
            return true; // Indicate successful login
          }
        } catch (error) {
          // Log specific login endpoint errors, but don't toast yet
          console.error(
            `Failed login attempt at ${path}`,
            error.response?.data || error.message
          );
        }
      }

      // If loop completes without successful login
      toast.error("Invalid credentials or user not found.");
      return false; // Indicate failed login
    } catch (error) {
      console.error("Login failed due to unexpected error:", error);
      toast.error("An error occurred. Please try again.");
      return false; // Indicate error in login
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

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
