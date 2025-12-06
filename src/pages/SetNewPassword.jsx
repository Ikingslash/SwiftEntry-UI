import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword, resetFlowData } = useAuth();

  useEffect(() => {
    // Check if we have all the required data from the reset flow
    if (!resetFlowData.resetToken || !resetFlowData.email || !resetFlowData.userRole) {
      console.error("Missing reset flow data:", resetFlowData);
      toast.error("Verification failed. Please restart the process.");
      navigate("/forgot-password");
    }
  }, [resetFlowData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    // Check if we have all required data
    const { email, resetToken, userRole } = resetFlowData;

    if (!email || !resetToken || !userRole) {
      console.error("Missing data for reset password:", { email, resetToken, userRole });
      toast.error("Reset data incomplete. Please restart the process.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting password reset with:", {
        email,
        tokenLength: resetToken.length,
        tokenPrefix: resetToken.substring(0, 10) + "...",
        userRole
      });

      // Call the resetPassword function with all required parameters
      const success = await resetPassword(
        email,          // email
        resetToken,     // reset_token
        password,       // password
        confirmPassword // password_confirmation
      );

      if (success) {
        toast.success("Password reset successfully! Redirecting to login...");

        // Wait a moment before redirecting
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
      // If not successful, error is handled in the resetPassword function
    } catch (error) {
      console.error("Reset password form error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#F5FAFE" }}
    >
      {/* Navbar */}
      <nav className="navbar w-100 px-4 py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a href="#" className="navbar-brand">
            <img src="./image.png" alt="Logo" width="150" />
          </a>
          <Link to="/" className="text-primary fw-bold">
            Go to Login
          </Link>
        </div>
      </nav>
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Main Section */}
      <div className="container mt-3 vh-100">
        <div className="row text-center justify-content-center">
          <div className="col-md-6 col-lg-5 col-12">
            <div className="text-center">
              <img
                src="./images/key.png"
                width={60}
                className="my-3"
                alt="Logo"
              />
              <h2 className="mb-3">Reset Password</h2>
              <p className="text-muted">
                Enter your new password for **{resetFlowData.email || "your account"}**
              </p>
              {resetFlowData.userRole && (
                <p className="text-muted small">
                  User type: {resetFlowData.userRole}
                </p>
              )}
            </div>

            {/* Reset Password Form */}
            <div className="my-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter New Password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="8"
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="8"
                  />
                </div>

                {password !== confirmPassword && confirmPassword.length > 0 && (
                  <div className="alert alert-danger py-2">
                    Passwords do not match
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-50 my-3"
                  disabled={isLoading || password.length < 8 || password !== confirmPassword}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="text-center mt-3">
                <Link
                  to="/forgot-password"
                  className="text-decoration-none text-primary fw-bold"
                >
                  Need to start over?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
