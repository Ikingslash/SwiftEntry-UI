import { useState } from "react";
import GeneralSettings from "./GeneralSettings";
import UserRolePermission from "./UserRolePermission";
import Notification from "./Notification";
import DataPrivacy from "./DataPrivacy";
import SystemSecurity from "./SystemSecurity";
import Profile from "./Profile";

import NavBar from "../include/NavBar"; 

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general-settings");

  return (
    <div>
      <NavBar />
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "270px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center ">
              <h3 className="mb-4">Manage Visitors</h3>
            </div>
            <div
              className="flex-grow-1 px-4"
              style={{
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            ></div>
          </div>
        </div>
      </header>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center">
          {/* Bootstrap Nav Tabs */}
          <ul className="nav nav-tabs">
            <li className="nav-item pe-4">
              <button
                className={`nav-link ${
                  activeTab === "general-settings"
                    ? "active"
                    : "text-dark"
                }`}
                onClick={() => setActiveTab("general-settings")}
              >
                General Settings
              </button>
            </li>
            <li className="nav-item pe-4">
              <button
                className={`nav-link ${
                  activeTab === "user-role-permission" ? "active" : "text-dark"
                }`}
                onClick={() => setActiveTab("user-role-permission")}
              >
                User Role and Permission
              </button>
            </li>
            <li className="nav-item pe-4">
              <button
                className={`nav-link ${
                  activeTab === "notification" ? "active" : "text-dark"
                }`}
                onClick={() => setActiveTab("notification")}
              >
                Notification
              </button>
            </li>
            <li className="nav-item pe-4">
              <button
                className={`nav-link ${
                  activeTab === "data-privacy" ? "active" : "text-dark"
                }`}
                onClick={() => setActiveTab("data-privacy")}
              >
                Data and Privacy
              </button>
            </li>
            <li className="nav-item pe-4">
              <button
                className={`nav-link ${
                  activeTab === "system-security" ? "active" : "text-dark"
                }`}
                onClick={() => setActiveTab("system-security")}
              >
                System Security
              </button>
            </li>
            <li className="nav-item pe-4">
              <button
                className={`nav-link ${
                  activeTab === "profile" ? "active" : "text-dark"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
            </li>
          </ul>
      
        </div>
        {/* Content */}
        <div className="mt-5">
          {activeTab === "general-settings" && <GeneralSettings />}
          {activeTab === "user-role-permission" && <UserRolePermission />}
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
