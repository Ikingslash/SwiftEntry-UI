import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";

function CompletedVisitTable({ visitType }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchVisits();
  }, [page, visitType]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const endpoint = `/front-desk/guests/${visitType}/completed-visits`;
      const response = await api.get(endpoint, {
        params: { per_page: perPage, page },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load completed visits");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page)
      setPage((prev) => prev + 1);
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-500 text-xs font-medium mb-0">Loading completed visits...</p>
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
                  <th className="py-4 px-6">Unique ID</th>
                  <th className="py-4 px-6">Guest Name</th>
                  <th className="py-4 px-6">Host Name</th>
                  <th className="py-4 px-6">Check-In Time</th>
                  <th className="py-4 px-6">Check-Out Time</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Special Req.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-400 font-semibold">#{visit.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{visit.visitor?.name || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-600">{visit.host_name || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.check_in ? new Date(visit.check_in).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.check_out ? new Date(visit.check_out).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {calculateDuration(visit.check_in, visit.check_out)}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{visit.visitor?.contact_number || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {visit.visitor?.special_requirements || "None"}
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
            <p className="text-slate-400 text-xs font-medium mb-0">No Completed Visits</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletedVisitTable;
