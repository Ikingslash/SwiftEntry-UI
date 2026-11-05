import { useState } from "react";
import { Outlet } from "react-router-dom";
import SecuritySidebar from "../pages/securityDashboard/include/SecuritySidebar";
import SecurityTopHeader from "../pages/securityDashboard/include/SecurityTopHeader";

function SecurityLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-[#F0F7FF] overflow-hidden font-sans">
      <SecuritySidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full overflow-y-auto min-w-0">
        <SecurityTopHeader onMenuClick={() => setSidebarOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}

export default SecurityLayout;
