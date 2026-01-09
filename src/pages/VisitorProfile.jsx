import { useState, useEffect } from "react";
import VisitorLayout from "../layout/VisitorLayout";
import api from "../context/api";
import { toast } from "react-toastify";

function VisitorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/self-service/profile");
      setProfile(response.data);
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  if (!profile) {
    return (
      <VisitorLayout>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </VisitorLayout>
    );
  }

  return (
    <VisitorLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-12">
            <h2 className="fw-bold" style={{ color: "#053561" }}>
              Your Profile
            </h2>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "100px", height: "100px" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <i className="bi bi-person fs-1 text-muted"></i>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    FULL NAME
                  </label>
                  <p className="fs-5">{profile.name}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    EMAIL
                  </label>
                  <p>{profile.email}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    POSITION
                  </label>
                  <p>{profile.position || "Not provided"}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    COMPANY NAME
                  </label>
                  <p>{profile.company_name || "Not provided"}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    EMPLOYEE ID
                  </label>
                  <p>{profile.employee_id || "Not provided"}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    DEPARTMENT
                  </label>
                  <p>{profile.department || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisitorLayout>
  );
}

export default VisitorProfile;
