import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password reset link sent to " + email);
    navigate("/verify-account");
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
          <img src="./image.png" alt="Logo" width="200" />
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
              src="./images/envelop.png"
              width={50}
              className="py-4"
              alt="Logo"
            />
            <h2 className="mb-3">Forgot Password</h2>
            <p className="text-muted">
              Enter Registered email for Verification
            </p>
          </div>

          {/* Forgot Password Form */}
          <div className="m-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-start">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter Your Company-assigned Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-50 my-3">
                Next
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
