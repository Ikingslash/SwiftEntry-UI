import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";

import ForgotPasswordImage from "../assets/forgot-password.jpg";
import SwiftEntryLogo from "/pwa-512x512.png";

const OTP_EXPIRY_SECONDS = 600;

function VerifyAccount() {
  const navigate = useNavigate();
  const { verifyOtp, resetFlowData, forgotPassword } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  // Redirect if email/role data is missing from the previous step
  useEffect(() => {
    // Check if the flow was initiated correctly
    if (!resetFlowData.email || !resetFlowData.userRole) {
      toast.error("Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, [resetFlowData, navigate]);

  useEffect(() => {
    // Stop the timer and enable resend if time runs out
    if (timeLeft === 0) {
      setIsResendEnabled(true);
      return;
    }

    // Set up the interval
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or timeLeft changes to 0
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Helper function to format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad single-digit numbers with a leading zero
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // Handles resending the OTP
  const handleResendCode = async (e) => {
    e.preventDefault();
    if (!isResendEnabled) return;

    setIsLoading(true);
    try {
      // Call forgotPassword with the email from resetFlowData
      const success = await forgotPassword(resetFlowData.email);

      if (success) {
        toast.info("A new verification code has been sent.");
        // Reset the timer and disable the resend button
        setTimeLeft(OTP_EXPIRY_SECONDS);
        setIsResendEnabled(false);
        setOtp(["", "", "", "", "", ""]); // Clear inputs

        // Clear all existing inputs
        for (let i = 0; i < 6; i++) {
          const input = document.getElementById(`otp-${i}`);
          if (input) input.value = "";
        }
      } else {
        toast.error("Failed to resend code. Please try again later.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("An error occurred while resResend code");
    } finally {
      setIsLoading(false);
    }
  };
  // Handles OTP input change
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
    // Auto-focus prev input on backspace/delete
    if (index > 0 && !value) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    // Check if the code has expired on the front-end before submitting
    if (isResendEnabled) {
      toast.error("The verification code has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting OTP for verification:", {
        email: resetFlowData.email,
        otp: enteredOtp,
        userRole: resetFlowData.userRole
      });

      const success = await verifyOtp(enteredOtp);

      if (success) {
        console.log("OTP verification successful, navigating to reset password");
        navigate("/set-new-password");
      } else {
        // Error is handled in verifyOtp function
        console.log("OTP verification failed");
      }
    } catch (error) {
      console.error("OTP submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-dvh bg-[#edf5ff] flex items-center justify-center p-0 m-0 overflow-hidden font-sans">

      {/* Main Full-Screen 50/50 Split View */}
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">

        {/* LEFT SIDE: Brand Image Panel */}
        <aside className="hidden lg:block lg:col-span-6 xl:col-span-6 relative h-full overflow-hidden bg-[#02213d]">
          <img
            src={ForgotPasswordImage}
            alt="Forgot Password"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </aside>

        {/* RIGHT SIDE: Form Section */}
        <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-8 xl:p-10 flex flex-col justify-between relative bg-[rgb(252,253,255)] h-full overflow-y-auto">

          {/* Mobile Brand Header */}
          <div className="flex lg:hidden items-center justify-center w-full mb-3">
            <img
              src={SwiftEntryLogo}
              alt="SwiftEntry"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Form Inputs Container */}
          <div className="max-w-md w-full mx-auto space-y-3 pt-6">

            {/* Header Logo & Title Aligned */}
            <div className="space-y-2 mb-4">
              <div className="hidden lg:flex items-center justify-center mt-4">
                <img
                  src={SwiftEntryLogo}
                  alt="SwiftEntry"
                  className="h-20 w-auto object-contain"
                />
              </div>

              <div className="space-y-0.5">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  Verify Your Account
                </p>
                <p className="text-xs text-[#7a8aa3] font-medium">
                  We sent an OTP to: {resetFlowData.email || "your email"}
                </p>
              </div>
            </div>

            {/* OTP Input Boxes */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1287ef] focus:bg-white focus:ring-4 focus:ring-[#1287ef]/10 transition-all duration-200 text-slate-900"
                    value={digit}
                    maxLength="1"
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      // Custom logic for backspace/delete on an empty field to move focus
                      if (
                        e.key === "Backspace" &&
                        index > 0 &&
                        otp[index] === ""
                      ) {
                        document.getElementById(`otp-${index - 1}`).focus();
                      }
                    }}
                    disabled={isResendEnabled} // Disable inputs when code expires
                  />
                ))}
              </div>

              {/* Countdown Timer */}
              <div className="text-center">
                {isResendEnabled ? (
                  <p className="text-xs text-red-600 font-semibold">
                    Code expired.{" "}
                    <button
                      onClick={handleResendCode}
                      className="text-blue-600 hover:underline font-bold border-0 bg-transparent p-0 cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Resend Code"}
                    </button>
                  </p>
                ) : (
                  <p className="text-xs font-medium text-red-600">
                    Code expires in:{" "}
                    <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading || isResendEnabled}
                  className="w-full h-11 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold !rounded-full text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Link */}
              <p className="text-center text-xs text-slate-500 font-medium pt-1">
                <Link to="/forgot-password" className="text-blue-600 hover:underline font-bold">
                  Back to Forgot Password
                </Link>
              </p>

            </form>
          </div>

          {/* Security Footer Line */}
          <footer className="security-note flex items-center gap-4 w-full max-w-md mx-auto pt-2 text-[#8291aa] text-[11px]">
            <span className="h-[1px] flex-1 bg-[#dce4ee]" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 text-[#6684ab]" />
              <p className="m-0">Your security is our priority.</p>
            </div>
            <span className="h-[1px] flex-1 bg-[#dce4ee]" />
          </footer>

        </div>

      </div>
    </div>
  );
}

export default VerifyAccount;
