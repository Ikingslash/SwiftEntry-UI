import { useState } from "react";
import api from "../../../context/api"; // Axios instance
import NavBar from "../include/NavBar";
import ManageSecurityTable from "./ManageSecurityTable";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AdminSecurity() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading spinner and button disable

  const [newStaffFormData, setNewStaffFormData] = useState({
    name: "",
    email: "",
    role: "security",
    position: "",
    company_name: "",
    department: "",
    password: "",
    photo: null,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewStaffFormData({
      name: "",
      email: "",
      role: "security",
      position: "",
      company_name: "",
      department: "",
      password: "",
      photo: null,
    });
    setSelectedImage(null);
    setFormErrors({});
  };

  const handleNewStaffFormChange = (e) => {
    const { name, value } = e.target;
    setNewStaffFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

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
      setNewStaffFormData((prevData) => ({
        ...prevData,
        photo: file, // FIXED: store actual file for backend upload
      }));
    } else {
      setSelectedImage(null);
      setNewStaffFormData((prevData) => ({ ...prevData, photo: null }));
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
    formData.append("name", newStaffFormData.name);
    formData.append("email", newStaffFormData.email);
    formData.append("role", newStaffFormData.role);
    formData.append("position", newStaffFormData.position);
    formData.append("company_name", newStaffFormData.company_name);
    formData.append("department", newStaffFormData.department);
    formData.append("password", newStaffFormData.password);

    if (newStaffFormData.photo) {
      formData.append("photo", newStaffFormData.photo);
    }

    try {
      const response = await api.post("admin/security", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });


      console.log("security added:", response.data);

      handleAddModalClose();
      triggerRefresh();
      toast.success("Security added successfully!");
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
              <h3 className="fw-bod mb-0">Manage Security</h3>
            </div>

            <div className="d-flex align-items-center mt-4">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
              >
                Sydani Group{" "}
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
            + Add New Security Staff
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <ManageSecurityTable
          refreshKey={refreshKey}
          triggerRefresh={triggerRefresh}
        />
      </div>

      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
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
                <h5 className="modal-title">Add Security Staff</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleAddModalClose}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleAddNewStaff}>
                  <div className="row">
                    <div className="d-flex flex-column gap-3">
                      {/* Photo */}
                      <div className="my-4">
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

                      {/* Full Name */}
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
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={newStaffFormData.email}
                          onChange={handleNewStaffFormChange}
                          placeholder="Enter email"
                          required
                        />
                      </div>

                      {/* Position */}
                      <div className="mb-3">
                        <label className="form-label">Position</label>
                        <input
                          type="text"
                          className="form-control"
                          name="position"
                          value={newStaffFormData.position}
                          onChange={handleNewStaffFormChange}
                          placeholder="Enter position (e.g. Gate Officer)"
                          required
                        />
                      </div>

                      {/* Company Name */}
                      <div className="mb-3">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="company_name"
                          value={newStaffFormData.company_name}
                          onChange={handleNewStaffFormChange}
                          placeholder="Enter company name"
                          required
                        />
                      </div>

                      {/* Department */}
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

                      {/* Password */}
                      <div className="mb-3">
                        <label className="form-label">Temporary Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={newStaffFormData.password}
                          onChange={handleNewStaffFormChange}
                          placeholder="Enter temporary password"
                          required
                        />
                      </div>
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
                            Saving...
                          </>
                        ) : (
                          "Save"
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

export default AdminSecurity;
