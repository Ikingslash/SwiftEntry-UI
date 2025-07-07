import React from "react";

const CardOption = ({ title, themeColor, selected, onClick }) => {
  const themeStyles = {
    blue: "#007bff",
    orange: "#fd7e14",
    purple: "#6f42c1",
  };

  const background = {
    blue: "#e6f2ff",
    orange: "#fff3e6",
    purple: "#f3e6ff",
  };

  const color = themeStyles[themeColor] || "#007bff";
  const bgColor = background[themeColor] || "#e6f2ff";

  return (
    <div className="col-md-4 mb-4">
      <div
        className="border rounded shadow-sm"
        style={{
          borderColor: selected ? color : "#ccc",
          borderWidth: "2px",
          borderStyle: "solid",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        {/* Top grey header */}
        <div
          style={{
            height: "80px",
            backgroundColor: "#eaeaea",
            borderBottom: "1px solid #ddd",
          }}
        ></div>

        {/* Card body */}
        <div className="p-3">
          <div className="row mb-2">
            <div className="col-6">
              <div
                className="bg-secondary"
                style={{ height: "10px", borderRadius: "4px", opacity: 0.3 }}
              ></div>
              <div
                className="bg-secondary mt-2"
                style={{
                  height: "10px",
                  borderRadius: "4px",
                  width: "80%",
                  opacity: 0.3,
                }}
              ></div>
            </div>
            <div className="col-6">
              <div
                style={{
                  height: "30px",
                  borderRadius: "4px",
                  backgroundColor: color,
                }}
              ></div>
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-6">
              <div
                style={{
                  height: "10px",
                  borderRadius: "4px",
                  backgroundColor: color,
                }}
              ></div>
            </div>
            <div className="col-6">
              <div
                className="bg-secondary"
                style={{
                  height: "30px",
                  borderRadius: "4px",
                  opacity: 0.3,
                }}
              ></div>
            </div>
          </div>

          <div
            className="bg-secondary mb-2"
            style={{ height: "10px", opacity: 0.3, borderRadius: "4px" }}
          ></div>
          <div
            className="bg-secondary mb-2"
            style={{ height: "10px", opacity: 0.3, borderRadius: "4px" }}
          ></div>
        </div>

        {/* Footer */}
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2"
          style={{
            backgroundColor: bgColor,
            borderTop: "1px solid #cce0ff",
          }}
        >
          <span className="text-dark fw-semibold">{title}</span>
          {selected && (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: color,
                borderRadius: "50%",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardOption;
