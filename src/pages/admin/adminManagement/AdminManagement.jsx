import { useState } from "react";
import UserAvatar from "../../../components/UserAvatar";
import NavBar from "../include/NavBar";
import ManageAdminsTable from "./ManageAdminsTable";
import BulkUploadModal from "../include/BulkUploadModal";
import BulkDeleteConfirmModal from "../include/BulkDeleteConfirmModal";
import api from "../../../context/api";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AdminManagement() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAdminFormData, setNewAdminFormData] = useState({
        name: "",
        email: "",
        department: "",
        status: "1",
        photo: null,
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const triggerRefresh = () => setRefreshKey((prevKey) => prevKey + 1);

    const handleAddModalClose = () => {
        setShowAddModal(false);
        setNewAdminFormData({
            name: "",
            email: "",
            department: "",
            status: "1",
            photo: null,
        });
        setSelectedImage(null);
        setFormErrors({});
    };

    const handleNewAdminFormChange = (e) => {
        const { name, value } = e.target;
        setNewAdminFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setNewAdminFormData((prev) => ({ ...prev, photo: file }));
        } else {
            setSelectedImage(null);
            setNewAdminFormData((prev) => ({ ...prev, photo: null }));
        }
    };

    const showValidationErrors = (error) => {
        if (error.response && error.response.status === 422) {
            let validationErrors = error.response.data.errors || error.response.data;

            if (typeof validationErrors === "string") {
                toast.error(validationErrors);
                return;
            }

            Object.values(validationErrors).forEach((messages) => {
                if (Array.isArray(messages)) {
                    messages.forEach((msg) => toast.error(msg));
                } else if (typeof messages === "string") {
                    toast.error(messages);
                }
            });
        } else {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Something went wrong. Please try again."
            );
        }
    };

    const handleAddNewAdmin = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setIsSubmitting(true);
        const formData = new FormData();

        Object.entries(newAdminFormData).forEach(([key, value]) => {
            if (value !== null) {
                formData.append(key, value);
            }
        });

        try {
            const response = await api.post("admin/admins", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Admin added:", response.data);
            handleAddModalClose();
            triggerRefresh();
            toast.success("Admin added successfully! An invitation email has been sent to the admin.");
        } catch (error) {
            showValidationErrors(error);
            console.log("Validation errors:", error.response?.data);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectionChange = (users) => {
        setSelectedUsers(users);
    };

    const handleBulkDeleteClick = () => {
        if (selectedUsers.length === 0) {
            toast.warning("Please select at least one user to delete");
            return;
        }
        setShowBulkDeleteModal(true);
    };

    return (
        <div>
            <NavBar />
            <ToastContainer position="top-right" autoClose={5000} />
            {/* Header */}
            <header
                id="home"
                className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
                style={{
                    backgroundColor: "#053561",
                    minHeight: "270px",
                    marginTop: "56px",
                    textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
                    borderBottomLeftRadius: "3%",
                    borderBottomRightRadius: "3%",
                }}
            >
                <div className="container">
                    <div
                        className="text-white p-4 shadow-sm"
                        style={{ backgroundColor: "#053561", minHeight: "180px" }}
                    >
                        <div className="d-flex align-items-center justify-content-between">
                            <h3 className="fw-bold mb-0">Manage Admins</h3>
                        </div>
                        <div className="d-flex align-items-center mt-4">
                            <p
                                className="badge text-white"
                                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
                            >
                                Sydani Group
                                <span
                                    className="badge text-light p-1"
                                    style={{ backgroundColor: "rgba(13, 46, 78, 0.8)" }}
                                >
                                    Company
                                </span>
                            </p>
                            <div
                                className="flex-grow-1 ms-3 mb-3"
                                style={{
                                    height: "2px",
                                    backgroundColor: "rgba(168, 172, 176, 0.8)",
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Add Admin Button */}
            <div className="position-relative">
                <div
                    className="d-flex justify-content-between align-items-center container gap-2"
                    style={{
                        position: "absolute",
                        top: "-47px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "100%",
                    }}
                >
                    <button
                        className="btn btn-danger rounded-3 ms-auto"
                        onClick={handleBulkDeleteClick}
                        disabled={selectedUsers.length === 0}
                    >
                        <i className="bi bi-trash me-2"></i>
                        Bulk Delete {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                    </button>
                    <button
                        className="btn btn-success rounded-3"
                        onClick={() => setShowBulkUploadModal(true)}
                    >
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Bulk Upload
                    </button>
                    <button
                        className="btn btn-primary rounded-3"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Add New Admin
                    </button>
                </div>
            </div>

            {/* Admin Table */}
            <div className="d-flex justify-content-between align-items-center">
                <ManageAdminsTable
                    refreshKey={refreshKey}
                    triggerRefresh={triggerRefresh}
                    onSelectionChange={handleSelectionChange}
                />
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={handleAddModalClose}
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
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Admin</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleAddModalClose}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleAddNewAdmin}>
                                    <div className="d-flex flex-column gap-3">
                                        {/* Photo Upload */}
                                        <div className="my-4 text-center">
                                            <label className="form-label d-block">
                                                <small>Add Photo (Optional)</small>
                                            </label>
                                            <input
                                                name="photo"
                                                type="file"
                                                className="d-none"
                                                id="fileUpload"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <label htmlFor="fileUpload" className="d-inline-block">
                                                <div
                                                    className="rounded-circle border d-flex justify-content-center align-items-center"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        backgroundColor: "#f8f9fa",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {selectedImage ? (
                                                        <UserAvatar
                                                            image={selectedImage}
                                                            firstName={newAdminFormData.name || "New Admin"}
                                                            size={100}
                                                            className="rounded-circle"
                                                        />
                                                    ) : (
                                                        <i
                                                            className="bi bi-camera"
                                                            style={{ fontSize: "24px" }}
                                                        ></i>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* Text Fields */}
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={newAdminFormData.name}
                                                onChange={handleNewAdminFormChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                            {formErrors.name && (
                                                <div className="text-danger small">
                                                    {formErrors.name[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email*</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={newAdminFormData.email}
                                                onChange={handleNewAdminFormChange}
                                                placeholder="Enter email"
                                                required
                                            />
                                            <small className="text-muted">An invitation email will be sent to this address</small>
                                            {formErrors.email && (
                                                <div className="text-danger small">
                                                    {formErrors.email[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Department</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="department"
                                                value={newAdminFormData.department}
                                                onChange={handleNewAdminFormChange}
                                                placeholder="Enter department"
                                                required
                                            />
                                        </div>

                                        <div className="mt-4 text-center">
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-50"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>
                                                        Sending Invitation...
                                                    </>
                                                ) : (
                                                    "Send Invitation"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            <BulkUploadModal
                isOpen={showBulkUploadModal}
                onClose={() => setShowBulkUploadModal(false)}
                userType="admin"
                onSuccess={() => {
                    setShowBulkUploadModal(false);
                    triggerRefresh();
                }}
            />

            {/* Bulk Delete Modal */}
            <BulkDeleteConfirmModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                selectedUsers={selectedUsers}
                userType="admin"
                onSuccess={() => {
                    setShowBulkDeleteModal(false);
                    setSelectedUsers([]);
                    triggerRefresh();
                }}
            />
        </div>
    );
}

export default AdminManagement;
