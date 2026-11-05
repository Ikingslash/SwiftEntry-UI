import { useEffect, useState } from "react";
import FrontDeskTopHeader from "./include/FrontDeskTopHeader";
import TabPreRegisteredVisitors from "./include/TabPreRegisteredVisitors";
import api from "../../context/api";
import { toast } from "react-toastify";

const groupVisitsByDate = (visits) => {
  if (!Array.isArray(visits)) {
    return {};
  }
  return visits.reduce((acc, visit) => {
    const date = visit.visit_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(visit);
    return acc;
  }, {});
};

function VisitHistory() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [groupedVisits, setGroupedVisits] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState("");
  const [purpose, setPurpose] = useState("all");
  const perPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [visitPurposes, setVisitPurposes] = useState([]);

  useEffect(() => {
    fetchHistory();
    api
      .get("/front-desk/guests/settings/visit-purposes")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch visit purposes:", error);
      });
  }, [activeFilter, month, purpose, currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const monthParam = month
        ? new Date(`${month} 1, 2025`).getMonth() + 1
        : null;

      const response = await api.get("/front-desk/history/visits", {
        params: {
          visitor_type: activeFilter,
          month: monthParam,
          purpose: purpose !== "all" ? purpose : null,
          per_page: perPage,
          page: currentPage,
        },
      });

      if (!response?.data || !response.data.visits) {
        throw new Error("Invalid response structure: 'visits' key not found.");
      }

      const groupedData = groupVisitsByDate(response.data.visits);
      setGroupedVisits(groupedData);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error("Error fetching history:", err);
      if (err.response && err.response.status === 422) {
        toast.error("Validation error: " + JSON.stringify(err.response.data));
      } else {
        toast.error("Failed to fetch visit history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12 font-sans">
      <FrontDeskTopHeader />

      {/* Header Container */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Visits
          </p>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            View and filter visit history records.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-[1140px] mx-auto px-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            onChange={(e) => setPurpose(e.target.value)}
            value={purpose}
          >
            <option value="all">All Categories</option>
            {visitPurposes.map((p, index) => (
              <option key={index} value={p}>{p}</option>
            ))}
          </select>

          <div className="-mx-4 sm:mx-0 px-4 sm:px-0 max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="inline-flex w-max p-1.5 bg-white border border-slate-200/80 rounded-full shadow-sm">
              {[
                { label: "All", value: "all" },
                { label: "Individual", value: "individual" },
                { label: "Group", value: "group" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveFilter(item.value)}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border-0 cursor-pointer ${activeFilter === item.value
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
      </div>

      {/* Content Table Container (No white backdrop here so component renders table card & outside pagination independently) */}
      <div className="max-w-[1140px] mx-auto px-4">
        <TabPreRegisteredVisitors
          groupedVisits={groupedVisits}
          pagination={pagination}
          loading={loading}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default VisitHistory;