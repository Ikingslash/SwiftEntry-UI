import { useEffect, useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";

function ManageFrontdeskTable({ refreshKey, triggerRefresh, onSelectionChange }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]); // For bulk delete

  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    company_name: "",
    password: "",
    photo: null,
    status: true,
  });

  useEffect(() => {
    fetchStaff();
  }, [refreshKey, page]);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {

      const response = await api.get(`admin/frontdesk?page=${page}`);

      setStaff(
        Array.isArray(response.data.frontdesk) ? response.data.frontdesk : []
      );
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching front desk staff:", err.response?.data || err.message);
      setError("Failed to load front desk staff. Please try again.");
      toast.error(
        "Failed to load front desk staff. Please try again."
      );
      setStaff([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (staffId) => {
    try {
      const response = await api.get(`admin/frontdesk/${staffId}`);
      const staffData = response.data;
      setSelectedStaff(staffData);
      setEditFormData({
        name: staffData.name,
        email: staffData.email,
        role: staffData.role,
        company_name: staffData.company_name,
        password: "",
        photo: staffData.photo,
        status: staffData.status,
      });
      setShowEditModal(true);
    } catch (err) {
      console.error(
        "Error fetching staff details for edit:",
        err.response?.data || err.message
      );
      toast.error("Failed to load staff details for editing.");
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };

      if (payload.password === "") {
        delete payload.password;
      }

      // API endpoint is correct: admin/frontdesk/{id} (PUT/PATCH)
      const response = await api.put(
        `admin/frontdesk/${selectedStaff.id}`,
        payload
      );
      console.log("Front desk staff updated:", response.data);
      setShowEditModal(false);
      triggerRefresh();
      toast.success("Front desk staff updated successfully!");
    } catch (err) {
      // CORRECTED: Improved error logging and toast message
      const errorMessage = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || err.message;
      console.error("Error updating front desk staff:", errorMessage);
      toast.error(
        `Failed to update front desk staff: ${errorMessage}`
      );
    }
  };

  const handleDeactivateActivate = async (staffId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    const confirmMessage = currentStatus
      ? "Are you sure you want to deactivate this front desk account?"
      : "Are you sure you want to activate this front desk account?";

    if (window.confirm(confirmMessage)) {
      try {
        // API endpoint is correct: admin/frontdesk/{id}/deactivate or activate
        const response = await api.post(`admin/frontdesk/${staffId}/${action}`);
        console.log(`Front desk staff ${action}d:`, response.data);
        triggerRefresh();
        toast.success(`Front desk staff ${action}d successfully!`);
      } catch (err) {
        console.error(
          `Error ${action}ing front desk staff:`,
          err.response?.data || err.message
        );
        toast.error(
          `Failed to ${action} front desk staff. Please try again.`
        );
      }
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this front desk staff? This action cannot be undone."
      )
    ) {
      try {
        // API endpoint is correct: admin/frontdesk/{id} (DELETE)
        const response = await api.delete(`admin/frontdesk/${staffId}`);
        console.log("Front desk staff deleted:", response.data);
        triggerRefresh();
        toast.success("Front desk staff deleted successfully!");
      } catch (err) {
        console.error(
          "Error deleting front desk staff:",
          err.response?.data || err.message
        );
        toast.error(
          "Failed to delete front desk staff. Please try again."
        );
      }
    }
  };

  const handleViewDetails = async (staffId) => {
    try {
      const response = await api.get(`admin/frontdesk/${staffId}`);
      setSelectedStaff(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error(
        "Error fetching front desk staff details for view:",
        err.response?.data || err.message
      );
      toast.error("Failed to load front desk staff details.");
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedStaff(null);
    // Reset image preview if it was for a modal
    // setSelectedImage(null); // This is managed by AdminStaff.jsx for add modal
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedStaff((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      }));
      setEditFormData((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      })); // Or a base64 string
    }
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

  // Bulk delete selection handlers
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

  if (loading) {
    return <p className="text-center mt-5">Loading staff data...</p>;
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
                  checked={staff.length > 0 && selectedUsers.length === staff.length}
                />
              </th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Email</th> {/* Added Email for clarity */}
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No staff found.
                </td>
              </tr>
            ) : (
              staff.map((s, idx) => (
                <tr key={s.id || idx}>
                  {" "}
                  {/* Use s.id for unique key */}
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isUserSelected(s.id)}
                      onChange={(e) => handleSelectUser(s, e.target.checked)}
                    />
                  </td>
                  <td>{s.name}</td>
                  <td>{s.role}</td>
                  <td>{s.company_name}</td>
                  <td>{s.email}</td>
                  <td>{s.status ? "Active" : "Inactive"}</td>
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
                            onClick={() => handleEdit(s.id)}
                          >
                            Edit Info
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleViewDetails(s.id)}
                          >
                            View Detail
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className={`dropdown-item ${s.status ? "text-warning" : "text-success"
                              }`}
                            onClick={() =>
                              handleDeactivateActivate(s.id, s.status)
                            }
                          >
                            {s.status ? "Deactivate" : "Activate"}
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDeleteStaff(s.id)}
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

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
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
                <h5 className="modal-title">Edit Front Desk Staff Information</h5>
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
                      <div className="">
                        <div className=" my-4">
                          <label className="form-label d-block">
                            <small>Staff Photo (Optional)</small>
                          </label>
                          <input
                            type="file"
                            className="d-none"
                            id="editFileUpload" // Unique ID
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="editFileUpload"
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
                              {selectedStaff.photo ? (
                                <img
                                  src={selectedStaff.photo}
                                  alt="Staff"
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
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          className="form-control"
                          name="company_name"
                          value={editFormData.company_name}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          New Password (leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={editFormData.password}
                          onChange={handleEditFormChange}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="staffStatus"
                          name="status"
                          checked={editFormData.status}
                          onChange={handleEditFormChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="staffStatus"
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

      {/* View Staff Details Modal */}
      {showViewModal && selectedStaff && (
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
                <h5 className="modal-title">Staff Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 container">
                  <div className="col-12 text-center mb-3">
                    <img
                      src={`${selectedStaff.profile_picture}` || "../images/user.png"}
                      alt="Staff"
                      className="rounded-circle"
                      width="100"
                      height="100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Full Name:</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedStaff.name}</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Email:</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedStaff.email}</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Job Role:</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedStaff.role}</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Department:</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedStaff.company_name}</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Status:</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>
                      {selectedStaff.status ? "Active" : "Inactive"}
                    </small>
                  </div>
                  <hr className="w-100" />
                  {/* You might add last login, created_at, etc. if available */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrops */}
      {(showEditModal || showViewModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default ManageFrontdeskTable;
