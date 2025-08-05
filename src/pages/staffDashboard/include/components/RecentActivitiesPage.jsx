import { ArrowLeft, BellRing } from 'lucide-react';

export default function RecentActivitiesPage({ recents, loading, goBack }) {
  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link me-3" onClick={goBack}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="fw-bold mb-0">Recent Activities</h3>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : recents.length > 0 ? (
        <div className="row g-3">
          {recents.map((item) => (
            <div key={item.id} className="col-12">
              <div className="card p-3 shadow-sm d-flex flex-row align-items-center rounded-3">
                <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center"
                     style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00' }}>
                  <BellRing size={20} />
                </div>
                <div>
                  {/* FIX: Use optional chaining to prevent error if visitor is null */}
                  <p className="mb-1 fw-bold text-dark">{item.visitor?.name || 'Unknown Visitor'} - {item.purpose}</p>
                  <small className="text-muted">
                    {new Date(item.check_in).toLocaleDateString("en-US", { weekday: "long" })}
                    {" | "}
                    {new Date(item.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No recent activities found.</p>
      )}
    </div>
  );
}
