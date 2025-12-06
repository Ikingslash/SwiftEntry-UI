import { ArrowLeft, User, Clock } from 'lucide-react';

export default function TodaysGuestsPage({ todaysGuests, loading, goBack }) {
  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link me-3" onClick={goBack}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="fw-bold mb-0">Today's Guests</h3>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : todaysGuests.length > 0 ? (
        <div className="row g-3">
          {todaysGuests.map((guest) => (
            <div key={guest.id} className="col-12">
              <div className="card p-3 shadow-sm d-flex flex-row align-items-center rounded-3">
                <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e9f5ff' }}>
                  <User size={24} color="#0d6efd" />
                </div>
                <div>
                  {/* FIX: Use optional chaining to prevent error if visitor is null */}
                  <p className="mb-1 fw-bold">{guest.visitor?.name || 'Unknown Visitor'}</p>
                  <small className="text-muted">
                    <Clock size={12} className="me-1" />
                    {new Date(guest.visit_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) || "No time"}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No guests for today.</p>
      )}
    </div>
  );
}
