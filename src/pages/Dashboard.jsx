import React, { useState } from "react";
import Home from "./dashboard/Home";
import NewGuest from "./dashboard/NewGuest";
import ManageGuests from "./dashboard/ManageGuests";
import Notifications from "./dashboard/Notifications";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="container mt-5">
      <h2 className="text-center">Dashboard</h2>

      {/* Bootstrap Nav Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>Home</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "new-guest" ? "active" : ""}`} onClick={() => setActiveTab("new-guest")}>New Guest</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "manage-guests" ? "active" : ""}`} onClick={() => setActiveTab("manage-guests")}>Manage Guests</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifications</button>
        </li>
      </ul>

      {/* Content */}
      <div className="mt-3">
        {activeTab === "home" && <Home />}
        {activeTab === "new-guest" && <NewGuest />}
        {activeTab === "manage-guests" && <ManageGuests />}
        {activeTab === "notifications" && <Notifications />}
      </div>
    </div>
  );
}

export default Dashboard;
