import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";

function PreScheduledVisitTable({ onVisitUpdate, visitType }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modal and action states
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchVisits();
  }, [page, visitType]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      // FIX: Dynamic and corrected endpoint for pre-scheduled visits
      const endpoint = `/security/guest/${visitType}/scheduled-visits`;
      const response = await api.get(endpoint, {
        params: { per_page: perPage, page },
      });

      setVisits(response.data.visits);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      await api.post(`/security/guest/visit/${selectedVisit.id}/cancel`, {
        reason: cancelReason
      });

      toast.success("Visit cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");

      // Refresh the visits list - cancelled visits should disappear
      await fetchVisits();

      if (onVisitUpdate) {
        onVisitUpdate();
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      toast.error(error.response?.data?.error || "Failed to cancel visit");
    }
  };

  const openCancelModal = (visit) => {
    setSelectedVisit(visit);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page)
      setPage((prev) => prev + 1);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="table-responsive my-5">
        {visits.length > 0 ? (
          <>
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Unique ID</th>
                  <th>Guest Name</th>
                  <th>Host Name</th>
                  <th>Visit Date/Time</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Special Requirement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.id}</td>
                    <td>{visit.visitor?.name || "N/A"}</td>
                    <td>{visit.host_name}</td>
                    <td>
                      {visit.visit_time
                        ? new Date(visit.visit_time).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{visit.visitor?.contact_number}</td>
                    <td>{visit.visitor?.email}</td>
                    <td>{visit.visitor?.special_requirements || "None"}</td>
                    <td>
                      <span className={`badge ${
                        visit.status === 'cancelled' ? 'bg-danger' :
                        visit.status === 'completed' ? 'bg-success' :
                        visit.status === 'checked_in' ? 'bg-primary' :
                        'bg-warning text-dark'
                      }`}>
                        {visit.status ? visit.status.replace(/_/g, ' ') : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openCancelModal(visit)}
                          disabled={visit.status === 'cancelled'}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
          </>
        ) : (
          <h1>No Data Available</h1>
        )}
      </div>

      {/* CANCEL VISIT MODAL */}
      {showCancelModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h4>Cancel Visit</h4>

              <p>
                Are you sure you want to cancel the visit for{" "}
                <strong>{selectedVisit.visitor?.name}</strong>?
              </p>

              <div className="mb-3">
                <label htmlFor="cancelReason" className="form-label">
                  Reason for Cancellation
                </label>
                <textarea
                  className="form-control"
                  id="cancelReason"
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                >
                  Go Back
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelVisit}
                  disabled={!cancelReason.trim()}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreScheduledVisitTable;
