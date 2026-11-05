import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../context/api";
import { Save, Loader2, LockKeyhole, Mail } from "lucide-react";

function SecuritySettings() {
  const [settings, setSettings] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get("security/settings");
        if (response.data) {
          setSettings({
            email: response.data.email || "",
            password: "",
            password_confirmation: "",
          });
        }
      } catch {
        toast.error("Failed to fetch settings");
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      settings.password &&
      settings.password !== settings.password_confirmation
    ) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: settings.email,
      };

      if (settings.password && settings.password_confirmation) {
        payload.password = settings.password;
        payload.password_confirmation = settings.password_confirmation;
      }

      await api.post("security/settings", payload);
      toast.success("Settings updated successfully");
      setSettings((prev) => ({
        ...prev,
        password: "",
        password_confirmation: "",
      }));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to update settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-2";

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Security Settings
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Manage your account email and password.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-0">
                Account Settings
              </h3>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-1 mb-0">
                Update your login credentials and password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    className={`${inputClass} pl-11`}
                    placeholder="Enter new email"
                    value={settings.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Change Password
                </label>
                <div className="relative">
                  <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="password"
                    className={`${inputClass} pl-11`}
                    placeholder="Enter new password"
                    value={settings.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password_confirmation" className={labelClass}>
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="password_confirmation"
                    className={`${inputClass} pl-11`}
                    placeholder="Confirm new password"
                    value={settings.password_confirmation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;
