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
            <div className="text-center">
              {/* Logo */}
              <img
                src="./images/envelop.png"
                width={60}
                className="my-3"
                alt="Logo"
              />
              <h2 className="fw-bold">Forgot Password</h2>
              <p className="text-muted">
                Enter your registered email for verification
              </p>
            </div>

            {/* Forgot Password Form */}
            <div className="my-5">
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

                <button
                  type="submit"
                  className="btn btn-primary w-50 py-2 rounded-3 fw-bold"
                >
                  Next
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
