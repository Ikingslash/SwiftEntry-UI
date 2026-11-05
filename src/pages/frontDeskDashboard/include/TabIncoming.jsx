import { useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from 'react-toastify';

const Pagination = ({ pagination, handlePageChange }) => {
  const { current_page, last_page } = pagination;

  return (
    <div className="flex items-center justify-between px-2 my-6">
      <span className="text-slate-500 text-xs font-medium">
        Page {current_page} of {last_page}
      </span>
      <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs gap-1">
        <button
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-35 rounded-xl transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-left text-xs"></i>
        </button>
        <button
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-35 rounded-xl transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  );
};

function TabIncoming({ filters, searchQuery, refreshKey, onVisitAction }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchIncomingVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchIncomingVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
        filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/incoming", {
        params: {
          visitor_type: visitorType,
          search: searchQuery,
          per_page: 8,
          page: currentPage,
        },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching incoming visits:", error);
      toast.error("Failed to fetch incoming visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckOut = async (visitId) => {
    try {
      await api.post(`/front-desk/guests/visits/${visitId}/check-out`);
      toast.success("Visitor checked out successfully!");
      fetchIncomingVisits();
      onVisitAction();
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error(error.response?.data?.message || "Failed to check out visitor");
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not checked in';

    try {
      const dateObj = new Date(dateTime);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';

      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const formattedTime = dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-medium">
          Loading incoming visits...
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center">
          <i className="bi bi-door-open text-slate-300 text-3xl"></i>
          <p className="mt-3 text-slate-700 font-semibold text-xs">No incoming visits</p>
          <p className="text-slate-400 text-xs mt-1">Check in visitors from Confirmed tab</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h6 className="font-bold text-slate-900 text-sm mb-0.5">
                        {visit.visitor_name}
                      </h6>
                      <span className="text-slate-400 text-xs">{visit.visitor_email}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                      Checked In
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">ID No</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.visit_code}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Check-in Time</span>
                      <strong className="text-slate-800 mt-0.5 block">{formatDateTime(visit.check_in)}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Host</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.host_name}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Duration</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.current_duration?.text ?? "Just checked in"}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <i className="bi bi-clock-history"></i>
                    {visit.check_in
                      ? (() => {
                        const diff = new Date() - new Date(visit.check_in);
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        return `${hours}h ${minutes}m elapsed`;
                      })()
                      : "Recently arrived"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Check out ${visit.visitor_name}?`)) {
                        handleCheckOut(visit.id);
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="bi bi-box-arrow-right"></i> Check Out
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <Pagination
              pagination={pagination}
              handlePageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}

export default TabIncoming;