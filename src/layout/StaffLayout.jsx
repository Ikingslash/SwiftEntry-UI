import { useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../pages/staffDashboard/include/StaffSidebar";
import { SidebarContext } from "./SidebarContext";

function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex h-dvh bg-[#f3f7fc] overflow-hidden font-sans">
        <StaffSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col h-full overflow-y-auto min-w-0">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default StaffLayout;
