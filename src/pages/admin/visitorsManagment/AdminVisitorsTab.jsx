import { useState } from "react";
import AllVisitors from "../include/visitorslog/AllVisitors";
import VipVisitors from "../include/visitorslog/VipVisitors";
import BlackListedVisitors from "../include/visitorslog/BlackListedVisitors";

export default function AdminVisitorsTab({ refreshKey }) {
  const [activeTab, setActiveTab] = useState("all-visitors");

  const tabs = [
    { id: "all-visitors", label: "All Visitors" },
    { id: "vip-visitors", label: "VIP Visitors" },
    { id: "blacklist-visitors", label: "Blacklisted Visitors" },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs container with bottom border only spanning the tab buttons */}
      <div className="inline-flex items-center space-x-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all duration-200 -mb-px ${isActive
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-t border-x border-zinc-200 dark:border-zinc-800 shadow-sm"
                : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 border-t border-x border-transparent"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div>
        {activeTab === "all-visitors" && <AllVisitors refreshKey={refreshKey} />}
        {activeTab === "vip-visitors" && <VipVisitors refreshKey={refreshKey} />}
        {activeTab === "blacklist-visitors" && <BlackListedVisitors refreshKey={refreshKey} />}
      </div>
    </div>
  );
}