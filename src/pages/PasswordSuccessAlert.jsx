import { CheckCircle2 } from "lucide-react";
import SwiftEntryLogo from "/pwa-512x512.svg";

function PasswordSuccessAlert() {
  return (
    <div className="min-h-[100dvh] bg-[#F5FAFE] flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
        <img
          src={SwiftEntryLogo}
          alt="SwiftEntry"
          className="h-12 w-auto object-contain mx-auto mb-5"
        />
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-bold text-emerald-600 mb-1">SUCCESS!</h1>
        <p className="text-slate-500 text-xs mb-6">
          Password has been successfully set. You can now sign in to your account.
        </p>
        <a
          href="/"
          className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-4 py-3 no-underline transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

export default PasswordSuccessAlert;
