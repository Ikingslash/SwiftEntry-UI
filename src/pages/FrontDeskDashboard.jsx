import { useState, useEffect } from "react";
import NavBar from "./frontDeskDashboard/include/NavBar";
import TabIncoming from "./frontDeskDashboard/include/TabIncoming";
import TabOutgoing from "./frontDeskDashboard/include/TabOutgoing";
import AddGuestModal from "./frontDeskDashboard/include/AddGuestModal";
import api from "../context/api";
import { PlusCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FrontDeskDashboard() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    group: false,
    individual: false,
    pending: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AddGuestModal states
  const [name, setName] = useState("");
  const [visitorType, setVisitorType] = useState("Individual");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact_number, setContact_number] = useState("");
  const [emergency_contact, setEmergencyContact] = useState("");
  const [special_requirements, setSpecialRequirements] = useState("");
  const [photo, setPhoto] = useState(null);
  const [is_vip, setIs_vip] = useState(false);
  const [is_blacklisted, setIs_blacklisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Filter handling
  const handleFilterChange = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const applyFilters = () => setShowFilters(false);
  const openAddGuestModal = () => setShowAddGuest(true);

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

      const response = await api.post("/front-desk/guests/visitors", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {

        toast.success("New visitor registered successfully!");


       console.log(
         "[FrontDeskDashboard] Incrementing refreshKey in 300ms to trigger list reload"
       );
       setTimeout(() => {
         setRefreshKey((prev) => {
           const next = prev + 1;
           console.log(
             "[FrontDeskDashboard] refreshKey updated:",
             prev,
             "->",
             next
           );
           return next;
         });
       }, 300);

       setSearchQuery("");
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

  useEffect(() => {}, []);

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "280px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bod mb-0">Guest Confirmation</h2>
              <button
                onClick={openAddGuestModal}
                className="btn btn-primary d-flex align-items-center justify-content-center p-2 rounded-circle"
                style={{ width: "48px", height: "48px" }}
              >
                <PlusCircle size={24} className="text-white" />
              </button>
            </div>
            <div className="d-flex align-items-center mt-2">
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

      {/* Tabs */}
      <div className="container mt-5">
        <ul
          className="nav nav-tabs container d-flex align-items-center justify-content-between"
          style={{ border: "none" }}
        >
          <div className="d-flex">
            <li className="nav-item">
              <button
                className="nav-link px-5 py-2"
                onClick={() => setActiveTab("incoming")}
                style={{
                  borderRadius:
                    activeTab === "incoming" ? "10px" : "10px 0px 0px 10px",
                  border:
                    activeTab === "incoming"
                      ? "2px solid rgb(151, 196, 245)"
                      : "none",
                  background:
                    activeTab === "incoming" ? "white" : "rgb(244, 246, 249)",
                  color:
                    activeTab === "incoming" ? "#007bff" : "rgba(0, 0, 0, 0.5)",
                  fontWeight: activeTab === "incoming" ? "bold" : "normal",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Incoming
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link px-5 py-2"
                onClick={() => setActiveTab("outgoing")}
                style={{
                  borderRadius:
                    activeTab === "outgoing" ? "10px" : "0px 10px 10px 0px",
                  border:
                    activeTab === "outgoing"
                      ? "2px solid rgb(163, 195, 229)"
                      : "none",
                  background:
                    activeTab === "outgoing" ? "white" : "rgb(244, 246, 249)",
                  color:
                    activeTab === "outgoing" ? "#007bff" : "rgba(0, 0, 0, 0.5)",
                  fontWeight: activeTab === "outgoing" ? "bold" : "normal",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Outgoing
              </button>
            </li>
          </div>

          {/* Search + Filters */}
          <div className="d-flex align-items-center position-relative">
            <div className="position-relative me-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search guests..."
                style={{
                  borderRadius: "20px",
                  paddingRight: "40px",
                  width: "400px",
                  border: "1px solid #ced4da",
                }}
                autoComplete="off"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <i
                className="bi bi-sliders position-absolute"
                style={{
                  top: "50%",
                  right: "15px",
                  transform: "translateY(-50%)",
                  color: "#053561",
                  cursor: "pointer",
                }}
                onClick={() => setShowFilters(!showFilters)}
              ></i>
            </div>

            {showFilters && (
              <div
                className="position-absolute bg-white rounded shadow-sm p-3"
                style={{
                  top: "45px",
                  right: "0",
                  width: "220px",
                  zIndex: 1000,
                  border: "1px solid #ced4da",
                }}
              >
                <h6 className="mb-3 fw-bold text-secondary">Filter by:</h6>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="groupFilter"
                    checked={filters.group}
                    onChange={() => handleFilterChange("group")}
                  />
                  <label className="form-check-label" htmlFor="groupFilter">
                    Group
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="individualFilter"
                    checked={filters.individual}
                    onChange={() => handleFilterChange("individual")}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="individualFilter"
                  >
                    Individual
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pendingFilter"
                    checked={filters.pending}
                    onChange={() => handleFilterChange("pending")}
                  />
                  <label className="form-check-label" htmlFor="pendingFilter">
                    Pending
                  </label>
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={applyFilters}
                  style={{
                    backgroundColor: "#053561",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="container mt-5">
        {activeTab === "incoming" && (
          <TabIncoming
            filters={filters}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
          />
        )}
        {activeTab === "outgoing" && (
          <TabOutgoing
            filters={filters}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
          />
        )}
      </div>

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

export default FrontDeskDashboard;
