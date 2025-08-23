
import { useEffect, useState } from "react";
import { IoPencil } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../context/api";
import { useAuth } from "../../context/AuthContext";
import NavBar from "./include/NavBar";

function StaffSettings() {
  const [settings, setSettings] = useState({
    email: "", // Changed to 'email' for consistency with backend
    password: "",
    password_confirmation: "", // Added password confirmation field
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get("staff/settings");
        if (response.data && response.data.email) {
          setSettings((prev) => ({
            ...prev,
            email: response.data.email,
          }));
        }
      } catch (error) {
        toast.error("Failed to fetch settings");
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: settings.email,
      };

      if (settings.password) {
        if (settings.password !== settings.password_confirmation) {
          toast.error("Passwords do not match.");
          return;
        }
        payload.password = settings.password;
        payload.password_confirmation = settings.password_confirmation;
      }

      await api.post("staff/settings", payload);
      toast.success("Settings updated successfully");
      setSettings((prev) => ({ ...prev, password: "", password_confirmation: "" }));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error("Failed to update settings");
      }
    }
  };

  return (
    <div>
      <NavBar />
      <header
        id="home"
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
            <div className="d-flex align-items-center ">
              <h3 className="mb-4">Staff settings</h3>
            </div>
            <div
              className="flex-grow-1 px-4"
              style={{
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            ></div>
          </div>
        </div>
      </header>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="card">
              <div className="card-header">
                <h4>Settings</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter new email"
                      value={settings.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Change Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter new password"
                      value={settings.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password_confirmation" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password_confirmation"
                      placeholder="Confirm new password"
                      value={settings.password_confirmation}
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <IoPencil className="me-2" />
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffSettings;
