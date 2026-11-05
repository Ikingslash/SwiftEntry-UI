import { useState, useEffect, useCallback } from "react";
import api from "../../../context/api";
import PreScheduledVisitTable from "./manageGuestGroup/PreScheduledVisitTable";
import CompletedVisitTable from "./manageGuestGroup/CompletedVisitTable";
import CancelledVisitTable from "./manageGuestGroup/CancelledVisitTable";
import MissedVisitTbale from "./manageGuestGroup/MissedVisitTbale";
import PendingVisitsTable from "./PendingVisitsTable";

function TabGroup() {
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
      const res = await api.get("/staff/guests/group-counts");
      setCounts(res.data);
    } catch (error) {
      console.error("Error fetching group counts:", error);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get("/staff/guests/staff-pending-visits", { params: { per_page: 1, page: 1, visitor_type: "group" } });
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
      {/* Tab Navigation Container: line starts at first element and ends exactly at last element */}
      <div className="overflow-x-auto pb-px">
        <div className="inline-flex items-center space-x-1 border-b border-slate-300">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-xs font-semibold rounded-t-xl transition-all duration-200 -mb-px cursor-pointer whitespace-nowrap ${isActive
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
    </div>
  );
}

export default TabGroup;