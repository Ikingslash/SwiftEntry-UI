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

function TabOutgoing({ filters, searchQuery, refreshKey }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOutgoingVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchOutgoingVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
                         filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/outgoing", {
        params: {
          visitor_type: visitorType,
          search: searchQuery,
          per_page: 8,
          page: currentPage,
          days_old: 10, // Show visits from last 10 days only
        },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching outgoing visits:", error);
      toast.error("Failed to fetch outgoing visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Showing visits checked out within the last 10 days. Older visits are
        archived.
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading outgoing visits...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-door-closed fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No outgoing visits</h5>
          <p className="text-muted">Check out visitors from Incoming tab</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {visits.map((visit) => (
              <div key={visit.id} className="col my-4">
                <div className="card h-100 shadow rounded-3 border-start border-4 border-secondary">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="card-title mb-1 fw-bold">
                          {visit.visitor_name}
                        </h6>
                        <small className="text-muted">
                          {visit.visitor_email}
                        </small>
                      </div>
                      <span className="badge bg-secondary">Checked Out</span>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">ID No</small>
                        <strong>{visit.visit_code}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Duration</small>
                        <strong>
                          {calculateDuration(visit.check_in, visit.check_out)}
                        </strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Check-in</small>
                        <small>{formatDateTime(visit.check_in)}</small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Check-out</small>
                        <small>{formatDateTime(visit.check_out)}</small>
                      </div>
                      <div className="col-6 my-3">
                        <small className="text-muted d-block">Host</small>
                        <strong>{visit.host_name}</strong>
                      </div>

                      <div className="col-6 my-3">
                        <small className="text-muted d-block">Purpose</small>
                        <p className="mb-0">{visit.purpose}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        Visit date:{" "}
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-person-check me-1"></i>
                        Host: {visit.host_name}
                      </small>
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
    </div>
  );
}

export default TabOutgoing;
