import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../context/api";
import { toast } from "react-toastify";
import UserAvatar from "../../components/UserAvatar";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  CreditCard,
  ShieldCheck,
  LogOut,
  Loader2,
} from "lucide-react";

export default function SecurityProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/security/user-profile");
      setProfileData(response.data);
      toast.success("Profile loaded successfully!");
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Error fetching profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logout successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F0F7FF] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
      </div>
    );
  }

  const details = [
    { label: "Name", value: profileData?.name, icon: User },
    { label: "Company Email", value: profileData?.email, icon: Mail },
    { label: "Position", value: profileData?.position, icon: Briefcase },
    { label: "Company", value: profileData?.company_name, icon: Building2 },
    { label: "Employee ID", value: profileData?.employee_id, icon: CreditCard },
  ];

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Profile
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Your account details and information.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-5 sm:p-8">
          {/* Avatar and Badge */}
          <div className="flex flex-col items-center text-center pb-6 sm:pb-8 border-b border-slate-100">
            <div className="mb-4">
              <UserAvatar
                image={profileData?.profile_picture}
                firstName={profileData?.name || "User"}
                size={96}
                className="rounded-full object-cover shadow-sm border-2 border-white"
              />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 break-words max-w-full">
              {profileData?.name || "Security"}
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] mt-1 border border-blue-100/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security
            </div>
          </div>

          {/* Information List */}
          <div className="py-5 sm:py-6 space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Information
            </span>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {details.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-600 truncate">
                      {label}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 text-right break-words min-w-0">
                    {value || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Log Out Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer border border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
