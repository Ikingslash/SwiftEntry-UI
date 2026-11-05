import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import { Eye, EyeOff, ShieldCheck, Loader2, ArrowRight, Lock } from "lucide-react";

import ForgotPasswordImage from "../assets/forgot-password.jpg";
import SwiftEntryLogo from "/pwa-512x512.png";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { resetPassword, resetFlowData } = useAuth();

  useEffect(() => {
    // Check if we have all the required data from the reset flow
    if (!resetFlowData.resetToken || !resetFlowData.email || !resetFlowData.userRole) {
      console.error("Missing reset flow data:", resetFlowData);
      toast.error("Verification failed. Please restart the process.");
      navigate("/forgot-password");
    }
  }, [resetFlowData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    // Check if we have all required data
    const { email, resetToken, userRole } = resetFlowData;

    if (!email || !resetToken || !userRole) {
      console.error("Missing data for reset password:", { email, resetToken, userRole });
      toast.error("Reset data incomplete. Please restart the process.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting password reset with:", {
        email,
        tokenLength: resetToken.length,
        tokenPrefix: resetToken.substring(0, 10) + "...",
        userRole
      });

      // Call the resetPassword function with all required parameters
      const success = await resetPassword(
        email,          // email
        resetToken,     // reset_token
        password,       // password
        confirmPassword // password_confirmation
      );

      if (success) {
        toast.success("Password reset successfully! Redirecting to login...");

        // Wait a moment before redirecting
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
      // If not successful, error is handled in the resetPassword function
    } catch (error) {
      console.error("Reset password form error:", error);
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
                  Reset Password
                </p>
                <p className="text-xs text-[#7a8aa3] font-medium">
                  Enter your new password for {resetFlowData.email || "your account"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">

              {/* New Password Field */}
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  New Password *
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Enter New Password (min. 8 characters)"
                    required
                    minLength="8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 border-0 bg-transparent p-0 cursor-pointer"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Confirm Password *
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="password_confirmation"
                    placeholder="Confirm New Password"
                    required
                    minLength="8"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 border-0 bg-transparent p-0 cursor-pointer"
                    aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {confirmPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {password !== confirmPassword && confirmPassword.length > 0 && (
                <div className="text-xs text-red-600 font-semibold">
                  Passwords do not match
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading || password.length < 8 || password !== confirmPassword}
                  className="w-full h-11 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold !rounded-full text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Link */}
              <p className="text-center text-xs text-slate-500 font-medium pt-1">
                <Link to="/forgot-password" className="text-blue-600 hover:underline font-bold">
                  Need to start over?
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

export default ResetPassword;
