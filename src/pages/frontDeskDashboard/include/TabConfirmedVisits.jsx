import { useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from 'react-toastify';

const Pagination = ({ pagination, handlePageChange }) => {
  const { current_page, last_page } = pagination;
  const pages = [];
  for (let i = 1; i <= last_page; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={() => handlePageChange(current_page - 1)}
          >
            Previous
          </a>
        </li>
        {pages.map(page => (
          <li key={page} className={`page-item ${current_page === page ? 'active' : ''}`}>
            <a
              className="page-link"
              href="#"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </a>
          </li>
        ))}
        <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={() => handlePageChange(current_page + 1)}
          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};

function TabConfirmedVisits({ filters, searchQuery, refreshKey, onVisitAction }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [checkInForm, setCheckInForm] = useState({ notes: "" });
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    fetchConfirmedVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchConfirmedVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
                         filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/confirmed", {
        params: {
          visitor_type: visitorType,
          search: searchQuery,
          per_page: 8,
          page: currentPage,
        },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching confirmed visits:", error);
      toast.error("Failed to fetch confirmed visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckIn = async () => {
    if (!selectedVisit) return;

    try {
      await api.post(`/front-desk/guests/visits/${selectedVisit.id}/check-in`, {
        ...checkInForm,
        actual_check_in_time: new Date().toISOString()
      });

      toast.success("Visitor checked in successfully!");
      setSelectedVisit(null);
      setCheckInForm({ notes: "" });
      fetchConfirmedVisits();
      onVisitAction();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error(error.response?.data?.message || "Failed to check in visitor");
    }
  };

  const openCheckInModal = (visit) => {
    setSelectedVisit(visit);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading confirmed visits...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No confirmed visits</h5>
          <p className="text-muted">Confirm visits from the Pending tab</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {visits.map((visit) => (
              <div key={visit.id} className="col my-3">
                <div className="card h-100 shadow border-start border-4 border-success rounded-3">
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1 fw-bold">
                          {visit.visitor_name}
                        </h6>
                        <small className="text-muted">
                          {visit.visitor_email}
                        </small>
                      </div>
                      <span className="badge bg-success">Confirmed</span>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">ID No</small>
                        <strong>{visit.visit_code}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">
                          Scheduled Time
                        </small>
                        <strong>{formatTime(visit.visit_time)}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Host</small>
                        <strong>{visit.host_name}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Contact</small>
                        <strong>{visit.visitor_contact_number}</strong>
                      </div>
                    </div>

                    <div className="alert alert-info py-2 mb-3">
                      <small>
                        <i className="bi bi-shield-check me-1"></i>
                        Security confirmed at: {visit.security_confirmed_at}
                      </small>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openCheckInModal(visit)}
                      >
                        <i className="bi bi-box-arrow-in-right me-1"></i> Check
                        In
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                pagination={pagination}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Check-in Modal */}
      {selectedVisit && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Check In Visitor</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedVisit(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Check in <strong>{selectedVisit.visitor_name}</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={checkInForm.notes}
                    onChange={(e) =>
                      setCheckInForm({ ...checkInForm, notes: e.target.value })
                    }
                    placeholder="Any special notes for this check-in..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedVisit(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCheckIn}
                >
                  Confirm Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TabConfirmedVisits;
