import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../context/api";
import { toast } from "react-toastify";
import VisitorLayout from "../layout/VisitorLayout";
import { requestForToken, onMessageListener } from "../context/firebase";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import QRCode from "react-qr-code";
import Select from "react-select";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Printer,
  X,
  Loader2,
  ArrowRight,
  Search,
} from "lucide-react";

// Helper function to get current datetime in the format needed for the backend
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const fieldClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-2.5 text-sm sm:text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
const selectClass = `${fieldClass} cursor-pointer`;
const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";

export default function VisitorWalkInRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    visitor_type: "individual",
    name: "",
    contact_number: "",
    email: "",
    address: "",
    host_id: "",
    host_role: "",
    host_name: "",
    purpose: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [visitCode, setVisitCode] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    // Request permission and get the FCM token
    requestForToken()
      .then((fcmToken) => {
        if (fcmToken) {
          api
            .post("/self-service/save-fcm-token", { fcm_token: fcmToken })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Set up the listener for incoming messages
    onMessageListener((payload) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    // Fetch visit purposes
    api
      .get("/self-service/visits/purposes")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch(() => {});

    // Fetch hosts (app users)
    api
      .get("/self-service/visits/app-users")
      .then((response) => {
        if (response.data && Array.isArray(response.data.users)) {
          setAppUsers(response.data.users);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch hosts:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;

    if (name === "host_id") {
      const [role, id] = value.split("-");
      // Normalize role to snake_case for backend compatibility
      const backendRole = role.toLowerCase().replace(/\s+/g, "_");
      const selectedHostName = selectedOptions[0]?.text.trim();

      setFormData({
        ...formData,
        host_id: id,
        host_role: backendRole,
        host_name: selectedHostName,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleHostChange = (selectedOption) => {
    if (selectedOption) {
      const [role, id] = selectedOption.value.split("-");
      const backendRole = role.toLowerCase().replace(/\s+/g, "_");

      setFormData({
        ...formData,
        host_id: id,
        host_role: backendRole,
        host_name: selectedOption.label,
      });
    } else {
      setFormData({
        ...formData,
        host_id: "",
        host_role: "",
        host_name: "",
      });
    }
  };

  const hostOptions = appUsers.map((user) => ({
    value: `${user.role || "unknown"}-${user.id}`,
    label: user.name,
  }));

  const showValidationErrors = (error) => {
    if (error.response && error.response.status === 422) {
      let validationErrors = error.response.data.errors || error.response.data;

      if (typeof validationErrors === "string") {
        toast.error(validationErrors);
        return;
      }

      Object.values(validationErrors).forEach((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(msg));
        } else if (typeof messages === "string") {
          toast.error(messages);
        }
      });
    } else {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!executeRecaptcha) {
        toast.error("reCAPTCHA not ready. Please try again.");
        return;
      }

      setLoading(true);

      try {
        // Execute reCAPTCHA with action 'walk_in_register'
        const recaptchaToken = await executeRecaptcha("walk_in_register");

        if (!recaptchaToken) {
          toast.error("reCAPTCHA verification failed. Please try again.");
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();

        // Required fields from form
        formDataToSend.append("name", formData.name);
        formDataToSend.append("contact_number", formData.contact_number);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("purpose", formData.purpose);
        formDataToSend.append("visitor_type", formData.visitor_type);

        // Optional email - if not provided, backend will generate
        if (formData.email) {
          formDataToSend.append("email", formData.email);
        }

        // Host info (optional)
        if (formData.host_id) {
          formDataToSend.append("host_id", formData.host_id);
          formDataToSend.append("host_role", formData.host_role);
          formDataToSend.append("host_name", formData.host_name);
        }

        // Set defaults for fields not shown in form but required by backend
        formDataToSend.append("building", "building 1");
        formDataToSend.append("floor", "1st floor");
        formDataToSend.append("visit_time", getCurrentDateTime());

        // Append reCAPTCHA token
        formDataToSend.append("recaptcha_token", recaptchaToken);

        const response = await api.post(
          "/self-service/visits/walk-in-register",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          setVisitCode(response.data.visit_code);
          setVisitorName(formData.name); // Save name before clearing form
          setShowSuccessModal(true);
          setFormData({
            visitor_type: "individual",
            name: "",
            contact_number: "",
            email: "",
            address: "",
            host_id: "",
            host_role: "",
            host_name: "",
            purpose: "",
          });
          toast.success("Visit registered successfully!");
        }
      } catch (error) {
        showValidationErrors(error);
      } finally {
        setLoading(false);
      }
    },
    [executeRecaptcha, formData]
  );

  const handlePrintBadge = () => {
    const printContent = document.getElementById("print-visit-slip");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Visit Badge - ${visitCode}</title>
          <style>
            @page {
                size: 80mm 120mm; /* Standard badge size */
                margin: 0;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 10px;
                margin: 0;
                width: 80mm;
                height: 120mm;
                box-sizing: border-box;
            }
            .badge-container {
                border: 1px solid #ddd;
                padding: 15px 5px;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            h2 {
                color: #053561;
                margin: 0 0 10px 0;
                font-size: 18px;
                text-transform: uppercase;
                border-bottom: 2px solid #053561;
                padding-bottom: 5px;
                width: 90%;
            }
            .info { margin: 5px 0; font-size: 14px; }
            .code {
                font-size: 24px;
                font-weight: bold;
                color: #053561;
                margin: 10px 0;
                letter-spacing: 2px;
            }
            svg {
                margin: 10px auto;
                display: block;
                max-width: 100%;
                height: auto;
            }
            .footer {
                margin-top: 15px;
                font-size: 10px;
                color: #666;
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
            <h2>VISITOR PASS</h2>
            <div class="info"><strong>${visitorName}</strong></div>
            ${
              printContent.querySelector("svg")
                ? printContent.querySelector("svg").outerHTML
                : ""
            }
            <div class="code">${visitCode}</div>
            <div class="footer">Please wear this badge at all times</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const goToDashboard = () => {
    setShowSuccessModal(false);
    navigate("/visitor-dashboard");
  };

  return (
    <VisitorLayout>
      {/* Page Header */}
      <div className="text-center mb-5 sm:mb-7">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Register Your Visit
        </h1>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1 mb-0">
          Walk in and register your visit in a few quick steps.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 space-y-6 sm:space-y-8"
        >
          {/* SECTION 1: VISITOR INFORMATION */}
          <div>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-8 h-8 shrink-0">
                <User className="w-4 h-4" />
              </span>
              <h2 className="font-bold text-slate-800 text-sm tracking-tight mb-0">
                Visitor Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Individual or Group *</label>
                <select
                  className={selectClass}
                  name="visitor_type"
                  value={formData.visitor_type}
                  onChange={handleChange}
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  className={fieldClass}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Phone No. *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    className={`${fieldClass} pl-11`}
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    className={`${fieldClass} pl-11`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    className={`${fieldClass} pl-11`}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: VISIT DETAILS */}
          <div>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-8 h-8 shrink-0">
                <Building2 className="w-4 h-4" />
              </span>
              <h2 className="font-bold text-slate-800 text-sm tracking-tight mb-0">
                Visit Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Purpose of Visit *</label>
                <select
                  className={selectClass}
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select purpose</option>
                  {visitPurposes.map((purpose, index) => (
                    <option key={index} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Who Are You Meeting With?</label>
                <Select
                  id="host_id"
                  name="host_id"
                  options={hostOptions}
                  value={
                    hostOptions.find(
                      (option) =>
                        option.value ===
                        `${formData.host_role || ""}-${formData.host_id || ""}`
                    ) || null
                  }
                  onChange={handleHostChange}
                  placeholder="Search and select a host..."
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "48px",
                      borderRadius: "0.75rem",
                      borderColor: "#e2e8f0",
                      backgroundColor: "#f8fafc",
                      fontSize: "0.75rem",
                      boxShadow: "none",
                    }),
                    menu: (base) => ({
                      ...base,
                      fontSize: "0.75rem",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#f1f5f9" : "white",
                      color: "#0f172a",
                      cursor: "pointer",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#94a3b8",
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Check In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal — bottom sheet on mobile */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-xl border border-slate-100 max-h-[92dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 shrink-0">
              <h2 className="font-bold text-slate-900 text-base mb-0">
                Visit Registered Successfully!
              </h2>
              <button
                type="button"
                onClick={goToDashboard}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 overflow-y-auto grow">
              <div id="print-visit-slip" className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Your visit has been registered.
                </p>

                <p className="text-xs text-slate-600 mb-3">
                  <span className="font-bold text-slate-800">Visitor:</span>{" "}
                  {visitorName}
                </p>

                <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-xs inline-block">
                  <QRCode value={visitCode || ""} size={120} />
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Visit Code
                  </p>
                  <p className="text-lg font-extrabold text-[#053561] tracking-widest break-all mb-0">
                    {visitCode}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 mb-0">
                  Scan the QR code or use the visit code to check in/out.
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/60 border-t border-slate-100 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:pb-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handlePrintBadge}
                className="flex-1 py-3.5 sm:py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <Printer className="w-4 h-4" />
                Print Badge
              </button>
              <button
                type="button"
                onClick={goToDashboard}
                className="flex-1 py-3.5 sm:py-3 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </VisitorLayout>
  );
}
