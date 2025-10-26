import { useState } from "react";
import ScheduledVisit from "../include/visit/ScheduledVisit";
import CompletedVisitTable from "../include/visit/CompletedVisitTable";
import UpcomingVisit from "../include/visit/UpcomingVisit";
import MissedVisitTbale from "../include/visit/MissedVisitTbale";

function AdminVisit() {
  const [activeTab, setActiveTab] = useState("scheduled-visit-table"); // Renamed for consistency
  const [refreshVisitsKey, setRefreshVisitsKey] = useState(0); // Key to force re-render/re-fetch in child tabs

  // Function to trigger refresh in child components
  const triggerRefresh = () => {
    setRefreshVisitsKey((prevKey) => prevKey + 1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        {/* Bootstrap Nav Tabs */}
        <ul className="nav nav-tabs">
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "scheduled-visit-table"
                  ? "active"
                  : "text-dark"
              }`}
              onClick={() => setActiveTab("scheduled-visit-table")}
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
                activeTab === "upcoming-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("upcoming-visit")}
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
        {/* <a href="#" className=" ms-3">
          See More
        </a> */}
      </div>
      {/* Content */}
      <div className="mt-5">
        {/* Pass refreshKey and triggerRefresh to child components */}
        {activeTab === "scheduled-visit-table" && <ScheduledVisit refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
        {activeTab === "completed-visit" && <CompletedVisitTable refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
        {activeTab === "upcoming-visit" && <UpcomingVisit refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
        {activeTab === "missed-visit" && <MissedVisitTbale refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
      </div>
    </div>
  );
}
export default AdminVisit;
