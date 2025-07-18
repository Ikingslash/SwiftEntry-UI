import { useState, useEffect } from "react";
import api from "../../../context/api";
import PreScheduledVisitTable from "./manageGuestGroup/PreScheduledVisitTable";
import CompletedVisitTable from "./manageGuestGroup/CompletedVisitTable";
import CancelledVisitTable from "./manageGuestGroup/CancelledVisitTable";
import MissedVisitTbale from "./manageGuestGroup/MissedVisitTbale";

function TabGroup() {
  const [activeTab, setActiveTab] = useState("pre-scheduled-visit-table");
   const [counts, setCounts] = useState({
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      missed: 0,
    });
  
    useEffect(() => {
      const fetchCounts = async () => {
        try {
          const res = await api.get("staff/guests/group-counts");
          setCounts(res.data);
        } catch (error) {
          console.error("Error fetching counts:", error);
        }
      };
  
      fetchCounts();
    }, []);
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
              Pre-Scheduled Visit ({counts.scheduled})
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "completed-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("completed-visit")}
            >
              Completed Visit ({counts.completed})
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "cancelled-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("cancelled-visit")}
            >
              Cancelled Visit ({counts.cancelled})
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "missed-visit" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("missed-visit")}
            >
              Missed Visit ({counts.missed})
            </button>
          </li>
        </ul>
        <a href="#" className=" ms-3">
          See More
        </a>
      </div>
      {/* Content */}
      <div className="mt-5">
        {activeTab === "pre-scheduled-visit-table" && (
          <PreScheduledVisitTable />
        )}
        {activeTab === "completed-visit" && <CompletedVisitTable />}
        {activeTab === "cancelled-visit" && <CancelledVisitTable />}
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

export default TabGroup;
