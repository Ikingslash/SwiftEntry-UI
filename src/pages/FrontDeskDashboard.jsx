import { useState } from "react";
import FrontDeskTopHeader from "./frontDeskDashboard/include/FrontDeskTopHeader";
import TabPendingVisits from "./frontDeskDashboard/include/TabPendingVisits";
import TabConfirmedVisits from "./frontDeskDashboard/include/TabConfirmedVisits";
import TabIncoming from "./frontDeskDashboard/include/TabIncoming";
import TabOutgoing from "./frontDeskDashboard/include/TabOutgoing";

function FrontDeskDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    group: false,
    individual: false,
  });

  const refreshVisits = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleFilterChange = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const tabs = [
    { id: "pending", label: "Registered" },
    { id: "confirmed", label: "Confirmed" },
    { id: "incoming", label: "Checked In" },
    { id: "outgoing", label: "Checked Out" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12 font-sans">
      <FrontDeskTopHeader />

      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4 space-y-6">
        {/* Header & Pill Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
              Guest Management
            </p>
            <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
              Manage and track visitor requests.
            </p>
          </div>

          {/* Fully Rounded Pill Tab Switcher */}
          <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="inline-flex w-max p-1.5 bg-white border border-slate-200/80 rounded-full shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border-0 cursor-pointer ${activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-transparent text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Custom Controlled Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              className="w-full bg-white border border-slate-200/80 shadow-2xs rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          </div>

          {/* Controlled Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
              type="button"
            >
              <i className="bi bi-funnel"></i> Filter
            </button>

            {isFilterOpen && (
              <>
                {/* Backdrop to catch clicks outside dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterOpen(false)}
                ></div>

                {/* Clean Floating Dropdown Card */}
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 z-30 text-xs text-left animate-fade-in space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
                    Filter by Type
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={filters.individual}
                        onChange={() => handleFilterChange("individual")}
                      />
                      Individual
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={filters.group}
                        onChange={() => handleFilterChange("group")}
                      />
                      Group
                    </label>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      className="w-full py-1.5 px-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold transition-colors text-center cursor-pointer"
                      onClick={() => {
                        setFilters({ group: false, individual: false });
                        setIsFilterOpen(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Content Tables */}
        <div>
          {activeTab === "pending" && (
            <TabPendingVisits
              filters={filters}
              searchQuery={searchQuery}
              refreshKey={refreshKey}
              onVisitAction={refreshVisits}
            />
          )}
          {activeTab === "confirmed" && (
            <TabConfirmedVisits
              filters={filters}
              searchQuery={searchQuery}
              refreshKey={refreshKey}
              onVisitAction={refreshVisits}
            />
          )}
          {activeTab === "incoming" && (
            <TabIncoming
              filters={filters}
              searchQuery={searchQuery}
              refreshKey={refreshKey}
              onVisitAction={refreshVisits}
            />
          )}
          {activeTab === "outgoing" && (
            <TabOutgoing
              filters={filters}
              searchQuery={searchQuery}
              refreshKey={refreshKey}
              onVisitAction={refreshVisits}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FrontDeskDashboard;