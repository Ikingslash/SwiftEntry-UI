import { useEffect, useState } from "react";
import TabPreRegisteredVisitors from "./include/TabPreRegisteredVisitors";
import TabWalkInVisitors from "./include/TabWalkInVisitors";
import api from "../../context/api";
import { toast } from "react-toastify";
import { CalendarDays } from "lucide-react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const visitorTypes = [
  { label: "All", value: "all" },
  { label: "Individual", value: "individual" },
  { label: "Group", value: "group" },
];

function VisitSecurityHistory() {
  const [activeTab, setActiveTab] = useState("pre-registered-visitors");
  const [activeFilter, setActiveFilter] = useState("all");
  const [groupedVisits, setGroupedVisits] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, month, category, activeTab]);

  useEffect(() => {
    fetchHistory();
  }, [activeFilter, month, category, activeTab, currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const monthParam = month
        ? new Date(`${month} 1, 2025`).getMonth() + 1
        : null;

      let statusParam = null;
      if (activeTab === "pre-registered-visitors") {
        statusParam = "pre_registered_visit";
      } else if (activeTab === "walk-in-visitors") {
        statusParam = "Walk_In";
      }

      const response = await api.get("security/history", {
        params: {
          visitor_type: activeFilter,
          month: monthParam,
          purpose: category,
          status: statusParam,
          per_page: perPage,
          page: currentPage,
        },
      });
      setGroupedVisits(response.data.grouped_visits || {});
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("Failed to load visit history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const tabs = [
    { id: "pre-registered-visitors", label: "Pre-Registered Visitors" },
    { id: "walk-in-visitors", label: "Walk-in Visitors" },
  ];

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          History
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Browse pre-registered and walk-in visitor records.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        {/* Tabs */}
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

        {/* Filters Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <CalendarDays className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              className="appearance-none bg-white border border-slate-200/80 shadow-2xs rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              onChange={(e) => setMonth(e.target.value)}
              value={month}
            >
              <option value="">Select Month</option>
              {months.map((monthName) => (
                <option key={monthName} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>

          <select
            className="appearance-none bg-white border border-slate-200/80 shadow-2xs rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="all">All Categories</option>
            <option value="recruitment">Recruitment</option>
            <option value="business meeting">Business Meeting</option>
            <option value="repairs/maintenance">Repairs/Maintenance</option>
            <option value="personal/official">Personal/Official</option>
            <option value="other">Other</option>
          </select>

          <div className="-mx-4 sm:mx-0 px-4 sm:px-0 max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="inline-flex w-max p-1.5 bg-white border border-slate-200/80 rounded-full shadow-sm">
              {visitorTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveFilter(item.value)}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 border-0 cursor-pointer whitespace-nowrap ${
                    activeFilter === item.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "pre-registered-visitors" && (
            <TabPreRegisteredVisitors
              groupedVisits={groupedVisits}
              pagination={pagination}
              loading={loading}
              handlePageChange={handlePageChange}
              currentPage={currentPage}
            />
          )}
          {activeTab === "walk-in-visitors" && (
            <TabWalkInVisitors
              groupedVisits={groupedVisits}
              pagination={pagination}
              loading={loading}
              handlePageChange={handlePageChange}
              currentPage={currentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitSecurityHistory;
