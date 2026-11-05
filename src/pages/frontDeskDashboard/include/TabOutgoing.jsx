
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

function TabOutgoing({ filters, searchQuery, refreshKey }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOutgoingVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchOutgoingVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
        filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/outgoing", {
        params: {
          visitor_type: visitorType,
          search: searchQuery,
          per_page: 8,
          page: currentPage,
          days_old: 10,
        },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching outgoing visits:", error);
      toast.error("Failed to fetch outgoing visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-blue-700 text-xs mb-6 flex items-center gap-2">
        <i className="bi bi-info-circle text-sm"></i>
        <span>Showing visits checked out within the last 10 days. Older visits are archived.</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-medium">
          Loading outgoing visits...
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center">
          <i className="bi bi-door-closed text-slate-300 text-3xl"></i>
          <p className="mt-3 text-slate-700 font-semibold text-xs">No outgoing visits</p>
          <p className="text-slate-400 text-xs mt-1">Check out visitors from Incoming tab</p>
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
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Checked Out
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">ID No</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.visit_code}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Duration</span>
                      <strong className="text-slate-800 mt-0.5 block">{calculateDuration(visit.check_in, visit.check_out)}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Check-in</span>
                      <span className="text-slate-700 mt-0.5 block font-medium">{formatDateTime(visit.check_in)}</span>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Check-out</span>
                      <span className="text-slate-700 mt-0.5 block font-medium">{formatDateTime(visit.check_out)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Host</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.host_name}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Purpose</span>
                      <p className="text-slate-800 font-medium mb-0 mt-0.5 truncate">{visit.purpose}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>
                    <i className="bi bi-calendar me-1"></i>
                    Visit date: {new Date(visit.visit_date || visit.check_in).toLocaleDateString()}
                  </span>
                  <span>
                    <i className="bi bi-person-check me-1"></i>
                    Host: {visit.host_name}
                  </span>
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

export default TabOutgoing;