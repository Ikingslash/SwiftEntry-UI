import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../context/api";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

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
    const email = searchParams.get('email');

    if (token && email) {
      // Validate token with backend
      api.post('/api/staff/validate-setup-token', { token, email })
        .then(response => {
          if (response.data.valid) {
            setFormData(prev => ({ ...prev, token, email }));
            setValidToken(true);
          } else {
            toast.error("Invalid or expired setup link");
          }
        })
        .catch(error => {
          toast.error("Invalid setup link");
          console.error("Token validation error:", error);
        })
        .finally(() => {
          setCheckingToken(false);
        });
    } else {
      setCheckingToken(false);
      toast.error("Invalid setup link");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/staff/setup-password', formData);

      if (response.data.success) {
        toast.success("Password set successfully! You can now login.");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Validation error");
      } else if (error.response?.status === 401) {
        toast.error("Invalid or expired setup link");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Invalid or expired setup link. Please contact your administrator for a new invitation.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
        <ToastContainer position="top-right" autoClose={5000} />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Set Your Password</h4>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                Welcome! Please set your password to activate your account.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    disabled
                  />
                  <small className="text-muted">This is your login email</small>
                </div>

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
                  <small className="text-muted">Minimum 8 characters</small>
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
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Setting Password..." : "Set Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPassword;
