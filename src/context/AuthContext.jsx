import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();

  // Login function
  const login = async (email, password) => {
    try {
      await api.get("/sanctum/csrf-cookie", {
        baseURL: "https://vms-api.194.62.98.28.nip.io",
      });
  
      const endpoints = [
        "/front-desk/login",
        "/staff/auth/login",
        "/security/auth/login",
        "/admin/login",
      ];
  
      for (const endpoint of endpoints) {
        try {
          const response = await api.post(endpoint, { email, password });
  
          if (response.data.token) {
            setUser(response.data.user);
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  
            switch (response.data.user.role) {
              case "admin":
                navigate("/admin-dashboard");
                break;
              case "staff":
                navigate("/staff-dashboard");
                break;
              case "security":
                navigate("/security-dashboard");
                break;
              case "front_desk":
                navigate("/front-desk-dashboard");
                break;
              default:
                navigate("/");
            }
            return true; // Indicate successful login
          }
        } catch (error) {
          console.error(`Failed login attempt at ${endpoint}`, error.response?.data || error.message);
        }
      }
  
      alert("Invalid credentials or user not found.");
      return false; // Indicate failed login
    } catch (error) {
      console.error("Login failed:", error);
      alert("An error occurred. Please try again.");
      return false; // Indicate error in login
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);


