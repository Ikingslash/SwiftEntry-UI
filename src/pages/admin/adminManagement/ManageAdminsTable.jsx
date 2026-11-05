import React, { useState, useEffect } from "react";
import ActionMenu from "../../../components/ActionMenu";
import api from "../../../context/api";
import UserAvatar from "../../../components/UserAvatar";
import { toast } from "react-toastify";

function ManageAdminsTable({ refreshKey, triggerRefresh, onSelectionChange }) {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        role: "",
        department: "",
        status: true,
    });

    useEffect(() => {
        fetchAdmins();
    }, [refreshKey, page]);

    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`admin/admins?page=${page}&per_page=8`);
            const adminList = Array.isArray(response.data.admins) ? response.data.admins : [];
            setAdmins(adminList.slice(0, 8));
            setPagination(response.data.pagination || {});
        } catch (err) {
            console.error("Error fetching admins:", err.response?.data || err.message);
            setError("Failed to load admins. Please try again.");
            setAdmins([]);
            setPagination({});
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (adminId) => {
        try {
            const response = await api.get(`admin/admins/${adminId}`);
            const adminData = response.data;
            setSelectedAdmin(adminData);
            setEditFormData({
                name: adminData.name || "",
                email: adminData.email || "",
                role: adminData.role || "",
                department: adminData.department || "",
                status: adminData.status ?? true,
            });
            setShowEditModal(true);
        } catch (err) {
            console.error("Error fetching admin details for edit:", err.response?.data || err.message);
            toast.error("Failed to load admin details for editing.");
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
            await api.put(`admin/admins/${selectedAdmin.id}`, payload);
            setShowEditModal(false);
            triggerRefresh();
            toast.success("Admin updated successfully!");
        } catch (err) {
            console.error("Error updating admin:", err.response?.data || err.message);
            toast.error("Failed to update admin");
        }
    };

    const handleDeactivateActivate = async (adminId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        const confirmMessage = currentStatus
            ? "Are you sure you want to deactivate this admin account?"
            : "Are you sure you want to activate this admin account?";

        if (window.confirm(confirmMessage)) {
            try {
                const response = await api.post(`admin/admins/${adminId}/${action}`);
                triggerRefresh();
                toast.success(response.data.message);
            } catch (err) {
                console.error(`Error ${action}ing admin:`, err.response?.data || err.message);
                toast.error(`Failed to ${action} admin: ` + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
            try {
                const response = await api.delete(`admin/admins/${adminId}`);
                triggerRefresh();
                toast.success(response.data.message);
            } catch (err) {
                console.error("Error deleting admin:", err.response?.data || err.message);
                toast.error("Failed to delete admin: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleViewDetails = async (adminId) => {
        try {
            const response = await api.get(`admin/admins/${adminId}`);
            setSelectedAdmin(response.data);
            setShowViewModal(true);
        } catch (err) {
            console.error("Error fetching admin details for view:", err.response?.data || err.message);
            toast.error("Failed to load admin details.");
        }
    };

    const closeModal = () => {
        setShowEditModal(false);
        setShowViewModal(false);
        setSelectedAdmin(null);
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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(admins);
            if (onSelectionChange) onSelectionChange(admins);
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

    if (loading) {
        return <div className="text-center py-6 text-slate-500 font-medium">Loading admin data...</div>;
    }

    if (error) {
        return <div className="text-center py-6 text-rose-600 font-medium">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-0">
            {/* Admins Table Card with Horizontal Scroll Support */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-6 overflow-x-auto">
                <div className="min-w-[900px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                                <th className="py-4 px-6 rounded-tl-3xl w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        onChange={handleSelectAll}
                                        checked={admins.length > 0 && selectedUsers.length === admins.length}
                                    />
                                </th>
                                <th className="py-4 px-6">Name</th>
                                <th className="py-4 px-6">Role</th>
                                <th className="py-4 px-6">Department</th>
                                <th className="py-4 px-6">Email</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-center rounded-tr-3xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-slate-400 py-12 text-xs">
                                        No admins found.
                                    </td>
                                </tr>
                            ) : (
                                admins.slice(0, 8).map((admin, idx) => (
                                    <tr key={admin.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isUserSelected(admin.id)}
                                                onChange={(e) => handleSelectUser(admin, e.target.checked)}
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-900">{admin.name}</td>
                                        <td className="py-4 px-6 text-slate-600">{admin.role || "Admin"}</td>
                                        <td className="py-4 px-6 text-slate-600">{admin.department || "N/A"}</td>
                                        <td className="py-4 px-6 text-slate-600">{admin.email}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${admin.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {admin.status ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <ActionMenu
 open={openDropdownId === admin.id}
 onClose={() => setOpenDropdownId(null)}
 className="w-48"
 trigger={<button
                                                    onClick={() => setOpenDropdownId(openDropdownId === admin.id ? null : admin.id)}
                                                    type="button"
                                                    className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                                                >
                                                    <i className="bi bi-three-dots-vertical text-slate-600"></i>
                                                </button>}
 >
                                                            <button
                                                                type="button"
                                                                onClick={() => { handleEdit(admin.id); setOpenDropdownId(null); }}
                                                                className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                                            >
                                                                Edit Info
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => { handleViewDetails(admin.id); setOpenDropdownId(null); }}
                                                                className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                                                            >
                                                                View Detail
                                                            </button>
                                                            <div className="border-t border-slate-100 my-1"></div>
                                                            <button
                                                                type="button"
                                                                onClick={() => { handleDeactivateActivate(admin.id, admin.status); setOpenDropdownId(null); }}
                                                                className={`w-full px-3 py-2 rounded-xl font-medium transition-colors text-left ${admin.status ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                                                            >
                                                                {admin.status ? "Deactivate" : "Activate"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => { handleDeleteAdmin(admin.id); setOpenDropdownId(null); }}
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

            {/* Edit Admin Slide-over Modal */}
            {showEditModal && selectedAdmin && (
                <div onClick={closeModal} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm">Edit Admin Information</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
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
                                <div className="flex items-center gap-2 pt-1">
                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" id="adminStatus" name="status" checked={editFormData.status} onChange={handleEditFormChange} />
                                    <label className="font-semibold text-slate-700 cursor-pointer" htmlFor="adminStatus">Active Status</label>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer">Update Admin</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Admin Details Slide-over Modal */}
            {showViewModal && selectedAdmin && (
                <div onClick={closeModal} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm">Admin Information</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            <div className="text-center">
                                <UserAvatar image={selectedAdmin.profile_picture} firstName={selectedAdmin.name || "Admin"} size={80} className="mx-auto mb-3" />
                                <h4 className="font-bold text-slate-900 text-base">{selectedAdmin.name}</h4>
                                <p className="text-slate-500 text-xs mt-0.5">{selectedAdmin.role || "Administrator"}</p>
                            </div>

                            <div className="divide-y divide-slate-100 text-xs">
                                <div className="py-3">
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Email Address</span>
                                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedAdmin.email}</span>
                                </div>
                                <div className="py-3">
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Department</span>
                                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedAdmin.department || "N/A"}</span>
                                </div>
                                <div className="py-3">
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Job Role</span>
                                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedAdmin.role || "Admin"}</span>
                                </div>
                                <div className="py-3">
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Status</span>
                                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedAdmin.status ? "Active" : "Inactive"}</span>
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

export default ManageAdminsTable;