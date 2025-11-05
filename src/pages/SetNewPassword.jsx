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
    if (!resetFlowData.resetToken || !resetFlowData.email) {
      toast.error("Verification failed. Please restart the process.");
      navigate("/forgot-password");
    }
  }, [resetFlowData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Backend requires min 8 characters, so this check is good
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    // Extract required data from flow state
    const email = resetFlowData.email;
    const resetToken = resetFlowData.resetToken;

    // Call the context function, passing all data required by the backend:
    // email, token, new password, and confirmation password
    const success = await resetPassword(
      email,
      resetToken,
      password,
      confirmPassword
    );

    setIsLoading(false);

    if (success) {
      // You should have a dedicated success page component or use a modal/toast here
      toast.success("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/"); // Redirect to login after success alert
      }, 3000);
    } else {
      // If the API call fails (e.g., 401 invalid token), the error toast
      // will be handled by the resetPassword context function.
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#F5FAFE" }}
    >
      {/* Navbar (content from snippet) */}
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
      <div className="container mt-3 vh-100 ">
        <div className="row text-center justify-content-center">
          <div className="col-md-6 col-lg-5 col-12">
            {/* Headings (content from snippet) */}
            <div className="text-center">
              <img
                src="./images/key.png"
                width={60}
                className="my-3"
                alt="Logo"
              />
              <h2 className="mb-3">Reset Password</h2>
              <p className="text-muted">
                Enter your new password for **
                {resetFlowData.email || "your account"}**
              </p>
            </div>

            {/* Reset Password Form */}
            <div className="my-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-50 my-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
