import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import SwiftEntryLogo from "/pwa-512x512.svg";

import {
  ShieldCheck,
  UserPlus,
  Users,
  History,
  QrCode,
  KeyRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const primaryLinks = [
  { to: "/security-dashboard", label: "Guest Confirmation", icon: ShieldCheck, exact: true },
  { to: "/security-dashboard/register-new-guest", label: "Register Guest", icon: UserPlus },
  { to: "/security-dashboard/manage-security-guests", label: "Manage Guests", icon: Users },
  { to: "/security-dashboard/history", label: "History", icon: History },
  { to: "/security-dashboard/generate-qr-code", label: "Generate QR Code", icon: QrCode },
  { to: "/security-dashboard/generate-by-unique-code", label: "Enter Unique Code", icon: KeyRound },
];

function SecuritySidebar({ open, onClose }) {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname === link.to ||
        location.pathname.startsWith(`${link.to}/`);

  const linkClass = (active) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${
      active ? "bg-[#1888ed] shadow-md shadow-blue-500/30" : "hover:bg-white/10"
    }`;

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
        {/* Subtle Ambient Lighting Overlay */}
        <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-b from-blue-400/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
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

            {primaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={linkClass(isActive(link))}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pb-2 flex flex-col gap-2">
            <div className="py-1 px-1">
              <div className="h-px bg-white/15 w-full"></div>
            </div>

            <Link
              to="/security-dashboard/security-settings"
              onClick={onClose}
              className={linkClass(location.pathname === "/security-dashboard/security-settings")}
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
              <span className="font-sans text-xs font-semibold leading-4">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SecuritySidebar;
