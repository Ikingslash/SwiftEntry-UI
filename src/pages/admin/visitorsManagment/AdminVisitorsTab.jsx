import { useState } from "react";
import AllVisitors from "../include/visitors/AllVisitors";
import VipVisitors from "../include/visitors/VipVisitors";
import BlackListedVisitors from "../include/visitors/BlackListedVisitors";

export default function AdminVisitorsTab() {
  const [activeTab, setActiveTab] = useState("all-visitors");
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        {/* Bootstrap Nav Tabs */}
        <ul className="nav nav-tabs">
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "all-visitors" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("all-visitors")}
            >
              All Visitors
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "vip-visitors" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("vip-visitors")}
            >
              VIP Visitors
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "blacklist-visitors" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("blacklist-visitors")}
            >
              Black Listed Visitors
            </button>
          </li>
        </ul>
      </div>
      {/* Content */}
      <div className="mt-5">
        {activeTab === "all-visitors" && <AllVisitors />}
        {activeTab === "vip-visitors" && <VipVisitors />}
        {activeTab === "blacklist-visitors" && <BlackListedVisitors />}
      </div>{" "}
      {/* Hero Section */}
    </div>
  );
}
