import { useEffect, useState } from "react";
import api from "../../../context/api"; // Adjust path as needed

function TabIncoming({ filters, searchQuery }) { // Accept filters and searchQuery as props
  const [incomingVisits, setIncomingVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedVisitForModal, setSelectedVisitForModal] = useState(null);

  useEffect(() => {
    fetchIncomingVisits();
  }, [filters, searchQuery]); // Re-fetch when filters or search query change

  const fetchIncomingVisits = async () => {
    setLoading(true);
    try {
      // Determine visitor_type based on filters
      let visitorTypeParam = 'all';
      if (filters.group && !filters.individual) {
        visitorTypeParam = 'group';
      } else if (filters.individual && !filters.group) {
        visitorTypeParam = 'individual';
      }

    
      let statusFilterParam = 'scheduled_visit'; // Default for incoming
      if (filters.pending) {
        statusFilterParam = 'pre_registered_visit';
      }

      const response = await api.get('/front-desk/guests/incoming', {
        params: {
          visitor_type: visitorTypeParam,
          status_filter: statusFilterParam,
          search: searchQuery,
          per_page: 10,
          page: 1,
        },
      });
      setIncomingVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching incoming visits:", error);
      setIncomingVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintTagClick = (visit) => {
    setSelectedVisitForModal(visit);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {loading ? (
        <p className="text-center">Loading incoming visits...</p>
      ) : incomingVisits.length === 0 ? (
        <p className="text-center">No incoming visits found.</p>
      ) : (
        <div className="row mb-5">
          {incomingVisits.map((visit) => (
            <div key={visit.id} className="col-12 col-md-6 mb-4">
              <div className="card shadow p-3 rounded-4">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={visit.visitor_photo ? `YOUR_LARAVEL_APP_STORAGE_URL/${visit.visitor_photo}` : './images/user.png'}
                    alt="User"
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <p className="mb-0">{visit.visitor_name}</p>
                    <small className="text-muted">{visit.visitor_email}</small>
                  </div>
                  {visit.is_verified && (
                    <span
                      className="ms-auto px-4 py-1 badge text-primary rounded-5"
                      style={{ backgroundColor: "#E7F3FE" }}
                    >
                      Verified{" "}
                      <span
                        className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: "18px",
                          height: "18px",
                          fontSize: "12px",
                          marginLeft: "4px",
                        }}
                      >
                        ✓
                      </span>
                    </span>
                  )}
                </div>
                <div className="container bg-light rounded p-3">
                  <div className="row mb-3">
                    <div className="col-3">
                      <small className="">ID No</small>
                      <p className="mb-0 text-muted">
                        <small>{visit.visit_code}</small>{" "}
                      </p>
                    </div>
                    <div className="col-3">
                      <small className="">Time Checked in</small>
                      <p className="mb-0 text-muted">
                        <small>{visit.check_in_time}</small>{" "}
                      </p>
                    </div>
                    <div className="col-3 ">
                      <small className="">Visit Date</small>
                      <p className="mb-0 text-muted">
                        <small>{visit.visit_date}</small>{" "}
                      </p>
                    </div>
                    <div className="col-3">
                      <small className="">Host</small>
                      <p className="mb-0 text-muted">
                        <small>{visit.host_name}</small>{" "}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex-grow-1 my-2"
                    style={{
                      height: "2px",
                      backgroundColor: "rgba(225, 228, 231, 0.8)",
                    }}
                  ></div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Contact Info</small>
                      <p className="mb-0">
                        <small>{visit.visitor_contact_number}</small>
                        <a href="#" className="text-primary ms-4">
                          <small>See more →</small>
                        </a>
                      </p>
                    </div>
                    <button
                      className="btn btn-primary rounded-3 mt-4 w-50"
                      data-bs-toggle="modal"
                      data-bs-target="#printTagModal"
                      onClick={() => handlePrintTagClick(visit)}
                    >
                      Print Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - same as previous version */}
      {selectedVisitForModal && (
        <div
          className="modal fade"
          id="printTagModal"
          tabIndex="-1"
          aria-hidden="true"
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
          >
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setSelectedVisitForModal(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 container px-5">
                  <div className="col-12">
                    <img
                      src={selectedVisitForModal.visitor_photo ? `YOUR_LARAVEL_APP_STORAGE_URL/${selectedVisitForModal.visitor_photo}` : './images/user.png'}
                      alt="User"
                      className="rounded-circle mb-3"
                      width="80"
                      height="80"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Guest Name</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.visitor_name}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Visit Date</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.visit_date}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-md-6">
                    <small className="fw-bold">Visit Time</small>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.check_in_time}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-md-6">
                    <small className="fw-bold">Host Name</small>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.host_name}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-md-6">
                    <small className="fw-bold">Contact Info</small>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.visitor_contact_number}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-md-6">
                    <small className="fw-bold">Special Request</small>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.special_requirements}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-md-6">
                    <small className="fw-bold">Visit Status</small>
                  </div>
                  <div className="col-md-6">
                    <small>{selectedVisitForModal.visit_status}</small>
                  </div>
                  <hr className="w-100" />
                  <div className="col-12 text-center">
                    <button type="button" className="btn btn-primary w-50" onClick={handlePrint}>
                      Print Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TabIncoming;
