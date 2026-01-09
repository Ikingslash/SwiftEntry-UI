import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VisitorLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <div>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
        style={{ backgroundColor: "#053561" }}
      >
        <div className="container">
          {/* Logo on the left */}
          <a className="navbar-brand fw-bold text-white pt-2" href="#">
            <img src="../image.png" width={140} alt="Logo" />
          </a>

          {/* Navbar Toggler */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span
              className="navbar-toggler-icon"
              style={{ filter: "invert(1)" }}
            ></span>
          </button>

          {/* Navigation Links */}
          <div
            className="collapse navbar-collapse justify-content-center"
            id="navbarNav"
          >
            <ul className="navbar-nav text-center fs-6">
              <li className="nav-item">
                <NavLink
                  className={`nav-link px-3 ${
                    location.pathname === "/visitor-dashboard"
                      ? "text-white fw-bold"
                      : "text-white-50"
                  }`}
                  to="/visitor-dashboard"
                >
                  Search Visit
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={`nav-link px-3 ${
                    location.pathname === "/visitor-dashboard/register-visit"
                      ? "text-white fw-bold"
                      : "text-white-50"
                  }`}
                  to="/visitor-dashboard/register-visit"
                >
                  Register Visit
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={`nav-link px-3 ${
                    location.pathname === "/visitor-dashboard/profile"
                      ? "text-white fw-bold"
                      : "text-white-50"
                  }`}
                  to="/visitor-dashboard/profile"
                >
                  Profile
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Right Side - User & Logout */}
          <div className="d-flex align-items-center gap-3">
            <div className="text-white">
              <small>Welcome, {user?.name}</small>
            </div>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ marginTop: "80px", padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

export default VisitorLayout;
