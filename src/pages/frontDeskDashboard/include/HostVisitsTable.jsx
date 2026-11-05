import { useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";
import { Check, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

function HostVisitsTable({ onBack }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await api.get("/front-desk/guests/frontdesk-pending-visits", {
        params: { per_page: perPage, page },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching host visits:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to load host visits. Check server logs.";
      toast.error(errorMessage);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page]);

  const handleAction = async (visitId, action) => {
    const newStatus = action === "accept" ? "approved" : "rejected";
    setVisits((currentVisits) =>
      currentVisits.map((visit) =>
        visit.id === visitId
          ? { ...visit, temp_status: newStatus, is_processing: true }
          : visit
      )
    );

    try {
      const endpoint =
        action === "accept"
          ? `/front-desk/guests/visit/${visitId}/approve-frontdesk-host`
          : `/front-desk/guests/visit/${visitId}/reject-frontdesk-host`;

      await api.post(endpoint);

      toast.success(`Visit ${visitId} ${newStatus} successfully.`);
    } catch (error) {
      console.error(`Error ${action}ing visit:`, error);
      toast.error(
        `Failed to ${action} visit: ${error.response?.data?.error || "Server error"}`
      );

      setVisits((currentVisits) =>
        currentVisits.map((visit) =>
          visit.id === visitId
            ? { ...visit, temp_status: undefined, is_processing: false }
            : visit
        )
      );
    }
  };

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page)
      setPage((prev) => prev + 1);
  };

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-0">
            Visits Requiring Your Approval
          </h2>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            Approve or reject visits that are waiting for your response.
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
            onClick={onBack}
          >
            ← Back to Guest Management
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
          <p className="text-slate-500 text-xs font-medium mb-0">Loading host visits...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {visits.length > 0 ? (
              <>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Visitor Name</th>
                      <th className="py-4 px-6">Purpose</th>
                      <th className="py-4 px-6">Scheduled Time</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {visits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-slate-400 font-semibold">#{visit.id}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {visit.visitor?.name || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-slate-600">{visit.purpose || "N/A"}</td>
                        <td className="py-4 px-6 text-slate-600">
                          {visit.visit_time
                            ? new Date(visit.visit_time).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "N/A"}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {visit.visitor?.contact_number || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {visit.temp_status === "approved" ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full">
                              Approved
                            </span>
                          ) : visit.temp_status === "rejected" ? (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-semibold text-[10px] rounded-full">
                              Rejected
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer border-0"
                                onClick={() => handleAction(visit.id, "accept")}
                                disabled={visit.is_processing}
                              >
                                {visit.is_processing ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer border-0"
                                onClick={() => handleAction(visit.id, "reject")}
                                disabled={visit.is_processing}
                              >
                                {visit.is_processing ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
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
                <p className="text-slate-400 text-xs font-medium mb-0">
                  No visits requiring your approval.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HostVisitsTable;
