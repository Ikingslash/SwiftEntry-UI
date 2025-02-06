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
    <div className="container mt-5 w-50">
      <h2 className="text-center">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" placeholder="Enter email" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" placeholder="Password" required />
        </div>

        <button type="submit" className="btn btn-primary w-100">Sign In</button>

        <div className="text-center mt-3">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
