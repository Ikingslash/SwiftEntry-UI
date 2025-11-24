import { useState, useEffect } from "react";
import api from "../../../context/api";
import {toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function HostVisitsTable({ onBack }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        "security/guest/host-pending-visits", // Correct endpoint
        { params: { per_page: perPage, page } }
      );

      setVisits(response.data.visits);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching host visits:", error);
      const errorMessage = error.response?.data?.error || "Failed to load host visits. Check server logs.";
      toast.error(errorMessage);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page]);

const handleAction = async (visitId, action) => {
    const newStatus = action === 'accept' ? 'approved' : 'rejected';

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
                ? `security/guest/visit/${visitId}/approve-host`
                : `security/guest/visit/${visitId}/reject-host`;

        await api.post(endpoint);

        toast.success(`Visit ${visitId} ${newStatus} successfully.`);
        // setVisits((currentVisits) =>
        //     currentVisits.filter((visit) => visit.id !== visitId)
        // );
        // fetchVisits();

    } catch (error) {
        console.error(`Error ${action}ing visit:`, error);
        toast.error(`Failed to ${action} visit: ${error.response?.data?.error || 'Server error'}`);

        // 3. Rollback UI on failure: restore buttons
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
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page) setPage((prev) => prev + 1);
  };

  if (loading) {
    return <p>Loading Host Visits...</p>;
  }

  return (
    <div>
      <button className="btn btn-secondary mb-3" onClick={onBack}>
        &larr; Back to Guest Management
      </button>
      <h2 className="mb-4">Visits Requiring Your Approval</h2>

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
                      {/* Conditional Rendering: Check for the temporary status */}
                      {visit.temp_status === 'approved' ? (
                        <span className="badge bg-success">Approved</span>
                      ) : visit.temp_status === 'rejected' ? (
                        <span className="badge bg-danger">Rejected</span>
                      ) : (
                        // Show buttons if no action has been taken
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleAction(visit.id, 'accept')}
                            disabled={visit.is_processing}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleAction(visit.id, 'reject')}
                            disabled={visit.is_processing}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          </>
        ) : (
          <div className="alert alert-info">No visits requiring your approval.</div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default HostVisitsTable;
