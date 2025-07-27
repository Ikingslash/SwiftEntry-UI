import React, { useState } from "react";
import NavBar from "../include/NavBar";
import ManageStaffTable from "./ManageStaffTable"; // Corrected path
import api from "../../../context/api"; // Assuming your Axios instance

function AdminStaff() {
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger table refresh
  const [showAddModal, setShowAddModal] = useState(false); // Renamed for clarity
  const [newStaffFormData, setNewStaffFormData] = useState({
    name: "",
    email: "",
    role: "", // This might be a dropdown in your UI
    department: "",
    password: "",
    photo: null, // For storing base64 or URL if you handle file upload directly
  });
  const [selectedImage, setSelectedImage] = useState(null); // For image preview
  const [formErrors, setFormErrors] = useState({}); // State to hold validation errors

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    // Reset form data, image preview, and errors when modal closes
    setNewStaffFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      password: "",
      photo: null,
    });
    setSelectedImage(null);
    setFormErrors({}); // Clear errors
  };

  const handleNewStaffFormChange = (e) => {
    const { name, value } = e.target;
    setNewStaffFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error for the field being changed
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
      // For simplicity, we'll just store the URL.
      // In a real application, you would upload this file to a server (e.g., AWS S3, Cloudinary)
      // and get a URL/path back, which you would then set in newStaffFormData.photo
      // For now, we'll just set the photo field to a placeholder or leave it null.
      // If your backend expects a base64 string, you'd convert it here.
      // Example for base64 (if your backend supports it directly):
      // const reader = new FileReader();
      // reader.onloadend = () => {
      //   setNewStaffFormData(prevData => ({ ...prevData, photo: reader.result }));
      // };
      // reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setNewStaffFormData((prevData) => ({ ...prevData, photo: null }));
    }
  };


  const handleAddNewStaff = async (e) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors before new submission
    try {
      const payload = { ...newStaffFormData };
      
      if (!payload.photo && selectedImage) {
        // This is a placeholder. Replace with actual image upload logic.
        payload.photo = "https://placehold.co/80x80/aabbcc/ffffff?text=Staff";
      }


      const response = await api.post("admin/staff", payload);
      console.log("Staff added:", response.data);
      handleAddModalClose(); // Close modal and reset form
      triggerRefresh(); // Refresh the staff table
      alert("Staff added successfully!");
    } catch (err) {
      console.error("Error adding staff:", err.response?.data || err.message);
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        setFormErrors(err.response.data.errors); // Set validation errors
        // Construct a more user-friendly alert message from validation errors
        const errorMessages = Object.values(err.response.data.errors).flat().join("\n");
        alert("Failed to add staff:\n" + errorMessages);
      } else {
        alert("Failed to add staff: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <NavBar />
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
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bod mb-0">Manage Staffs</h3>

              {/* Plus Icon */}
            </div>

            {/* Badge & Line Row */}
            <div className="d-flex align-items-center  mt-4">
              {/* Badge */}
              <p
                className="badge text-white"
                style={{
                  backgroundColor: "rgba(25, 88, 148, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{
                    backgroundColor: "rgba(13, 46, 78, 0.8)",
                  }}
                >
                  Company
                </span>
              </p>

              {/* Extending Line */}
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

        {/* Core Values Section */}
        <div
          className="container position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-90px" }}
        >
          <div className="row g-3 justify-content-md-center">
            <div className="col-lg-4 col-md-6"></div>
            <div className="col-lg-4 col-md-6"></div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
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
            onClick={() => setShowAddModal(true)} // Changed to showAddModal
          >
            + Add New Staff
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="d-flex justify-content-between align-items-center">
        <ManageStaffTable refreshKey={refreshKey} triggerRefresh={triggerRefresh} />
      </div>

      {/* Modal for Adding a Staff */}
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
            <div className="modal-content ">
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
                  <div className="row">
                    <div className="d-flex flex-column gap-3">
                      <div className="">
                        <div className=" my-4">
                          <label className="form-label d-block">
                            <small>Add Photo (Optional)</small>
                          </label>
                          <input
                            type="file"
                            className="d-none"
                            id="fileUpload"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="fileUpload"
                            className="d-inline-block"
                          >
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
                        <div className="my-3">
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
                            <div className="text-danger small">{formErrors.name[0]}</div>
                          )}
                        </div>
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
                          {formErrors.email && (
                            <div className="text-danger small">{formErrors.email[0]}</div>
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
                          {formErrors.role && (
                            <div className="text-danger small">{formErrors.role[0]}</div>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          className="form-control"
                          name="department"
                          value={newStaffFormData.department}
                          onChange={handleNewStaffFormChange}
                          placeholder="Enter your dept"
                          required
                        />
                        {formErrors.department && (
                          <div className="text-danger small">{formErrors.department[0]}</div>
                        )}
                      </div>
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
                        {formErrors.password && (
                          <div className="text-danger small">{formErrors.password[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button type="submit" className="btn btn-primary w-50">
                        Save
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
