import api from "../../context/api";
import { useRef, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { requestForToken, onMessageListener } from "../../context/firebase";
import {
  Users,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  X,
  Printer,
  Download,
  Share2,
  MapPin,
} from "lucide-react";

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

const fieldClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
const selectClass = `${fieldClass} cursor-pointer`;
const labelClass = "block text-xs font-semibold text-slate-700 mb-1";

export default function RegisterNewGuestGroup() {
  const [formData, setFormData] = useState({
    group_leader_name: "",
    group_leader_contact: "",
    group_leader_email: "",
    organization_name: "",
    address: "",
    group_size: "",
    visit_time: "",
    host_name: "",
    host_id: "",
    host_role: "",
    building: "",
    floor: "",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    previsit_instruction: "",
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
  const [appUsers, setAppUsers] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const printRef = useRef();

  useEffect(() => {
    requestForToken()
      .then((fcmToken) => {
        if (fcmToken) {
          api.post("/save-fcm-token", { fcm_token: fcmToken }).catch(() => {});
        }
      })
      .catch(() => {});

    api
      .get("/frontdesk-app-users")
      .then((response) => {
        if (response.data && Array.isArray(response.data.users)) {
          setAppUsers(response.data.users);
        }
      })
      .catch(() => {});

    api
      .get("/security/settings/visit-purposes")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        }
      })
      .catch(() => {});

    api.get("/security/settings/buildings").then((r) => { if (Array.isArray(r.data)) setBuildings(r.data); }).catch(() => { });
    api.get("/security/settings/floors").then((r) => { if (Array.isArray(r.data)) setFloors(r.data); }).catch(() => { });
    api.get("/security/settings/special-requirements").then((r) => { if (Array.isArray(r.data)) setSpecialRequirements(r.data); }).catch(() => { });

    const unsubscribe = onMessageListener((payload) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (name === "host_id") {
      const [role, id] = value.split("-");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.host_id || !formData.host_role || !formData.host_name) {
      toast.error("Please select a host before registering the group.");
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
        "/security/guest/register-group",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const visit = response.data.visit;
        const visitor = response.data.visitor;

        if (formData.host_id && formData.host_role) {
          try {
            await api.post("/genereal-notify-host", {
              host_id: formData.host_id,
              host_role: formData.host_role,
              guest_name: formData.group_leader_name,
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
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          } catch {
            const visitTimeParts = visit.visit_time.split(" ");
            date = formatDateToDDMMYYYY(visitTimeParts[0] || "");
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
            purpose: visit.purpose,
            type: "group",
            group_size: visit.group_size,
          });
          setQrValue(qrData);
        }

        setFormData({
          group_leader_name: "",
          group_leader_contact: "",
          group_leader_email: "",
          organization_name: "",
          address: "",
          group_size: "",
          visit_time: "",
          host_name: formData.host_name,
          host_id: formData.host_id,
          host_role: formData.host_role,
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          previsit_instruction: "",
          details: "",
        });

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
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
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
    if (element) {
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
          .save()
          .catch((err) => {
            console.error("Error generating PDF:", err);
            toast.error("Failed to generate PDF. Please try again.");
          });
      }, 100);
    } else {
      toast.error("Error: Content for PDF not found.");
    }
  };

  return (
    <>
      <div className={`w-full mt-4 transition-all duration-300 ${showSuccessModal || showVisitCardModal ? "blur-sm" : ""}`}>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-100 space-y-8">

          {/* SECTION 1: GROUP LEADER & ORGANIZATION INFORMATION */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-8 h-8 shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-0">Group Leader & Organization Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Group Name / Leader Name *</label>
                <input
                  type="text"
                  name="group_leader_name"
                  className={fieldClass}
                  placeholder="Enter group leader's name"
                  value={formData.group_leader_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Group Contact Number *</label>
                <input
                  type="tel"
                  name="group_leader_contact"
                  className={fieldClass}
                  placeholder="Enter contact number"
                  value={formData.group_leader_contact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Group Email</label>
                <input
                  type="email"
                  name="group_leader_email"
                  className={fieldClass}
                  placeholder="Enter email"
                  value={formData.group_leader_email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClass}>Group Size</label>
                <select
                  name="group_size"
                  className={selectClass}
                  value={formData.group_size}
                  onChange={handleChange}
                >
                  <option value="">Select Group Size</option>
                  <option value="5">2 - 10</option>
                  <option value="10">10 - 20</option>
                  <option value="20">20 - 30</option>
                  <option value="30">30 Above</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Name of Organization</label>
                <input
                  type="text"
                  name="organization_name"
                  className={fieldClass}
                  placeholder="Enter organization name"
                  value={formData.organization_name}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address *</label>
                <input
                  type="text"
                  name="address"
                  className={fieldClass}
                  placeholder="Enter address"
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
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-0">Visit Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Visit Time *</label>
                <input
                  type="datetime-local"
                  name="visit_time"
                  className={fieldClass}
                  value={formData.visit_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Host Name *</label>
                <select
                  id="host_id"
                  name="host_id"
                  className={selectClass}
                  value={`${formData.host_role || ""}-${formData.host_id || ""}`}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a host</option>
                  {appUsers.map((user, index) => (
                    <option
                      key={`${user.role || "unknown"}-${user.id || index}`}
                      value={`${user.role}-${user.id}`}
                      data-role={user.role}
                      data-id={user.id}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Building</label>
                <select
                  name="building"
                  className={selectClass}
                  value={formData.building}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {buildings.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Floor</label>
                <select
                  name="floor"
                  className={selectClass}
                  value={formData.floor}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {floors.map((f, i) => (
                    <option key={i} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Purpose of Visit *</label>
                <select
                  name="purpose"
                  className={selectClass}
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Purpose</option>
                  {visitPurposes.map((purpose, index) => (
                    <option key={index} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Details (Optional)</label>
                <textarea
                  name="details"
                  className={`${fieldClass} resize-none`}
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
                <label className={labelClass}>Special Requirements (Optional)</label>
                <select
                  name="special_requirements"
                  className={selectClass}
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
                <label className={labelClass}>Emergency Contact (Optional)</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  className={fieldClass}
                  placeholder="Enter emergency contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Previsit Instruction (Optional)</label>
                <input
                  type="text"
                  name="previsit_instruction"
                  className={fieldClass}
                  placeholder="Enter any previsit instruction"
                  value={formData.previsit_instruction}
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
              <span>{loading ? "Registering..." : "Register"}</span>
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
            <h5 className="font-bold text-sm mb-0">Group Visitor Registered Successfully!</h5>
          </div>
        </div>
      )}

      {/* Visit Card Modal */}
      {showVisitCardModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in flex flex-col max-h-[92dvh] sm:my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h5 className="font-bold text-slate-800 text-sm mb-0">Share Visit Details</h5>
              <button
                type="button"
                onClick={() => setShowVisitCardModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto min-h-0">

              {/* Badge Card */}
              <div
                ref={printRef}
                id="badgeCard"
                className="card mx-auto rounded-2xl overflow-hidden shadow-md flex flex-col justify-between bg-white"
                style={{
                  maxWidth: "420px",
                  minHeight: "480px",
                  border: "1px solid #cbd5e1",
                }}
              >
                {/* Top Header Banner */}
                <div className="bg-[#02213d] text-white px-6 py-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-widest uppercase font-medium text-blue-300">Organization</span>
                    <span className="font-extrabold text-sm tracking-wide text-white">Sydani Group</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-600/40 border border-blue-400/30 text-white font-bold rounded-lg text-[10px] tracking-widest uppercase">
                    Group Pass
                  </span>
                </div>

                {/* Badge Body Content */}
                <div className="p-6 flex flex-col items-center text-center space-y-4 flex-1 justify-center">

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authorized Group Leader</span>
                    <h4 className="font-extrabold text-slate-900 text-xl tracking-tight">{guestDetails.name}</h4>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-xs my-1">
                    {typeof qrValue === "string" && qrValue.length > 0 ? (
                      <QRCode value={qrValue} size={110} level="H" />
                    ) : (
                      <div className="text-slate-400 text-xs">QR not ready</div>
                    )}
                  </div>

                  <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-left text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Badge / ID</span>
                      <strong className="text-slate-800 text-xs">{guestDetails.id}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Host</span>
                      <strong className="text-slate-800 text-xs truncate block">{guestDetails.host}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Date & Time</span>
                      <strong className="text-slate-800 text-[11px]">{guestDetails.date} ({guestDetails.time})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Purpose</span>
                      <strong className="text-slate-800 text-xs truncate block">{guestDetails.purpose}</strong>
                    </div>
                  </div>
                </div>

                {/* Badge Footer */}
                <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 text-slate-500 text-[11px] flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{guestDetails.address}</span>
                </div>
              </div>

              {/* Share & Export Buttons */}
              <div className="text-center pt-2">
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-3">Share Visit Pass Via</p>
                <div className="flex justify-center flex-wrap gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`🎫 Group Visitor Badge – Sydani Group\n\nGroup/Leader: ${guestDetails.name}\nGuest Code: ${guestDetails.id}\nHost: ${guestDetails.host}\nVisit Date: ${guestDetails.date} at ${guestDetails.time}\nPurpose: ${guestDetails.purpose}\nContact: ${guestDetails.Contact_info}`)}`}
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
