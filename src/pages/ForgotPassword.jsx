import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";

import ForgotPasswordImage from "../assets/forgot-password.jpg";
import SwiftEntryLogo from "/pwa-512x512.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      toast.error("reCAPTCHA not ready. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const success = await forgotPassword(email, executeRecaptcha);
      console.log("Forgot password success:", success);
      if (success) {
        toast.success("Verification code sent. Please check your email.");
        navigate("/verify-account");
      } else {
        toast.error("Unable to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error during forgot password:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [executeRecaptcha, email, forgotPassword, navigate]);

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

          {/* Form Inputs Container - Centered Vertically */}
          <div className="max-w-md w-full mx-auto my-auto space-y-3 pt-6">

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
                  Forgot Password
                </p>
                <p className="text-xs text-[#7a8aa3] font-medium">
                  Enter your registered email to receive a verification code.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">

              {/* Email Field */}
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Email Address *
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your registered email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold !rounded-full text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Continue</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Link */}
              <p className="text-center text-xs text-slate-500 font-medium pt-1">
                Remembered?{" "}
                <Link to="/" className="text-blue-600 hover:underline font-bold">
                  Login Instead
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

export default ForgotPassword;