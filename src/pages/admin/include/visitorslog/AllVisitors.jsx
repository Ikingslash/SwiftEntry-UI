import React, { useState, useEffect } from "react";
import ActionMenu from "../../../../components/ActionMenu";
import api from "../../../../context/api";
import { format } from 'date-fns';

function AllVisitors({ refreshKey }) {
  const [visitors, setVisitors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active dropdown tracking state (replaces Bootstrap JS dropdown)
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchAllVisitors();
  }, [refreshKey]);

  const fetchAllVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/visitors");
      setVisitors(response.data);
    } catch (err) {
      console.error("Error fetching all visitors:", err.response?.data || err.message);
      setError("Failed to load visitors. Please try again.");
      setVisitors({});
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visitor) => {
    setSelectedVisitor(visitor);
    setEditFormData({
      name: visitor.name || "",
      contact_number: visitor.contact_number || "",
      email: visitor.email || "",
      address: visitor.address || "",
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setShowDetailsModal(true);
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
      await api.put(`/admin/visitors/${selectedVisitor.id}`, editFormData);
      setShowEditModal(false);
      fetchAllVisitors();
      alert("Visitor updated successfully!");
    } catch (err) {
      console.error("Error updating visitor:", err.response?.data || err.message);
      alert("Failed to update visitor: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkVip = async (visitorId) => {
    if (window.confirm("Are you sure you want to toggle VIP status for this visitor?")) {
      try {
        const response = await api.post(`/admin/visitors/${visitorId}/vip`);
        fetchAllVisitors();
        alert(response.data.message);
      } catch (err) {
        console.error("Error toggling VIP status:", err.response?.data || err.message);
        alert("Failed to toggle VIP status: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleBlacklist = async (visitorId) => {
    if (window.confirm("Are you sure you want to toggle blacklist status for this visitor?")) {
      try {
        const response = await api.post(`/admin/visitors/${visitorId}/blacklist`);
        fetchAllVisitors();
        alert(response.data.message);
      } catch (err) {
        console.error("Error toggling blacklist status:", err.response?.data || err.message);
        alert("Failed to toggle blacklist status: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (visitorId) => {
    if (window.confirm("Are you sure you want to delete this visitor? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/admin/visitors/${visitorId}`);
        fetchAllVisitors();
        alert(response.data.message);
      } catch (err) {
        console.error("Error deleting visitor:", err.response?.data || err.message);
        alert("Failed to delete visitor: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const sortedDates = Object.keys(visitors || {}).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const flattenedVisitors = [];
  sortedDates.forEach((date) => {
    if (visitors[date] && Array.isArray(visitors[date])) {
      visitors[date].forEach((visitor) => {
        flattenedVisitors.push({ ...visitor, visitDate: date });
      });
    }
  });

  const totalItems = flattenedVisitors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVisitors = flattenedVisitors.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <div className="text-center py-6 text-slate-500 font-medium">Loading visitors...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-rose-600 font-medium">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-0">
      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mt-2 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Contact Information</th>
                <th className="py-4 px-6 whitespace-nowrap">Date</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentVisitors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-slate-400 py-12 text-xs">
                    No visitors found.
                  </td>
                </tr>
              ) : (
                currentVisitors.map((visitor, idx) => {
                  const formattedDate = visitor.visitDate
                    ? format(new Date(visitor.visitDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? "Today"
                      : format(new Date(visitor.visitDate), 'yyyy-MM-dd')
                    : "N/A";

                  return (
                    <tr key={visitor.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{visitor.name}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{visitor.contact_number || "N/A"}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">{formattedDate}</td>
                      <td className="py-4 px-6 text-slate-600">{visitor.email || "N/A"}</td>
                      <td className="py-4 px-6 text-slate-600">{visitor.address || "N/A"}</td>
                      <td className="py-4 px-6 text-center relative">
                        <ActionMenu
 open={openDropdownId === visitor.id}
 onClose={() => setOpenDropdownId(null)}
 className="w-48"
 trigger={<button
                            onClick={() => setOpenDropdownId(openDropdownId === visitor.id ? null : visitor.id)}
                            type="button"
                            className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <i className="bi bi-three-dots-vertical text-slate-600"></i>
                          </button>}
 >
                                <button
                                  type="button"
                                  onClick={() => { handleEdit(visitor); setOpenDropdownId(null); }}
                                  className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                >
                                  Edit Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { handleMarkVip(visitor.id); setOpenDropdownId(null); }}
                                  className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                >
                                  {visitor.is_vip ? "Remove from VIP" : "Make VIP Guest"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { handleViewDetails(visitor); setOpenDropdownId(null); }}
                                  className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                >
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { handleBlacklist(visitor.id); setOpenDropdownId(null); }}
                                  className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left"
                                >
                                  {visitor.is_blacklisted ? "Unblacklist Guest" : "Blacklist Guest"}
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                  type="button"
                                  onClick={() => { handleDelete(visitor.id); setOpenDropdownId(null); }}
                                  className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left"
                                >
                                  Delete
                                </button>
                              </ActionMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 mb-8">
        <span className="text-slate-500 text-xs font-medium">
          Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems}
        </span>
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
          >
            <i className="bi bi-chevron-left text-xs"></i>
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
          >
            <i className="bi bi-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      {/* Edit Visitor Slide-over Modal */}
      {showEditModal && selectedVisitor && (
        <div onClick={() => setShowEditModal(false)} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Visitor Information</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visitor Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Information</label>
                  <input
                    type="text"
                    name="contact_number"
                    value={editFormData.contact_number}
                    onChange={handleEditFormChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditFormChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Centered Modal */}
      {showDetailsModal && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Visitor Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="py-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm">
                  {selectedVisitor.name?.charAt(0)?.toUpperCase() || "V"}
                </div>
                <h4 className="mt-3 font-bold text-slate-900 text-sm">{selectedVisitor.name}</h4>
                <div className="mt-2 flex justify-center gap-2">
                  {selectedVisitor.is_vip && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">VIP</span>
                  )}
                  {selectedVisitor.is_blacklisted && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">Blacklisted</span>
                  )}
                  {!selectedVisitor.is_vip && !selectedVisitor.is_blacklisted && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Regular</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 divide-y divide-slate-100 text-xs space-y-3">
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Email Address</span>
                  <span className="font-semibold text-slate-800">{selectedVisitor.email || "N/A"}</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Contact Number</span>
                  <span className="font-semibold text-slate-800">{selectedVisitor.contact_number || "N/A"}</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Address</span>
                  <span className="font-semibold text-slate-800">{selectedVisitor.address || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllVisitors;