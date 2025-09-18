import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext"; // New import

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(); // Get the unread count from the context

  return (
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
                  location.pathname === "/front-desk-dashboard"
                    ? "text-white fw-bold "
                    : "text-white-50"
                }`}
                to="/front-desk-dashboard"
              >
                Guest Confirmation
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/front-desk-dashboard/register-guest"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/front-desk-dashboard/register-guest"
              >
                Register Guest
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/front-desk-dashboard/history"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/front-desk-dashboard/history"
              >
                History
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/front-desk-dashboard/notifications"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/front-desk-dashboard/notifications"
              >
                Notifications
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Right Side Icons */}
        <div className="d-flex align-items-center">
          {/* Notification Icon */}
          <NavLink
            to="/front-desk-dashboard/notifications"
            className="me-3 position-relative d-flex align-items-center"
            aria-label="Notifications"
          >
            <i
              className="bi bi-bell fs-4 text-white rounded-circle p-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transition: "0.3s ease-in-out",
              }}
            ></i>
            {/* Display the unread count badge */}
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "10px" }}
              >
                {unreadCount}
                <span className="visually-hidden">unread messages</span>
              </span>
            )}
          </NavLink>

          {/* User Profile Dropdown */}
          <div className="dropdown">
            <button
              className="btn text-white d-flex align-items-center dropdown-toggle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                gap: "0.5rem",
                background: "transparent",
                border: "none",
              }}
            >
              <span className="fw-semibold">{user?.name}</span>
              <img
                src={`https://app.theswiftentry.com${user.profile_picture}`}
                alt="Profile"
                className="rounded-circle border"
                width="40"
                height="40"
              />
            </button>

            {/* Remove the default arrow using inline style or override */}
            <style>
              {`
                #profileDropdown::after {
                  display: none !important;
                }
              `}
            </style>

            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="profileDropdown"
            >
              <li>
                <NavLink
                  className={`dropdown-item py-2 ${
                    location.pathname === "/front-desk-dashboard/profile"
                      ? "text-primary bg-white fw-bold"
                      : "text-dark bg-white"
                  }`}
                  to="/front-desk-dashboard/profile"
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={`dropdown-item py-2 ${
                    location.pathname ===
                    "/front-desk-dashboard/front-desk-settings"
                      ? "text-primary bg-white fw-bold"
                      : "text-dark bg-white"
                  }`}
                  to="/front-desk-dashboard/front-desk-settings"
                >
                  Settings
                </NavLink>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item py-2 text-danger"
                  onClick={logout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
