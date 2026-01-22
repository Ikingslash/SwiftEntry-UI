import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VisitorLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
                  className={`nav-link px-3 ${location.pathname === "/visitor-dashboard"
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
                  className={`nav-link px-3 ${location.pathname === "/visitor-dashboard/register-visit"
                      ? "text-white fw-bold"
                      : "text-white-50"
                    }`}
                  to="/visitor-dashboard/register-visit"
                >
                  Register Visit
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Right Side - User Dropdown */}
          <div className="d-flex align-items-center user-dropdown-container position-relative">
            <button
              className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ border: "none", background: "transparent" }}
            >
              <span>Welcome, {user?.name}</span>
              <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'}`}></i>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="position-absolute bg-white rounded shadow-lg py-2"
                style={{
                  top: "100%",
                  right: 0,
                  minWidth: "150px",
                  marginTop: "8px",
                  zIndex: 1000,
                }}
              >
                <NavLink
                  to="/visitor-dashboard/profile"
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none"
                  onClick={() => setShowDropdown(false)}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-person"></i>
                  Profile
                </NavLink>
                <hr className="my-1" />
                <button
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger w-100 border-0 bg-transparent"
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            )}
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
