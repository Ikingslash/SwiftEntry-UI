import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignIn() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

 const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      navigate("/loading"); // show loading page (optional)

      const success = await login(email, password);
      if (!success) {
        setErrorMessage("Invalid email or password");
        navigate("/"); // go back to login
      } else {
        setErrorMessage(""); // clear previous error
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Something went wrong. Please try again.");
      navigate("/");
    }
  };
  

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center vh-100 p-0"
      style={{ backgroundColor: "#F5FAFE", overflow: "hidden" }}
    >
      <div className="row w-100 h-100 d-flex align-items-center justify-content-center g-0">
        {/* Left Section (Video Background) */}
        <div
          className="col-lg-5  offset-md-1  d-none d-lg-block position-relative p-0"
          style={{
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-100 h-100 object-fit-cover p-4 rounded-5"
            style={{ objectFit: "cover" }}
          >
            <source src="./video1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div
            className="position-absolute bottom-0 start-50 translate-middle-x text-white ms-4 p-4 w-100"
            style={{
              fontSize: "22px",
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="d-flex">
              <img src="./image2.png" width={70} alt="" />
            </div>
            <p className="fw-bold fs-5 text-shadow">
              Ready to Manage Guests with Ease? <br /> Lets Get You Started
            </p>
          </div>
        </div>

        {/* Right Section (Sign-In Form) */}
        <div
          className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-3"
          style={{
            height: "100vh",
            paddingRight: "80px",
          }}
        >
          <div className="w-100 p-5" style={{ maxWidth: "576px" }}>
            <div className="d-flex p-3 justify-content-center">
              <img src="./image.png" width={180} className="py-4" alt="" />
            </div>

            <h2 className="text-center mb-4 fw-bold">Sign Inn</h2>

            {errorMessage && (
              <div className="alert alert-danger text-center">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your company assigned email"
                  required
                  style={{ color: "rgba(133, 124, 124, 0.5)" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="position-absolute top-50 end-0 translate-middle-y m-3"
                  style={{ cursor: "pointer", color: "#007bff" }}
                >
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-4">
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
                <button type="submit" className="btn btn-primary w-50 my-3">
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
