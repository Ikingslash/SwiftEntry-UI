import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function CancelledVisitTable({ visitType, onVisitUpdate }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const perPage = 10;

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const endpoint = `/staff/guests/${visitType}/cancelled-visits`;
      const response = await api.get(endpoint, {
        params: { per_page: perPage, page },
      });
      setVisits(response.data.visits);
      setPagination(response.data.pagination ?? {});
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load cancelled visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page, visitType, onVisitUpdate]);

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page)
      setPage((prev) => prev + 1);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedVisit || !newDate || !newTime) {
      toast.error("Please select a new date and time.");
      return;
    }

    try {
      await api.put(`/staff/guests/reschedule/${selectedVisit.id}`, {
        new_date: newDate,
        new_time: newTime
      });
      toast.success("Visit successfully rescheduled!");
      setShowModal(false);
      fetchVisits();
      if (onVisitUpdate) onVisitUpdate();
    } catch (error) {
      console.error("Reschedule failed:", error);
      toast.error("Failed to reschedule visit.");
    }
  };

  const openRescheduleModal = (visit) => {
    setSelectedVisit(visit);
    setNewDate("");
    setNewTime("");
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-500 text-xs font-medium mb-0">Loading cancelled visits...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        {visits.length > 0 ? (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Guest Name</th>
                  <th className="py-4 px-6">Host Name</th>
                  <th className="py-4 px-6">Visit Date/Time</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Special Req.</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-400 font-semibold">#{visit.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{visit.visitor?.name}</td>
                    <td className="py-4 px-6 text-slate-600">{visit.host_name}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visit_time ? new Date(visit.visit_time).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{visit.visitor?.contact_number}</td>
                    <td className="py-4 px-6 text-slate-600">{visit.visitor?.email}</td>
                    <td className="py-4 px-6 text-slate-500">{visit.visitor?.special_requirements || "None"}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl transition-all cursor-pointer border-0"
                        onClick={() => openRescheduleModal(visit)}
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.last_page > 1 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  onClick={handlePrevious}
                  disabled={pagination.current_page === 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-slate-500 font-semibold">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  type="button"
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  onClick={handleNext}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-xs font-medium mb-0">No Cancelled Visit</p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-base mb-0">Reschedule Visit</h5>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Date *</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Time *</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer border-0"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2.5 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 cursor-pointer border-0"
                onClick={handleRescheduleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CancelledVisitTable;