import { useRef, useState, useEffect } from "react";
import api from "../../../context/api";
import { requestForToken, onMessageListener } from "../../../context/firebase";
import QRCode from "react-qr-code";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

// Helper function to format date to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

function NewGuestGroup() {
  const [formData, setFormData] = useState({
    group_leader_name: "",
    group_leader_contact: "",
    group_leader_email: "",
    organization_name: "",
    address: "",
    group_size: "",
    visit_time: "",
    host_name: "",
    building: "",
    floor: "",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    previsit_instruction: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [guestDetails, setGuestDetails] = useState({});
  const [qrValue, setQrValue] = useState("");
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [specialRequirements, setSpecialRequirements] = useState([]);
  const printRef = useRef();

  // Get current logged-in user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    // Request permission and get the FCM token
    requestForToken()
      .then((fcmToken) => {
        if (fcmToken) {
          api.post("/save-fcm-token", { fcm_token: fcmToken }).catch(() => { });
        }
      })
      .catch(() => { });

    // Fetch visit purposes
    api
      .get("/admin/settings/visit-purposes")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch(() => { });

    // Fetch buildings, floors, special requirements
    api.get("/admin/settings/buildings").then((r) => { if (Array.isArray(r.data)) setBuildings(r.data); }).catch(() => { });
    api.get("/admin/settings/floors").then((r) => { if (Array.isArray(r.data)) setFloors(r.data); }).catch(() => { });
    api.get("/admin/settings/special-requirements").then((r) => { if (Array.isArray(r.data)) setSpecialRequirements(r.data); }).catch(() => { });

    // Set up the listener for incoming messages
    const unsubscribe = onMessageListener((payload) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    return () => unsubscribe();
  }, []);

  // Set the current logged-in user as the host
  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser && currentUser.id && currentUser.name) {
      setFormData((prev) => ({
        ...prev,
        host_id: currentUser.id,
        host_role: (currentUser.role || "admin").toLowerCase().replace(/\s+/g, '_'),
        host_name: currentUser.name,
      }));
    } else {
      console.error("No valid user found in localStorage");
      toast.error("Unable to set host. Please log in again.");
    }
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
        "Something went wrong. Please try again."
      );
    }
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate host data before submission
    if (!formData.host_id || !formData.host_role || !formData.host_name) {
      toast.error("Host information is missing. Please refresh the page.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "visit_time" &&
        key !== "host_id" &&
        key !== "host_role" &&
        key !== "host_name"
      ) {
        formDataToSend.append(key, value);
      }
    });

    // Format visit_time - datetime-local already provides local time
    if (formData.visit_time) {
      // datetime-local gives us "YYYY-MM-DDTHH:MM" format
      // Just replace T with space and add seconds for the API format
      const formattedVisitTime = formData.visit_time.replace("T", " ") + ":00";
      formDataToSend.append("visit_time", formattedVisitTime);
      console.log("Formatted visit time:", formattedVisitTime);
    }

    // host fields
    formDataToSend.append("host_id", formData.host_id);
    formDataToSend.append("host_role", formData.host_role);
    formDataToSend.append("host_name", formData.host_name);

    try {
      const response = await api.post(
        "/admin/register-group-guest",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const visit = response.data.visit;
        const visitor = response.data.visitor;

        // Send notification
        if (formData.host_id && formData.host_role) {
          try {
            await api.post("/admin/notify-admin-host", {
              host_id: formData.host_id,
              host_role: formData.host_role,
              guest_name: formData.group_leader_name,
              purpose: formData.purpose,
            });
          } catch (notificationError) {
            // Notification failure should not block the main flow
            console.error("Failed to notify host:", notificationError);
          }
        }

        let date = "";
        let time = "";

        if (visit?.visit_time) {
          try {
            const visitDateObj = new Date(visit.visit_time);
            date = formatDateToDDMMYYYY(visit.visit_time);
            time = visitDateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (e) {
            console.error("Error parsing visit time for badge:", e);
            const visitTimeParts = visit.visit_time.split(" ");
            date = visitTimeParts[0] || "";
            time = visitTimeParts[1] ? visitTimeParts[1].slice(0, 8) : "";
          }
        }

        setGuestDetails({
          name: visitor.name,
          id: visit.code || "",
          host: visit.host_name,
          date,
          time,
          purpose: visit.purpose,
          Contact_info: visitor.contact_number,
          address: visitor.address,
        });

        if (visit.code) {
          const qrData = JSON.stringify({
            code: visit.code,
            id: visit.code, // Fallback
            visit_id: visit.id,
            name: visitor.name,
            host: visit.host_name,
            date: date,
            time: time,
            purpose: visit.purpose,
            type: 'group',
            group_size: visit.group_size
          });
          setQrValue(qrData);
        }

        setFormData({
          group_leader_name: "",
          group_leader_contact: "",
          group_leader_email: "",
          organization_name: "",
          address: "",
          group_size: "",
          visit_time: "",
          host_name: formData.host_name,
          host_id: formData.host_id,
          host_role: formData.host_role,
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          previsit_instruction: "",
          details: "",
        });
        setSelectedImage(null);

        toast.success("Group visitor registered!");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowVisitCardModal(true);
        }, 2500);
      } else {
        toast.error("Unexpected error occurred");
      }
    } catch (error) {
      showValidationErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const element = printRef.current;

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Visitor Badge</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">'
    );
    printWindow.document.write("</head><body >");
    printWindow.document.write('<div class="p-5">');
    printWindow.document.write(element.outerHTML);
    printWindow.document.write("</div>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const downloadBadgeAsPDF = () => {
    const element = printRef.current;
    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0.3,
          filename: "Visitor_Badge.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    }, 100);
  };

  return (
    <>
      <div
        className={`container mt-4 ${showSuccessModal || showVisitCardModal ? "blur-bg" : ""
          }`}
      >
        <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                      name="group_leader_name"
                      className="form-control"
                      placeholder="Enter Name"
                      value={formData.group_leader_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Contact Number</label>
                        <input
                          type="text"
                          name="group_leader_contact"
                          className="form-control"
                          placeholder="Enter contact number"
                          value={formData.group_leader_contact}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="group_leader_email"
                          className="form-control"
                          placeholder="Enter email"
                          value={formData.group_leader_email}
                          onChange={handleChange}
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
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Group Size</label>
                    <select
                      className="form-select"
                      name="group_size"
                      value={formData.group_size}
                      onChange={handleChange}
                    >
                      <option>Select Group Size</option>
                      <option value="5">2 - 10</option>
                      <option value="10">10 - 20</option>
                      <option value="20">20 - 30</option>
                      <option value="30">30 Above</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 mb-5">
                  <h5 className="fw-bold">Visit Information</h5>
                  <div className="mb-3">
                    <label className="form-label">Visit Time</label>
                    <input
                      type="datetime-local"
                      name="visit_time"
                      className="form-control"
                      value={formData.visit_time}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Hidden inputs for host data */}
                  <input type="hidden" name="host_id" value={formData.host_id} />
                  <input type="hidden" name="host_role" value={formData.host_role} />

                  {/* Display only - show the host name to user */}
                  <div className="mb-3">
                    <label className="form-label">Host Name</label>
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      name="host_name"
                      value={formData.host_name}
                      readOnly
                      placeholder="Host will be automatically assigned"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="my-3">
                        <label className="form-label">Building</label>
                        <select
                          className="form-select"
                          name="building"
                          value={formData.building}
                          onChange={handleChange}
                        >
                          <option value="">None</option>
                          {buildings.map((b, i) => (
                            <option key={i} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="my-3">
                        <label className="form-label">Floor</label>
                        <select
                          className="form-select"
                          name="floor"
                          value={formData.floor}
                          onChange={handleChange}
                        >
                          <option value="">None</option>
                          {floors.map((f, i) => (
                            <option key={i} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Purpose of Visit</label>
                    <select
                      className="form-select"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                    >
                      <option value="">Select Purpose</option>
                      {visitPurposes.map((purpose, index) => (
                        <option key={purpose} value={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="my-3">
                    <label className="form-label">Details (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter visit details"
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
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
                </div>
                <div className="my-3">
                  <label className="form-label">Name of Organization</label>
                  <input
                    type="text"
                    name="organization_name"
                    className="form-control"
                    value={formData.organization_name}
                    placeholder="Enter organization name"
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Special Requirements</label>
                  <select
                    className="form-select"
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {specialRequirements.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="my-3">
                  <label className="form-label">Emergency Contact</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter emergency contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                  />
                </div>
                <div className="my-3">
                  <label className="form-label">Previsit Instruction</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter any previsit instruction"
                    name="previsit_instruction"
                    value={formData.previsit_instruction}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-3 w-50 "
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <div
        className={`modal fade ${showSuccessModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-success text-white text-center">
            <div className="modal-body">
              <h5 className="modal-title">Visitor Registered Successfully!</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Card Modal */}
      {showVisitCardModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Share Visit Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowVisitCardModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div
                  ref={printRef}
                  className="card mx-auto"
                  style={{
                    maxWidth: "650px",
                    height: "380px",
                    border: "2px solid #cfd9e1",
                    backgroundColor: "#F5FAFE",
                  }}
                >
                  <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{ background: "#007bff", color: "white" }}
                  >
                    <span className="badge bg-light text-dark">
                      Sydani Group
                    </span>
                    <strong className="text-white">VISITORS BADGE</strong>
                  </div>
                  <div className="card-body d-flex mx-4 justify-content-between">

                    <div className="flex-grow-1 ms-2">
                      <h5 className="fw-bold my-3">{guestDetails.name}</h5>
                      <p className="my-2 lead">
                        ID No: <small className="ms-4">{guestDetails.id}</small>
                      </p>
                      <p className="my-2 lead">
                        Host:{" "}
                        <small className="ms-4">{guestDetails.host}</small>
                      </p>
                      <p className="my-2 lead">
                        Visit Date:{" "}
                        <small className="ms-4">
                          {guestDetails.date} by {guestDetails.time}
                        </small>
                      </p>
                      <p className="my-2 lead">
                        Purpose:{" "}
                        <small className="ms-4">{guestDetails.purpose}</small>
                      </p>
                      <p className="my-2 lead">
                        Contact Info:{" "}
                        <small className="ms-2">
                          {guestDetails.Contact_info}
                        </small>
                      </p>
                    </div>
                    <div>
                      {typeof qrValue === "string" && qrValue.length > 0 ? (
                        <QRCode value={qrValue} size={130} />
                      ) : (
                        <div className="text-muted">QR not ready</div>
                      )}
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
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`🎫 Visitor Badge – Sydani Group\n\nName: ${guestDetails.name}\nGuest Code: ${guestDetails.id}\nHost: ${guestDetails.host}\nVisit Date: ${guestDetails.date} at ${guestDetails.time}\nPurpose: ${guestDetails.purpose}\nContact: ${guestDetails.Contact_info}`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="bi bi-whatsapp fs-3 text-success"></i>
                    </a>
                    <a
                      href="https://www.linkedin.com/sharing/share-offsite/?url=https://example.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="bi bi-linkedin fs-3 text-primary"></i>
                    </a>
                    <a
                      href="https://twitter.com/intent/tweet?text=Visit%20Confirmation%20Details"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="bi bi-twitter-x fs-3"></i>
                    </a>
                    <a
                      href="https://facebook.com/sharer/sharer.php?u=https://example.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="bi bi-facebook fs-3 text-primary"></i>
                    </a>
                    <button
                      className="btn btn-outline-dark"
                      onClick={handlePrint}
                    >
                      🖨️ Print
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={downloadBadgeAsPDF}
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
            @media print {
              body * { visibility: hidden; }
              #badgeCard, #badgeCard * { visibility: visible; }
              #badgeCard { position: absolute; top: 0; left: 0; width: 100%; }
            }
          `}</style>
    </>
  );
}

export default NewGuestGroup;
