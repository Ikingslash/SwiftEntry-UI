import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import SwiftEntryLogo from "/pwa-512x512.svg";

import {
  LayoutDashboard,
  UserPlus,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";

function StaffSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      to: "/staff-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Register Guest",
      to: "/staff-dashboard/new-guest",
      icon: UserPlus,
    },
    {
      label: "Manage Guests",
      to: "/staff-dashboard/manage-guest",
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto w-[16rem] bg-gradient-to-b from-[#08528f] via-[#053561] to-[#01182c] text-white flex flex-col justify-between p-3 shrink-0 select-none shadow-2xl h-dvh overflow-y-auto border-r border-blue-500/20 transition-transform duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <style>{`
          .admin-sidebar a,
          .admin-sidebar button {
            text-decoration: none !important;
          }
        `}</style>
        {/* Subtle Ambient Lighting Overlay */}
        <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-b from-blue-400/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo + nav in one uniform-gap column */}
          <nav className="flex flex-col gap-2 pt-1">
            <div className="px-2 pb-1 flex items-center justify-between">
              <img
                src={SwiftEntryLogo}
                alt="SwiftEntry Logo"
                className="h-14 w-auto object-contain filter brightness-0 invert"
              />
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-0 cursor-pointer transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {navItems.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${
                  location.pathname === to
                    ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Pushed to bottom: Divider, Settings, and Log Out */}
          <div className="mt-auto pb-2 flex flex-col gap-2">
            <div className="py-1 px-1">
              <div className="h-px bg-white/15 w-full"></div>
            </div>

            <Link
              to="/staff-dashboard/staff-settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${
                location.pathname === "/staff-dashboard/staff-settings"
                  ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                  : "hover:bg-white/10"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold leading-4 text-white whitespace-nowrap bg-transparent border-0 appearance-none cursor-pointer text-left no-underline transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="font-sans text-xs font-semibold leading-4">
                Log Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default StaffSidebar;
