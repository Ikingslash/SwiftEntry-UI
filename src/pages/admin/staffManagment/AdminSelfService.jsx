import { useState, useEffect } from "react";
import NavBar from "../include/NavBar";
import api from "../../../context/api";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AdminSelfService() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selfServiceUsers, setSelfServiceUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    company_name: "",
    department: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchSelfServiceUsers();
  }, []);
  const [formErrors, setFormErrors] = useState({});

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    fetchSelfServiceUsers();
  };

  const fetchSelfServiceUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/self-service-users");
      setSelfServiceUsers(response.data.users || []);
    } catch (error) {
      toast.error("Failed to load self-service users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewUserFormData({
      name: "",
      email: "",
      password: "",
      position: "",
      company_name: "",
      department: "",
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUserFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post(
        "/admin/self-service-users",
        newUserFormData
      );

      handleAddModalClose();
      triggerRefresh();
      toast.success("Self-service user created successfully!");
    } catch (error) {
      showValidationErrors(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/self-service-users/${userId}`);
        triggerRefresh();
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <header
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "270px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        <div className="container">
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">Manage Self-Service Users</h3>
              <button
                className="btn btn-light"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New User
              </button>
            </div>
            <div className="d-flex align-items-center mt-4">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
              >
                Sydani Group
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mt-5 mb-5">
        <div className="row">
          <div className="col-md-12">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover border">
                  <thead style={{ backgroundColor: "#053561", color: "white" }}>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Position</th>
                      <th>Company</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selfServiceUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No self-service users found
                        </td>
                      </tr>
                    ) : (
                      selfServiceUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td className="fw-bold">{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.position || "N/A"}</td>
                          <td>{user.company_name || "N/A"}</td>
                          <td>{user.employee_id || "N/A"}</td>
                          <td>{user.department || "N/A"}</td>
                          <td>
                            <span
                              className={`badge ${user.status ? "bg-success" : "bg-danger"
                                }`}
                            >
                              {user.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Self-Service User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleAddModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddUser}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newUserFormData.name}
                      onChange={handleFormChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={newUserFormData.email}
                      onChange={handleFormChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={newUserFormData.password}
                      onChange={handleFormChange}
                      placeholder="Enter password (min 8 characters)"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Position</label>
                    <input
                      type="text"
                      className="form-control"
                      name="position"
                      value={newUserFormData.position}
                      onChange={handleFormChange}
                      placeholder="Enter position (e.g., Manager, Engineer)"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="company_name"
                      value={newUserFormData.company_name}
                      onChange={handleFormChange}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      value={newUserFormData.department}
                      onChange={handleFormChange}
                      placeholder="Enter department"
                    />
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create User"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAddModalClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSelfService;
