import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      toast.error("reCAPTCHA not ready. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Execute reCAPTCHA with action 'forgot_password'
      const recaptchaToken = await executeRecaptcha('forgot_password');

      if (!recaptchaToken) {
        toast.error("reCAPTCHA verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const success = await forgotPassword(email, recaptchaToken);
      console.log("Forgot password success:", success);
      if (success) {
        toast.success("Verification code sent. Please check your email.");
        navigate("/verify-account");
      } else {
        toast.error("Unable to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error during forgot password:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [executeRecaptcha, email, forgotPassword, navigate]);

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
      {/* Forgot Password Section */}
      <div className="container mt-3 vh-100">
        <div className="row text-center justify-content-center">
          <div className="col-md-6 col-lg-5 col-12">
            <div className="text-center">
              <img
                src="./images/envelop.png"
                width={60}
                className="my-3"
                alt="Logo"
              />
              <h2 className="fw-bold">Forgot Password</h2>
              <p className="text-muted">
                Enter your registered email to receive a verification code.
              </p>
            </div>

            {/* Form */}
            <div className="my-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-50 py-2 rounded-3 fw-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Next"}
                </button>
              </form>

              <div className="text-center mt-3">
                <Link
                  to="/"
                  className="text-decoration-none text-primary fw-bold"
                >
                  Remembered? Login Instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
