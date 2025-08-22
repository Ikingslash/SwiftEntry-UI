import { useState, useEffect } from "react";
import NavBar from "./frontDeskDashboard/include/NavBar";
import TabIncoming from "./frontDeskDashboard/include/TabIncoming";
import TabOutgoing from "./frontDeskDashboard/include/TabOutgoing";
import AddGuestModal from "./frontDeskDashboard/include/AddGuestModal";
import api from "../context/api"; // Assuming your api context is here
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

  // Function to handle filter checkbox changes
  const handleFilterChange = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const openAddGuestModal = () => {
    setShowAddGuest(true);
  };

  // Function to handle adding a new guest (connected to the API)
  const handleAddGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        contact_number,
        email,
        address,
        is_vip,
        is_blacklisted,
        emergency_contact,
        special_requirements,
        photo,
        visitor_type: visitorType,
      };

      const response = await api.post("/front-desk/guests/visitors", payload);

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
        setPhoto("");
        setIs_vip(false);
        setIs_blacklisted(false);

        // TODO: refresh incoming list if needed
         setRefreshKey((prev) => prev + 1);
      } else {
        toast.error(response.data.message || "Failed to register visitor.");
      }
    } catch (error) {
      console.error("Error creating new visitor:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create visitor. Please check your network connection.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Fetch initial data if needed
    // For example, you can fetch the list of guests or any other data here
  }, []);

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
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bod mb-0">Guest Confirmation</h2>

              {/* Plus Icon with onClick handler to open the modal */}
              <button
                onClick={openAddGuestModal}
                className="btn btn-primary d-flex align-items-center justify-content-center p-2 rounded-circle"
                style={{ width: "48px", height: "48px" }}
              >
                <PlusCircle size={24} className="text-white" />
              </button>
            </div>

            {/* Badge & Line Row */}
            <div className="d-flex align-items-center  mt-2">
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

      {/* Tabs Navigation (Positioned Below Header) */}
      <div className=" container mt-5">
        <ul
          className="nav nav-tabs container d-flex align-items-center justify-content-between"
          style={{
            border: "none",
          }}
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

          {/* Search Bar with Settings Icon */}
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

            {/* Filter Dropdown */}
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
            refreshKey={refreshKey} // 🔑 pass down
          />
        )}
        {activeTab === "outgoing" && (
          <TabOutgoing filters={filters} searchQuery={searchQuery} refreshKey={refreshKey} />
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
      />
    </div>
  );
}

export default FrontDeskDashboard;
