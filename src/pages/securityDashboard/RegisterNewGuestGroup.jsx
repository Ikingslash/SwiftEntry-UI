import api from "../../context/api";
import { useRef, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import html2pdf from "html2pdf.js";
import { toast } from 'react-toastify';
import { requestForToken, onMessageListener } from "../../context/firebase";

function RegisterNewGuestGroup() {
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
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [guestDetails, setGuestDetails] = useState({});
  const [qrValue, setQrValue] = useState("");
  const printRef = useRef();
  const [appUsers, setAppUsers] = useState([]);
  const [visitPurposes, setVisitPurposes] = useState([]);

  // useEffect to handle Firebase messaging and token registration, AND to fetch users.
  useEffect(() => {
    // Request permission and get the FCM token
    requestForToken()
      .then((fcmToken) => {
        if (fcmToken) {
          console.log("FCM token:", fcmToken);
          toast.info("FCM token:", fcmToken);

          api
            .post("/save-fcm-token", { fcm_token: fcmToken })
            .then((response) => {
              console.log("FCM token saved on backend:", response.data);
              toast.success("FCM token saved on backend:", response.data);
            })
            .catch((error) => {
              console.error("Failed to save FCM token on backend:", error);
              toast.error("Failed to save FCM token on backend:", error);
            });
        }
      })
      .catch((err) => {
        console.error("An error occurred while retrieving token. ", err);
        toast.error("Failed to retrieve FCM token:", err);
      });

    // Fetch the list of all app users (staff, security, front desk)
    api
      .get("/frontdesk-app-users")
      .then((response) => {
        // Assuming the response is an array of user names
        if (response.data && Array.isArray(response.data.users)) {
          setAppUsers(response.data.users);
        } else {
          console.error(
            "API response for users is not an array:",
            response.data
          );

          toast.error("API response for users is not an array:", response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch app users:", error);
        toast.error("Failed to fetch app users:", error);
      });
    // Fetch the list of visit purposes from the backend
    api
      .get("/security/settings/visit-purposes")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        } else {
          console.error(
            "API response for purposes is not an array:",
            response.data
          );
          toast.error(
            "API response for purposes is not an array:",
            response.data
          );
        }
      })
      .catch((error) => {
        console.error("Failed to fetch visit purposes:", error);
        toast.error("Failed to fetch visit purposes:", error);
      });

    // Set up the listener for incoming messages.
    const unsubscribe = onMessageListener((payload) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    // Cleanup function to detach the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    // Special handling for the host selection to also get the ID
    if (name === "host_id") {
      const selectedHostName = selectedOptions[0]?.text;
      const selectedHostRole = selectedOptions[0]?.dataset.role;
      setFormData({
        ...formData,
        host_id: value,
        host_name: selectedHostName, // Keep host_name for display
        host_role: selectedHostRole,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "photo" &&
        key !== "visit_time" &&
        key !== "host_id" &&
        key !== "host_role"
      ) {
        formDataToSend.append(key, value);
      }
    });

    if (formData.visit_time) {
      const visitTime = new Date(formData.visit_time);
      if (!isNaN(visitTime.getTime())) {
        // Check if date is valid
        const formattedVisitTime = visitTime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        formDataToSend.append("visit_time", formattedVisitTime);
      } else {
        toast.error("Invalid visit time format."); // Changed alert to toast
        setLoading(false);
        return;
      }
    }

    // if (formData.visit_time) {
    //   formDataToSend.append("visit_time", formData.visit_time);
    // }

    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }
    // Append host_id and host_role
    formDataToSend.append("host_id", formData.host_id);
    formDataToSend.append("host_role", formData.host_role);

    try {
      const response = await api.post(
        "/security/guest/register-group",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const visit = response.data.visit;
        const visitor = response.data.visitor;

        if (formData.host_id && formData.host_role) {
          try {
            await api.post("/genereal-notify-host", {
              host_id: formData.host_id,
              host_role: formData.host_role,
              guest_name: formData.name,
              purpose: formData.purpose,
            });
            console.log("Notification trigger sent to backend.");
            toast.success("Notification sent to host successfully.");
          } catch (notificationError) {
            console.error("Failed to trigger notification:", notificationError);
            toast.error(
              "Failed to send host notification: " +
                (notificationError.response?.data?.message || "Server error.")
            );
          }
        } else {
          console.warn("Host ID or Role missing, skipping host notification.");
        }
        const visitTimeParts = visit?.check_in?.split(" ") || [];

        const date = visitTimeParts?.[0] || "";
        const time = visitTimeParts?.[1] || "";

        setGuestDetails({
          name: visitor.name,
          id: visit.code || "",
          host: visit.host_name,
          date,
          time,
          purpose: visit.purpose,
          Contact_info: visitor.contact_number,
          address: visitor.address,
          photo: visitor.photo,
        });

        if (visit.code) {
          setQrValue(visit.code);
        }
        setFormData({
          group_leader_name: "",
          group_leader_contact: "",
          group_leader_email: "",
          organization_name: "",
          address: "",
          group_size: "",
          visit_time: "",
          host_name: "",
          host_id: "",
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          previsit_instruction: "",
          details: "",
          photo: null,
        });
        setSelectedImage(null);

        toast.success("Visitor group registered successfully!"); // Added success toast
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowVisitCardModal(true);
        }, 2500);
      } else {
        toast.error(
          "Error: " + (response.data.message || "Something went wrong")
        ); // Changed alert to toast
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        // Changed alert to toast
        "Failed to register guest. " +
          (error.response?.data?.message || "Server error.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const element = printRef.current;
    if (element) {
      const printWindow = window.open("", "", "height=600,width=800");
      printWindow.document.write("<html><head><title>Visitor Badge</title>");
      // Include Bootstrap CSS for styling in the printout
      printWindow.document.write(
        '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">'
      );
      printWindow.document.write("</head><body>");
      printWindow.document.write(
        '<div class="p-5">' + element.innerHTML + "</div>"
      );
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      toast.error("Error: Print content not found."); // Toast for print error
    }
  };

  const downloadBadgeAsPDF = () => {
    const element = printRef.current;
    if (element) {
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
          .save()
          .catch((err) => {
            console.error("Error generating PDF:", err);
            toast.error("Failed to generate PDF. Please try again."); // Toast for PDF error
          });
      }, 100);
    } else {
      toast.error("Error: Content for PDF not found."); // Toast for PDF content error
    }
  };

  return (
    <>
      <div
        className={`container mt-4 ${
          showSuccessModal || showVisitCardModal ? "blur-bg" : ""
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
                  <div className="mb-3">
                    <label className="form-label">Host Name</label>
                    <select
                      className="form-select rounded-pill"
                      name="host_id"
                      value={formData.host_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a host</option>
                      {appUsers.map((user) => (
                        // We now use a composite key for uniqueness
                        <option
                          key={user.role + "-" + user.id}
                          value={user.id}
                          data-role={user.role}
                        >
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
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
                          <option value="">Select Building</option>
                          <option value="building 1">Building 1</option>
                          <option value="building 2">Building 2</option>
                          <option value="building 3">Building 3</option>
                          <option value="building 4">Building 4</option>
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
                          <option value="">Select Floor</option>
                          <option value="1st floor">1st Floor</option>
                          <option value="2nd floor">2nd Floor</option>
                          <option value="3rd floor">3rd Floor</option>
                          <option value="4th floor">4th Floor</option>
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
                  <div className=" mt-4">
                    <label className="form-label d-block">
                      Add Photo (Optional)
                    </label>
                    <input
                      type="file"
                      className="d-none"
                      id="fileUpload"
                      accept="image/*"
                      name="photo"
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
                    name="organization_name"
                    className="form-control"
                    value={formData.organization_name}
                    placeholder="Enter emergency contact number"
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    Special Requirements (Optional)
                  </label>
                  <select
                    className="form-select"
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleChange}
                  >
                    <option value="">Select special requirements</option>
                    <option value="parking arrangements[for multiple vehicles]">
                      Parking arrangements (for multiple vehicles)
                    </option>
                    <option value="meeting room">Meeting Room</option>
                    <option value="catering needs">Catering Needs</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="my-3">
                  <label className="form-label">
                    Emergency Contact (Optional)
                  </label>
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
                  <div className="card-body d-flex">
                    <div className="me-3">
                      <img
                        src={
                          guestDetails.photo ||
                          "http://127.0.0.1:8000/storage/images/user2.png"
                        }
                        alt="Guest"
                        className="rounded-circle shadow"
                        width="100"
                        height="100"
                        style={{ border: "4px solid #007bff" }}
                      />
                    </div>
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
                      href={`https://wa.me/?text=Visit%20Details%3A%20${qrValue}`}
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

export default RegisterNewGuestGroup;
