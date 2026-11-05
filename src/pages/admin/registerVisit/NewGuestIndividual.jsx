import { useRef, useState, useEffect } from "react";
import api from "../../../context/api";
import { requestForToken, onMessageListener } from "../../../context/firebase";
import QRCode from "react-qr-code";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { User, Phone, Mail, MapPin, Calendar, Clock, Building, Layers, FileText, ShieldAlert, PhoneCall, CheckCircle2, ArrowRight, X, Printer, Download, Share2 } from "lucide-react";

// Helper function to format date to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

export default function NewGuestIndividual() {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
    address: "",
    visit_time: "",
    host_name: "",
    building: "",
    floor: "",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [guestDetails, setGuestDetails] = useState({});
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [specialRequirements, setSpecialRequirements] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const printRef = useRef();

  // Get current logged-in user from localStorage or API
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  // useEffect to handle Firebase messaging and token registration, AND to fetch users.
  useEffect(() => {
    requestForToken()
      .then((fcmToken) => {
        if (fcmToken) {
          api.post("/save-fcm-token", { fcm_token: fcmToken }).catch(() => { });
        }
      })
      .catch(() => { });

    api
      .get("/admin/settings/visit-purposes")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch(() => { });

    api.get("/admin/settings/buildings").then((r) => { if (Array.isArray(r.data)) setBuildings(r.data); }).catch(() => { });
    api.get("/admin/settings/floors").then((r) => { if (Array.isArray(r.data)) setFloors(r.data); }).catch(() => { });
    api.get("/admin/settings/special-requirements").then((r) => { if (Array.isArray(r.data)) setSpecialRequirements(r.data); }).catch(() => { });

    const unsubscribe = onMessageListener((payload) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser && currentUser.id && currentUser.name) {
      setFormData((prev) => ({
        ...prev,
        host_id: currentUser.id,
        host_role: (currentUser.role || "admin").toLowerCase().replace(/\s+/g, '_'),
        host_name: currentUser.name,
      }));
    } else {
      console.error("No valid user found in localStorage");
      toast.error("Unable to set host. Please log in again.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
        "Something went wrong. Please try again."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.host_id || !formData.host_role || !formData.host_name) {
      toast.error("Host information is missing. Please refresh the page.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "visit_time" &&
        key !== "host_id" &&
        key !== "host_role" &&
        key !== "host_name"
      ) {
        formDataToSend.append(key, value);
      }
    });

    if (formData.visit_time) {
      const formattedVisitTime = formData.visit_time.replace("T", " ") + ":00";
      formDataToSend.append("visit_time", formattedVisitTime);
    }

    formDataToSend.append("host_id", formData.host_id);
    formDataToSend.append("host_role", formData.host_role);
    formDataToSend.append("host_name", formData.host_name);

    try {
      const response = await api.post(
        "/admin/register-individual-guest",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const visit = response.data.visit;
        const visitor = response.data.visitor;

        if (formData.host_id && formData.host_role) {
          try {
            await api.post("/admin/notify-admin-host", {
              host_id: formData.host_id,
              host_role: formData.host_role,
              guest_name: formData.name,
              purpose: formData.purpose,
            });
          } catch (notificationError) {
            console.error("Failed to notify host:", notificationError);
          }
        }

        let date = "";
        let time = "";

        if (visit?.visit_time) {
          try {
            const visitDateObj = new Date(visit.visit_time);
            date = formatDateToDDMMYYYY(visit.visit_time);
            time = visitDateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (e) {
            const visitTimeParts = visit.visit_time.split(" ");
            date = visitTimeParts[0] || "";
            time = visitTimeParts[1] ? visitTimeParts[1].slice(0, 8) : "";
          }
        }

        setGuestDetails({
          name: visitor.name,
          id: visit.code || "",
          host: visit.host_name,
          date,
          time,
          purpose: visit.purpose,
          Contact_info: visitor.contact_number,
          address: visitor.address,
        });

        if (visit.code) {
          const qrData = JSON.stringify({
            code: visit.code,
            id: visit.code,
            visit_id: visit.id,
            name: visitor.name,
            host: visit.host_name,
            date: date,
            time: time,
            purpose: visit.purpose
          });
          setQrValue(qrData);
        }

        setFormData({
          name: "",
          contact_number: "",
          email: "",
          address: "",
          visit_time: "",
          host_name: formData.host_name,
          host_id: formData.host_id,
          host_role: formData.host_role,
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          details: "",
        });
        toast.success("Individual visitor registered!");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowVisitCardModal(true);
        }, 2500);
      } else {
        toast.error("Unexpected error occurred");
      }
    } catch (error) {
      showValidationErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const element = printRef.current;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Visitor Badge</title>");
    printWindow.document.write(
      '<script src="https://cdn.tailwindcss.com"></script>'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write('<div class="p-5 flex justify-center">');
    printWindow.document.write(element.outerHTML);
    printWindow.document.write("</div>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const downloadBadgeAsPDF = () => {
    const element = printRef.current;
    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0.3,
          filename: "Visitor_Badge.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    }, 100);
  };

  return (
    <>
      <div className={`w-full mt-4 transition-all duration-300 ${showSuccessModal || showVisitCardModal ? "blur-sm" : ""}`}>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-100 space-y-8">

          {/* SECTION 1: PERSONAL INFORMATION */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-8 h-8 shrink-0">
                <User className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-0">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g. Amina Bello"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="contact_number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g. 0803 000 0000"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: VISIT DETAILS */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-8 h-8 shrink-0">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-0">Visit Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Time *</label>
                <input
                  type="datetime-local"
                  name="visit_time"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={formData.visit_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Host Name</label>
                <input
                  type="text"
                  name="host_name"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  value={formData.host_name}
                  readOnly
                  placeholder="Host automatically assigned"
                />
                <input type="hidden" name="host_id" value={formData.host_id} />
                <input type="hidden" name="host_role" value={formData.host_role} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Building</label>
                <select
                  name="building"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                  value={formData.building}
                  onChange={handleChange}
                >
                  <option value="">Select building...</option>
                  {buildings.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
                <select
                  name="floor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                  value={formData.floor}
                  onChange={handleChange}
                >
                  <option value="">Select floor...</option>
                  {floors.map((f, i) => (
                    <option key={i} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                <select
                  name="purpose"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                  value={formData.purpose}
                  onChange={handleChange}
                >
                  <option value="">Select purpose...</option>
                  {visitPurposes.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details (Optional)</label>
                <textarea
                  name="details"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  rows="3"
                  placeholder="Enter visit details"
                  value={formData.details}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* SECTION 3: ADDITIONAL INFORMATION */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-8 h-8 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-0">Additional Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requirements</label>
                <select
                  name="special_requirements"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                  value={formData.special_requirements}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {specialRequirements.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter emergency contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Clean Submit Button Container */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-2"
              disabled={loading}
            >
              <span>{loading ? "Registering..." : "Register Guest"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-emerald-600 text-white text-center rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-fade-in space-y-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h5 className="font-bold text-sm mb-0">Visitor Registered Successfully!</h5>
          </div>
        </div>
      )}

      {/* Visit Card Modal */}
      {showVisitCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in flex flex-col my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h5 className="font-bold text-slate-800 text-sm mb-0">Share Visit Details</h5>
              <button
                type="button"
                onClick={() => setShowVisitCardModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div
                ref={printRef}
                id="badgeCard"
                className="card mx-auto rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                style={{
                  maxWidth: "650px",
                  minHeight: "360px",
                  border: "2px solid #e2e8f0",
                  backgroundColor: "#F5FAFE",
                }}
              >
                <div className="flex justify-between items-center py-3 px-6 bg-blue-600 text-white">
                  <span className="px-2.5 py-1 bg-white text-blue-600 font-bold rounded-full text-[10px]">
                    Sydani Group
                  </span>
                  <strong className="text-white text-xs tracking-wider">VISITORS BADGE</strong>
                </div>
                <div className="p-6 flex justify-between items-center gap-4">
                  <div className="space-y-2 text-xs flex-1">
                    <h5 className="font-bold text-slate-900 text-base mb-3">{guestDetails.name}</h5>
                    <p className="text-slate-500 mb-0 flex justify-between">
                      <span>ID No:</span>
                      <strong className="text-slate-900">{guestDetails.id}</strong>
                    </p>
                    <p className="text-slate-500 mb-0 flex justify-between">
                      <span>Host:</span>
                      <strong className="text-slate-900">{guestDetails.host}</strong>
                    </p>
                    <p className="text-slate-500 mb-0 flex justify-between">
                      <span>Visit Date:</span>
                      <strong className="text-slate-900">{guestDetails.date} by {guestDetails.time}</strong>
                    </p>
                    <p className="text-slate-500 mb-0 flex justify-between">
                      <span>Purpose:</span>
                      <strong className="text-slate-900">{guestDetails.purpose}</strong>
                    </p>
                    <p className="text-slate-500 mb-0 flex justify-between">
                      <span>Contact Info:</span>
                      <strong className="text-slate-900">{guestDetails.Contact_info}</strong>
                    </p>
                  </div>
                  <div className="shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    {typeof qrValue === "string" && qrValue.length > 0 ? (
                      <QRCode value={qrValue} size={110} />
                    ) : (
                      <div className="text-slate-400 text-xs">QR not ready</div>
                    )}
                  </div>
                </div>
                <div className="bg-transparent border-t border-slate-200 px-6 py-3 text-slate-500 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{guestDetails.address}</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="text-center pt-2">
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-3">Share Visit Pass Via</p>
                <div className="flex justify-center flex-wrap gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`🎫 Visitor Badge – Sydani Group\n\nName: ${guestDetails.name}\nGuest Code: ${guestDetails.id}\nHost: ${guestDetails.host}\nVisit Date: ${guestDetails.date} at ${guestDetails.time}\nPurpose: ${guestDetails.purpose}\nContact: ${guestDetails.Contact_info}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 border border-slate-200 text-emerald-600 hover:bg-slate-50 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <button
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    onClick={handlePrint}
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    className="px-4 py-2 border border-slate-200 text-blue-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    onClick={downloadBadgeAsPDF}
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #badgeCard, #badgeCard * { visibility: visible; }
          #badgeCard { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}