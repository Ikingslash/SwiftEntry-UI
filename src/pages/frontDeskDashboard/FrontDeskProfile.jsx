import { useEffect, useState } from "react";
import api from "../../context/api";
import NavBar from "./include/NavBar";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IoPencil } from 'react-icons/io5';

// Removed the Pagination component as it's not relevant for a profile page.

function FrontDeskProfile() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth(); // Assume AuthContext provides 'user' and 'logout'
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      position: "",
      company_name: "",
      employee_id: "",
    });


  // Function to fetch the user's profile data
  const fetchProfileData = async () => {
    setLoading(true);

    try {
      const response = await api.get("front-desk/profile");
      setProfileData(response.data);
      setFormData(response.data);

      toast.success("Profile loaded successfully!");
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data. Please try again."); // More appropriate error message
      // Handle error, e.g., redirect to login or show an error message
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();

  }, []); // Empty dependency array means this runs once on mount

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthContext
      navigate("/"); // Redirect to home/login page after logout
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again."); // Corrected error message
    }
  };

    const handleEditClick = () => {
      setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      try {
        // Send the updated data to the backend
        const response = await api.put("/front-desk/update-profile", formData);
         // Get the updated profile data from backend
             const updatedData = response.data;

             // Update both local and global states
             setProfileData(updatedData);
             updateUser(updatedData);

             // Close modal
             setIsModalOpen(false);

             // Success message
             toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      }
    };


  // Placeholder image for when a profile picture isn't available
  const defaultProfilePicture = "https://placehold.co/100x100";

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
      <div
        className="container-fluid py-5"
        style={{ backgroundColor: "#F5FAFE", minHeight: "100vh" }}
      >
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card shadow rounded-4 p-4 mt-5">
                <div className="text-center pt-3">
                  <h3 className="fw-bold">Profile</h3>
                </div>

                {/* Profile Picture and Staff Badge */}
                <div className="text-center mt-4">
                  <img
                    src={profileData?.profile_picture || defaultProfilePicture}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    className="d-inline-block px-3 py-1 rounded-pill bg-light text-primary fw-bold"
                    style={{ border: "1px solid #ccc" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-person-badge-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm4.5 0a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </svg>
                    Front Desk
                  </div>
                </div>

                {/* Profile Details */}
                <div className="mt-5 border p-4 rounded-4">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <span className="text-muted fw-bold">Name</span>
                      <span>{profileData?.name}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <span className="text-muted fw-bold">Company Email</span>
                      <span>{profileData?.email}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <span className="text-muted fw-bold">Position</span>
                      <span>{profileData?.position}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <span className="text-muted fw-bold">Company</span>
                      <span>{profileData?.company_name}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <span className="text-muted fw-bold">Employee ID</span>
                      <span>{profileData?.employee_id}</span>
                    </li>
                  </ul>
                </div>

                {/* Edit Profile Button */}
                <div className="d-grid mt-4 px-3">
                  <button
                    onClick={handleEditClick}
                    className="btn btn-primary btn-lg rounded-pill fw-bold"
                  >
                    <IoPencil className="me-2" />
                    Edit Profile
                  </button>
                </div>

                {/* Log Out Button */}
                <div className="d-grid mt-5 px-3">
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger btn-lg rounded-pill fw-bold"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-box-arrow-right me-2"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                      />
                      <path
                        fillRule="evenodd"
                        d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                      />
                    </svg>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      <div
        className={`modal fade ${isModalOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: isModalOpen ? "rgba(0, 0, 0, 0.5)" : "transparent",
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Profile</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Position
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="position"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                {/* You can add more fields here if needed */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FrontDeskProfile;
