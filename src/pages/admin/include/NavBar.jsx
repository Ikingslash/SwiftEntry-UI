import { NavLink, useLocation } from "react-router-dom";
// import { useAuth } from "../../../context/AuthContext";

function Navbar() {
  // const location = useLocation();
  // const { user, logout } = useAuth();
    const location = useLocation();
  // const { user, logout } = useAuth();
   const user = { name: "John Aliyu" };
  const logout = () => {
    console.log("Logging out...");
    // perform logout logic here
  };
  
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
                  location.pathname === "/admin-dashboard"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/admin-dashboard"
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/admin-dashboard/visitors"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/admin-dashboard/visitors"
              >
                Visitors
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/admin-dashboard/staffs"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/admin-dashboard/staffs"
              >
                Staffs
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/admin-dashboard/analytical-report"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/admin-dashboard/analytical-report"
              >
                Reports & Analytics
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/admin-dashboard/settings"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/admin-dashboard/settings"
              >
                Settings
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
              <span className="fw-semibold me-2">{user?.name}</span>
              <img
                src="../images/user.png"
                alt="Profile"
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
                <button className="dropdown-item py-2 text-danger" onClick={logout}>
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
