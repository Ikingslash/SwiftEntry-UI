import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext";
import UserAvatar from "../../../components/UserAvatar";

const links = [
  { to: "/security-dashboard", label: "Guest Confirmation", end: true },
  { to: "/security-dashboard/register-new-guest", label: "Register Guest" },
  { to: "/security-dashboard/history", label: "History" },
  { to: "/security-dashboard/manage-security-guests", label: "Manage Guests" },
];

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { unreadCount, latestUnread, markAsRead, fetchLatestUnread } =
    useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-[1140px] mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/security-dashboard"
          className="flex items-center gap-2 shrink-0 no-underline"
        >
          <img src="../image.png" alt="Logo" className="h-9 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-50 border border-slate-100 rounded-full">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 no-underline ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onMouseEnter={() => {
                setShowNotifications(true);
                fetchLatestUnread?.();
              }}
              onClick={() => navigate("/security-dashboard/notifications")}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center focus-visible:outline-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                onMouseLeave={() => setShowNotifications(false)}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-lg border border-slate-100 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h6 className="font-bold text-slate-900 text-xs mb-0">
                    Recent Notifications
                  </h6>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex flex-col divide-y divide-slate-50 max-h-60 overflow-y-auto">
                  {latestUnread?.length > 0 ? (
                    latestUnread.map((notification) => (
                      <Link
                        key={notification.id}
                        to="/security-dashboard/notifications"
                        onClick={() => markAsRead(notification.id)}
                        className="px-4 py-2.5 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5 cursor-pointer no-underline"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 mb-0">
                            {notification.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mb-0 leading-tight mt-0.5">
                            {notification.message}
                          </p>
                          {notification.created_at && (
                            <span className="text-[9px] text-slate-400">
                              {notification.created_at}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-[11px] text-slate-400">
                      No new notifications
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50/50 border-t border-slate-100 text-center">
                  <Link
                    to="/security-dashboard/notifications"
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 no-underline transition-colors block"
                  >
                    See all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfile((prev) => !prev)}
              className="flex items-center gap-2.5 ps-3 border-l border-slate-200 bg-transparent border-0 cursor-pointer"
            >
              <UserAvatar
                image={user?.photo || user?.profile_picture}
                firstName={user?.name || "Security"}
                size={38}
                className="rounded-full object-cover shadow-sm"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 mb-0 leading-tight">
                  {loading ? "Loading..." : user?.name || "Security"}
                </p>
                <span className="text-[11px] text-slate-500 font-medium">
                  Security
                </span>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 z-50 overflow-hidden py-1.5">
                <Link
                  to="/security-dashboard/profile"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 no-underline transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> Profile
                </Link>
                <Link
                  to="/security-dashboard/security-settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 no-underline transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Settings
                </Link>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 bg-transparent border-0 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden border-t border-slate-100 bg-white overflow-x-auto">
        <nav className="flex items-center gap-1 px-3 py-2 min-w-max">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-[11px] font-bold transition-all no-underline whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
