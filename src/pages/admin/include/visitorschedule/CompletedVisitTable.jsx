import React, { useState, useEffect } from "react";
import ActionMenu from "../../../../components/ActionMenu";
import UserAvatar from "../../../../components/UserAvatar";
import api from "../../../../context/api";
import { useTenant } from "../../../../context/TenantContext";
import { flattenVisits, paginationOf } from "../../../../utils/visitPayload";
import { format, parseISO } from 'date-fns';

function CompletedVisitTable({ refreshKey, triggerRefresh }) {
  const { isTenantScope } = useTenant();
  const [visits, setVisits] = useState([]); // Flat array storage
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
    check_out: "",
    status: "completed_visit",
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
    fetchCompletedVisits();
  }, [refreshKey, page]);

  const fetchCompletedVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/visits/completed?page=${page}`);
      const data = response.data;

      // Accepts grouped-by-date or flat arrays and fills legacy display fields.
      setVisits(flattenVisits(data.visits));
      setPagination(paginationOf(data));
    } catch (err) {
      console.error("Error fetching completed visits:", err.response?.data || err.message);
      setError("Failed to load completed visits. Please try again.");
      setVisits([]);
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
        visitor_name: visitData.visitor_name || "",
        visitor_email: visitData.visitor_email || "",
        visitor_contact_number: visitData.visitor_contact_number || "",
        visitor_address: visitData.visitor_address || "",
        host_name: visitData.host_name || "",
        check_in: visitData.check_in ? format(parseISO(visitData.check_in), "yyyy-MM-dd'T'HH:mm") : "",
        check_out: visitData.check_out ? format(parseISO(visitData.check_out), "yyyy-MM-dd'T'HH:mm") : "",
        status: visitData.status || "completed_visit",
        purpose: visitData.purpose || "",
        building: visitData.building || "",
        floor: visitData.floor || "",
        group_size: visitData.group_size || "",
        visit_time: visitData.visit_time_enum || "",
        visit_details: visitData.visit_details || "",
        visitor_type: visitData.visitor_type || "",
        special_requirements: visitData.special_requirements || "",
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
        check_out: editFormData.check_out ? format(parseISO(editFormData.check_out), "yyyy-MM-dd HH:mm:ss") : null,
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

  const handleDeleteVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to delete this visit? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/visits/${visitId}`);
        triggerRefresh();
        alert("Visit deleted successfully.");
      } catch (err) {
        console.error("Error deleting visit:", err.response?.data || err.message);
        alert("Failed to delete visit: " + (err.response?.data?.message || err.message));
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

  if (loading) {
    return <div className="text-center py-6 text-slate-500 font-medium">Loading completed visits...</div>;
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
              {visits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-slate-400 py-12 text-xs">No completed visits found.</td>
                </tr>
              ) : (
                visits.map((visit, idx) => (
                  <tr key={visit.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{visit.visitor_name}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{visit.host_name}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">{visit.visit_date_formatted}, {visit.visit_time_formatted}</td>
                    <td className="py-4 px-6 text-slate-600">{visit.visitor_type}</td>
                    <td className="py-4 px-6 text-slate-600">{visit.check_in_time_formatted || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-600">{visit.check_out_time_formatted || "N/A"}</td>
                    <td className="py-4 px-6 text-center">
                      {isTenantScope ? (
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
                                onClick={() => { handleEdit(visit.id); setOpenDropdownId(null); }}
                                className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                              >
                                Edit Info
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

export default CompletedVisitTable;