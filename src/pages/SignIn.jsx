import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  TrendingUp,
  Mail,
  Lock,
  Loader2,
  Check
} from "lucide-react";

import FrontdeskImage from "../assets/frontdesk.png";
import SwiftEntryLogo from "/pwa-512x512.png";

function SignIn() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const MOCK_MODE = import.meta.env.VITE_USE_MOCK_API === "true";

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!executeRecaptcha && !MOCK_MODE) {
      toast.error("reCAPTCHA not ready. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      navigate("/loading");

      const success = await login(
        email,
        password,
        MOCK_MODE ? undefined : executeRecaptcha
      );
      if (!success) {
        setErrorMessage("Invalid email or password");
        toast.error("Invalid email or password");
        navigate("/");
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  }, [executeRecaptcha, email, password, login, navigate, MOCK_MODE]);

  return (
    <>
      <main className="w-full h-dvh bg-[#edf5ff] flex items-center justify-center p-0 m-0 overflow-hidden font-sans">

        {/* Main Full-Screen 50/50 Split View */}
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#f9fbff]">

          {/* LEFT SIDE: Brand Image Panel with Radial Glow & Waves */}
          <aside className="hidden lg:flex lg:col-span-6 xl:col-span-6 relative flex-col justify-between p-8 xl:p-10 bg-[#02213d] text-white overflow-hidden h-full">

            {/* Radial Glowing Layer Shapes in Bottom Left */}
            <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] bg-gradient-to-tr from-blue-600/50 via-blue-500/30 to-transparent rounded-full blur-2xl pointer-events-none z-10" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-cyan-400/30 rounded-full blur-xl pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[250px] bg-blue-700/20 rounded-t-full blur-3xl pointer-events-none z-10" />

            {/* Slimmer Image Pushed to the Right */}
            <div className="absolute inset-y-0 right-0 w-[55%] h-full pointer-events-none select-none flex items-center justify-end">
              <img
                src={FrontdeskImage}
                alt=""
                className="w-full h-full object-cover object-right opacity-75"
              />
            </div>

            {/* Darker Gradient Overlays for High Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#02213d] via-[#02213d]/95 to-transparent w-[85%] z-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02213d]/95 via-transparent to-transparent z-20 pointer-events-none" />

            {/* Top Branding Group Aligned Left */}
            <div className="relative z-30 flex flex-col items-start gap-1">
              <div className="flex items-center -ml-2">
                <img
                  src={SwiftEntryLogo}
                  alt="SwiftEntry"
                  className="h-20 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-xs font-medium text-white/80 tracking-wide">
                Smarter Access. Safer Spaces.
              </p>
            </div>

            {/* Middle Headline & Feature List */}
            <div className="relative z-30 my-auto py-2 space-y-4 max-w-md">
              <div className="space-y-1.5">
                <h3 className="text-2xl xl:text-3xl font-extrabold tracking-tight leading-tight text-white">
                  Ready to Manage Guests with Ease?{" "}
                  <span className="text-blue-400 whitespace-nowrap">Let&apos;s Get You Started</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/85 font-normal leading-relaxed">
                  Secure, simple and efficient visitor management for your organization.
                </p>
              </div>

              {/* Feature Badges */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col justify-center space-y-0">
                    <h5 className="text-lg font-bold text-white leading-snug">Secure Access</h5>
                    <p className="text-xs text-white/75 leading-snug">Keep your premises safe</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col justify-center space-y-0">
                    <h5 className="text-lg font-bold text-white leading-snug">Easy Check-ins</h5>
                    <p className="text-xs text-white/75 leading-snug">For visitors, staff and contractors</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col justify-center space-y-0">
                    <h5 className="text-lg font-bold text-white leading-snug">Real-time Insights</h5>
                    <p className="text-xs text-white/75 leading-snug">Track and manage with ease</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="relative z-30 pt-3 border-t border-white/10 flex items-center gap-2.5 text-xs text-white/80">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Trusted by organizations across different industries.</span>
            </div>

          </aside>

          {/* RIGHT SIDE: Original Form Layout, Vertically Centered */}
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

              {/* Header Logo & Title Centered/Left Balanced */}
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
                    Sign In
                  </p>
                  <p className="text-xs text-[#7a8aa3] font-medium">
                    Access your SwiftEntry account to continue.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-center">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2">

                {/* Email Field */}
                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    Email *
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your company assigned email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    Password *
                  </label>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      required
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

                {/* Remember Me & Forgot Password Options */}
                <div className="flex flex-row items-center justify-between py-1 text-xs gap-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[#233653] font-medium select-none shrink-0 leading-none">
                    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="peer m-0 h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-[#1287ef] checked:bg-[#1287ef]"
                      />
                      <Check
                        className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                        strokeWidth={3}
                      />
                    </span>
                    <span className="whitespace-nowrap leading-none">Remember me</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[#087bde] hover:underline font-semibold no-underline whitespace-nowrap"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Semi-Rounded Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ borderRadius: '9999px' }}
                    className="w-full h-11 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold !rounded-full rounded-pill text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base font-light leading-none">→</span>
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>

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
      </main>
    </>
  );
}

export default SignIn;