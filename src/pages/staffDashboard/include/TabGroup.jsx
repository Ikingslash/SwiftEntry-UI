import { useState, useEffect } from "react"; // Add this import
import api from "../../../context/api";
import PreScheduledVisitTable from "./manageGuestGroup/PreScheduledVisitTable";
import CompletedVisitTable from "./manageGuestGroup/CompletedVisitTable";
import CancelledVisitTable from "./manageGuestGroup/CancelledVisitTable";
import MissedVisitTbale from "./manageGuestGroup/MissedVisitTbale";
import HostVisitsTable from "./HostVisitsTable";
import {toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TabGroup() {
  const [activeTab, setActiveTab] = useState("pre-scheduled-visit-table");
   const [showHostVisits, setShowHostVisits] = useState(false);
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

  const handleVisitUpdate = () => {
    // Refresh counts when visits are updated
    fetchCounts();
  };

  const fetchCounts = async () => {
    try {
      const res = await api.get("staff/guests/group-counts");
      setCounts(res.data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

    // Function to handle switching to the Host Visits view
    const handleHostVisitsClick = (e) => {
      e.preventDefault();
      setShowHostVisits(true);
    };

    // Function to handle switching back to the default view
    const handleBackToTabs = () => {
      setShowHostVisits(false);
      setActiveTab("pre-scheduled-visit-table"); // Reset to default tab
    };

    if (showHostVisits) {
      return <HostVisitsTable onBack={handleBackToTabs} />;
    }


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
        <a href="#" className=" ms-3" onClick={handleHostVisitsClick}>
          Check Your Visits
        </a>
      </div>

      {/* Content */}
      <div className="mt-5">
        {activeTab === "pre-scheduled-visit-table" && (
          <PreScheduledVisitTable onVisitUpdate={handleVisitUpdate} />
        )}
        {activeTab === "completed-visit" && (
          <CompletedVisitTable onVisitUpdate={handleVisitUpdate} />
        )}
        {activeTab === "cancelled-visit" && (
          <CancelledVisitTable onVisitUpdate={handleVisitUpdate} />
        )}
        {activeTab === "missed-visit" && (
          <MissedVisitTbale onVisitUpdate={handleVisitUpdate} />
        )}
      </div>
    </div>
  );
}

export default TabGroup;
