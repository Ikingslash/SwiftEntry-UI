import { useEffect, useState, useCallback } from "react";
import api from "../../../context/api";
import CancelledVisitTable from "./manageSecurityGuestIndividual/CancelledVisitTable";
import CompletedVisitTable from "./manageSecurityGuestIndividual/CompletedVisitTable";
import MissedVisitTable from "./manageSecurityGuestIndividual/MissedVisitTable";
import PreScheduledVisitTable from "./manageSecurityGuestIndividual/PreScheduledVisitTable";
import SecurityPendingVisitsTable from "./SecurityPendingVisitsTable";

function SecurityTabIndividual() {
  const [activeTab, setActiveTab] = useState("pre-scheduled-visit-table");
  const [counts, setCounts] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
    pending: 0,
  });

  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get("/security/guest/individual/counts");
      setCounts(res.data);
    } catch (error) {
      console.error("Error fetching individual counts:", error);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get("/security/guest/host-pending-visits", {
        params: { per_page: 1, page: 1 },
      });
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
    fetchCounts();
    fetchPendingCount();
  };

  const tabs = [
    { id: "pre-scheduled-visit-table", label: `Scheduled Visit (${counts.scheduled})` },
    { id: "pending-visits", label: `Pending Visits (${counts.pending})` },
    { id: "completed-visit", label: `Completed Visit (${counts.completed})` },
    { id: "cancelled-visit", label: `Cancelled Visit (${counts.cancelled})` },
    { id: "missed-visit", label: `Missed Visit (${counts.missed})` },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="overflow-x-auto pb-px">
        <div className="inline-flex items-center space-x-1 border-b border-slate-300">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-xs font-semibold rounded-t-xl transition-all duration-200 -mb-px cursor-pointer whitespace-nowrap border-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "pre-scheduled-visit-table" && (
          <PreScheduledVisitTable
            visitType="individual"
            onVisitUpdate={handleVisitUpdate}
          />
        )}
        {activeTab === "pending-visits" && (
          <SecurityPendingVisitsTable
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
    </div>
  );
}

export default SecurityTabIndividual;
