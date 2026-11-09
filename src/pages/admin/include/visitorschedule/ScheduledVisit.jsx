import React, { useState, useEffect } from "react";
import ActionMenu from "../../../../components/ActionMenu";
import UserAvatar from "../../../../components/UserAvatar";
import api from "../../../../context/api";
import { useTenant } from "../../../../context/TenantContext";
import { groupVisitsByDate, paginationOf } from "../../../../utils/visitPayload";
import { format, parseISO } from 'date-fns';

function ScheduledVisit({ refreshKey, triggerRefresh }) {
  const { isTenantScope } = useTenant();
  const [visits, setVisits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

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

  const [inviteFormData, setInviteFormData] = useState({
    check_in: "",
    host_name: "",
    purpose: "",
    building: "",
    floor: "",
    group_size: "",
    visit_time: "",
    visit_details: "",
    visitor_type: "",
    status: "scheduled_visit",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchScheduledVisits();
  }, [refreshKey, page]);

  const fetchScheduledVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/visits/scheduled?page=${page}`);
      setVisits(groupVisitsByDate(response.data.visits));
      setPagination(paginationOf(response.data));
    } catch (err) {
      console.error("Error fetching scheduled visits:", err.response?.data || err.message);
      setError("Failed to load scheduled visits. Please try again.");
      setVisits({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (visitId) => {
    try {
      const response = await api.get(`/admin/visits/${visitId}`);
      const visitData = response.data;
      setSelectedVisit(visitData);
      setEditFormData({
        visitor_name: visitData.visitor_name,
        visitor_email: visitData.visitor_email,
        visitor_contact_number: visitData.visitor_contact_number,
        visitor_address: visitData.visitor_address,
        host_name: visitData.host_name,
        check_in: visitData.check_in ? format(parseISO(visitData.check_in), "yyyy-MM-dd'T'HH:mm") : "",
        purpose: visitData.purpose,
        building: visitData.building,
        floor: visitData.floor,
        group_size: visitData.group_size,
        visit_time: visitData.visit_time_enum,
        visit_details: visitData.visit_details,
        visitor_type: visitData.visitor_type,
        special_requirements: visitData.special_requirements,
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching visit details for edit:", err.response?.data || err.message);
      alert("Failed to load visit details for editing.");
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormData,
        check_in: editFormData.check_in ? format(parseISO(editFormData.check_in), "yyyy-MM-dd HH:mm:ss") : null,
      };
      await api.put(`/admin/visits/${selectedVisit.id}`, payload);
      setShowEditModal(false);
      triggerRefresh();
      alert("Visit updated successfully!");
    } catch (err) {
      console.error("Error updating visit:", err.response?.data || err.message);
      alert("Failed to update visit: " + (err.response?.data?.message || err.message));
    }
  };

  const handleInviteAgain = async (visitId) => {
    try {
      const response = await api.get(`/admin/visits/${visitId}`);
      const originalVisitData = response.data;
      setSelectedVisitor(originalVisitData.visitor);
      setInviteFormData({
        check_in: "",
        host_name: originalVisitData.host_name,
        purpose: originalVisitData.purpose,
        building: originalVisitData.building,
        floor: originalVisitData.floor,
        group_size: originalVisitData.group_size,
        visit_time: originalVisitData.visit_time_enum,
        visit_details: originalVisitData.visit_details,
        visitor_type: originalVisitData.visitor_type,
        status: "scheduled_visit",
      });
      setSelectedImage(originalVisitData.visitor_photo);
      setShowInviteModal(true);
    } catch (err) {
      console.error("Error fetching original visit for re-invite:", err.response?.data || err.message);
      alert("Failed to prepare re-invitation.");
    }
  };

  const handleInviteFormChange = (e) => {
    const { name, value } = e.target;
    setInviteFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        visitor_id: selectedVisitor.id,
        ...inviteFormData,
        check_in: inviteFormData.check_in ? format(parseISO(inviteFormData.check_in), "yyyy-MM-dd HH:mm:ss") : null,
      };
      await api.post(`/admin/visits/${selectedVisit.id}/invite-again`, payload);
      setShowInviteModal(false);
      setInviteFormData({
        check_in: "", host_name: "", purpose: "", building: "", floor: "", group_size: "", visit_time: "", visit_details: "", visitor_type: "", status: "scheduled_visit",
      });
      setSelectedImage(null);
      triggerRefresh();
      alert("New visit scheduled successfully!");
    } catch (err) {
      console.error("Error scheduling new visit:", err.response?.data || err.message);
      alert("Failed to schedule new visit: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to delete this visit? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/admin/visits/${visitId}`);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error deleting visit:", err.response?.data || err.message);
        alert("Failed to delete visit: " + (err.response?.data?.message || err.message));
      }
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

  const handleCheckOut = async (visitId) => {
    if (window.confirm("Are you sure you want to check out this visitor?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/check-out`);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error checking out visit:", err.response?.data || err.message);
        alert("Failed to check out visit: " + (err.response?.data?.message || err.message));
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

  const closeModal = () => {
    setShowEditModal(false);
    setShowInviteModal(false);
    setSelectedVisit(null);
    setSelectedVisitor(null);
    setSelectedImage(null);
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
    return <div className="text-center py-6 text-slate-500 font-medium">Loading scheduled visits...</div>;
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
                  <td colSpan="7" className="text-center text-slate-400 py-12 text-xs">No scheduled visits found.</td>
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
                          {isTenantScope ? (
                            <ActionMenu
 open={openDropdownId === visit.id}
 onClose={() => setOpenDropdownId(null)}
 className="w-52"
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
                                    onClick={() => { handleEdit(visit.id); setOpenDropdownId(null); }}
                                    className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                  >
                                    Edit Info
                                  </button>
                                  {(visit.status === 'scheduled_visit' || visit.status === 'pre_registered_visit' || visit.status === 'Walk_In') && (
                                    <>
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
                                        className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                      >
                                        Mark as Missed
                                      </button>
                                    </>
                                  )}
                                  {visit.status === 'completed_visit' && visit.check_in && !visit.check_out && (
                                    <button
                                      type="button"
                                      onClick={() => { handleCheckOut(visit.id); setOpenDropdownId(null); }}
                                      className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                    >
                                      Check Out
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => { handleInviteAgain(visit.id); setOpenDropdownId(null); }}
                                    className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                  >
                                    Invite Again
                                  </button>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button
                                    type="button"
                                    onClick={() => { handleDeleteVisit(visit.id); setOpenDropdownId(null); }}
                                    className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left"
                                  >
                                    Delete Visit
                                  </button>
                                </ActionMenu>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">—</span>
                          )}
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

      {/* Pagination Footer */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-2 mb-8">
          <span className="text-slate-500 text-xs font-medium">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs gap-1">
            <button
              onClick={handlePrevious}
              disabled={pagination.current_page === 1}
              className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            >
              <i className="bi bi-chevron-left text-xs"></i>
            </button>
            <button
              onClick={handleNext}
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            >
              <i className="bi bi-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      )}

      {/* Edit & Invite Modals remain functional */}
      {showEditModal && selectedVisit && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Visit Information</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="text-center">
                  <UserAvatar image={selectedVisit.visitor_photo} firstName={selectedVisit.visitor_name || "Visitor"} size={80} className="mx-auto mb-3" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Schedule Date & Time</label>
                  <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="check_in" value={editFormData.check_in} onChange={handleEditFormChange} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Status</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="status" value={editFormData.status || selectedVisit.status} onChange={handleEditFormChange} required>
                    <option value="scheduled_visit">Scheduled</option>
                    <option value="completed_visit">Completed</option>
                    <option value="cancelled_visit">Cancelled</option>
                    <option value="missed_visit">Missed</option>
                    <option value="pre_registered_visit">Pre-Registered</option>
                    <option value="Walk_In">Walk-In</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guest Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="visitor_name" value={editFormData.visitor_name} onChange={handleEditFormChange} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Host Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="host_name" value={editFormData.host_name} onChange={handleEditFormChange} required />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduledVisit;