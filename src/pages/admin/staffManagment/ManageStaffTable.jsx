import React, { useState } from "react";

function ManageStaffTable() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const visitorsData = [
    {
      name: "Henry Riggs",
      role: "Staff",
      dept: "Sales and Research",
      lastLogin: "3:00pm on 11/10/24",
      status: "Active", 
    },
    {
      name: "Maya Luke",
      role: "Security",
      dept: "Finance and Analysis",
      lastLogin: "3:00pm on 11/10/24",
      status: "Inactive",
    },
    {
      name: "Mary Smith",
      role: "Frontdesk",
      dept: "Marketing And Development",
      lastLogin: "3:00pm on 11/10/24",
      status: "Active",
    },
    {
      name: "Henry Riggs",
      role: "Staff",
      dept: "Customer Support",
      lastLogin: "3:00pm on 11/10/24",
      status: "Inactive", 
    },
    {
      name: "Maya Luke",
      role: "Staff",
      dept: "Product Manager",
      lastLogin: "3:00pm on 11/10/24",
      status: "Inactive",
    },
    {
      name: "Mary Smith",
      role: "Security",
      dept: "HUMAN RESOURCES", 
      lastLogin: "3:00pm on 11/10/24",
      status: "Active",
    },
  ];


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
              <th>Role</th>
              <th>Department</th>
              <th>Last Login</th>
              <th>Status</th> 
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <React.Fragment>
              {visitorsData.map((visitor, idx) => (
                <tr key={idx}>
                  <td>{visitor.name}</td>
                  <td>{visitor.role}</td>
                  <td>{visitor.dept}</td>
                  <td>{visitor.lastLogin}</td>
                  <td>{visitor.status}</td> 
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
                            View Detail
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button className="dropdown-item text-danger">
                           Deactivate
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </React.Fragment>
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
                <h5 className="modal-title">Edit Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form>
                  <div className="row"> 
                    <div className="d-flex flex-column gap-3"> 
                      <div className="">
                        <div className=" my-4">
                          <label className="form-label d-block">
                            <small>Add Photo (Optional)</small>
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
                        <div className="my-3">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Job Role</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter job role"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your dept"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Role Assignment</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter assign role"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Temporary Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter temporary password"
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button type="button" className="btn btn-primary w-50">
                        Update
                      </button>
                    </div>
                  </div>
                </form>
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
                <h5 className="modal-title">View Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInviteModal(false)}
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

      {/* Modal Backdrops */}
      {(showEditModal || showInviteModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default ManageStaffTable;
