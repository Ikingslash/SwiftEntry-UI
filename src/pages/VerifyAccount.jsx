import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; //
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const OTP_EXPIRY_SECONDS = 600;

function VerifyAccount() {
  const navigate = useNavigate();
  const { verifyOtp, resetFlowData, forgotPassword } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  // Redirect if email/role data is missing from the previous step
  useEffect(() => {
    // Check if the flow was initiated correctly
    if (!resetFlowData.email || !resetFlowData.userRole) {
      toast.error("Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, [resetFlowData, navigate]);

  useEffect(() => {
    // Stop the timer and enable resend if time runs out
    if (timeLeft === 0) {
      setIsResendEnabled(true);
      return;
    }

    // Set up the interval
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or timeLeft changes to 0
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Helper function to format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad single-digit numbers with a leading zero
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // Handles resending the OTP
  const handleResendCode = async (e) => {
    e.preventDefault();
    if (!isResendEnabled) return;

    setIsLoading(true);
    // Call forgotPassword to re-initiate the flow and send a new code
    const success = await forgotPassword(resetFlowData.email);
    setIsLoading(false);

    if (success) {
      toast.info("A new verification code has been sent.");
      // Reset the timer and disable the resend button
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setIsResendEnabled(false);
      setOtp(["", "", "", "", "", ""]); // Clear inputs
    } else {
      toast.error("Failed to resend code. Please try again later.");
    }
  };

  // Handles OTP input change
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
    // Auto-focus prev input on backspace/delete
    if (index > 0 && !value) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    // Check if the code has expired on the front-end before submitting
    if (isResendEnabled) {
      toast.error(
        "The verification code has expired. Please request a new one."
      );
      return;
    }

    setIsLoading(true);
    const success = await verifyOtp(enteredOtp);
    setIsLoading(false);

    if (success) {
      navigate("/set-new-password");
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
            <div className="text-center pt-3">
              <img
                src="./images/key.png"
                width={50}
                className="py-4"
                alt="Logo"
              />
              <h2 className="mb-3">Verify Your Account</h2>
              <p className="text-muted">
                We sent an OTP to: **{resetFlowData.email || "your email"}**
              </p>
            </div>

            {/* OTP Input Boxes (content from snippet) */}
            <div className="my-5">
              <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      className="form-control text-center fs-4"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "5px",
                      }}
                      value={digit}
                      maxLength="1"
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        // Custom logic for backspace/delete on an empty field to move focus
                        if (
                          e.key === "Backspace" &&
                          index > 0 &&
                          otp[index] === ""
                        ) {
                          document.getElementById(`otp-${index - 1}`).focus();
                        }
                      }}
                      disabled={isResendEnabled} // Disable inputs when code expires
                    />
                  ))}
                </div>

                {/* Countdown Timer */}
                <div className="mt-4">
                  {isResendEnabled ? (
                    <p className="text-danger fw-bold">
                      Code expired.{" "}
                      <button
                        onClick={handleResendCode}
                        className="btn btn-link p-0 fw-bold"
                        disabled={isLoading}
                        style={{ textDecoration: "none" }}
                      >
                        {isLoading ? "Sending..." : "Resend Code"}
                      </button>
                    </p>
                  ) : (
                    <p className="text-success fw-bold">
                      Code expires in:
                      <span className="ms-2">{formatTime(timeLeft)}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-50 my-5"
                  disabled={isLoading || isResendEnabled} // Disable if loading or code expired
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyAccount;
