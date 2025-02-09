import React from "react";

function Loading() {
  return (
    <div
    className="d-flex vh-100 justify-content-center align-items-center"
    style={{ backgroundColor: "#F5FAFE", overflow: "hidden" }}
  >
    <div className="text-center w-100">
      <div className="d-flex justify-content-center">
        <img src="./image.png" width={150} className="py-5" alt="Loading" />
      </div>
      <div className="d-flex justify-content-center">
        <div className="progress" style={{ height: "7px", width: "350px" }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: "30%" }}
          ></div>
        </div>
      </div>
    </div>
  </div>
  
  );
}

export default Loading;
