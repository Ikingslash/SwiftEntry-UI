import { useRef, useState, useEffect, useCallback } from "react";
import api from "../context/api";
import { toast } from "react-toastify";
import VisitorLayout from "../layout/VisitorLayout";
import "react-toastify/dist/ReactToastify.css";
import { requestForToken, onMessageListener } from "../context/firebase";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

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

// Helper function to get current datetime in the format needed for the backend
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function VisitorWalkInRegistration() {
  const [formData, setFormData] = useState({
    visitor_type: "individual",
    name: "",
    contact_number: "",
    email: "",
    address: "",
    host_id: "",
    host_role: "",
    host_name: "",
    purpose: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [visitCode, setVisitCode] = useState("");
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    // Request permission and get the FCM token
    requestForToken()
      .then((fcmToken) => {
        if (fcmToken) {
          api
            .post("/self-service/save-fcm-token", { fcm_token: fcmToken }).catch(() => { });
        }
      })
      .catch(() => { });

    // Set up the listener for incoming messages
    onMessageListener((payload) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    // Fetch visit purposes
    api
      .get("/self-service/visits/purposes")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch(() => { });

    // Fetch hosts (app users)
    api
      .get("/self-service/visits/app-users")
      .then((response) => {
        if (response.data && Array.isArray(response.data.users)) {
          setAppUsers(response.data.users);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch hosts:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;

    if (name === "host_id") {
      const [role, id] = value.split("-");
      // Normalize role to snake_case for backend compatibility
      const backendRole = role.toLowerCase().replace(/\s+/g, '_');
      const selectedHostName = selectedOptions[0]?.text.trim();

      setFormData({
        ...formData,
        host_id: id,
        host_role: backendRole,
        host_name: selectedHostName,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      toast.error("reCAPTCHA not ready. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Execute reCAPTCHA with action 'walk_in_register'
      const recaptchaToken = await executeRecaptcha('walk_in_register');

      if (!recaptchaToken) {
        toast.error("reCAPTCHA verification failed. Please try again.");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Required fields from form
      formDataToSend.append("name", formData.name);
      formDataToSend.append("contact_number", formData.contact_number);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("purpose", formData.purpose);
      formDataToSend.append("visitor_type", formData.visitor_type);

      // Optional email - if not provided, backend will generate
      if (formData.email) {
        formDataToSend.append("email", formData.email);
      }

      // Host info (optional)
      if (formData.host_id) {
        formDataToSend.append("host_id", formData.host_id);
        formDataToSend.append("host_role", formData.host_role);
        formDataToSend.append("host_name", formData.host_name);
      }

      // Set defaults for fields not shown in form but required by backend
      formDataToSend.append("building", "building 1");
      formDataToSend.append("floor", "1st floor");
      formDataToSend.append("visit_time", getCurrentDateTime());

      // Append reCAPTCHA token
      formDataToSend.append("recaptcha_token", recaptchaToken);

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
          visitor_type: "individual",
          name: "",
          contact_number: "",
          email: "",
          address: "",
          host_id: "",
          host_role: "",
          host_name: "",
          purpose: "",
        });
        toast.success("Visit registered successfully!");
      }
    } catch (error) {
      showValidationErrors(error);
    } finally {
      setLoading(false);
    }
  }, [executeRecaptcha, formData]);

  return (
    <VisitorLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-12">
            <h2 className="fw-bold text-center" style={{ color: "#053561" }}>
              Register Your Visit
            </h2>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Individual or Group */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Individual or Group</label>
                    <select
                      className="form-select form-select-lg"
                      name="visitor_type"
                      value={formData.visitor_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="individual">Individual</option>
                      <option value="group">Group</option>
                    </select>
                  </div>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Phone No. */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Phone No.</label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      Email <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Address</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      required
                    />
                  </div>

                  {/* Purpose of Visit */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Purpose of Visit</label>
                    <select
                      className="form-select form-select-lg"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select purpose</option>
                      {visitPurposes.map((purpose, index) => (
                        <option key={index} value={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Who Are You Meeting With? */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Who Are You Meeting With?</label>
                    <select
                      className="form-select form-select-lg"
                      id="host_id"
                      name="host_id"
                      value={`${formData.host_role || ""}-${formData.host_id || ""}`}
                      onChange={handleChange}
                    >
                      <option value="">Select a host</option>
                      {appUsers.map((user, index) => (
                        <option
                          key={`${user.role || "unknown"}-${user.id || index}`}
                          value={`${user.role}-${user.id}`}
                        >
                          {user.name}
                        </option>
                      ))}
                    </select>
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
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Check In
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
