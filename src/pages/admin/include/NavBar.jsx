import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext";

function Navbar() {
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  // Destructure latestUnread and markAsRead for the dropdown functionality
  const { unreadCount, markAllAsRead, latestUnread, markAsRead } = useNotifications();

  useEffect(() => {
    // Check if user navigates to the *full* notification page
    if (location.pathname === "/admin-dashboard/notifications" && unreadCount > 0) {
      // markNotificationsAsRead is called in AdminNotifications.jsx's useEffect,
      // but keeping this redundant check here is a safe fallback if navigation is faster than component mount.
      // Removed setUnreadCount(0) to rely on the markAllAsRead in AdminNotifications.jsx updating the count.
    }
  }, [location, unreadCount, markAllAsRead]);

  // Handle click on an item in the dropdown
  const handleDropdownNotificationClick = (notificationId) => {
    markAsRead(notificationId); // Mark the single notification as read (Point 4)
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

            {/* Staff Management Dropdown */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle px-3 ${
                  [
                    "/admin-dashboard/staffs",
                    "/admin-dashboard/frontdesk",
                    "/admin-dashboard/security",
                  ].includes(location.pathname)
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                href="#"
                id="staffDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Staff Management
              </a>
              <ul className="dropdown-menu">
                <li>
                  <NavLink
                    className={`dropdown-item ${
                      location.pathname === "/admin-dashboard/staffs"
                        ? "fw-bold text-light"
                        : ""
                    }`}
                    to="/admin-dashboard/staffs"
                  >
                    Staff
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={`dropdown-item ${
                      location.pathname === "/admin-dashboard/frontdesk"
                        ? "fw-bold text-light "
                        : ""
                    }`}
                    to="/admin-dashboard/frontdesk"
                  >
                    Frontdesk
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={`dropdown-item ${
                      location.pathname === "/admin-dashboard/security"
                        ? "fw-bold text-light"
                        : ""
                    }`}
                    to="/admin-dashboard/security"
                  >
                    Security
                  </NavLink>
                </li>
              </ul>
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

            <li className="nav-item">
              <NavLink
                className={`nav-link px-3 ${
                  location.pathname === "/admin-dashboard/new-guest"
                    ? "text-white fw-bold"
                    : "text-white-50"
                }`}
                to="/admin-dashboard/new-guest"
              >
                Register Guest
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Right Side Icons */}
        <div className="d-flex align-items-center">
          {/* Notification Icon Dropdown (Point 1, 2, 3, 4) */}
          <div className="dropdown me-3">
            <a
              href="#"
              className="position-relative d-flex align-items-center"
              id="notificationDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i
                className="bi bi-bell fs-4 text-white rounded-circle p-2"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transition: "0.3s ease-in-out",
                }}
              ></i>
              {/* Point 1: Notification Count on Bell Icon */}
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.7em" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                  <span className="visually-hidden">unread messages</span>
                </span>
              )}
            </a>

            {/* Point 2: Dropdown Menu showing recent 3 */}
            <ul
              className="dropdown-menu dropdown-menu-end shadow"
              aria-labelledby="notificationDropdown"
              style={{ width: "320px", maxHeight: "400px", overflowY: "auto" }}
            >
              <li className="dropdown-header fw-bold">Recent Notifications</li>
              {latestUnread.length > 0 ? (
                latestUnread.map((notification) => (
                  <li key={notification.id}>
                    {/* Point 3 & 4: Clicking takes user to full page and marks as read */}
                    <NavLink
                      className="dropdown-item d-flex align-items-start py-2"
                      to="/admin-dashboard/notifications"
                      onClick={() => handleDropdownNotificationClick(notification.id)}
                      style={{
                          // Highlight the item visually distinct (Point 4)
                          backgroundColor: notification.is_read ? 'transparent' : '#f8f9fa',
                      }}
                    >
                      <div>
                          <small className="fw-bold text-dark">{notification.title}</small>
                          <p className="mb-0 text-muted text-wrap" style={{ fontSize: "0.85em" }}>
                            {notification.message}
                          </p>
                          <span className="badge bg-light text-muted fw-normal">{notification.created_at}</span>
                      </div>
                    </NavLink>
                  </li>
                ))
              ) : (
                <li>
                  <span className="dropdown-item text-center text-muted">No new notifications</span>
                </li>
              )}

              {/* Point 3: "View All" Link */}
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <NavLink
                  className="dropdown-item text-center text-success fw-bold"
                  to="/admin-dashboard/notifications"
                >
                  View All Notifications
                </NavLink>
              </li>
            </ul>
          </div>

          {/* User Profile Dropdown */}
          <div className="dropdown">
              {loading ? (
                <span className="text-white">Loading...</span>
              ) : user ? (
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
                  <span className="fw-semibold">{user.name}</span>
                  <img
                    src={user?.profile_picture ? user.profile_picture : "../images/user.png"}
                    alt="Profile"
                    className="rounded-circle border"
                    width="40"
                    height="40"
                  />
                </button>
              ) : (
                <NavLink to="/login" className="btn btn-light">
                  Login
                </NavLink>
              )}

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
                    location.pathname === "/admin-dashboard/profile"
                      ? "text-primary bg-white fw-bold"
                      : "text-dark bg-white"
                  }`}
                  to="/admin-dashboard/profile"
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={`dropdown-item py-2 ${
                    location.pathname === "/admin-dashboard/settings"
                      ? "text-primary bg-white fw-bold"
                      : "text-dark bg-white"
                  }`}
                  to="/admin-dashboard/settings"
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
