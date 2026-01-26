import React, { useState, useEffect } from "react";
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
            const response = await api.get(`admin/admins?page=${page}`);
            setAdmins(Array.isArray(response.data.admins) ? response.data.admins : []);
            setPagination(response.data.pagination);
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
                name: adminData.name,
                email: adminData.email,
                role: adminData.role,
                department: adminData.department,
                status: adminData.status,
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
            const response = await api.put(`admin/admins/${selectedAdmin.id}`, payload);
            console.log("Admin updated:", response.data);
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
                console.log(`Admin ${action}d:`, response.data);
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
                console.log("Admin deleted:", response.data);
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
        return <p className="text-center mt-5">Loading admin data...</p>;
    }

    if (error) {
        return <p className="text-center mt-5 text-danger">{error}</p>;
    }

    return (
        <div className="container">
            <div className="table-responsive my-5">
                <table className="table table-bordered table-hover">
                    <thead className="bg-white">
                        <tr>
                            <th style={{ width: "50px" }}>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    onChange={handleSelectAll}
                                    checked={admins.length > 0 && selectedUsers.length === admins.length}
                                />
                            </th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center text-muted py-4">
                                    No admins found.
                                </td>
                            </tr>
                        ) : (
                            admins.map((admin, idx) => (
                                <tr key={admin.id || idx}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={isUserSelected(admin.id)}
                                            onChange={(e) => handleSelectUser(admin, e.target.checked)}
                                        />
                                    </td>
                                    <td>{admin.name}</td>
                                    <td>{admin.role}</td>
                                    <td>{admin.department}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.status ? "Active" : "Inactive"}</td>
                                    <td className="text-center">
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-white border-primary"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>
                                            <ul
                                                className="dropdown-menu bg-light rounded-4"
                                                style={{ fontSize: "13px", width: "250px" }}
                                            >
                                                <li>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => handleEdit(admin.id)}
                                                    >
                                                        Edit Info
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => handleViewDetails(admin.id)}
                                                    >
                                                        View Detail
                                                    </button>
                                                </li>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                <li>
                                                    <button
                                                        className={`dropdown-item ${admin.status ? "text-warning" : "text-success"}`}
                                                        onClick={() => handleDeactivateActivate(admin.id, admin.status)}
                                                    >
                                                        {admin.status ? "Deactivate" : "Activate"}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        className="dropdown-item text-danger"
                                                        onClick={() => handleDeleteAdmin(admin.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-primary"
                    onClick={handlePrevious}
                    disabled={pagination.current_page === 1}
                >
                    Previous
                </button>
                <span>
                    Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={pagination.current_page === pagination.last_page}
                >
                    Next
                </button>
            </div>

            {/* Edit Admin Modal */}
            {showEditModal && selectedAdmin && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={closeModal}
                >
                    <div
                        className="modal-dialog modal-lg py-4"
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            width: "50%",
                            maxWidth: "40%",
                            height: "100vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content py-5">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Admin Information</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>

                            <div className="modal-body p-4">
                                <form onSubmit={handleEditSubmit}>
                                    <div className="row">
                                        <div className="d-flex flex-column gap-3">
                                            <div className="my-3">
                                                <label className="form-label">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={editFormData.name}
                                                    onChange={handleEditFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={editFormData.email}
                                                    onChange={handleEditFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Job Role</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="role"
                                                    value={editFormData.role}
                                                    onChange={handleEditFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Department</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="department"
                                                    value={editFormData.department}
                                                    onChange={handleEditFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3 form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="adminStatus"
                                                    name="status"
                                                    checked={editFormData.status}
                                                    onChange={handleEditFormChange}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="adminStatus"
                                                >
                                                    Active
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <button type="submit" className="btn btn-primary w-50">
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Admin Details Modal */}
            {showViewModal && selectedAdmin && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={closeModal}
                >
                    <div
                        className="modal-dialog modal-lg py-4"
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            width: "50%",
                            maxWidth: "40%",
                            height: "100vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content p-3">
                            <div className="modal-header">
                                <h5 className="modal-title">Admin Information</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3 container">
                                    <div className="col-12 text-center mb-3">
                                        <UserAvatar
                                            image={selectedAdmin.profile_picture}
                                            firstName={selectedAdmin.name || "Admin"}
                                            size={100}
                                            className="rounded-circle mx-auto"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <p className="fw-bold">
                                            <small>Full Name:</small>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <small>{selectedAdmin.name}</small>
                                    </div>
                                    <hr className="w-100" />

                                    <div className="col-md-6">
                                        <p className="fw-bold">
                                            <small>Email:</small>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <small>{selectedAdmin.email}</small>
                                    </div>
                                    <hr className="w-100" />

                                    <div className="col-md-6">
                                        <p className="fw-bold">
                                            <small>Job Role:</small>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <small>{selectedAdmin.role}</small>
                                    </div>
                                    <hr className="w-100" />

                                    <div className="col-md-6">
                                        <p className="fw-bold">
                                            <small>Department:</small>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <small>{selectedAdmin.department}</small>
                                    </div>
                                    <hr className="w-100" />

                                    <div className="col-md-6">
                                        <p className="fw-bold">
                                            <small>Status:</small>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <small>
                                            {selectedAdmin.status ? "Active" : "Inactive"}
                                        </small>
                                    </div>
                                    <hr className="w-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAdminsTable;
