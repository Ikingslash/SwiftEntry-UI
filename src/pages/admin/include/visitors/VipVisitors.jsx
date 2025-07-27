import React, { useState, useEffect } from "react";
import api from "../../../../context/api"; // Assuming your Axios instance
import { format } from 'date-fns'; // For date formatting

function VipVisitors({ refreshKey }) {
  const [visitors, setVisitors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
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
                                className="dropdown-item"
                                onClick={() => handleEdit(visitor)}
                              >
                                Edit Info
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleMarkVip(visitor.id)}
                              >
                                {visitor.is_vip ? "Remove from VIP" : "Make VIP Guest"}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`dropdown-item ${visitor.is_blacklisted ? "text-success" : "text-danger"}`}
                                onClick={() => handleBlacklist(visitor.id)}
                              >
                                {visitor.is_blacklisted ? "Unblacklist Guest" : "Blacklist Guest"}
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item">
                                View Detail
                              </button>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button
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
            <div className="modal-content p-3"   style={{
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
    </div>
  );
}

export default VipVisitors;
