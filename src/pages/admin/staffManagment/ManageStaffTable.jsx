import React, { useState, useEffect } from "react";
import ActionMenu from "../../../components/ActionMenu";
import api from "../../../context/api";
import UserAvatar from "../../../components/UserAvatar";
import { toast } from "react-toastify";

function ManageStaffTable({ refreshKey, triggerRefresh, onSelectionChange }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState({ name: "", department: "", email: "" });
  const [filterTrigger, setFilterTrigger] = useState(0);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    password: "",
    photo: null,
    status: true,
  });

  useEffect(() => {
    fetchStaff();
  }, [refreshKey, page, filterTrigger]);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page,
        per_page: 8,
        ...(filters.name && { name: filters.name }),
        ...(filters.department && { department: filters.department }),
        ...(filters.email && { email: filters.email }),
      }).toString();

      const response = await api.get(`admin/staff?${queryParams}`);
      const staffList = Array.isArray(response.data.staff) ? response.data.staff : [];
      setStaff(staffList.slice(0, 8));
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error("Error fetching staff:", err.response?.data || err.message);
      setError("Failed to load staff. Please try again.");
      setStaff([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (staffId) => {
    try {
      const response = await api.get(`admin/staff/${staffId}`);
      const staffData = response.data;
      setSelectedStaff(staffData);
      setEditFormData({
        name: staffData.name || "",
        email: staffData.email || "",
        role: staffData.role || "",
        department: staffData.department || "",
        password: "",
        photo: staffData.photo || null,
        status: staffData.status ?? true,
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching staff details for edit:", err.response?.data || err.message);
      toast.error("Failed to load staff details for editing.");
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };
      if (payload.password === "") {
        delete payload.password;
      }

      await api.put(`admin/staff/${selectedStaff.id}`, payload);
      setShowEditModal(false);
      triggerRefresh();
      toast.success("Staff updated successfully!");
    } catch (err) {
      console.error("Error updating staff:", err.response?.data || err.message);
      toast.error("Failed to update staff.");
    }
  };

  const handleDeactivateActivate = async (staffId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmMessage = currentStatus
      ? "Are you sure you want to deactivate this staff account?"
      : "Are you sure you want to activate this staff account?";

    if (window.confirm(confirmMessage)) {
      try {
        const response = await api.post(`admin/staff/${staffId}/${action}`);
        triggerRefresh();
        toast.success(response.data.message);
      } catch (err) {
        console.error(`Error ${action}ing staff:`, err.response?.data || err.message);
        toast.error(`Failed to ${action} staff: ` + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff? This action cannot be undone.")) {
      try {
        const response = await api.delete(`admin/staff/${staffId}`);
        triggerRefresh();
        toast.success(response.data.message);
      } catch (err) {
        console.error("Error deleting staff:", err.response?.data || err.message);
        toast.error("Failed to delete staff: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleViewDetails = async (staffId) => {
    try {
      const response = await api.get(`admin/staff/${staffId}`);
      setSelectedStaff(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching staff details for view:", err.response?.data || err.message);
      toast.error("Failed to load staff details.");
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedStaff(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSelectedStaff(prev => ({ ...prev, photo: previewUrl }));
      setEditFormData(prev => ({ ...prev, photo: previewUrl }));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(staff);
      if (onSelectionChange) onSelectionChange(staff);
    } else {
      setSelectedUsers([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectUser = (user, isChecked) => {
    let updatedSelection;
    if (isChecked) {
      updatedSelection = [...selectedUsers, user];
    } else {
      updatedSelection = selectedUsers.filter((u) => u.id !== user.id);
    }
    setSelectedUsers(updatedSelection);
    if (onSelectionChange) onSelectionChange(updatedSelection);
  };

  const isUserSelected = (userId) => {
    return selectedUsers.some((u) => u.id === userId);
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
    return <div className="text-center py-6 text-slate-500 font-medium">Loading staff data...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-rose-600 font-medium">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-0">
      {/* Filters Bar without Background Card Wrapper */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 px-1">
        <div>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            placeholder="Filter by Name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            placeholder="Filter by Department"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            placeholder="Filter by Email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
            onClick={() => { setPage(1); setFilterTrigger(prev => prev + 1); }}
          >
            Apply
          </button>
          <button
            className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
            onClick={() => {
              setFilters({ name: "", department: "", email: "" });
              setPage(1);
              setFilterTrigger(prev => prev + 1);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Staff Table Card with Horizontal Scroll Support */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-6 overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6 rounded-tl-3xl w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={staff.length > 0 && selectedUsers.length === staff.length}
                  />
                </th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Invite Status</th>
                <th className="py-4 px-6">Password Set Up</th>
                <th className="py-4 px-6">Last Login</th>
                <th className="py-4 px-6 text-center rounded-tr-3xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-slate-400 py-12 text-xs">
                    No staff found.
                  </td>
                </tr>
              ) : (
                staff.slice(0, 8).map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isUserSelected(s.id)}
                        onChange={(e) => handleSelectUser(s, e.target.checked)}
                      />
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-4 px-6 text-slate-600">{s.role}</td>
                    <td className="py-4 px-6 text-slate-600">{s.department}</td>
                    <td className="py-4 px-6 text-slate-600">{s.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {s.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${s.invitation_status === 'sent'
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.invitation_status === 'failed'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-orange-100 text-orange-700'
                          }`}
                      >
                        {s.invitation_status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {s.password_setup_at ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                          Complete
                        </span>
                      ) : s.invitation_status === 'sent' || s.invitation_status === 'pending' || !s.invitation_status ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-600">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {s.last_login ? (
                        <span className="text-slate-600 font-medium">
                          {new Date(s.last_login).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-600">
                          Never
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <ActionMenu
 open={openDropdownId === s.id}
 onClose={() => setOpenDropdownId(null)}
 className="w-48"
 trigger={<button
                          onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)}
                          type="button"
                          className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <i className="bi bi-three-dots-vertical text-slate-600"></i>
                        </button>}
 >
                              <button
                                type="button"
                                onClick={() => { handleEdit(s.id); setOpenDropdownId(null); }}
                                className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                              >
                                Edit Info
                              </button>
                              <button
                                type="button"
                                onClick={() => { handleViewDetails(s.id); setOpenDropdownId(null); }}
                                className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                              >
                                View Detail
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                type="button"
                                onClick={() => { handleDeactivateActivate(s.id, s.status); setOpenDropdownId(null); }}
                                className={`w-full px-3 py-2 rounded-xl font-medium transition-colors text-left ${s.status ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                              >
                                {s.status ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  setOpenDropdownId(null);
                                  try {
                                    await api.post(`admin/staff/${s.id}/resend-setup-email`);
                                    toast.success('Setup email resent successfully!');
                                    triggerRefresh();
                                  } catch (err) {
                                    toast.error('Failed to resend setup email.');
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-xl text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left"
                              >
                                Resend Setup Email
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                type="button"
                                onClick={() => { handleDeleteStaff(s.id); setOpenDropdownId(null); }}
                                className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left"
                              >
                                Delete
                              </button>
                            </ActionMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-2 mb-8">
          <span className="text-slate-500 text-xs font-medium">Page {pagination.current_page} of {pagination.last_page}</span>
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs gap-1">
            <button onClick={handlePrevious} disabled={pagination.current_page === 1} className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-35 rounded-xl transition-colors cursor-pointer">
              <i className="bi bi-chevron-left text-xs"></i>
            </button>
            <button onClick={handleNext} disabled={pagination.current_page === pagination.last_page} className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-35 rounded-xl transition-colors cursor-pointer">
              <i className="bi bi-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      )}

      {/* Edit Staff Slide-over Modal */}
      {showEditModal && selectedStaff && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Staff Information</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="text-center my-2">
                  <input type="file" className="hidden" id="editFileUpload" accept="image/*" onChange={handleImageChange} />
                  <label htmlFor="editFileUpload" className="inline-block cursor-pointer group">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 group-hover:border-blue-500 bg-slate-50 flex items-center justify-center mx-auto overflow-hidden transition-colors">
                      {selectedStaff.photo ? (
                        <UserAvatar image={selectedStaff.photo} firstName={selectedStaff.name || "Staff"} size={80} className="rounded-full w-full h-full object-cover" />
                      ) : (
                        <i className="bi bi-camera text-slate-400 text-xl group-hover:text-blue-500 transition-colors"></i>
                      )}
                    </div>
                    <span className="block mt-2 font-semibold text-slate-600 text-[11px]">Change Photo</span>
                  </label>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="name" value={editFormData.name} onChange={handleEditFormChange} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="email" value={editFormData.email} onChange={handleEditFormChange} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Role</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="role" value={editFormData.role} onChange={handleEditFormChange} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="department" value={editFormData.department} onChange={handleEditFormChange} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="password" value={editFormData.password} onChange={handleEditFormChange} placeholder="Enter new password" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" id="staffStatus" name="status" checked={editFormData.status} onChange={handleEditFormChange} />
                  <label className="font-semibold text-slate-700 cursor-pointer" htmlFor="staffStatus">Active Status</label>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer">Update Staff</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Details Slide-over Modal */}
      {showViewModal && selectedStaff && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Staff Information</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="text-center">
                <UserAvatar image={selectedStaff.profile_picture} firstName={selectedStaff.name || "Staff"} size={80} className="mx-auto mb-3" />
                <h4 className="font-bold text-slate-900 text-base">{selectedStaff.name}</h4>
                <p className="text-slate-500 text-xs mt-0.5">{selectedStaff.role || "Staff Member"}</p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Email Address</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedStaff.email}</span>
                </div>
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Department</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedStaff.department}</span>
                </div>
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Job Role</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedStaff.role}</span>
                </div>
                <div className="py-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Status</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedStaff.status ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <button onClick={closeModal} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStaffTable;