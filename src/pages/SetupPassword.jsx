import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import api from "../context/api";
import { toast } from "react-toastify";
import SwiftEntryLogo from "/pwa-512x512.svg";

const fieldClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelClass = "block text-xs font-semibold text-slate-700 mb-2";

function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
    email: "",
    token: "",
  });
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("checking"); // "checking" | "valid" | "invalid" | "expired"
  const [tokenMessage, setTokenMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = decodeURIComponent(searchParams.get("email") || "");

    if (!token || !email) {
      setTokenStatus("invalid");
      setTokenMessage("Setup link is missing required parameters.");
      return;
    }

    setFormData((prev) => ({ ...prev, token, email }));
    validateToken(token, email);
  }, [searchParams]);

  const validateToken = async (token, email) => {
    try {
      const response = await api.post("/admin/staff/validate-setup-token", { token, email });
      if (response.data?.valid) {
        setTokenStatus("valid");
      } else {
        setTokenStatus("invalid");
        setTokenMessage(response.data?.message || "This setup link is no longer valid.");
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        setTokenStatus("expired");
        setTokenMessage(message || "This setup link has expired.");
      } else if (status === 404) {
        setTokenStatus("invalid");
        setTokenMessage(message || "This setup link is invalid or has already been used.");
      } else {
        // Network / unknown error – allow user to try anyway
        setTokenStatus("valid");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/admin/staff/setup-password", formData);
      if (response.data.success) {
        toast.success("Password set successfully! Redirecting to login…");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 422) {
        const errors = error.response.data.errors || {};
        Object.values(errors).forEach((errArray) =>
          (Array.isArray(errArray) ? errArray : [errArray]).forEach((e) => toast.error(e))
        );
      } else if (status === 400 || status === 404) {
        // Token is invalid / already used / expired
        setTokenStatus("invalid");
        setTokenMessage(
          message ||
          "This setup link has already been used or is no longer valid. Please ask your administrator to resend a new setup link."
        );
        toast.error("Setup link is no longer valid.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state ── */
  if (tokenStatus === "checking") {
    return (
      <div className="min-h-[100dvh] bg-[#F0F7FF] flex items-center justify-center px-4 font-sans">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-0">
            Validating your setup link…
          </p>
        </div>
      </div>
    );
  }

  /* ── Invalid / expired token state ── */
  if (tokenStatus === "invalid" || tokenStatus === "expired") {
    const isExpired = tokenStatus === "expired";
    return (
      <div className="min-h-[100dvh] bg-[#F0F7FF] flex items-center justify-center px-4 py-10 font-sans">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                isExpired ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
              }`}
            >
              {isExpired ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <h1 className="text-lg font-bold text-slate-900 text-center mb-1">
              {isExpired ? "Setup Link Expired" : "Invalid Setup Link"}
            </h1>
            <p className="text-slate-500 text-xs text-center mb-6">
              {tokenMessage ||
                "This setup link has already been used or has expired. Each setup link can only be used once."}
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left">
              <p className="text-xs font-bold text-blue-900 mb-2">What to do next:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800/90 mb-0">
                <li>Contact your administrator</li>
                <li>
                  Ask them to resend a new setup link to{" "}
                  <strong className="font-bold break-all">{formData.email}</strong>
                </li>
                <li>Check your email for a new invitation</li>
              </ol>
            </div>

            <a
              href="/"
              className="mt-6 w-full inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl px-4 py-3 no-underline transition-colors"
            >
              Go to Login
            </a>

            <p className="text-slate-400 text-[11px] text-center mt-4 mb-0">
              Already set your password? Sign in with your email and password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Valid token – show form ── */
  const passwordsMismatch =
    formData.password &&
    formData.password_confirmation &&
    formData.password !== formData.password_confirmation;

  return (
    <div className="min-h-[100dvh] bg-[#F0F7FF] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img
            src={SwiftEntryLogo}
            alt="SwiftEntry Logo"
            className="h-12 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mb-1">
            Set Your Password
          </h1>
          <p className="text-slate-500 text-xs mb-0">
            Activate your SwiftEntry account to get started.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] text-emerald-800 mb-0 break-all">
                <strong className="font-bold">Email:</strong> {formData.email}
              </p>
              <p className="text-[11px] text-emerald-700/80 mb-0">
                Link verified — you can set your password now.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={fieldClass}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                minLength="8"
              />
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                className={fieldClass}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                minLength="8"
              />
              {passwordsMismatch && (
                <p className="text-rose-600 text-[11px] mt-2 mb-0">
                  Passwords do not match
                </p>
              )}
            </div>

            <p className="text-slate-400 text-[11px] mb-0 flex items-start gap-1.5">
              <LockKeyhole className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Use at least 8 characters. A mix of letters, numbers, and symbols is
              recommended.
            </p>

            <button
              type="submit"
              disabled={loading || formData.password.length < 8}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-3 border-0 cursor-pointer transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting Password…
                </>
              ) : (
                "Set Password"
              )}
            </button>
          </form>

          <p className="text-slate-400 text-[11px] text-center mt-6 mb-0">
            Having issues? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SetupPassword;
