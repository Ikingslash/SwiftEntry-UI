import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import api from "../context/api";
import { toast } from "react-toastify";
import SwiftEntryLogo from "/pwa-512x512.svg";

const fieldClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelClass = "block text-xs font-semibold text-slate-700 mb-2";

function FrontdeskSetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
    email: "",
    token: "",
  });
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = decodeURIComponent(searchParams.get("email") || "");

    if (token && email) {
      // Set form data immediately
      setFormData((prev) => ({
        ...prev,
        token,
        email: email,
      }));

      // Try to validate token
      validateToken(token, email);
    } else {
      setCheckingToken(false);
      toast.error("Invalid setup link - missing parameters");
    }
  }, [searchParams]);

  const validateToken = async (token, email) => {
    try {
      // Try with different API endpoints
      const endpoints = [
        "/api/admin/frontdesk/validate-setup-token",
        "/admin/frontdesk/validate-setup-token",
        "/admin/frontdesk/validate-setup-token",
        "/api/admin/frontdesk/validate-setup-token",
        "/admin/frontdesk/validate-setup-token",
      ];

      let validResponse = null;

      for (const endpoint of endpoints) {
        try {
          const response = await api.post(endpoint, {
            token,
            email,
          });

          if (response.data && response.data.valid !== undefined) {
            validResponse = response;
            break;
          }
        } catch {
          continue;
        }
      }

      if (validResponse && validResponse.data.valid) {
        setValidToken(true);
        toast.success("Token validated successfully");
      } else {
        toast.error("Invalid or expired setup link");
      }
    } catch (error) {
      console.error("Token validation error:", error);

      // If validation fails, still allow user to try setting password
      // (backend will validate again during setup)
      setValidToken(true);
      toast.warning("Unable to validate token. You can still try to set password.");
    } finally {
      setCheckingToken(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!formData.token || !formData.email) {
      toast.error("Invalid setup link");
      return;
    }

    setLoading(true);

    try {
      // Use the correct endpoint
      const response = await api.post("/admin/frontdesk/setup-password", formData);

      if (response.data.success) {
        toast.success("Password set successfully! You can now login.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Setup password error:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        Object.values(errors).forEach((errArray) => {
          if (Array.isArray(errArray)) {
            errArray.forEach((err) => toast.error(err));
          } else {
            toast.error(errArray);
          }
        });
      } else if (error.response?.status === 404) {
        toast.error("Invalid setup link. The token may be incorrect or expired.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Setup link has expired");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-[100dvh] bg-[#F0F7FF] flex items-center justify-center px-4 font-sans">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-0">
            Validating your setup link...
          </p>
        </div>
      </div>
    );
  }

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
            Activate your SwiftEntry front desk account.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div
            className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-6 border ${
              validToken
                ? "bg-emerald-50 border-emerald-100"
                : "bg-amber-50 border-amber-100"
            }`}
          >
            {validToken ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p
                className={`text-[11px] mb-0 break-all ${
                  validToken ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                <strong className="font-bold">Email:</strong> {formData.email}
              </p>
              <p
                className={`text-[11px] mb-0 ${
                  validToken ? "text-emerald-700/80" : "text-amber-700/80"
                }`}
              >
                {validToken
                  ? "Link verified — you can set your password now."
                  : "We couldn't fully verify this link. Please proceed with caution."}
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
              disabled={loading || (formData.password && formData.password.length < 8)}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-3 border-0 cursor-pointer transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting Password...
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

export default FrontdeskSetupPassword;
