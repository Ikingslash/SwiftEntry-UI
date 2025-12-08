import { useState } from "react";
import NavBar from "../include/NavBar";
import ManageStaffTable from "./ManageStaffTable";
import api from "../../../context/api";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AdminStaff() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaffFormData, setNewStaffFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    position: "",
    company_name: "",
    status: "1",
    photo: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const triggerRefresh = () => setRefreshKey((prevKey) => prevKey + 1);

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewStaffFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      position: "",
      company_name: "",
      status: "1",
      photo: null,
    });
    setSelectedImage(null);
    setFormErrors({});
  };

  const handleNewStaffFormChange = (e) => {
    const { name, value } = e.target;
    setNewStaffFormData((prev) => ({ ...prev, [name]: value }));
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
      setNewStaffFormData((prev) => ({ ...prev, photo: file }));
    } else {
      setSelectedImage(null);
      setNewStaffFormData((prev) => ({ ...prev, photo: null }));
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

  const handleAddNewStaff = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    const formData = new FormData();

    // Don't send password field
    Object.entries(newStaffFormData).forEach(([key, value]) => {
      if (key !== 'password') { // Remove password from form data
        formData.append(key, value);
      }
    });

    try {
      const response = await api.post("admin/staff", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Staff added:", response.data);
      handleAddModalClose();
      triggerRefresh();
      toast.success("Staff added successfully! An invitation email has been sent to the staff member.");
    } catch (error) {
      showValidationErrors(error);
      console.log("Validation errors:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
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
              <h3 className="fw-bold mb-0">Manage Staffs</h3>
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

      {/* Add Staff Button */}
      <div className="position-relative">
        <div
          className="d-flex justify-content-between align-items-center container"
          style={{
            position: "absolute",
            top: "-47px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
          }}
        >
          <button
            className="btn btn-primary rounded-3 ms-auto"
            onClick={() => setShowAddModal(true)}
          >
            + Add New Staff
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="d-flex justify-content-between align-items-center">
        <ManageStaffTable
          refreshKey={refreshKey}
          triggerRefresh={triggerRefresh}
        />
      </div>

      {/* Add Staff Modal */}
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
                <h5 className="modal-title">Add Staff</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleAddModalClose}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleAddNewStaff}>
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
                            <img
                              src={selectedImage}
                              alt="Uploaded"
                              className="rounded-circle"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
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
                        value={newStaffFormData.name}
                        onChange={handleNewStaffFormChange}
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
                        value={newStaffFormData.email}
                        onChange={handleNewStaffFormChange}
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
                      <label className="form-label">Job Role</label>
                      <input
                        type="text"
                        className="form-control"
                        name="role"
                        value={newStaffFormData.role}
                        onChange={handleNewStaffFormChange}
                        placeholder="Enter job role"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={newStaffFormData.department}
                        onChange={handleNewStaffFormChange}
                        placeholder="Enter department"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Position</label>
                      <input
                        type="text"
                        className="form-control"
                        name="position"
                        value={newStaffFormData.position}
                        onChange={handleNewStaffFormChange}
                        placeholder="Enter position"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="company_name"
                        value={newStaffFormData.company_name}
                        onChange={handleNewStaffFormChange}
                        placeholder="Enter company name"
                      />
                    </div>

                    {/* REMOVED TEMPORARY PASSWORD FIELD */}

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
    </div>
  );
}

export default AdminStaff;
