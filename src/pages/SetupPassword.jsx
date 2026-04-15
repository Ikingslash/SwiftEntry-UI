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
  const [tokenStatus, setTokenStatus] = useState("checking"); // "checking" | "valid" | "invalid" | "expired"
  const [tokenMessage, setTokenMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = decodeURIComponent(searchParams.get("email") || "");

    if (!token || !email) {
      setTokenStatus("invalid");
      setTokenMessage("Setup link is missing required parameters.");
      return;
    }

    setFormData((prev) => ({ ...prev, token, email }));
    validateToken(token, email);
  }, [searchParams]);

  const validateToken = async (token, email) => {
    try {
      const response = await api.post("/admin/staff/validate-setup-token", { token, email });
      if (response.data?.valid) {
        setTokenStatus("valid");
      } else {
        setTokenStatus("invalid");
        setTokenMessage(response.data?.message || "This setup link is no longer valid.");
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        setTokenStatus("expired");
        setTokenMessage(message || "This setup link has expired.");
      } else if (status === 404) {
        setTokenStatus("invalid");
        setTokenMessage(message || "This setup link is invalid or has already been used.");
      } else {
        // Network / unknown error – allow user to try anyway
        setTokenStatus("valid");
      }
    }
  };

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
      const response = await api.post("/admin/staff/setup-password", formData);
      if (response.data.success) {
        toast.success("Password set successfully! Redirecting to login…");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 422) {
        const errors = error.response.data.errors || {};
        Object.values(errors).forEach((errArray) =>
          (Array.isArray(errArray) ? errArray : [errArray]).forEach((e) => toast.error(e))
        );
      } else if (status === 400 || status === 404) {
        // Token is invalid / already used / expired
        setTokenStatus("invalid");
        setTokenMessage(
          message ||
          "This setup link has already been used or is no longer valid. Please ask your administrator to resend a new setup link."
        );
        toast.error("Setup link is no longer valid.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state ── */
  if (tokenStatus === "checking") {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p>Validating your setup link…</p>
        </div>
      </div>
    );
  }

  /* ── Invalid / expired token state ── */
  if (tokenStatus === "invalid" || tokenStatus === "expired") {
    return (
      <div className="container mt-5">
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow border-danger">
              <div className="card-header bg-danger text-white">
                <h4 className="mb-0">
                  {tokenStatus === "expired" ? "⏰ Setup Link Expired" : "🔗 Invalid Setup Link"}
                </h4>
              </div>
              <div className="card-body text-center py-4">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  {tokenStatus === "expired" ? "⏰" : "⚠️"}
                </div>
                <h5 className="text-danger mb-3">
                  {tokenStatus === "expired" ? "Link Has Expired" : "Link Is No Longer Valid"}
                </h5>
                <p className="text-muted mb-3">
                  {tokenMessage ||
                    "This setup link has already been used or has expired. Each setup link can only be used once."}
                </p>
                <div className="alert alert-info text-start">
                  <strong>What to do next:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Contact your administrator</li>
                    <li>Ask them to resend a new setup link to <strong>{formData.email}</strong></li>
                    <li>Check your email for a new invitation</li>
                  </ol>
                </div>
              </div>
              <div className="card-footer text-center">
                <small className="text-muted">
                  Already set your password?{" "}
                  <a href="/" className="text-primary">Go to Login</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Valid token – show form ── */
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
              <div className="alert alert-success mb-3">
                <p className="mb-1"><strong>Email:</strong> {formData.email}</p>
                <p className="mb-0"><strong>Status:</strong> ✓ Link is valid</p>
              </div>

              <p className="text-muted mb-4">
                Please set a password to activate your account. It must be at least 8 characters.
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
                  {formData.password &&
                    formData.password_confirmation &&
                    formData.password !== formData.password_confirmation && (
                      <div className="text-danger small mt-1">Passwords do not match</div>
                    )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || formData.password.length < 8}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Setting Password…
                      </>
                    ) : (
                      "Set Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small className="text-muted">Having issues? Contact your administrator.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPassword;
