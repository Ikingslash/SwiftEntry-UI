import { useState, useEffect, useCallback } from "react"; // Add this import
import api from "../../../context/api";
import PreScheduledVisitTable from "./manageGuestGroup/PreScheduledVisitTable";
import CompletedVisitTable from "./manageGuestGroup/CompletedVisitTable";
import CancelledVisitTable from "./manageGuestGroup/CancelledVisitTable";
import MissedVisitTbale from "./manageGuestGroup/MissedVisitTbale";
import PendingVisitsTable from "./PendingVisitsTable";
import {toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TabGroup() {
  const [activeTab, setActiveTab] = useState("pre-scheduled-visit-table");
  const [counts, setCounts] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
    pending: 0,
  });

  // New, unified endpoint for fetching counts
  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get("/staff/guests/group-counts");
      setCounts(res.data);
    } catch (error) {
      console.error("Error fetching group counts:", error);
    }
  }, []); // Empty dependency array for stability

  // Fetch pending visits count separately
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get("/staff/guests/staff-pending-visits", { params: { per_page: 1, page: 1 } });
      setCounts((prev) => ({
        ...prev,
        pending: res.data.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching pending counts:", error);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchPendingCount();
  }, [fetchCounts, fetchPendingCount]);

  const handleVisitUpdate = () => {
    // Refresh counts when visits are updated
    fetchCounts();
    fetchPendingCount();
  };

  return (
    <div>
      <div className="d-flex justify-content-start align-items-center">
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
              Scheduled Visit ({counts.scheduled})
            </button>
          </li>
          <li className="nav-item pe-4">
            <button
              className={`nav-link ${
                activeTab === "pending-visits" ? "active" : "text-dark"
              }`}
              onClick={() => setActiveTab("pending-visits")}
            >
              Pending Visits ({counts.pending})
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
      </div>

      {/* Content - Passing visitType="group" */}
      <div className="mt-5">
        {activeTab === "pre-scheduled-visit-table" && (
          <PreScheduledVisitTable
            visitType="group"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "pending-visits" && (
          <PendingVisitsTable
            visitType="group"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "completed-visit" && (
          <CompletedVisitTable
            visitType="group"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "cancelled-visit" && (
          <CancelledVisitTable
            visitType="group"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "missed-visit" && (
          <MissedVisitTbale
            visitType="group"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default TabGroup;
