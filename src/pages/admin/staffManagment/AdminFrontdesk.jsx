import { useState } from "react";
import api from "../../../context/api";
import NavBar from "../include/NavBar";
import ManageFrontdeskTable from "./ManageFrontdeskTable";
import { toast } from "react-toastify";

function AdminFrontdesk() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaffFormData, setNewStaffFormData] = useState({
    name: "",
    email: "",
    role: "",
    company_name: "",
    password: "",
    photo: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewStaffFormData({
      name: "",
      email: "",
      role: "",
      company_name: "",
      password: "",
      photo: null,
    });
    setSelectedImage(null);
    setPhotoFile(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewStaffFormData((prev) => ({
        ...prev,
        photo: file,
      }));
      setSelectedImage(URL.createObjectURL(file));
      setPhotoFile(file);
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
    formData.append("company_name", newStaffFormData.company_name);
    formData.append("password", newStaffFormData.password);

    // ✅ Corrected file append condition
    if (newStaffFormData.photo instanceof File) {
      formData.append("photo", newStaffFormData.photo);
    }

    try {
      const response = await api.post("admin/frontdesk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("frontdesk added:", response.data);
      handleAddModalClose();
      triggerRefresh();
      toast.success("Front desk staff added successfully!");
    } catch (err) {
      console.error("Error adding frontdesk:", err.response?.data || err.message);

      if (err.response && err.response.status === 422 && err.response.data.errors) {
        setFormErrors(err.response.data.errors);

        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .map((msg) => `- ${msg}`)
          .join("\n");

        toast.error(
          `Failed to add front desk staff:\n${errorMessages}`,
          { autoClose: 5000, style: { whiteSpace: "pre-line" } }
        );
      } else {
        toast.error("Failed to add front desk staff. Please check server logs.");
      }
    } finally {
      setIsSubmitting(false);
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
        <div className="container">
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bod mb-0">Manage Frontdesk</h3>
            </div>

            <div className="d-flex align-items-center mt-4">
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
            + Add New Front Desk Staff
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <ManageFrontdeskTable
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
                      <div className=" mt-4">
                        <label className="form-label d-block">
                          Add Photo (Optional)
                        </label>
                        <input
                          type="file"
                          className="d-none"
                          id="fileUpload"
                          accept="image/*"
                          name="photo"
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
                          <div className="text-danger small">
                            {formErrors.name[0]}
                          </div>
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
                        {formErrors.role && (
                          <div className="text-danger small">
                            {formErrors.role[0]}
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="company_name"
                          value={newStaffFormData.company_name}
                          onChange={handleNewStaffFormChange}
                          placeholder="Enter your dept"
                          required
                        />
                        {formErrors.company_name && (
                          <div className="text-danger small">
                            {formErrors.company_name[0]}
                          </div>
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
                          <div className="text-danger small">
                            {formErrors.password[0]}
                          </div>
                        )}
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

export default AdminFrontdesk;
