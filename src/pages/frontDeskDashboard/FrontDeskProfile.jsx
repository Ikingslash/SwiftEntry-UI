import { useEffect, useState } from "react";
import api from "../../context/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import FrontDeskTopHeader from "./include/FrontDeskTopHeader";

function FrontDeskProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's profile data
  const fetchProfileData = async () => {
    setLoading(true);

    try {
      const response = await api.get("front-desk/profile");
      setProfileData(response.data);
      toast.success("Profile loaded successfully!");
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data. Please try again.");
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
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f7fc] flex items-center justify-center">
        <FrontDeskTopHeader />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7fc] pb-16">
      <FrontDeskTopHeader />
      <div className="max-w-xl mx-auto px-4 pt-6">
        {/* Top Header Navigation title */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <i className="bi bi-chevron-left text-sm"></i>
          </button>
          <h1 className="text-base font-bold text-slate-900 mb-0">Profile</h1>
          <div className="w-10"></div> {/* Spacer for symmetry */}
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

            <h2 className="text-lg font-bold text-slate-900 mb-1">{profileData?.name || "Front Desk"}</h2>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs mt-1 border border-blue-100/60">
              <i className="bi bi-person-badge-fill me-1.5"></i>
              Front Desk
            </div>
          </div>

          {/* Information List */}
          <div className="py-6 space-y-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Information</span>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-person"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Name</span>
                </div>
                <span className="font-semibold text-slate-900">{profileData?.name}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Company Email</span>
                </div>
                <span className="font-semibold text-slate-900">{profileData?.email}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Position</span>
                </div>
                <span className="font-semibold text-slate-900">{profileData?.position}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-building"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Company</span>
                </div>
                <span className="font-semibold text-slate-900">{profileData?.company_name}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-card-text"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Employee ID</span>
                </div>
                <span className="font-semibold text-slate-900">{profileData?.employee_id}</span>
              </div>
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

export default FrontDeskProfile;
