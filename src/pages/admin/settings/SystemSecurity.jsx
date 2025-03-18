import React, { useState } from "react";

function Notification() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const visitorsData = [
    {
      name: "Henry Riggs",
      hostName: "Henry Riggs",
      visitDateTime: "12/10/24, 3:00pm",
      visitType: "Individual",
      checkedIn: "10:00am",
      checkedOut: "12:00pm",
    },
    {
      name: "Maya Luke",
      hostName: "Maya Luke",
      visitDateTime: "12/10/24, 3:00pm",
      visitType: "Sales Department",
      checkedIn: "2:00pm",
      checkedOut: "-----",
    },
    {
      name: "Mary Smith",
      hostName: "Mary Smith",
      visitDateTime: "12/10/24, 3:00pm",
      visitType: "Group",
      checkedIn: "Expecting",
      checkedOut: "-----",
    },
    {
      name: "Henry Riggs",
      hostName: "Henry Riggs",
      visitDateTime: "13/10/24, 3:00pm",
      visitType: "Individual",
      checkedIn: "10:00am",
      checkedOut: "12:00pm",
    },
    {
      name: "Maya Luke",
      hostName: "Maya Luke",
      visitDateTime: "13/10/24, 3:00pm",
      visitType: "Sales Department",
      checkedIn: "2:00pm",
      checkedOut: "-----",
    },
    {
      name: "Mary Smith",
      hostName: "Mary Smith",
      visitDateTime: "11/10/24, 3:00pm",
      visitType: "Group",
      checkedIn: "Expecting",
      checkedOut: "-----",
    },
  ];
  const groupedVisitors = visitorsData.reduce((acc, visitor) => {
    const visitDate = visitor.visitDateTime.split(",")[0];
    acc[visitDate] = acc[visitDate] || [];
    acc[visitDate].push(visitor);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedVisitors).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const handleEdit = (visitor) => {
    setSelectedVisitor(visitor);
    setShowEditModal(true);
  };

  const handleInviteAgain = () => {
    setShowInviteModal(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowInviteModal(false);
  };

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
            {sortedDates.map((date, index) => (
              <React.Fragment key={index}>
                <tr className="table">
                  <td
                    colSpan="7"
                    className="py-3"
                    style={{ backgroundColor: "#F5FAFE" }}
                  >
                    {date === "12/10/24" ? "Today" : date}
                  </td>
                </tr>
                {groupedVisitors[date].map((visitor, idx) => (
                  <tr key={idx}>
                    <td>{visitor.name}</td>
                    <td>{visitor.hostName}</td>
                    <td>{visitor.visitDateTime}</td>
                    <td>{visitor.visitType}</td>
                    <td>{visitor.checkedIn}</td>
                    <td>{visitor.checkedOut}</td>
                    <td className="text-center">
                      <div className="dropdown">
                        <button
                          className="btn btn-white border-primary"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul
                          className="dropdown-menu bg-light rounded-4"
                          style={{ fontSize: "13px", width: "250px" }}
                        >
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleEdit(visitor)}
                            >
                              Edit Info
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={handleInviteAgain}
                            >
                              Invite Again
                            </button>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button className="dropdown-item text-danger">
                              Delete Visit
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Visitor Modal */}
      {showEditModal && selectedVisitor && (
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
                <h5 className="modal-title">Edit Visitor Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3 container">
                  <div className="col-12">
                    <img
                      src="../images/user.png"
                      alt="User"
                      className="rounded-circle mb-3"
                      width="80"
                      height="80"
                    />
                  </div>
                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Schedule Date</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>12/12/2024</small>
                  </div>

                  <hr className="w-100" />

                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Guest Name</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>Femi Biodun</small>
                  </div>
                  <div className="col-md-6">
                    <p className="fw-bold">
                      <small>Visit Date</small>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small>12-02-25</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <small className="fw-bold">Visit Time</small>
                  </div>
                  <div className="col-md-6">
                    <small>2:00pm</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <small className="fw-bold">Host Name</small>
                  </div>
                  <div className="col-md-6">
                    <small>Ajayi Adebayo</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <small className="fw-bold">Contact Info</small>
                  </div>
                  <div className="col-md-6">
                    <small>femiempires@gmail.com</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <small className="fw-bold">Special Request</small>
                  </div>
                  <div className="col-md-6">
                    <small>Parking Space</small>
                  </div>
                  <hr className="w-100" />

                  <div className="col-md-6">
                    <small className="fw-bold">Visit Status</small>
                  </div>
                  <div className="col-md-6">
                    <small>Scheduled</small>
                  </div>
                  {/* <hr className="w-100" />

                   <div className="mt-4 text-center">
                    <button type="button" className="btn btn-primary w-50">
                      Save Changes
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Again Modal */}
      {showInviteModal && (
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
                <h5 className="modal-title">Register New Guest</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    {/* Left Column */}

                    <div className="d-flex flex-column gap-3">
                      {/* Guest Information */}
                      <div className="">
                        <div className="my-3">
                          <label className="form-label">Visitors Type</label>
                          <select className="form-select w-50">
                            <option>Select Visitors Type</option>
                            <option>Individual</option>
                            <option>Group</option>
                          </select>
                        </div>
                        <h6 className="fw-bold  my-5">Visitors Details</h6>
                        <div className=" my-4">
                          <label className="form-label d-block">
                            Add Photo (Optional)
                          </label>
                          <input
                            type="file"
                            className="d-none"
                            id="fileUpload"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="fileUpload"
                            className="d-inline-block"
                          >
                            <div
                              className="rounded-circle border d-flex justify-content-center align-items-center"
                              style={{
                                width: "100px",
                                height: "100px",
                                backgroundColor: "#f8f9fa",
                                cursor: "pointer",
                              }}
                            >
                              {selectedImage ? (
                                <img
                                  src={selectedImage}
                                  alt="Uploaded"
                                  className="rounded-circle"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <i
                                  className="bi bi-camera"
                                  style={{ fontSize: "24px" }}
                                ></i>
                              )}
                            </div>
                          </label>
                        </div>
                        <div className="mt-3">
                          <label className="form-label">Visitors Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter visitor's name"
                          />
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="my-5">
                              <label className="form-label">
                                Contact Number
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter contact number"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="my-5">
                              <label className="form-label">Email</label>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter address"
                          />
                        </div>
                      </div>

                      {/* Visit Information */}
                      <div className="my-3">
                        <h5 className="fw-bold mb-4">Visit Information</h5>
                        <div className="my-4">
                          <label className="form-label">Visit Time</label>
                          <input type="time" className="form-control" />
                        </div>
                        <div className="my-3">
                          <label className="form-label">Host Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter host name"
                          />
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="my-4">
                              <label className="form-label">Building</label>
                              <select className="form-select">
                                <option>Select Building</option>
                                <option>Building A</option>
                                <option>Building B</option>
                                <option>Building C</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="my-4">
                              <label className="form-label">Floor</label>
                              <select className="form-select">
                                <option>Select Floor</option>
                                <option>1st Floor</option>
                                <option>2nd Floor</option>
                                <option>3rd Floor</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="my-4">
                          <label className="form-label">Purpose of Visit</label>
                          <select className="form-select">
                            <option>Select Purpose</option>
                            <option>Recruitment</option>
                            <option>Business Meeting</option>
                            <option>Repair/Maintenance</option>
                            <option>Interview</option>
                            <option>Personal Visit</option>
                          </select>
                        </div>
                        <div className="my-4">
                          <label className="form-label">
                            Details (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Enter visit details"
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {/* Additional Information */}
                      <div className="">
                        <h5 className="fw-bold">Additional Information</h5>
                      </div>
                      <div className="my-3">
                        <label className="form-label">
                          Name of Organization
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Organization name"
                        />
                      </div>
                      <div className="my-3">
                        <label className="form-label">
                          Special Requirements (Optional)
                        </label>
                        <select className="form-select">
                          <option>Enter special requirements</option>
                          <option>Business Meeting</option>
                          <option>Interview</option>
                          <option>Personal Visit</option>
                        </select>
                      </div>
                      <div className="my-3">
                        <label className="form-label">
                          Emergency Contact (Optional)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter emergency contact number"
                        />
                      </div>

                      <div className="my-3">
                        <label className="form-label">
                          Emergency Contact (Optional)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter emergency contact number"
                        />
                      </div>
                      <div className="my-3">
                        <label className="form-label">
                          Previsit Instruction
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter emergency contact number"
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button type="button" className="btn btn-primary w-50">
                        Register Guest
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrops */}
      {(showEditModal || showInviteModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default Notification;
