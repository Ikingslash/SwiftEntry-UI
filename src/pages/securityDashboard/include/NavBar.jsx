import { NavLink, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
      style={{ backgroundColor: "#053561" }}
    >
      <div className="container">
        {/* Logo on the left */}
        <a className="navbar-brand fw-bold text-white pt-2" href="/security-dashboard">
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
                  location.pathname === "/security-dashboard"
                    ? "text-white fw-bold "
                    : "text-white-50"
                }`}
                to="/security-dashboard"
              >
                Guest Confirmation
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/security-dashboard/register-new-guest"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/security-dashboard/register-new-guest"
              >
                Register Guest
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/security-dashboard/history"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/security-dashboard/history"
              >
               History
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/security-dashboard/notifications"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/security-dashboard/notifications"
              >
                Notifications
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/security-dashboard/generate-qr-code"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/security-dashboard/generate-qr-code"
              >
                Generate
              </NavLink>
            </li>
        
          </ul>
        </div>

        {/* Right Side Icons */}
        <div className="d-flex align-items-center">
          {/* Notification Icon */}
          <a
            href="#notifications"
            className="me-3 position-relative d-flex align-items-center"
          >
            <i
              className="bi bi-bell fs-4 text-white rounded-circle p-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transition: "0.3s ease-in-out",
              }}
            ></i>
          </a>

          {/* User Profile Dropdown */}
          <div className="dropdown">
            <button
              className="btn text-white dropdown-toggle d-flex align-items-center"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="fw-semibold me-2">John Aliyu</span>
              <img
                src="../images/user.png"
                alt="User"
                className="rounded-circle border"
                width="40"
                height="40"
              />
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="profileDropdown"
            >
              <li>
                <a className="dropdown-item py-2" href="/profile">
                  Profile
                </a>
              </li>
              <li>
                <a className="dropdown-item py-2" href="/settings">
                  Settings
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item py-2 text-danger" href="/logout">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
