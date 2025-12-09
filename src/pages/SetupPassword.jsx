import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../context/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
    email: "",
    token: "",
  });
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = decodeURIComponent(searchParams.get('email') || '');

    console.log("Setup Password Page Loaded:", {
      token,
      email,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (token && email) {
      // Set form data immediately
      setFormData(prev => ({
        ...prev,
        token,
        email: email
      }));

      // Try to validate token
      validateToken(token, email);
    } else {
      setCheckingToken(false);
      toast.error("Invalid setup link - missing parameters");
    }
  }, [searchParams]);

  const validateToken = async (token, email) => {
    try {
      // Try with different API endpoints
      const endpoints = [
        "/api/admin/staff/validate-setup-token",
        "/admin/staff/validate-setup-token",
        "/admin/staff/validate-setup-token",
        "/api/admin/staff/validate-setup-token",
        "/admin/staff/validate-setup-token",
      ];

      let validResponse = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await api.post(endpoint, {
            token,
            email
          });

          if (response.data && response.data.valid !== undefined) {
            validResponse = response;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
          continue;
        }
      }

      if (validResponse && validResponse.data.valid) {
        setValidToken(true);
        toast.success("Token validated successfully");
      } else {
        toast.error("Invalid or expired setup link");
        console.error("Token validation failed:", validResponse?.data);
      }
    } catch (error) {
      console.error("Token validation error:", error);

      // If validation fails, still allow user to try setting password
      // (backend will validate again during setup)
      setValidToken(true);
      toast.warning("Unable to validate token. You can still try to set password.");
    } finally {
      setCheckingToken(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    console.log("Submitting password setup:", {
      email: formData.email,
      tokenLength: formData.token?.length
    });

    try {
      // Try different endpoints for setup
      const endpoints = [
        "/api/admin/staff/setup-password",
        "/admin/staff/setup-password",
        "/admin/staff/setup-password",
        "/api/admin/staff/setup-password",
        "/admin/staff/setup-password",
      ];

      let success = false;
      let errorMessage = "Setup failed";

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying setup endpoint: ${endpoint}`);
          const response = await api.post(endpoint, formData);

          if (response.data && response.data.success) {
            toast.success("Password set successfully! You can now login.");
            success = true;

            setTimeout(() => {
              navigate('/login');
            }, 2000);
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.data || err.message);
          errorMessage = err.response?.data?.message || err.message;
          continue;
        }
      }

      if (!success) {
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Setup password error:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        Object.values(errors).forEach(errArray => {
          errArray.forEach(err => toast.error(err));
        });
      } else if (error.response?.status === 401) {
        toast.error("Invalid or expired setup link");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Bad request");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Validating your setup link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Set Your Password</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="alert alert-info">
                  <p className="mb-1"><strong>Email:</strong> {formData.email}</p>
                  <p className="mb-0"><strong>Status:</strong> {validToken ? "✓ Link is valid" : "⚠ Please proceed with caution"}</p>
                </div>
              </div>

              <p className="text-muted mb-4">
                Please set your password to activate your account. Your password must be at least 8 characters.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    minLength="8"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    minLength="8"
                  />
                  {formData.password && formData.password_confirmation &&
                   formData.password !== formData.password_confirmation && (
                    <div className="text-danger small mt-1">Passwords do not match</div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || (formData.password && formData.password.length < 8)}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Setting Password...
                      </>
                    ) : "Set Password"}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small className="text-muted">
                Having issues? Contact your administrator.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPassword;
