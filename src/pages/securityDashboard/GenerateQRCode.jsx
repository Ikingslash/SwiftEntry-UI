import { useState } from "react";
import QRCode from "react-qr-code";
import { NavLink } from "react-router-dom";
import { QrCode, ArrowLeft, Mail } from "lucide-react";

function GenerateQRCode() {
  const [email, setEmail] = useState("");
  const [qrValue, setQrValue] = useState("");

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Generate QR Code
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Create a scannable code for a guest visit.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Input Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 mb-0">
                    Guest QR Code
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mb-0">
                    Enter the guest email to generate their code.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="guestEmail"
                  className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                  Guest Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="guestEmail"
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setQrValue(e.target.value ? `guest-${e.target.value}` : "");
                    }}
                  />
                </div>
              </div>

              <NavLink
                to="/security-dashboard"
                className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500 hover:text-blue-600 no-underline transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Guest Confirmation
              </NavLink>
            </div>
          </div>

          {/* QR Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8">
              <h5 className="font-bold text-slate-900 text-sm mb-4">Preview</h5>

              {qrValue ? (
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
                    <QRCode value={qrValue} size={180} />
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-4 mb-0 break-all">
                    {email}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-0">
                    Code: {qrValue}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center">
                  <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-[11px] text-slate-400 font-medium mb-0">
                    Enter an email to generate the QR code.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateQRCode;
