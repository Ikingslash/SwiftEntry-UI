import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", { rememberMe });
    navigate("/loading");
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center vh-100"
      style={{ backgroundColor: "#F5FAFE", overflow: "hidden" }}
    >
      <div className="row w-100 h-100 d-flex align-items-center justify-content-center">
        {/* Left Section (Video Background) */}
        <div
          className="col-md-6 position-relative px-5"
          style={{
            height: "100vh",
            // borderRadius: "30px 300px 0px 0px",
            overflow: "hidden",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-100 h-100 p-4 rounded-5"
            style={{ objectFit: "cover" }}
          >
            <source
              src="./video1.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div
            className="position-absolute bottom-0 start-40 w-100 text-white p-5"
            style={{
              fontSize: "22px",
              // fontWeight: "bold",
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          
          > 
              <div className="justify-content-center">
              <img
                src="./image2.png"
                width={70} 
                alt="" 
              />
            </div>
            Ready to Manage Guests with Ease?  Let's Get  <br /> You Started
          </div>
        </div>

        {/* Right Section (Sign-In Form) */}
        <div
          className="col-md-6 d-flex align-items-center justify-content-center"
          style={{
            height: "100vh",
            paddingRight: "80px",
          }}
        >
          <div className="w-100 p-5" style={{ maxWidth: "576px" }}>
            <div className="d-flex p-3  justify-content-center">
              <img
                src="./image.png"
                width={180}
                className="py-4"
                alt="" 
              />
            </div>

            <h2 className="text-center mb-4 fw-bold">Sign In</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your company assigned email"
                  required
                  style={{
                    color: "rgba(75, 74, 74, 0.5)",
                    "::placeholder": { color: "rgba(75, 74, 74, 0.5)" },
                  }}
                />
              </div>

              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter password"
                  required
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="position-absolute top-50 end-0 translate-middle-y m-3"
                  style={{ cursor: "pointer", color: "#007bff" }}
                >
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-4 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-primary text-decoration-none"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary w-50">
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
