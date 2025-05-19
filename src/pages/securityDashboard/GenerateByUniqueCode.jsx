import { useState } from "react";
import NavBar from "../securityDashboard/include/NavBar";

function GenerateByUniqueCode() { 
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Handles OTP input change
  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Ensure single digit per box
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every((digit) => digit !== "")) {
      handleSubmit(newOtp.join(""));
    }
  };

    // Handles OTP submission
  // Handles OTP submission
  const handleSubmit = (enteredOtp) => {
    
    // const enteredOtp = otp.join("");
    alert("Entered OTP: " + enteredOtp);
    // Perform API request or validation here
  };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault(); 
  
//     const enteredOtp = otp.join("");
  
//     try {
//       const response = await fetch("https://dummyapi.com/verify-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           otp: enteredOtp,
//           userId: "12345", // Dummy user ID
//         }),
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         alert("OTP Verified Successfully: " + JSON.stringify(data));
//       } else {
//         alert("OTP Verification Failed: " + data.message);
//       }
//     } catch (error) {
//       console.error("Error verifying OTP:", error);
//       alert("Something went wrong! Please try again.");
//     }
//   };
  

  return (
    <div>
      <NavBar />

      {/* Hero Section */}
      <header
        className="text-white text-center position-relative px-4"
        style={{
          backgroundColor: "#053561",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
          paddingTop: "20px",
          paddingBottom: "50px",
        }}
      >
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bod mb-0">Guest Confirmation</h2>

              {/* Plus Icon */}
              <i
                className="bi bi-plus-circle fs-1 text-primary p-2"
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            {/* Badge & Line Row */}
            <div className="d-flex align-items-center  mt-2">
              {/* Badge */}
              <p
                className="badge text-white"
                style={{
                  backgroundColor: "rgba(25, 88, 148, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{
                    backgroundColor: "rgba(13, 46, 78, 0.8)",
                  }}
                >
                  Company
                </span>
              </p>

              {/* Extending Line */}
              <div
                className="flex-grow-1 ms-2 mb-3"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(168, 172, 176, 0.8)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* QR Code Scanner and Generator Section */}
      <section className="container p-5 text-center">
      <div className="row text-center justify-content-center">
          <div className="col-md-6 col-lg-5 col-12">
            {/* Logo */}
            <div className="text-center pt-3"> 
              <p className="text-muted">Enter Guest Unique Code</p>
            </div>

            {/* OTP Input Boxes */}
            <div className="my-5">
              <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      className="form-control text-center fs-4"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "5px",
                      }}
                      value={digit}
                      maxLength="1"
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  ))}
                </div> 
              </form>
            </div>
            <a href="#" className="mt-4">
          <small>Scan QRL Instead</small>
        </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GenerateByUniqueCode;
