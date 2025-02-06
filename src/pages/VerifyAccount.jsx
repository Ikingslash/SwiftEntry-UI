import React, { useState } from "react";

function VerifyAccount() {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("OTP Verified Successfully!");
  };

  return (
    <div className="container mt-5 w-50">
      <h2 className="text-center">Verify Account</h2>
      <p className="text-center">Enter the OTP sent to your email</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">OTP Code</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Verify Account
        </button>
      </form>
    </div>
  );
}

export default VerifyAccount;
