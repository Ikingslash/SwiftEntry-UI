import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; //
import { toast } from "react-toastify";

function VerifyAccount() {
  const navigate = useNavigate();
  const { verifyOtp, resetFlowData } = useAuth(); // Get function and state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if email/role data is missing from the previous step
  useEffect(() => {
    // Check if the flow was initiated correctly
    if (!resetFlowData.email || !resetFlowData.userRole) {
      toast.error("Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, [resetFlowData, navigate]);

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

  // Handles OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
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
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-50 my-5"
                  disabled={isLoading}
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
