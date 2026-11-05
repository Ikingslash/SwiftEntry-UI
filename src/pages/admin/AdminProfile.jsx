import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../context/api";
import { toast } from 'react-toastify';
import UserAvatar from "../../components/UserAvatar";
import AdminTopHeader from "./include/AdminTopHeader";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's profile data
  const fetchProfileData = async () => {
    try {
      const response = await api.get("/admin/profile");
      setProfileData(response.data.profile);
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
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-16">
      <AdminTopHeader />

      <div className="max-w-xl mx-auto px-4 pt-6">
        {/* Top Header Navigation title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">Profile</h1>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          {/* Avatar and Badge */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100">
            <div className="mb-4">
              <UserAvatar
                image={profileData?.photo}
                firstName={profileData?.fullName || "Admin"}
                size={100}
                className="rounded-full object-cover shadow-sm border-2 border-white"
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">{profileData?.fullName || "Admin User"}</h2>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs mt-1 border border-blue-100/60">
              <i className="bi bi-person-badge-fill me-1.5"></i>
              Admin
            </div>
          </div>

          {/* Information List */}
          <div className="py-6 space-y-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Information</span>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between gap-3 p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-person"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Full Name</span>
                </div>
                <span className="font-semibold text-slate-900 truncate text-right max-w-[55%]">{profileData?.fullName}</span>
              </div>

              <div className="flex items-center justify-between gap-3 p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Email Address</span>
                </div>
                <span className="font-semibold text-slate-900 truncate text-right max-w-[55%]">{profileData?.email}</span>
              </div>

              <div className="flex items-center justify-between gap-3 p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-building"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Department</span>
                </div>
                <span className="font-semibold text-slate-900 truncate text-right max-w-[55%]">{profileData?.department || "General"}</span>
              </div>

              <div className="flex items-center justify-between gap-3 p-4 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <span className="font-semibold text-slate-600">Company</span>
                </div>
                <span className="font-semibold text-slate-900 truncate text-right max-w-[55%]">{profileData?.company_name || "N/A"}</span>
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