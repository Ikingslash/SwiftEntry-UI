import { useState } from "react";
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
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: "#F5FAFE",
      }}
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

      {/* Main Section */}
      <div className="container mt-3 vh-100 ">
        <div className="row text-center justify-content-center">
          <div className="col-md-6 col-lg-5 col-12">
            {/* Logo */}
            <div className="text-center pt-3">
              <img
                src="./images/key.png"
                width={50}
                className="py-4"
                alt="Logo"
              />
              <h2 className="mb-3">Verify Your Account</h2>
              <p className="text-muted">We sent an OPT to your email</p>
            </div>

            {/* OTP Input Boxes */}
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

                <button type="submit" className="btn btn-primary w-50 my-5">
                  Verify
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
