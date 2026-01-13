import React, { useState, useEffect } from "react";
import UserAvatar from "../../../../components/UserAvatar";
import api from "../../../../context/api"; // Assuming your Axios instance
import { format, parseISO } from 'date-fns'; // For date formatting and parsing

function ScheduledVisit({ refreshKey, triggerRefresh }) {
  const [visits, setVisits] = useState({}); // Stores grouped visits
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({}); // Added pagination state
  const [page, setPage] = useState(1); // Added page state

  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null); // Full visit object
  const [selectedVisitor, setSelectedVisitor] = useState(null); // Visitor details for invite modal

  const [editFormData, setEditFormData] = useState({
    visitor_name: "",
    visitor_email: "",
    visitor_contact_number: "",
    visitor_address: "",
    host_name: "",
    check_in: "", // YYYY-MM-DDTHH:MM format for datetime-local
    purpose: "",
    building: "",
    floor: "",
    group_size: "",
    visit_time: "",
    visit_details: "",
    visitor_type: "",
    special_requirements: "", // From visitor model
  });

  const [inviteFormData, setInviteFormData] = useState({
    check_in: "", // YYYY-MM-DDTHH:MM format
    host_name: "",
    purpose: "",
    building: "",
    floor: "",
    group_size: "",
    visit_time: "",
    visit_details: "",
    visitor_type: "",
    status: "scheduled_visit", // Default for new invite
  });

  const [selectedImage, setSelectedImage] = useState(null); // For invite modal photo

  // Fetch data on component mount and when refreshKey changes, or when page changes
  useEffect(() => {
    fetchScheduledVisits();
  }, [refreshKey, page]); // Added 'page' to the dependency array

  const fetchScheduledVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      // Include the 'page' parameter in the API call
      const response = await api.get(`/admin/visits/scheduled?page=${page}`);
      setVisits(response.data.visits);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching scheduled visits:", err.response?.data || err.message);
      setError("Failed to load scheduled visits. Please try again.");
      setVisits({});
      setPagination({}); // Reset pagination on error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (visitId) => {
    try {
      const response = await api.get(`/admin/visits/${visitId}`);
      const visitData = response.data;
      setSelectedVisit(visitData);
      setEditFormData({
        visitor_name: visitData.visitor_name,
        visitor_email: visitData.visitor_email,
        visitor_contact_number: visitData.visitor_contact_number,
        visitor_address: visitData.visitor_address,
        host_name: visitData.host_name,
        check_in: visitData.check_in ? format(parseISO(visitData.check_in), "yyyy-MM-dd'T'HH:mm") : "",
        purpose: visitData.purpose,
        building: visitData.building,
        floor: visitData.floor,
        group_size: visitData.group_size,
        visit_time: visitData.visit_time_enum, // Use the enum value
        visit_details: visitData.visit_details,
        visitor_type: visitData.visitor_type,
        special_requirements: visitData.special_requirements,
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching visit details for edit:", err.response?.data || err.message);
      alert("Failed to load visit details for editing.");
    }
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
      const payload = {
        ...editFormData,
        // Ensure check_in is in YYYY-MM-DD HH:MM:SS format for Laravel
        check_in: editFormData.check_in ? format(parseISO(editFormData.check_in), "yyyy-MM-dd HH:mm:ss") : null,
      };
      const response = await api.put(`/admin/visits/${selectedVisit.id}`, payload);
      console.log("Visit updated:", response.data);
      setShowEditModal(false);
      triggerRefresh(); // Refresh parent to update all tables
      alert("Visit updated successfully!");
    } catch (err) {
      console.error("Error updating visit:", err.response?.data || err.message);
      alert("Failed to update visit: " + (err.response?.data?.message || err.message));
    }
  };

  const handleInviteAgain = async (visitId) => {
    try {
      const response = await api.get(`/admin/visits/${visitId}`);
      const originalVisitData = response.data;
      setSelectedVisitor(originalVisitData.visitor); // Store original visitor details
      setInviteFormData({
        check_in: "", // Reset date for new invite
        host_name: originalVisitData.host_name,
        purpose: originalVisitData.purpose,
        building: originalVisitData.building,
        floor: originalVisitData.floor,
        group_size: originalVisitData.group_size,
        visit_time: originalVisitData.visit_time_enum,
        visit_details: originalVisitData.visit_details,
        visitor_type: originalVisitData.visitor_type,
        status: "scheduled_visit", // Always scheduled for a new invite
      });
      setSelectedImage(originalVisitData.visitor_photo); // Set original photo if available
      setShowInviteModal(true);
    } catch (err) {
      console.error("Error fetching original visit for re-invite:", err.response?.data || err.message);
      alert("Failed to prepare re-invitation.");
    }
  };

  const handleInviteFormChange = (e) => {
    const { name, value } = e.target;
    setInviteFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        visitor_id: selectedVisitor.id, // Use original visitor's ID
        ...inviteFormData,
        check_in: inviteFormData.check_in ? format(parseISO(inviteFormData.check_in), "yyyy-MM-dd HH:mm:ss") : null,
      };
      const response = await api.post(`/admin/visits/${selectedVisit.id}/invite-again`, payload); // Use invite-again endpoint
      console.log("New visit scheduled:", response.data);
      setShowInviteModal(false);
      setInviteFormData({ // Reset form
        check_in: "", host_name: "", purpose: "", building: "", floor: "", group_size: "", visit_time: "", visit_details: "", visitor_type: "", status: "scheduled_visit",
      });
      setSelectedImage(null);
      triggerRefresh(); // Refresh parent to update all tables
      alert("New visit scheduled successfully!");
    } catch (err) {
      console.error("Error scheduling new visit:", err.response?.data || err.message);
      alert("Failed to schedule new visit: " + (err.response?.data?.message || err.message));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      // In a real app, you'd handle file upload here and get a URL to set in state
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to delete this visit? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/admin/visits/${visitId}`);
        console.log("Visit deleted:", response.data);
        triggerRefresh(); // Refresh parent to update all tables
        alert(response.data.message);
      } catch (err) {
        console.error("Error deleting visit:", err.response?.data || err.message);
        alert("Failed to delete visit: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCheckIn = async (visitId) => {
    if (window.confirm("Are you sure you want to check in this visitor?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/check-in`);
        console.log("Visit checked in:", response.data);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error checking in visit:", err.response?.data || err.message);
        alert("Failed to check in visit: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCheckOut = async (visitId) => {
    if (window.confirm("Are you sure you want to check out this visitor?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/check-out`);
        console.log("Visit checked out:", response.data);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error checking out visit:", err.response?.data || err.message);
        alert("Failed to check out visit: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancelVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to cancel this visit?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/cancel`);
        console.log("Visit cancelled:", response.data);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error cancelling visit:", err.response?.data || err.message);
        alert("Failed to cancel visit: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleMarkMissed = async (visitId) => {
    if (window.confirm("Are you sure you want to mark this visit as missed?")) {
      try {
        const response = await api.post(`/admin/visits/${visitId}/mark-missed`);
        console.log("Visit marked as missed:", response.data);
        triggerRefresh();
        alert(response.data.message);
      } catch (err) {
        console.error("Error marking visit as missed:", err.response?.data || err.message);
        alert("Failed to mark visit as missed: " + (err.response?.data?.message || err.message));
      }
    }
  };


  const closeModal = () => {
    setShowEditModal(false);
    setShowInviteModal(false);
    setSelectedVisit(null);
    setSelectedVisitor(null);
    setSelectedImage(null);
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

  const sortedDates = Object.keys(visits).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) {
    return <p className="text-center mt-5">Loading scheduled visits...</p>;
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
              <th>Host Name</th>
              <th>Visit Date/Time</th>
              <th>Visit Type</th>
              <th>Checked In</th>
              <th>Checked Out</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">No scheduled visits found.</td>
              </tr>
            ) : (
              sortedDates.map((date, index) => (
                <React.Fragment key={index}>
                  <tr className="table">
                    <td
                      colSpan="7"
                      className="py-3 fw-bold"
                      style={{ backgroundColor: "#F5FAFE" }}
                    >
                      {format(new Date(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "Today" : format(new Date(date), 'yyyy-MM-dd')}
                    </td>
                  </tr>
                  {visits[date].map((visit, idx) => (
                    <tr key={idx}>
                      <td>{visit.visitor_name}</td>
                      <td>{visit.host_name}</td>
                      <td>{visit.visit_date_formatted}, {visit.check_in_time_formatted}</td>
                      <td>{visit.visitor_type}</td>
                      <td>{visit.check_in_time_formatted}</td>
                      <td>{visit.check_out_time_formatted}</td>
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
                          <ul className="dropdown-menu bg-light rounded-4" style={{ fontSize: "13px", width: "250px" }}>
                            <li>
                              <button className="dropdown-item" onClick={() => handleEdit(visit.id)}>
                                Edit Info
                              </button>
                            </li>
                            {visit.status === 'scheduled_visit' || visit.status === 'pre_registered_visit' || visit.status === 'Walk_In' ? (
                              <>
                                <li>
                                  <button className="dropdown-item" onClick={() => handleCheckIn(visit.id)}>
                                    Check In
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item" onClick={() => handleCancelVisit(visit.id)}>
                                    Cancel Visit
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item" onClick={() => handleMarkMissed(visit.id)}>
                                    Mark as Missed
                                  </button>
                                </li>
                              </>
                            ) : null}
                            {visit.status === 'completed_visit' && visit.check_in && !visit.check_out ? (
                              <li>
                                <button className="dropdown-item" onClick={() => handleCheckOut(visit.id)}>
                                  Check Out
                                </button>
                              </li>
                            ) : null}
                            <li>
                              <button className="dropdown-item" onClick={() => handleInviteAgain(visit.id)}>
                                Invite Again
                              </button>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => handleDeleteVisit(visit.id)}>
                                Delete Visit
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

      {/* Edit Visit Modal */}
      {showEditModal && selectedVisit && (
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
                <h5 className="modal-title">Edit Visit Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  <div className="row g-3 container">
                    <div className="col-12 text-center">
                      <UserAvatar
                        image={selectedVisit.visitor_photo}
                        firstName={selectedVisit.visitor_name || "Visitor"}
                        size={80}
                        className="mb-3"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Schedule Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="check_in"
                        value={editFormData.check_in}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Visit Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="scheduled_visit">Scheduled</option>
                        <option value="completed_visit">Completed</option>
                        <option value="cancelled_visit">Cancelled</option>
                        <option value="missed_visit">Missed</option>
                        <option value="pre_registered_visit">Pre-Registered</option>
                        <option value="Walk_In">Walk-In</option>
                      </select>
                    </div>

                    <hr className="w-100 my-3" />

                    <div className="col-md-6">
                      <label className="fw-bold">Guest Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="visitor_name"
                        value={editFormData.visitor_name}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Host Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="host_name"
                        value={editFormData.host_name}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="fw-bold">Visitor Type</label>
                      <select
                        className="form-select"
                        name="visitor_type"
                        value={editFormData.visitor_type}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="individual">Individual</option>
                        <option value="group">Group</option>
                        <option value="walk-in">Walk-In</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Purpose</label>
                      <select
                        className="form-select"
                        name="purpose"
                        value={editFormData.purpose}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="recruitment">Recruitment</option>
                        <option value="business meeting">Business Meeting</option>
                        <option value="repairs/maintenance">Repairs/Maintenance</option>
                        <option value="interview">Interview</option>
                        <option value="personal/official">Personal Visit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="fw-bold">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="visitor_contact_number"
                        value={editFormData.visitor_contact_number}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        name="visitor_email"
                        value={editFormData.visitor_email}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="fw-bold">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="visitor_address"
                        value={editFormData.visitor_address}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="fw-bold">Building</label>
                      <select
                        className="form-select"
                        name="building"
                        value={editFormData.building}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="building 1">Building 1</option>
                        <option value="building 2">Building 2</option>
                        <option value="building 3">Building 3</option>
                        <option value="building 4">Building 4</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Floor</label>
                      <select
                        className="form-select"
                        name="floor"
                        value={editFormData.floor}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="1st floor">1st Floor</option>
                        <option value="2nd floor">2nd Floor</option>
                        <option value="3rd floor">3rd Floor</option>
                        <option value="4th floor">4th Floor</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="fw-bold">Group Size</label>
                      <select
                        className="form-select"
                        name="group_size"
                        value={editFormData.group_size}
                        onChange={handleEditFormChange}
                      >
                        <option value="">Select Group Size (Optional)</option>
                        <option value="2 to 10">2 to 10</option>
                        <option value="10 to 20">10 to 20</option>
                        <option value="20 to 30">20 to 30</option>
                        <option value="30 above">30 above</option>
                        <option value="single">Single</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold">Visit Duration</label>
                      <select
                        className="form-select"
                        name="visit_time"
                        value={editFormData.visit_time}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="30mins">30mins</option>
                        <option value="1 to 2hrs">1 to 2hrs</option>
                        <option value="3 to 4hrs">3 to 4hrs</option>
                        <option value="4 to 5hrs">4 to 5hrs</option>
                        <option value="5 to 6hrs">5 to 6hrs</option>
                        <option value="above 6hrs">Above 6hrs</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="fw-bold">Special Requirements</label>
                      <textarea
                        className="form-control"
                        name="special_requirements"
                        value={editFormData.special_requirements}
                        onChange={handleEditFormChange}
                        rows="2"
                      ></textarea>
                    </div>

                    <div className="col-md-12">
                      <label className="fw-bold">Visit Details (Optional)</label>
                      <textarea
                        className="form-control"
                        name="visit_details"
                        value={editFormData.visit_details}
                        onChange={handleEditFormChange}
                        rows="2"
                      ></textarea>
                    </div>

                    <div className="col-12 mt-4 text-center">
                      <button type="submit" className="btn btn-primary w-50">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Again Modal (Register New Guest) */}
      {showInviteModal && selectedVisitor && (
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
                <h5 className="modal-title">Register New Guest (Re-invite)</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleInviteSubmit}>
                  <div className="d-flex flex-column gap-3">
                    {/* Guest Information (Display from selectedVisitor) */}
                    <div className="">
                      <h6 className="fw-bold mb-3">Original Visitor Details</h6>
                      <div className="text-center">
                        <UserAvatar
                          image={selectedImage}
                          firstName={selectedVisitor.name || "Visitor"}
                          size={80}
                          className="mb-3"
                        />
                      </div>
                      <p><strong>Name:</strong> {selectedVisitor.name}</p>
                      <p><strong>Email:</strong> {selectedVisitor.email}</p>
                      <p><strong>Contact:</strong> {selectedVisitor.contact_number}</p>
                      <p><strong>Address:</strong> {selectedVisitor.address}</p>
                      <p><strong>Type:</strong> {selectedVisitor.visitor_type}</p>
                      <p><strong>Special Req:</strong> {selectedVisitor.special_requirements || 'None'}</p>
                    </div>

                    {/* Visit Information (for new invite) */}
                    <div className="my-3">
                      <h5 className="fw-bold mb-4">New Visit Information</h5>
                      <div className="my-4">
                        <label className="form-label">New Visit Date & Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="check_in"
                          value={inviteFormData.check_in}
                          onChange={handleInviteFormChange}
                          required
                        />
                      </div>
                      <div className="my-3">
                        <label className="form-label">Host Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="host_name"
                          value={inviteFormData.host_name}
                          onChange={handleInviteFormChange}
                          placeholder="Enter host name"
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="my-4">
                            <label className="form-label">Building</label>
                            <select
                              className="form-select"
                              name="building"
                              value={inviteFormData.building}
                              onChange={handleInviteFormChange}
                              required
                            >
                              <option value="">Select Building</option>
                              <option value="building 1">Building 1</option>
                              <option value="building 2">Building 2</option>
                              <option value="building 3">Building 3</option>
                              <option value="building 4">Building 4</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="my-4">
                            <label className="form-label">Floor</label>
                            <select
                              className="form-select"
                              name="floor"
                              value={inviteFormData.floor}
                              onChange={handleInviteFormChange}
                              required
                            >
                              <option value="">Select Floor</option>
                              <option value="1st floor">1st Floor</option>
                              <option value="2nd floor">2nd Floor</option>
                              <option value="3rd floor">3rd Floor</option>
                              <option value="4th floor">4th Floor</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="my-4">
                            <label className="form-label">Purpose</label>
                            <select
                              className="form-select"
                              name="purpose"
                              value={inviteFormData.purpose}
                              onChange={handleInviteFormChange}
                              required
                            >
                              <option value="">Select Purpose</option>
                              <option value="recruitment">Recruitment</option>
                              <option value="business meeting">Business Meeting</option>
                              <option value="repairs/maintenance">Repairs/Maintenance</option>
                              <option value="interview">Interview</option>
                              <option value="personal/official">Personal Visit</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="my-4">
                            <label className="form-label">Group Size</label>
                            <select
                              className="form-select"
                              name="group_size"
                              value={inviteFormData.group_size}
                              onChange={handleInviteFormChange}
                            >
                              <option value="">Select Group Size (Optional)</option>
                              <option value="2 to 10">2 to 10</option>
                              <option value="10 to 20">10 to 20</option>
                              <option value="20 to 30">20 to 30</option>
                              <option value="30 above">30 above</option>
                              <option value="single">Single</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="my-3">
                        <label className="form-label">Visit Duration</label>
                        <select
                          className="form-select"
                          name="visit_time"
                          value={inviteFormData.visit_time}
                          onChange={handleInviteFormChange}
                          required
                        >
                          <option value="">Select Duration</option>
                          <option value="30mins">30mins</option>
                          <option value="1 to 2hrs">1 to 2hrs</option>
                          <option value="3 to 4hrs">3 to 4hrs</option>
                          <option value="4 to 5hrs">4 to 5hrs</option>
                          <option value="5 to 6hrs">5 to 6hrs</option>
                          <option value="above 6hrs">Above 6hrs</option>
                        </select>
                      </div>
                      <div className="my-3">
                        <label className="form-label">Visit Details (Optional)</label>
                        <textarea
                          className="form-control"
                          name="visit_details"
                          value={inviteFormData.visit_details}
                          onChange={handleInviteFormChange}
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center">
                      <button type="submit" className="btn btn-primary w-50">
                        Schedule New Visit
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

export default ScheduledVisit;
