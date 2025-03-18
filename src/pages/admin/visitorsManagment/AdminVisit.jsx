import { useState } from "react";
import ScheduledVisit from "../include/visit/ScheduledVisit";
import CompletedVisitTable from "../include/visit/CompletedVisitTable";
import UpcomingVisit from "../include/visit/UpcomingVisit";
import MissedVisitTbale from "../include/visit/MissedVisitTbale";

function AdminVisit() {
  const [activeTab, setActiveTab] = useState("pre-scheduled-visit-table");
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        {/* Bootstrap Nav Tabs */}
        <ul className="nav nav-tabs">
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "pre-scheduled-visit-table"
                  ? "active"
                  : "text-dark"
              }`}
              onClick={() => setActiveTab("pre-scheduled-visit-table")}
            >
              Scheduled Visits
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "completed-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("completed-visit")}
            >
              Completed Visits
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "cancelled-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("cancelled-visit")}
            >
              Upcoming Visits
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "missed-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("missed-visit")}
            >
              Missed Visits
            </button>
          </li>
        </ul>
        <a href="#" className=" ms-3">
          See More
        </a>
      </div>
      {/* Content */}
      <div className="mt-5">
        {activeTab === "pre-scheduled-visit-table" && <ScheduledVisit />}
        {activeTab === "completed-visit" && <CompletedVisitTable />}
        {activeTab === "cancelled-visit" && <UpcomingVisit />}
        {activeTab === "missed-visit" && <MissedVisitTbale />}
        {/* {activeTab === "home" && <Home />}
        {activeTab === "new-guest" && <NewGuest />}
        {activeTab === "manage-guests" && <ManageGuests />}
        {activeTab === "notifications" && <Notifications />} */}
      </div>{" "}
      {/* Hero Section */}
    </div>
  );
}
export default AdminVisit;
