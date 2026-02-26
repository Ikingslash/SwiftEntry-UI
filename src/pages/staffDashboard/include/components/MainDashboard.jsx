// MainDashboard.jsx
import {
  PlusCircle,
  Users,
  CalendarCheck,
  Eye,
  BellRing,
  User,
  Clock,
} from "lucide-react";
import UserAvatar from "../../../../components/UserAvatar";

export default function MainDashboard({
  user,
  summaryData,
  notifications,
  todaysGuests,
  openAddGuestModal,
  goToRecents,
  goToGuests,
}) {
  return (
    <>
      <header
        className="text-white position-relative px-4"
        style={{
          backgroundColor: "#053561",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
          paddingTop: "40px",
          paddingBottom: "150px",
        }}
      >
        <div className="container mt-3">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <p className="mb-1 fw-bold">{user?.name || "Unnamed Visitor"}</p>
              <p
                className="badge mt-2 text-white"
                style={{ backgroundColor: "#195894", fontSize: "0.85em" }}
              >
                Sydani Group
                <span
                  className="badge text-light ms-2"
                  style={{ backgroundColor: "#0d2e4e" }}
                >
                  Company
                </span>
              </p>
            </div>
            <button
              onClick={openAddGuestModal}
              className="btn btn-primary d-flex align-items-center justify-content-center p-2 rounded-circle"
              style={{ width: "48px", height: "48px" }}
            >
              <PlusCircle size={24} className="text-white" />
            </button>
          </div>
        </div>
        <div
          className="container position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-80px" }}
        >
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 justify-content-center">
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-success-subtle">
                  <Users size={28} />
                </div>
                <div className="ms-auto  text-muted text-start">
                  <h6 className="mb-1 ">Total Visitors Today</h6>
                  <p className="mb-0 fs-4">
                    {summaryData.total_visitors_today}
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-info-subtle">
                  <CalendarCheck size={28} />
                </div>
                <div className="ms-auto text-start">
                  <h6 className="mb-1">Upcoming Visits</h6>
                  <p className="mb-0 fs-4">{summaryData.upcoming_visits}</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-info-subtle">
                  <Eye size={28} />
                </div>
                <div className="ms-auto text-start">
                  <h6 className="mb-1">Pending Visits</h6>
                  <p className="mb-0 fs-4">{summaryData.pending_guests}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container mt-5 pt-5">
        <div className="row m-5 pt-5">
          <div className="col-md-6 pe-md-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Recent Activities</h5>
              <button
                className="btn btn-link p-0 text-primary text-decoration-none"
                onClick={goToRecents}
              >
                See all
              </button>
            </div>
            <div className="row g-3">
              {notifications.length > 0 ? (
                notifications.map((item, index) => (
                  <div key={index} className="col-12">
                    <div className="card p-3 shadow-sm d-flex flex-row align-items-center rounded-3">
                      <div
                        className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(255, 204, 0, 0.1)",
                          color: "#ffcc00",
                        }}
                      >
                        <BellRing size={20} />
                      </div>
                      <div>
                        <p className="mb-1 fw-bold text-dark">{item.title}</p>
                        <small className="text-muted">
                          {item.message}
                          <span className="ms-2">({item.created_at})</span>
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent notifications.</p>
              )}
            </div>
          </div>

          <div className="col-md-6 mt-4 mt-md-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Today's Guests</h5>
              <button
                className="btn btn-link p-0 text-primary text-decoration-none"
                onClick={goToGuests}
              >
                See more
              </button>
            </div>

            <div className="row g-3">
              {todaysGuests.length === 0 ? (
                <p className="text-muted">No guests for today.</p>
              ) : (
                todaysGuests.slice(0, 3).map((guest, index) => (
                  <div
                    key={guest.id}
                    className="col-9 col-sm-8 col-md-4 d-flex justify-content-between mb-3"
                  >
                    <div className="card p-2 m-2 shadow-sm rounded-3 text-center">
                      {/* Conditional rendering for the guest image. */}
                      <UserAvatar
                        image={guest.visitor?.photo}
                        firstName={guest.visitor?.name || "Visitor"}
                        size={60}
                        className="mx-auto"
                      />
                      <p className="mt-2 mb-1 fw-bold">
                        {guest.visitor?.name || "Unknown Visitor"}
                      </p>
                      <small className="text-muted">
                        <span
                          className={`ms-2 ${index % 2 === 0
                            ? "text-success me-3"
                            : "text-danger me-3"
                            }`}
                        >
                          ●
                        </span>
                        {new Date(guest.visit_time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) || "No time"}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="row g-3">
              {todaysGuests.length > 0 ? (
                todaysGuests.map((guest) => (
                  <div key={guest.id} className="col-12">
                    <div className="card p-3 shadow-sm d-flex flex-row align-items-center rounded-3">
                      {/* Conditional rendering for the guest image in the list view. */}
                      <UserAvatar
                        image={guest.visitor?.photo || guest.visitor?.image_url}
                        firstName={guest.visitor?.name || "Visitor"}
                        size={40}
                        className="me-3"
                      />
                      <div>
                        <p className="mb-1 fw-bold">
                          {guest.visitor?.name || "Unknown Visitor"}
                        </p>
                        <small className="text-muted">
                          <Clock size={12} className="me-1" />
                          {new Date(guest.visit_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          ) || "No time"}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No guests for today.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
