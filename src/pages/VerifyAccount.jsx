import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function VerifyAccount() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Handles OTP input change
  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Ensure single digit per box
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handles OTP submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    alert("Entered OTP: " + enteredOtp);
    navigate("/set-new-password");
  };

  return (
    <div
      style={{
        backgroundColor: "#F5FAFE",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Navbar */}
      <nav className="navbar p-5 pb-0">
        <a className="navbar-brand mx-4">
          <img src="./image.png" alt="Logo" width="150" />
        </a>
        <Link to="/" className="">
          Go to Login
        </Link>
      </nav>

      {/* Main Section */}
      <div className="container mt-3 w-50 vh-100 justify-content-center">
        <div className="text-center">
          {/* Logo */}
          <div className="pt-3">
            <img
              src="./images/key.png"
              width={50}
              className="py-4"
              alt="Logo"
            />
            <h2 className="mb-3">Verify Your Account</h2>
            <p className="text-muted">
              We sent an OPT to your email
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="m-5">
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

              <button type="submit" className="btn btn-primary w-50 my-5">
                Verify
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyAccount;
