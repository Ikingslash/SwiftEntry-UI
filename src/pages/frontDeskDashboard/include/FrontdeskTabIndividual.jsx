import { useEffect, useState, useCallback } from "react";
import api from "../../../context/api";
import CancelledVisitTable from "./manageFrontdeskGuestIndividual/CancelledVisitTable";
import CompletedVisitTable from "./manageFrontdeskGuestIndividual/CompletedVisitTable";
import MissedVisitTable from "./manageFrontdeskGuestIndividual/MissedVisitTable";
import PreScheduledVisitTable from "./manageFrontdeskGuestIndividual/PreScheduledVisitTable";
import HostVisitsTable from "./HostVisitsTable";
import {toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FrontdeskTabIndividual() {
  const [activeTab, setActiveTab] = useState("pre-scheduled-visit-table");
  const [showHostVisits, setShowHostVisits] = useState(false);
  const [counts, setCounts] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
  });

  // New, unified endpoint for fetching counts
  const fetchCounts = useCallback(async () => {
    try {
      // Fix: Use a consistent, logical endpoint for individual counts
      const res = await api.get("/front-desk/guests/individual/counts");
      setCounts(res.data);
    } catch (error) {
      console.error("Error fetching individual counts:", error);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleVisitUpdate = () => {
    // Refresh counts when visits are updated
    fetchCounts();
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
              Scheduled Visit ({counts.scheduled})
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

      {/* Content - Passing visitType="individual" */}
      <div className="mt-5">
        {activeTab === "pre-scheduled-visit-table" && (
          <PreScheduledVisitTable
            visitType="individual"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "completed-visit" && (
          <CompletedVisitTable
            visitType="individual"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "cancelled-visit" && (
          <CancelledVisitTable
            visitType="individual"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "missed-visit" && (
          <MissedVisitTable
            visitType="individual"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

    </div>
  );
}

export default FrontdeskTabIndividual;
