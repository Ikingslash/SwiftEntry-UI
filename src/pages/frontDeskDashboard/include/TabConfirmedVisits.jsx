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

function TabConfirmedVisits({ filters, searchQuery, refreshKey, onVisitAction }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [checkInForm, setCheckInForm] = useState({ notes: "" });
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    fetchConfirmedVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchConfirmedVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
        filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/confirmed", {
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
      console.error("Error fetching confirmed visits:", error);
      toast.error("Failed to fetch confirmed visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckIn = async () => {
    if (!selectedVisit) return;

    try {
      await api.post(`/front-desk/guests/visits/${selectedVisit.id}/check-in`, {
        ...checkInForm,
        actual_check_in_time: new Date().toISOString()
      });

      toast.success("Visitor checked in successfully!");
      setSelectedVisit(null);
      setCheckInForm({ notes: "" });
      fetchConfirmedVisits();
      onVisitAction();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error(error.response?.data?.message || "Failed to check in visitor");
    }
  };

  const openCheckInModal = (visit) => {
    setSelectedVisit(visit);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    const utcString = timeString.includes('Z') ? timeString : timeString.replace(' ', 'T') + 'Z';
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return timeString;

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-medium">
          Loading confirmed visits...
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center">
          <i className="bi bi-people text-slate-300 text-3xl"></i>
          <p className="mt-3 text-slate-700 font-semibold text-xs">No confirmed visits</p>
          <p className="text-slate-400 text-xs mt-1">Confirm visits from the Pending tab</p>
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
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">ID No</span>
                      <strong className="text-slate-800 mt-0.5 block">{visit.visit_code}</strong>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Scheduled Time</span>
                      <strong className="text-slate-800 mt-0.5 block">{formatTime(visit.visit_time)}</strong>
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

                  {visit.security_confirmed_at && (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 text-blue-700 text-xs mb-4 flex items-center gap-2">
                      <i className="bi bi-shield-check text-sm"></i>
                      <span>Visit confirmed at: {formatTime(visit.security_confirmed_at)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    onClick={() => openCheckInModal(visit)}
                  >
                    <i className="bi bi-box-arrow-in-right"></i> Check In
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

      {/* Check-in Modal */}
      {selectedVisit && (
        <div onClick={() => setSelectedVisit(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Check In Visitor</h3>
              <button onClick={() => setSelectedVisit(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">
                Check in <strong className="text-slate-900">{selectedVisit.visitor_name}</strong>
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={checkInForm.notes}
                  onChange={(e) => setCheckInForm({ ...checkInForm, notes: e.target.value })}
                  placeholder="Any special notes for this check-in..."
                ></textarea>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                onClick={() => setSelectedVisit(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
                onClick={handleCheckIn}
              >
                Confirm Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TabConfirmedVisits;