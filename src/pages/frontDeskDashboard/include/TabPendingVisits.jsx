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

function TabPendingVisits({ filters, searchQuery, refreshKey, onVisitAction }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPendingVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchPendingVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
        filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/pending", {
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
      console.error("Error fetching pending visits:", error);
      toast.error("Failed to fetch pending visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleConfirmVisit = async (visitId) => {
    try {
      await api.post(`/front-desk/visits/${visitId}/confirm`);
      toast.success("Visit confirmed successfully!");
      fetchPendingVisits();
      onVisitAction();
    } catch (error) {
      console.error("Error confirming visit:", error);
      toast.error(error.response?.data?.message || "Failed to confirm visit");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'bg-amber-100 text-amber-700', text: 'Pending' },
      'scheduled_visit': { color: 'bg-blue-100 text-blue-700', text: 'Scheduled' },
      'pre_registered_visit': { color: 'bg-slate-100 text-slate-700', text: 'Pre-registered' },
      'Walk_In': { color: 'bg-emerald-100 text-emerald-700', text: 'Walk-in' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-slate-100 text-slate-700', text: status };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>;
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-medium">
          Loading pending visits...
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center">
          <i className="bi bi-calendar-x text-slate-300 text-3xl"></i>
          <p className="mt-3 text-slate-700 font-semibold text-xs">No pending visits found</p>
          <p className="text-slate-400 text-xs mt-1">All visits are confirmed or completed</p>
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
                    {getStatusBadge(visit.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">ID No</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.visit_code}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Visit Time</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.visit_time}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Host</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.host_name}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Contact</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.visitor_contact_number}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs mb-3">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Purpose</span>
                    <p className="text-slate-800 font-medium mb-0 mt-0.5">{visit.purpose}</p>
                  </div>

                  {visit.special_requirements && visit.special_requirements !== "None" && (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3 text-amber-800 text-xs mb-3 flex items-center gap-2">
                      <i className="bi bi-exclamation-triangle text-sm"></i>
                      <span>{visit.special_requirements}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Registered: {visit.registered_at}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleConfirmVisit(visit.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm Visit
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

export default TabPendingVisits;