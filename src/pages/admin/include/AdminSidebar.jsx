import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import TenantSwitcher from "../../../components/tenancy/TenantSwitcher";
import SwiftEntryLogo from "/pwa-512x512.svg";

import {
  LayoutDashboard,
  UserPlus,
  Users,
  Building2,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";

function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const { isTenantScope, activeTenant } = useTenant();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  // Tenant admins get the same shell at a different prefix, with a reduced
  // navigation set. Building admins keep the full menu.
  const base = isTenantScope ? "/tenant-dashboard" : "/admin-dashboard";

  const staffPaths = isTenantScope
    ? activeTenant?.own_front_desk
      ? [`${base}/staffs`, `${base}/frontdesk`]
      : [`${base}/staffs`]
    : [
      `${base}/admins`,
      `${base}/frontdesk`,
      `${base}/security`,
      `${base}/self-service`,
    ];

  const staffItems = isTenantScope
    ? activeTenant?.own_front_desk
      ? [
        { label: "Staff", path: `${base}/staffs` },
        { label: "Frontdesk", path: `${base}/frontdesk` },
      ]
      : [{ label: "Staff", path: `${base}/staffs` }]
    : [
      { label: "Tenants Admin", path: `${base}/admins` },
      { label: "Frontdesk", path: `${base}/frontdesk` },
      { label: "Security", path: `${base}/security` },
      { label: "Self-Service Users", path: `${base}/self-service` },
    ];

  const activeStaffIdx = staffPaths.indexOf(location.pathname);

  useEffect(() => {
    const path = location.pathname;
    if (staffPaths.includes(path)) {
      setOpenMenu("staff");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isActive = (path, { startsWith = false } = {}) =>
    startsWith ? location.pathname.startsWith(path) : location.pathname === path;

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
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 lg:static lg:z-auto w-[16rem] bg-gradient-to-b from-[#08528f] via-[#053561] to-[#01182c] text-white flex flex-col justify-between p-3 shrink-0 select-none shadow-2xl h-dvh overflow-y-auto border-r border-blue-500/20 transition-transform duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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

            <TenantSwitcher light className="mb-1" />

            <Link
              to={base}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${isActive(base)
                ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                : "hover:bg-white/10"
                }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              to={`${base}/new-guest`}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${isActive(`${base}/new-guest`)
                ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                : "hover:bg-white/10"
                }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Register Guest</span>
            </Link>

            {/* Visitors Direct Link (Dropdown removed) */}
            <Link
              to={`${base}/visitors`}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${location.pathname.startsWith(`${base}/visitors`) ||
                location.pathname.startsWith(`${base}/visits`)
                ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                : "hover:bg-white/10"
                }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Visitors</span>
            </Link>

            {/* Staff Management Accordion with Dot Indicators */}
            <div className="w-full">
              <div
                onClick={() => setOpenMenu(openMenu === "staff" ? null : "staff")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-white whitespace-nowrap cursor-pointer ${staffPaths.includes(location.pathname)
                  ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                  : "hover:bg-white/10"
                  }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">Staff Management</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openMenu === "staff" ? "rotate-180" : ""
                    }`}
                />
              </div>
              {openMenu === "staff" && (
                <div className="mt-1.5 ml-3 flex flex-col gap-1.5 pl-3 relative">
                  {/* Track line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-white/15" />
                  {/* Highlight line grows to active item */}
                  {activeStaffIdx >= 0 && (
                    <div
                      className="absolute left-0 top-0 w-px bg-white/80 transition-all duration-300"
                      style={{
                        height: `${((activeStaffIdx + 1) / Math.max(staffPaths.length, 1)) * 100}%`,
                      }}
                    />
                  )}
                  {staffItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all duration-200 ${location.pathname === item.path
                        ? "bg-white/15 text-white"
                        : "text-white hover:bg-white/10"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${location.pathname === item.path
                          ? "bg-white"
                          : "bg-white/50"
                          }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to={`${base}/analytical-report`}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${isActive(`${base}/analytical-report`, { startsWith: true })
                ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                : "hover:bg-white/10"
                }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Reports &amp; Analytics</span>
            </Link>
          </nav>

          {/* Pushed to bottom: Divider, Settings, and Log Out */}
          <div className="mt-auto pb-2 flex flex-col gap-2">
            <div className="py-1 px-1">
              <div className="h-px bg-white/15 w-full"></div>
            </div>

            {!isTenantScope && (
              <Link
                to={`${base}/settings`}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 no-underline text-white whitespace-nowrap ${isActive(`${base}/settings`)
                  ? "bg-[#1888ed] shadow-md shadow-blue-500/30"
                  : "hover:bg-white/10"
                  }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </Link>
            )}

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

export default AdminSidebar;
