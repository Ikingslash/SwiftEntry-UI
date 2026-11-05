import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function PreScheduledVisitTable({ onVisitUpdate, visitType }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchVisits();
  }, [page, visitType]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const endpoint = `/security/guest/${visitType}/scheduled-visits`;
      const response = await api.get(endpoint, {
        params: { per_page: perPage, page },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      await api.post(`/security/guest/visit/${selectedVisit.id}/cancel`, {
        reason: cancelReason,
      });

      toast.success("Visit cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");

      await fetchVisits();

      if (onVisitUpdate) {
        onVisitUpdate();
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      toast.error(error.response?.data?.error || "Failed to cancel visit");
    }
  };

  const openCancelModal = (visit) => {
    setSelectedVisit(visit);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page)
      setPage((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-500 text-xs font-medium mb-0">
          Loading scheduled visits...
        </p>
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
                  <th className="py-4 px-6 whitespace-nowrap">Unique ID</th>
                  <th className="py-4 px-6 whitespace-nowrap">Guest Name</th>
                  <th className="py-4 px-6 whitespace-nowrap">Host Name</th>
                  <th className="py-4 px-6 whitespace-nowrap">Visit Date/Time</th>
                  <th className="py-4 px-6 whitespace-nowrap">Contact</th>
                  <th className="py-4 px-6 whitespace-nowrap">Email</th>
                  <th className="py-4 px-6 whitespace-nowrap">Special Req.</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-400 font-semibold">
                      #{visit.id}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {visit.visitor?.name || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.host_name || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {visit.visit_time
                        ? new Date(visit.visit_time).toLocaleString()
                        : "Not Scheduled"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visitor?.contact_number || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visitor?.email || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {visit.visitor?.special_requirements || "None"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 font-semibold text-[10px] rounded-full capitalize whitespace-nowrap ${
                          visit.status === "cancelled"
                            ? "bg-rose-50 text-rose-700"
                            : visit.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : visit.status === "checked_in"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {visit.status ? visit.status.replace(/_/g, " ") : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {visit.status !== "cancelled" &&
                        visit.status !== "completed" && (
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl transition-all cursor-pointer border-0"
                            onClick={() => openCancelModal(visit)}
                          >
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
            <p className="text-slate-400 text-xs font-medium mb-0">
              No scheduled visits available.
            </p>
          </div>
        )}
      </div>

      {/* CANCEL VISIT MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full sm:max-w-md shadow-xl border border-slate-100 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-base mb-0">
                Cancel Visit
              </h5>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-0">
              Are you sure you want to cancel the visit for{" "}
              <strong className="text-slate-900">{selectedVisit?.visitor?.name}</strong>?
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="cancelReason"
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >
                Reason for Cancellation *
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
                id="cancelReason"
                rows="3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer border-0"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer border-0"
                onClick={handleCancelVisit}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreScheduledVisitTable;
