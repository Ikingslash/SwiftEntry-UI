import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    navigate("/password-success");
    setTimeout(() => {
      navigate("/");
    }, 3000);
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
        <Link to="/signin" className="">
          Go to Login
        </Link>
      </nav>

      {/* Main Section */}
      <div className="container mt-3 w-50 vh-100 justify-content-center">
        <div className="text-center">
          {/* Logo */}
          <div className="pt-3">
            <img
              src="./images/key2.png"
              width={50}
              className="py-4"
              alt="Logo"
            />
            <h2 className="mb-3">Reset Password</h2>
            <p className="text-muted">Enter your new password</p>
          </div>

          {/* Reset Password Form */}
          <div className="m-5">
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

              <button type="submit" className="btn btn-primary w-50 my-3">
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>  
    </div>
  );
}

export default ResetPassword;
