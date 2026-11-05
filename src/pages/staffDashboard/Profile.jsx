import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../context/api";
import { toast } from "react-toastify";
import UserAvatar from "../../components/UserAvatar";
import StaffTopHeader from "./include/StaffTopHeader";

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's profile data
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/staff/profile");
      setProfileData(response.data);
      toast.success("Profile loaded successfully!");
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Error fetching profile data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logout successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F7FF]">
        <StaffTopHeader />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const details = [
    { label: "Name", value: profileData?.name, icon: "bi-person" },
    { label: "Company Email", value: profileData?.email, icon: "bi-envelope" },
    { label: "Position", value: profileData?.position, icon: "bi-briefcase" },
    { label: "Company", value: profileData?.company_name, icon: "bi-building" },
    { label: "Employee ID", value: profileData?.employee_id, icon: "bi-card-text" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-16">
      <StaffTopHeader />

      <div className="max-w-xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Profile
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Your account details and information.
          </p>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {/* Avatar and Badge */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100">
            <div className="mb-4">
              <UserAvatar
                image={profileData?.profile_picture}
                firstName={profileData?.name || "User"}
                size={100}
                className="rounded-full object-cover shadow-sm border-2 border-white"
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {profileData?.name || "Staff"}
            </h2>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs mt-1 border border-blue-100/60">
              <i className="bi bi-person-badge-fill me-1.5"></i>
              Staff
            </div>
          </div>

          {/* Information List */}
          <div className="py-6 space-y-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Information
            </span>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {details.map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <i className={`bi ${icon}`}></i>
                    </div>
                    <span className="font-semibold text-slate-600">{label}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Log Out Button */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer border border-rose-100"
            >
              <i className="bi bi-box-arrow-right text-sm"></i>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
