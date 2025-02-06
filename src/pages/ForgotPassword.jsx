import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password reset link sent to " + email);
  };

  return (
    <div className="container mt-5 w-50">
      <h2 className="text-center">Forgot Password</h2>
      <p className="text-center">Enter your email to receive a reset link</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
