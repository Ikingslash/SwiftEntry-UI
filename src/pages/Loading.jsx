import React from "react";

function Loading() {
  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-3">Signing In...</h4>
      </div>
    </div>
  );
}

export default Loading;
