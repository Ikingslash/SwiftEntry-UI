// Required packages: react, react-qr-code, bootstrap (icons + modal)
import { useState } from "react";
import QRCode from "react-qr-code";


export default function RegisterNewGuestIndividual() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qrValue, setQrValue] = useState("https://example.com/visitor/101123556"); // Dummy QR value

  const guestDetails = {
    name: "FEMI BIODUN",
    id: "101256",
    host: "Adekunle Adeniyi",
    date: "08-07-2025",
    time: "4PM",
    Contact_info: "femi.biodun@gmail.com",
    purpose: "Business Discussion",
    address: "Main office no 15 Aja Off Mainland Bridge, Lagos, Nigeria",
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleRegister = () => {
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <form>
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              <div className="p-4">
                <h5 className="fw-bold">Guest Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visitors Name</label>
                  <input type="text" className="form-control" placeholder="Enter visitor's name" />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input type="number" className="form-control" placeholder="Enter contact number" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" placeholder="Enter email" />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" placeholder="Enter address" />
                </div>
              </div>
              <div className="p-4 mb-5">
                <h5 className="fw-bold">Visit Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visit Time</label>
                  <input type="time" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Host Name</label>
                  <input type="text" className="form-control" placeholder="Enter host name" />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="my-3">
                      <label className="form-label">Building</label>
                      <select className="form-select">
                        <option>Select Building</option>
                        <option>Building A</option>
                        <option>Building B</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="my-3">
                      <label className="form-label">Floor</label>
                      <select className="form-select">
                        <option>Select Floor</option>
                        <option>1st Floor</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="my-3">
                  <label className="form-label">Purpose of Visit</label>
                  <select className="form-select">
                    <option>Select Purpose</option>
                    <option>Business Meeting</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <div className="p-4">
              <h5 className="fw-bold">Additional Information</h5>
              <label className="form-label d-block mt-3">Add Photo (Optional)</label>
              <input type="file" className="d-none" id="fileUpload" accept="image/*" onChange={handleImageChange} />
              <label htmlFor="fileUpload" className="d-inline-block">
                <div
                  className="rounded-circle border d-flex justify-content-center align-items-center"
                  style={{ width: "100px", height: "100px", backgroundColor: "#f8f9fa", cursor: "pointer" }}
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt="Uploaded" className="rounded-circle" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <i className="bi bi-camera" style={{ fontSize: "24px" }}></i>
                  )}
                </div>
              </label>
              <div className="mt-3">
                <label className="form-label">Special Requirements (Optional)</label>
                <select className="form-select">
                  <option>Enter special requirements</option>
                </select>
              </div>
              <div className="mt-3">
                <label className="form-label">Emergency Contact (Optional)</label>
                <input type="text" className="form-control" placeholder="Enter emergency contact number" />
              </div>
              <button type="button" className="btn btn-primary mt-4 w-50" onClick={handleRegister}>
                Register Guest
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block " tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Share Visit Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="card mx-auto" style={{ maxWidth: "600px", height: "400px", border: "2px solid #cfd9e1" , backgroundColor: "#F5FAFE"}}>
                  <div className="card-header d-flex justify-content-between align-items-center" style={{ background: "#007bff", color: "white" }}>
                    <span className="badge bg-light text-dark">Syndani Group</span>
                    <strong className="text-white">VISIT CONFIRMATION</strong>
                  </div>
                  <div className="card-body d-flex">
                    <div className="me-3">
                      <img
                        src="../images/user1.png"
                        alt="Guest"
                        className="rounded-circle shadow"
                        width="100"
                        height="100"
                        style={{ border: "4px solid #007bff" }}
                      />
                    </div>
                    <div className="flex-grow-1 ms-2">
                      <h5 className="fw-bold my-3">{guestDetails.name}</h5>
                      <p className="my-2 lead">ID No: <small className="ms-4">{guestDetails.id}</small></p>
                      <p className="my-2 lead">Host:  <small className="ms-4">{guestDetails.host}</small> </p>
                      <p className="my-2 lead">Visit Date: <small className="ms-4">{guestDetails.date} by {guestDetails.time}</small></p>
                      <p className="my-2 lead">Purpose: <small className="ms-4">{guestDetails.purpose}</small> </p>
                      <p className="my-2 lead">Contact Info: <small className="ms-2">{guestDetails.Contact_info}</small> </p>
                     
                    </div>
                    <div>
                      <QRCode value={qrValue} size={130} />
                    </div>
                  </div>
                  <div className="card-footer">
                     <p className="mb-1">
                        <i className="bi bi-geo-alt"></i> {guestDetails.address}
                      </p>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="mt-4 text-center">
                  <p className="fw-bold">Share Via</p>
                  <div className="d-flex justify-content-center gap-4">
                    <a href={`https://wa.me/?text=Visit%20Details%3A%20${qrValue}`} target="_blank" rel="noreferrer">
                      <i className="bi bi-whatsapp fs-3 text-success"></i>
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://example.com" target="_blank" rel="noreferrer">
                      <i className="bi bi-linkedin fs-3 text-primary"></i>
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=Visit%20Confirmation%20Details" target="_blank" rel="noreferrer">
                      <i className="bi bi-twitter-x fs-3"></i>
                    </a>
                    <a href="https://facebook.com/sharer/sharer.php?u=https://example.com" target="_blank" rel="noreferrer">
                      <i className="bi bi-facebook fs-3 text-primary"></i>
                    </a>
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


