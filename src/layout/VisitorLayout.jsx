import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "../components/UserAvatar";
import {
  Menu,
  X,
  Search,
  CalendarPlus,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

function VisitorLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/visitor-dashboard", label: "Search Visit", icon: Search },
    {
      to: "/visitor-dashboard/register-visit",
      label: "Register Visit",
      icon: CalendarPlus,
    },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors no-underline ${
      isActive
        ? "bg-white/15 text-white"
        : "text-blue-100/80 hover:text-white hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#053561] shadow-md">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <NavLink
            to="/visitor-dashboard"
            className="flex items-center shrink-0 no-underline"
          >
            <img
              src="/image.png"
              alt="SwiftEntry"
              className="h-8 w-auto max-w-[140px] object-contain"
            />
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end className={linkClass}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Profile dropdown (desktop) */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer text-white"
              >
                <UserAvatar
                  image={user?.profile_picture}
                  firstName={user?.name || "Visitor"}
                  size={32}
                  className="rounded-full object-cover border border-white/30"
                />
                <span className="text-xs font-semibold max-w-[120px] truncate">
                  {user?.name || "Visitor"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 mb-0 truncate">
                      {user?.name || "Visitor"}
                    </p>
                    <p className="text-[10px] text-slate-500 mb-0 truncate">
                      {user?.email || "Visitor account"}
                    </p>
                  </div>
                  <NavLink
                    to="/visitor-dashboard/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 no-underline"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-0 bg-transparent cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-0 cursor-pointer transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 pb-4 pt-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}

            <div className="flex items-center gap-2.5 px-2 pt-3 mt-2 border-t border-white/10">
              <UserAvatar
                image={user?.profile_picture}
                firstName={user?.name || "Visitor"}
                size={34}
                className="rounded-full object-cover border border-white/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white mb-0 truncate">
                  {user?.name || "Visitor"}
                </p>
                <p className="text-[10px] text-blue-200 mb-0 truncate">
                  {user?.email || "Visitor account"}
                </p>
              </div>
              <NavLink
                to="/visitor-dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center no-underline transition-colors"
                aria-label="Profile"
              >
                <User className="w-4 h-4" />
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white flex items-center justify-center border-0 cursor-pointer transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-16">
        {children}
      </main>
    </div>
  );
}

export default VisitorLayout;
