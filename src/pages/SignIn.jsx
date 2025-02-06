import React from "react";
import { Link, useNavigate } from "react-router-dom"; 

function SignIn() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
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
        className="col-md-6 position-relative p-0"
        style={{
          height: "100vh",
          borderRadius: "30px 0px 0px 0px",
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          className="position-absolute top-50 start-50 translate-middle text-white text-center"
          style={{
            width: "80%",
            fontSize: "28px",
            fontWeight: "bold",
            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          Ready to Manage Guests with Ease? <br /> Let's Get You Started
        </div>
      </div>

      {/* Right Section (Sign-In Form) */}
      <div
        className="col-md-6 d-flex align-items-center justify-content-center"
        style={{
          height: "100vh", 
          padding: "40px",
        }}
      >
        <div className="w-100" style={{ maxWidth: "576px" }}>
          <h2 className="text-center mb-4 fw-bold">Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="text-end mb-3">
              <Link to="/forgot-password" className="text-primary text-decoration-none">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Sign In
            </button>
          </form>
        </div>
      </div>

    </div>
  </div>
  );
}

export default SignIn;
