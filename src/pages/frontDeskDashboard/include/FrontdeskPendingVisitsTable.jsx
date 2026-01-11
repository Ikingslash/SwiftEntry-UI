import { useState, useEffect, useCallback } from "react";
import api from "../../../context/api";
import { toast } from 'react-toastify';

function FrontdeskPendingVisitsTable({ visitType, onVisitUpdate }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const perPage = 10;

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        "front-desk/guests/frontdesk-pending-visits",
        { params: { per_page: perPage, page } }
      );

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
      setPendingCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching pending visits:", error);
      const errorMessage = error.response?.data?.error || "Failed to load pending visits.";
      toast.error(errorMessage);
      setVisits([]);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleAction = async (visitId, action) => {
    const newStatus = action === 'accept' ? 'approved' : 'rejected';

    // Optimistic UI update
    setVisits((currentVisits) =>
      currentVisits.map((visit) =>
        visit.id === visitId
          ? {
            ...visit,
            temp_status: newStatus,
            is_processing: true,
          }
          : visit
      )
    );

    try {
      const endpoint =
        action === "accept"
          ? `front-desk/guests/visit/${visitId}/approve-frontdesk-host`
          : `front-desk/guests/visit/${visitId}/reject-frontdesk-host`;

      await api.post(endpoint);

      toast.success(`Visit ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully. Notification sent to visitor.`);

      // Remove the visit from the list after successful action
      setVisits((currentVisits) =>
        currentVisits.filter((visit) => visit.id !== visitId)
      );

      // Update pending count
      setPendingCount((prev) => Math.max(0, prev - 1));

      // Call the parent callback to refresh counts
      if (onVisitUpdate) {
        onVisitUpdate();
      }

    } catch (error) {
      console.error(`Error ${action}ing visit:`, error);
      toast.error(`Failed to ${action} visit: ${error.response?.data?.error || 'Server error'}`);

      // Rollback UI on failure
      setVisits((currentVisits) =>
        currentVisits.map((visit) =>
          visit.id === visitId
            ? { ...visit, temp_status: undefined, is_processing: false }
            : visit
        )
      );
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

  if (loading) {
    return <p>Loading pending visits...</p>;
  }

  return (
    <div>
      <div className="table-responsive my-5">
        {visits.length > 0 ? (
          <>
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Visitor Name</th>
                  <th>Purpose</th>
                  <th>Scheduled Time</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.id}</td>
                    <td>{visit.visitor?.name || "N/A"}</td>
                    <td>{visit.purpose}</td>
                    <td>
                      {new Date(visit.visit_time).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>{visit.visitor?.contact_number || "N/A"}</td>
                    <td>
                      {visit.temp_status === 'approved' ? (
                        <span className="badge bg-success">Approved</span>
                      ) : visit.temp_status === 'rejected' ? (
                        <span className="badge bg-danger">Rejected</span>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleAction(visit.id, 'accept')}
                            disabled={visit.is_processing}
                            title="Approve this visit"
                          >
                            {visit.is_processing ? "Processing..." : "Accept"}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleAction(visit.id, 'reject')}
                            disabled={visit.is_processing}
                            title="Reject this visit"
                          >
                            {visit.is_processing ? "Processing..." : "Reject"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.last_page > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handlePrevious}
                  disabled={pagination.current_page === 1}
                >
                  ← Previous
                </button>
                <span className="small">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleNext}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-info">No visits requiring your approval.</div>
        )}
      </div>
    </div>
  );
}

export default FrontdeskPendingVisitsTable;
