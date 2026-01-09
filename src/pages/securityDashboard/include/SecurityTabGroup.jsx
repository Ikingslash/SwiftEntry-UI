import { useEffect, useState, useCallback } from "react";
import api from "../../../context/api";
// Fix: Assuming the table components are now siblings to this file
import CancelledVisitTable from "./manageSecurityGuestGroup/CancelledVisitTable";
import CompletedVisitTable from "./manageSecurityGuestGroup/CompletedVisitTable";
import MissedVisitTable from "./manageSecurityGuestGroup/MissedVisitTable";
import PreScheduledVisitTable from "./manageSecurityGuestGroup/PreScheduledVisitTable";
import SecurityPendingVisitsTable from "./SecurityPendingVisitsTable";
import {toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SecurityTabGroup() {
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
      const res = await api.get("/security/guest/group/counts");
      setCounts(res.data);
    } catch (error) {
      console.error("Error fetching group counts:", error);
    }
  }, []); // Empty dependency array for stability

  // Fetch pending visits count separately
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get("/security/guest/host-pending-visits", { params: { per_page: 1, page: 1 } });
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
          <SecurityPendingVisitsTable
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
          <MissedVisitTable
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

export default SecurityTabGroup;
