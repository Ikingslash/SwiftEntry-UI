import React from "react";

function PasswordSuccessAlert() {
  return (
    <div
    className="d-flex vh-100 justify-content-center align-items-center"
    style={{ backgroundColor: "#F5FAFE", overflow: "hidden" }}
  >
    <div className="row d-flex align-items-center">
      <div className="col-lg-2 d-flex justify-content-center">
        <img src="./images/tick.png" width={50} className="py-4" alt="Logo" />
      </div>
      <div className="col-lg-10">
        <h3 className="text-success">SUCCESS!</h3>
        <p>Password has been successfully set</p>
      </div>
    </div>
  </div>
  
  );
}

export default PasswordSuccessAlert;
