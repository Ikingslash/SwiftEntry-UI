import ManageStaffTable from "./ManageStaffTable";
import { useState } from "react";
import NavBar from "../include/NavBar";

function AdminStaff() {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const closeModal = () => {
    setShowModal(false);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <NavBar />
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "270px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bod mb-0">Manage Staffs</h3>

              {/* Plus Icon */}
            </div>

            {/* Badge & Line Row */}
            <div className="d-flex align-items-center  mt-4">
              {/* Badge */}
              <p
                className="badge text-white"
                style={{
                  backgroundColor: "rgba(25, 88, 148, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{
                    backgroundColor: "rgba(13, 46, 78, 0.8)",
                  }}
                >
                  Company
                </span>
              </p>

              {/* Extending Line */}
              <div
                className="flex-grow-1 ms-3 mb-3"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(168, 172, 176, 0.8)",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div
          className="container position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-90px" }}
        >
          <div className="row g-3 justify-content-md-center">
            <div className="col-lg-4 col-md-6"></div>
            <div className="col-lg-4 col-md-6"></div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="position-relative">
        <div
          className="d-flex justify-content-between align-items-center container"
          style={{
            position: "absolute",
            top: "-47px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
          }}
        >
          <button
            className="btn btn-primary rounded-3 ms-auto"
            onClick={() => setShowModal(true)}
          >
            + Add New Visitor
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="d-flex justify-content-between align-items-center">
        <ManageStaffTable />
      </div>

      {/* Modal for Adding a Visitor */}
      {showModal && (
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
            <div className="modal-content ">
              <div className="modal-header">
                <h5 className="modal-title">Add Staff</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
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
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaff;
