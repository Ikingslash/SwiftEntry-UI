import React, { useState, useEffect } from "react";
import ActionMenu from "../../../../components/ActionMenu";
import api from "../../../../context/api";
import { useTenant } from "../../../../context/TenantContext";

function BlackListedVisitors({ refreshKey }) {
  const { isTenantScope } = useTenant();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active dropdown tracking state
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
    fetchBlacklistedVisitors();
  }, [refreshKey]);

  const fetchBlacklistedVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/visitors/blacklisted");
      const data = response.data;
      if (Array.isArray(data)) {
        setVisitors(data);
      } else if (data && typeof data === 'object') {
        const flattened = Array.isArray(data.visitors)
          ? data.visitors
          : Object.values(data).flat();
        setVisitors(Array.isArray(flattened) ? flattened : []);
      } else {
        setVisitors([]);
      }
    } catch (err) {
      console.error("Error fetching blacklisted visitors:", err.response?.data || err.message);
      setError("Failed to load blacklisted visitors. Please try again.");
      setVisitors([]);
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
      fetchBlacklistedVisitors();
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
        fetchBlacklistedVisitors();
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
        fetchBlacklistedVisitors();
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
        fetchBlacklistedVisitors();
        alert(response.data.message);
      } catch (err) {
        console.error("Error deleting visitor:", err.response?.data || err.message);
        alert("Failed to delete visitor: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-slate-500 font-medium">Loading blacklisted visitors...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-rose-600 font-medium">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-0">
      {/* Table Card without overflow-hidden */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mt-2 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6 rounded-tl-3xl">Name</th>
                <th className="py-4 px-6">Contact Information</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-center rounded-tr-3xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-400 py-12 text-xs">
                    No blacklisted visitors found.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor, idx) => (
                  <tr key={visitor.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{visitor.name}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{visitor.contact_number || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-600">{visitor.email || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-600">{visitor.address || "N/A"}</td>
                    <td className="py-4 px-6 text-center">
                      {isTenantScope ? (
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

      {/* View Details Slide-over Modal */}
      {showDetailsModal && selectedVisitor && (
        <div
          onClick={() => setShowDetailsModal(false)}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Visitor Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-sm">
                  {selectedVisitor.name?.charAt(0)?.toUpperCase() || "V"}
                </div>
                <h4 className="mt-3 font-bold text-slate-900 text-base">{selectedVisitor.name}</h4>
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

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Email Address</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedVisitor.email || "N/A"}</span>
                </div>
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Contact Number</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedVisitor.contact_number || "N/A"}</span>
                </div>
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Address</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedVisitor.address || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
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

export default BlackListedVisitors;