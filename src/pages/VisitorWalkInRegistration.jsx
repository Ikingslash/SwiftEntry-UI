import { useRef, useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";
import VisitorLayout from "../../../layout/VisitorLayout";
import "react-toastify/dist/ReactToastify.css";

// Helper function to format date to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
};

// Helper function to create enhanced QR code value with visit details
const createEnhancedQRValue = (visitCode, visitorName, hostName, visitDate, purpose) => {
  return JSON.stringify({
    visit_code: visitCode,
    name: visitorName,
    host: hostName,
    date: visitDate,
    purpose: purpose,
  });
};

export default function VisitorWalkInRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
    address: "",
    visit_time: "",
    host_name: "",
    building: "building 1",
    floor: "1st floor",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [visitCode, setVisitCode] = useState("");
  const [visitPurposes, setVisitPurposes] = useState([]);

  useEffect(() => {
    // Fetch visit purposes
    api
      .get("/self-service/visits/purposes")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showValidationErrors = (error) => {
    if (error.response && error.response.status === 422) {
      let validationErrors = error.response.data.errors || error.response.data;

      if (typeof validationErrors === "string") {
        toast.error(validationErrors);
        return;
      }

      Object.values(validationErrors).forEach((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(msg));
        } else if (typeof messages === "string") {
          toast.error(messages);
        }
      });
    } else {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "visit_time") {
        formDataToSend.append(key, value);
      }
    });

    // Format visit time
    if (formData.visit_time) {
      const visitTime = new Date(formData.visit_time);
      if (!isNaN(visitTime.getTime())) {
        const utcTime = new Date(
          visitTime.getTime() - visitTime.getTimezoneOffset() * 60000
        );
        const formattedVisitTime = utcTime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        formDataToSend.append("visit_time", formattedVisitTime);
      } else {
        toast.error("Invalid visit time format.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await api.post(
        "/self-service/visits/walk-in-register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setVisitCode(response.data.visit_code);
        setShowSuccessModal(true);
        setFormData({
          name: "",
          contact_number: "",
          email: "",
          address: "",
          visit_time: "",
          host_name: "",
          building: "building 1",
          floor: "1st floor",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          details: "",
        });
        toast.success("Visit registered successfully!");
      }
    } catch (error) {
      showValidationErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VisitorLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-12">
            <h2 className="fw-bold" style={{ color: "#053561" }}>
              Register Your Visit
            </h2>
            <p className="text-muted">
              Fill in your details to register your visit as a walk-in visitor
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <h5 className="fw-bold mb-3" style={{ color: "#053561" }}>
                    Personal Information
                  </h5>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Contact Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="Enter your contact number"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={handleChange}
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Address *</label>
                    <textarea
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      rows="2"
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Special Requirements
                    </label>
                    <select
                      className="form-select"
                      name="special_requirements"
                      value={formData.special_requirements}
                      onChange={handleChange}
                    >
                      <option value="">Select special requirements</option>
                      <option value="wheelchair/accessibility">
                        Wheelchair/Accessibility
                      </option>
                      <option value="sign_language_interpreter">
                        Sign Language Interpreter
                      </option>
                      <option value="language interpretation">
                        Language Interpretation
                      </option>
                      <option value="parking space">Parking Space</option>
                      <option value="catering needs">Catering Needs</option>
                      <option value="meeting room">Meeting Room</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Visit Information */}
                  <hr className="my-4" />
                  <h5 className="fw-bold mb-3" style={{ color: "#053561" }}>
                    Visit Information
                  </h5>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Visit Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="visit_time"
                        value={formData.visit_time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Purpose *</label>
                      <select
                        className="form-select"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select purpose</option>
                        {visitPurposes.map((purpose) => (
                          <option key={purpose.id} value={purpose.purpose}>
                            {purpose.purpose}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Building *</label>
                      <select
                        className="form-select"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                        required
                      >
                        <option value="building 1">Building 1</option>
                        <option value="building 2">Building 2</option>
                        <option value="building 3">Building 3</option>
                        <option value="building 4">Building 4</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Floor *</label>
                      <select
                        className="form-select"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        required
                      >
                        <option value="1st floor">1st Floor</option>
                        <option value="2nd floor">2nd Floor</option>
                        <option value="3rd floor">3rd Floor</option>
                        <option value="4th floor">4th Floor</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Host Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="host_name"
                      value={formData.host_name}
                      onChange={handleChange}
                      placeholder="Name of the person you are visiting (optional)"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Additional Details</label>
                    <textarea
                      className="form-control"
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      placeholder="Any additional details about your visit"
                      rows="3"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-lg"
                      style={{ backgroundColor: "#053561", color: "white" }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Register Visit
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Visit Registered Successfully!</h5>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <i
                    className="bi bi-check-circle text-success"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
                <p>
                  Your visit has been registered successfully as a confirmed walk-in
                  visit.
                </p>
                <p className="mt-3">
                  <strong>Your Visit Code:</strong>
                  <br />
                  <span
                    style={{ fontSize: "1.5rem", color: "#053561" }}
                    className="fw-bold"
                  >
                    {visitCode}
                  </span>
                </p>
                <p className="text-muted mt-3 small">
                  Please save this code. You can use it to search for your visit and
                  check in/out.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VisitorLayout>
  );
}
