import { useState } from "react";
import ScheduledVisit from "../include/visitorschedule/ScheduledVisit";
import CompletedVisitTable from "../include/visitorschedule/CompletedVisitTable";
import UpcomingVisit from "../include/visitorschedule/UpcomingVisit";
import MissedVisitTbale from "../include/visitorschedule/MissedVisitTbale";

function AdminVisit() {
  const [activeTab, setActiveTab] = useState("scheduled-visit-table");
  const [refreshVisitsKey, setRefreshVisitsKey] = useState(0);

  // Function to trigger refresh in child components
  const triggerRefresh = () => {
    setRefreshVisitsKey((prevKey) => prevKey + 1);
  };

  const tabs = [
    { id: "scheduled-visit-table", label: "Scheduled Visits" },
    { id: "completed-visit", label: "Completed Visits" },
    { id: "upcoming-visit", label: "Upcoming Visits" },
    { id: "missed-visit", label: "Missed Visits" },
  ];

  return (
    <div className="space-y-4">
      {/* Modern Tailwind Tabs container with bottom border only spanning tab buttons */}
      <div className="inline-flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all duration-200 -mb-px cursor-pointer border-0 ${isActive
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-t border-x border-slate-200 dark:border-slate-800 shadow-sm"
                : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border-t border-x border-transparent"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "scheduled-visit-table" && <ScheduledVisit refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
        {activeTab === "completed-visit" && <CompletedVisitTable refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
        {activeTab === "upcoming-visit" && <UpcomingVisit refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
        {activeTab === "missed-visit" && <MissedVisitTbale refreshKey={refreshVisitsKey} triggerRefresh={triggerRefresh} />}
      </div>
    </div>
  );
}

export default AdminVisit;