import { useState } from "react";
import GeneralSettings from "./GeneralSettings";
// import UserRolePermission from "./UserRolePermission";
import Notification from "./Notification";
import DataPrivacy from "./DataPrivacy";
import SystemSecurity from "./SystemSecurity";
import Profile from "./Profile";
import AdminTopHeader from "../include/AdminTopHeader";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general-settings");

  const tabs = [
    { id: "general-settings", label: "General Settings" },
    // { id: "user-role-permission", label: "User Role and Permission" },
    { id: "notification", label: "Notification" },
    { id: "data-privacy", label: "Data and Privacy" },
    { id: "system-security", label: "System Security" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <AdminTopHeader />

      {/* Header Container aligned to max-w-[1140px] */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Settings
        </p>
        <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
          Manage your account preferences, system security, and configuration options.
        </p>
      </div>

      {/* Tabs Navigation Bar Container: line starts at first element and ends exactly at last element */}
      <div className="max-w-[1140px] mx-auto px-4 mt-2">
        <div className="overflow-x-auto pb-px">
          <div className="inline-flex items-center space-x-1 border-b border-slate-300">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-t-xl transition-all duration-200 -mb-px cursor-pointer whitespace-nowrap ${isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Container */}
      <div className="max-w-[1140px] mx-auto px-4 mt-6">
        <div className="bg-white rounded-b-3xl rounded-tr-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          {activeTab === "general-settings" && <GeneralSettings />}
          {/* {activeTab === "user-role-permission" && <UserRolePermission />} */}
          {activeTab === "notification" && <Notification />}
          {activeTab === "data-privacy" && <DataPrivacy />}
          {activeTab === "system-security" && <SystemSecurity />}
          {activeTab === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;