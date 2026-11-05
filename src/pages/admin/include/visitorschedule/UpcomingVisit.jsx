import React, { useState, useEffect } from "react";
import ActionMenu from "../../../../components/ActionMenu";
import UserAvatar from "../../../../components/UserAvatar";
import api from "../../../../context/api";
import { groupVisitsByDate, paginationOf } from "../../../../utils/visitPayload";
import { format, parseISO } from 'date-fns';

function UpcomingVisit({ refreshKey, triggerRefresh }) {
  const [visits, setVisits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    visitor_name: "",
    visitor_email: "",
    visitor_contact_number: "",
    visitor_address: "",
    host_name: "",
    check_in: "",
    purpose: "",
    building: "",
    floor: "",
    group_size: "",
    visit_time: "",
    visit_details: "",
    visitor_type: "",
    special_requirements: "",
  });

  useEffect(() => {
    fetchUpcomingVisits();
  }, [refreshKey, page]);

  const fetchUpcomingVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/visits/upcoming?page=${page}`);
      setVisits(groupVisitsByDate(response.data.visits));
      setPagination(paginationOf(response.data));
    } catch (err) {
      console.error("Error fetching upcoming visits:", err.response?.data || err.message);
      setError("Failed to load upcoming visits. Please try again.");
      setVisits({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (visitId) => {
    if (window.confirm("Are you sure you want to check in this visitor?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/check-in`);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error checking in visit:", err.response?.data || err.message);
        alert("Failed to check in visit: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancelVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to cancel this visit?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/cancel`);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error cancelling visit:", err.response?.data || err.message);
        alert("Failed to cancel visit: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleMarkMissed = async (visitId) => {
    if (window.confirm("Are you sure you want to mark this visit as missed?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/mark-missed`);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error marking visit as missed:", err.response?.data || err.message);
        alert("Failed to mark visit as missed: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handlePrevious = () => {
    if (pagination.current_page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page) {
      setPage((prev) => prev + 1);
    }
  };

  const sortedDates = Object.keys(visits || {}).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) {
    return <div className="text-center py-6 text-slate-500 font-medium">Loading upcoming visits...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-rose-600 font-medium">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-0">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mt-2 mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6 rounded-tl-3xl">Name</th>
                <th className="py-4 px-6">Host Name</th>
                <th className="py-4 px-6">Visit Date/Time</th>
                <th className="py-4 px-6">Visit Type</th>
                <th className="py-4 px-6">Checked In</th>
                <th className="py-4 px-6">Checked Out</th>
                <th className="py-4 px-6 text-center rounded-tr-3xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedDates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-slate-400 py-12 text-xs">No upcoming visits found.</td>
                </tr>
              ) : (
                sortedDates.map((date, index) => (
                  <React.Fragment key={index}>
                    <tr className="bg-slate-50/40 border-b border-slate-100">
                      <td colSpan="7" className="py-3 px-6 text-xs font-bold text-slate-700">
                        {format(parseISO(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "Today" : format(parseISO(date), 'yyyy-MM-dd')}
                      </td>
                    </tr>
                    {visits[date].map((visit, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">{visit.visitor_name}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{visit.host_name}</td>
                        <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">{visit.visit_date_formatted}, {visit.visit_time_formatted ?? visit.check_in_time_formatted}</td>
                        <td className="py-4 px-6 text-slate-600">{visit.visitor_type}</td>
                        <td className="py-4 px-6 text-slate-600">{visit.check_in_time_formatted}</td>
                        <td className="py-4 px-6 text-slate-600">{visit.check_out_time_formatted}</td>
                        <td className="py-4 px-6 text-center">
                          <ActionMenu
 open={openDropdownId === visit.id}
 onClose={() => setOpenDropdownId(null)}
 className="w-48"
 trigger={<button
                              onClick={() => setOpenDropdownId(openDropdownId === visit.id ? null : visit.id)}
                              type="button"
                              className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <i className="bi bi-three-dots-vertical text-slate-600"></i>
                            </button>}
 >
                                  <button
                                    type="button"
                                    onClick={() => { handleCheckIn(visit.id); setOpenDropdownId(null); }}
                                    className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                  >
                                    Check In
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { handleCancelVisit(visit.id); setOpenDropdownId(null); }}
                                    className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                  >
                                    Cancel Visit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { handleMarkMissed(visit.id); setOpenDropdownId(null); }}
                                    className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left"
                                  >
                                    Mark as Missed
                                  </button>
                                </ActionMenu>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-2 mb-8">
          <span className="text-slate-500 text-xs font-medium">Page {pagination.current_page} of {pagination.last_page}</span>
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs gap-1">
            <button onClick={handlePrevious} disabled={pagination.current_page === 1} className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl transition-colors cursor-pointer">
              <i className="bi bi-chevron-left text-xs"></i>
            </button>
            <button onClick={handleNext} disabled={pagination.current_page === pagination.last_page} className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl transition-colors cursor-pointer">
              <i className="bi bi-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingVisit;