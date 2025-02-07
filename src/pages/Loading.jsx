import React from "react";

function Loading() {
  return (
    <div
      className="d-flex vh-100 justify-content-center align-items-center"
      style={{ backgroundColor: "#F5FAFE", overflow: "hidden" }}
    >
      <div className="text-center">
        <div className="d-flex justify-content-center">
          <img src="./image.png" width={180} className="py-4" alt="" />
        </div>
        <div className="progress" style={{ height: "10px", width: "250%" }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: "40%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
