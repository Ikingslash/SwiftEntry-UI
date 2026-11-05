import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../pages/admin/include/AdminSidebar";
import ScopeBanner from "../components/tenancy/ScopeBanner";
import { SidebarContext } from "./SidebarContext";
import { useTenant } from "../context/TenantContext";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { viewingTenantId } = useTenant();

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex h-dvh bg-[#f3f7fc] overflow-hidden font-sans">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col h-full overflow-y-auto min-w-0">
          <ScopeBanner />
          {/*
            Pages fetch on mount and don't watch the tenant filter, so switching
            tenants would leave stale data on screen. Keying the page on the
            filter remounts it, and every page refetches for the new tenant.
          */}
          <div key={viewingTenantId ?? "all-tenants"} className="contents">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default AdminLayout;
