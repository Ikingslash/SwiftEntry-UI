import React, { useState, useEffect } from "react";
import api from "../../../../context/api"; // Assuming your Axios instance
import { format } from 'date-fns'; // For date formatting

function VipVisitors({ refreshKey }) {
  const [visitors, setVisitors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchVipVisitors();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  const fetchVipVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/visitors/vip");
      setVisitors(response.data);
    } catch (err) {
      console.error("Error fetching VIP visitors:", err.response?.data || err.message);
      setError("Failed to load VIP visitors. Please try again.");
      setVisitors({});
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visitor) => {
    setSelectedVisitor(visitor);
    setEditFormData({
      name: visitor.name,
      contact_number: visitor.contact_number,
      email: visitor.email,
      address: visitor.address,
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
      const response = await api.put(`/admin/visitors/${selectedVisitor.id}`, editFormData);
      console.log("Visitor updated:", response.data);
      setShowEditModal(false);
      fetchVipVisitors(); // Re-fetch data to show updated list
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
        console.log("VIP status toggled:", response.data);
        fetchVipVisitors(); // Re-fetch data
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
        console.log("Blacklist status toggled:", response.data);
        fetchVipVisitors(); // Re-fetch data
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
        console.log("Visitor deleted:", response.data);
        fetchVipVisitors(); // Re-fetch data
        alert(response.data.message);
      } catch (err) {
        console.error("Error deleting visitor:", err.response?.data || err.message);
        alert("Failed to delete visitor: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const sortedDates = Object.keys(visitors).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) {
    return <p className="text-center mt-5">Loading VIP visitors...</p>;
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
              <th>Name</th>
              <th>Contact Information</th>
              <th>Email Address</th>
              <th>Address</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">No VIP visitors found.</td>
              </tr>
            ) : (
              sortedDates.map((date, index) => (
                <React.Fragment key={index}>
                  <tr className="table">
                    <td
                      colSpan="5"
                      className="py-3 fw-bold"
                      style={{
                        backgroundColor: "#F5FAFE",
                      }}
                    >
                      {format(new Date(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "Today" : format(new Date(date), 'yyyy-MM-dd')}
                    </td>
                  </tr>
                  {visitors[date].map((visitor, idx) => (
                    <tr key={idx}>
                      <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.name}</td>
                      <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.contact_number}</td>
                      <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.email}</td>
                      <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.address}</td>
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
                          <ul className="dropdown-menu bg-light rounded-4" style={{ fontSize: "13px", width: "250px" }} >
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => handleEdit(visitor)}
                              >
                                Edit Info
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => handleMarkVip(visitor.id)}
                              >
                                {visitor.is_vip ? "Remove from VIP" : "Make VIP Guest"}
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                className={`dropdown-item ${visitor.is_blacklisted ? "text-success" : "text-danger"}`}
                                onClick={() => handleBlacklist(visitor.id)}
                              >
                                {visitor.is_blacklisted ? "Unblacklist Guest" : "Blacklist Guest"}
                              </button>
                            </li>
                            <li>
                              <button type="button" className="dropdown-item" onClick={() => handleViewDetails(visitor)}>
                                View Details
                              </button>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button
                                type="button"
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(visitor.id)}
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Visitor Modal */}
      {showEditModal && selectedVisitor && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content p-3" style={{
              backgroundColor: "#F5FAFE",
            }}>
              <div className="modal-header" >
                <h5 className="modal-title">Edit Visitor Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  <div className="my-3">
                    <label className="form-label">Visitor Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Contact Information</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contact_number"
                      value={editFormData.contact_number}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="mt-5 text-center">
                    <button type="submit" className="btn btn-primary w-50">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap Modal Backdrop */}
      {showEditModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowEditModal(false)}
        ></div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedVisitor && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-dialog modal-lg py-4"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "420px",
              maxWidth: "100%",
              height: "100vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content h-100" style={{ backgroundColor: "#F5FAFE" }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Visitor Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold fs-3"
                    style={{ width: 80, height: 80 }}
                  >
                    {selectedVisitor.name?.charAt(0)?.toUpperCase() || "V"}
                  </div>
                  <h5 className="mt-3 mb-0 fw-bold">{selectedVisitor.name}</h5>
                  <div className="mt-2">
                    {selectedVisitor.is_vip && <span className="badge bg-warning text-dark me-2">VIP</span>}
                    {selectedVisitor.is_blacklisted && <span className="badge bg-danger">Blacklisted</span>}
                    {!selectedVisitor.is_vip && !selectedVisitor.is_blacklisted && <span className="badge bg-success">Regular</span>}
                  </div>
                </div>
                <div className="list-group list-group-flush">
                  <div className="list-group-item bg-transparent px-0">
                    <small className="text-muted d-block">Email Address</small>
                    <span className="fw-semibold">{selectedVisitor.email || "N/A"}</span>
                  </div>
                  <div className="list-group-item bg-transparent px-0">
                    <small className="text-muted d-block">Contact Number</small>
                    <span className="fw-semibold">{selectedVisitor.contact_number || "N/A"}</span>
                  </div>
                  <div className="list-group-item bg-transparent px-0">
                    <small className="text-muted d-block">Address</small>
                    <span className="fw-semibold">{selectedVisitor.address || "N/A"}</span>
                  </div>
                  {selectedVisitor.emergency_contact && (
                    <div className="list-group-item bg-transparent px-0">
                      <small className="text-muted d-block">Emergency Contact</small>
                      <span className="fw-semibold">{selectedVisitor.emergency_contact}</span>
                    </div>
                  )}
                  {selectedVisitor.special_requirements && (
                    <div className="list-group-item bg-transparent px-0">
                      <small className="text-muted d-block">Special Requirements</small>
                      <span className="fw-semibold">{selectedVisitor.special_requirements}</span>
                    </div>
                  )}
                  <div className="list-group-item bg-transparent px-0">
                    <small className="text-muted d-block">Registered On</small>
                    <span className="fw-semibold">
                      {selectedVisitor.created_at ? new Date(selectedVisitor.created_at).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary w-100" onClick={() => setShowDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VipVisitors;
