import { useState } from "react";

function RegisterGuestGroup() {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };
  return (
    <div className="container mt-4">
      <form>
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              {/* Guest Information */}
              <div className=" p-4">
                <h5 className="fw-bold">Group Leader Information</h5>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
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
                  <label className="form-label">Group Size</label>
                  <select className="form-select">
                    <option>Select Group Size</option>
                    <option>2 - 10</option>
                    <option>10 - 20</option>
                    <option>20 - 30</option>
                    <option>30 Above</option>
                  </select>
                </div>
              </div>

              {/* Visit Information */}
              <div className=" p-4 mb-5">
                <h5 className="fw-bold">Visit Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visit Time</label>
                  <input type="time" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Host Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter host name"
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="my-3">
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
                    <div className="my-3">
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
                <div className="my-3">
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
                <div className="my-3">
                  <label className="form-label">Details (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter visit details"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              {/* Additional Information */}
              <div className="p-4">
                <h5 className="fw-bold">Additional Information</h5>
                <div className=" mt-4">
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
                  <label htmlFor="fileUpload" className="d-inline-block">
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
              </div>
              <div className="my-3">
                <label className="form-label">Name of Organization</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Organization Name"
                />
              </div>
              <div className="mb-4">
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
                <label className="form-label">Previsit Instruction</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter emergency contact number"
                />
              </div>
            </div>
            <button className="btn btn-primary mt-3 w-50 ">
              Register Guest
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterGuestGroup;
