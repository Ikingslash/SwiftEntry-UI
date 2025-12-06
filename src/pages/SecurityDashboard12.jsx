import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import NavBar from "./securityDashboard/include/NavBar";
import api from "../context/api";
import AddGuestModal from "./securityDashboard/include/AddGuestModal";
import { PlusCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from "react-router-dom";

function SecurityDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const printRef = useRef();

  const [showAddGuest, setShowAddGuest] = useState(false);

  // State variables for the AddGuestModal
  const [name, setName] = useState("");
  const [visitorType, setVisitorType] = useState("Individual");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact_number, setContact_number] = useState("");
  const [emergency_contact, setEmergencyContact] = useState("");
  const [special_requirements, setSpecialRequirements] = useState("");
  const [photo, setPhoto] = useState("");
  const [is_vip, setIs_vip] = useState(false);
  const [is_blacklisted, setIs_blacklisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddGuestModal = () => {
    setShowAddGuest(true);
  };
  // ✅ Image handler (works perfectly with preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setSelectedImage(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setSelectedImage(null);
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

  // Function to handle adding a new guest (connected to the API)
  // ✅ Handle Add Guest
  const handleAddGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("contact_number", contact_number);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("is_vip", is_vip ? 1 : 0);
      formData.append("is_blacklisted", is_blacklisted ? 1 : 0);
      formData.append("emergency_contact", emergency_contact);
      formData.append("special_requirements", special_requirements);
      formData.append("visitor_type", visitorType);

      // ✅ Append photo if selected
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await api.post("/security/visitors", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        toast.success("New visitor registered successfully!");

        setShowAddGuest(false);

        // Reset form fields
        setName("");
        setVisitorType("Individual");
        setEmail("");
        setAddress("");
        setContact_number("");
        setEmergencyContact("");
        setSpecialRequirements("");
        setPhoto(null);
        setIs_vip(false);
        setIs_blacklisted(false);
        setSelectedImage(null);
      } else {
        toast.error(response.data.message || "Failed to register visitor.");
      }
    } catch (error) {
      showValidationErrors(error);
      console.log("Validation errors:", error.response?.data);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanResult(decodedText);
        await fetchUserProfile(decodedText);
      },
      (error) => {
        console.warn(error);
      }
    );
  }, []);

  const fetchUserProfile = async (code) => {
    try {
      const response = await api.get(`/security/visit/scan/${code}`);
      setUserProfile(response.data);

      const modal = new window.bootstrap.Modal(
        document.getElementById("printTagModal")
      );
      modal.show();
    } catch (error) {
      console.error("Scan Error:", error);
      toast.error("No visitor record found for this code.");
    }
  };

  const handlePrint = () => {
    const element = printRef.current;

    // Create a new window to print
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Visitor Badge</title>");
    // Include Bootstrap CSS for styling in the print window
    printWindow.document.write(
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">'
    );
    printWindow.document.write("</head><body >");
    printWindow.document.write('<div class="p-5">');
    printWindow.document.write(element.outerHTML);
    printWindow.document.write("</div>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Wait for the content to load and then print
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
      <header
        className="text-white text-center position-relative px-4"
        style={{
          backgroundColor: "#053561",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
          paddingTop: "20px",
          paddingBottom: "50px",
        }}
      >
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bold mb-0">Guest Confirmation</h2>
              <button
                onClick={openAddGuestModal}
                className="btn btn-primary d-flex align-items-center justify-content-center p-2 rounded-circle"
                style={{ width: "48px", height: "48px" }}
              >
                <PlusCircle
                  size={24}
                  className="text-white"
                  style={{ cursor: "pointer" }}
                />
              </button>
              {/* <i className="bi bi-plus-circle fs-1 text-primary p-2"></i> */}
            </div>
            <div className="d-flex align-items-center mt-2">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
              >
                Sydani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{ backgroundColor: "rgba(13, 46, 78, 0.8)" }}
                >
                  Company
                </span>
              </p>
              <div
                className="flex-grow-1 ms-2 mb-3"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(168, 172, 176, 0.8)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <section className="container d-flex flex-column align-items-center justify-content-center text-center p-5">
        <h2 className="mb-4">Scan QR Code</h2>
        <div
          id="reader"
          style={{
            width: "300px",
            height: "300px",
            border: "4px solid black",
            borderRadius: "10px",
            backgroundColor: "grey",
          }}
        ></div>

        <NavLink
          className="mt-4"
          to="/security-dashboard/generate-by-unique-code"
        >
          <small>Enter Code Instead</small>
        </NavLink>
      </section>

      {/* MODAL */}
      <div
        className="modal fade"
        id="printTagModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down"
          style={{
            maxWidth: "450px",
            marginLeft: "auto",
            marginRight: 0,
            height: "100vh",
          }}
        >
          <div
            className="modal-content rounded-4 shadow-lg"
            style={{ border: "none" }}
          >
            <div className="modal-header border-0 d-print-none">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {userProfile && (
              <div className="modal-body px-4" ref={printRef}>
                <div className="text-center mb-4">
                  <img
                    src={`${userProfile.photo}`}
                    alt="User"
                    className="rounded-circle shadow"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Guest Name</span>
                  <span>{userProfile.name}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Date</span>
                  <span>{userProfile.visit_date}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Time</span>
                  <span>{userProfile.visit_time}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">ID No.</span>
                  <span>{userProfile.ID_No}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Host Name</span>
                  <span>{userProfile.host_name}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small text-wrap">
                  <span className="text-muted">Purpose</span>
                  <span>{userProfile.purpose}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small text-wrap">
                  <span className="text-muted">Contact Info</span>
                  <span>{userProfile.contact_info}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Special Requi.</span>
                  <span>{userProfile.special_request}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Status</span>
                  <span>{userProfile.status}</span>
                </div>

                <div className="text-center mt-4 d-print-none">
                  <button
                    type="button"
                    className="btn btn-primary w-100 rounded-3 py-2"
                    onClick={handlePrint}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .modal-content, .modal-content * {
            visibility: visible;
          }
          .modal-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .btn, .btn-close, .modal-header, .d-print-none {
            display: none !important;
          }
        }
      `}</style>

      {/* Add Guest Modal */}
      {/* Add Guest Modal */}
      <AddGuestModal
        show={showAddGuest}
        onClose={() => setShowAddGuest(false)}
        name={name}
        visitorType={visitorType}
        email={email}
        address={address}
        contact_number={contact_number}
        emergency_contact={emergency_contact}
        special_requirements={special_requirements}
        is_vip={is_vip}
        is_blacklisted={is_blacklisted}
        photo={photo}
        setName={setName}
        setVisitorType={setVisitorType}
        setEmail={setEmail}
        setAddress={setAddress}
        setContact_number={setContact_number}
        setEmergencyContact={setEmergencyContact}
        setSpecialRequirements={setSpecialRequirements}
        setIs_vip={setIs_vip}
        setIs_blacklisted={setIs_blacklisted}
        setPhoto={setPhoto}
        handleAddGuest={handleAddGuest}
        loading={loading}
        setLoading={setLoading}
        selectedImage={selectedImage}
        isSubmitting={isSubmitting}
        handleImageChange={handleImageChange}
      />
    </div>
  );
}

export default SecurityDashboard;
