import { useState, useEffect } from "react";
import VisitorLayout from "../layout/VisitorLayout";
import UserAvatar from "../components/UserAvatar";
import api from "../context/api";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  CreditCard,
  Users,
  Loader2,
  UserCheck,
} from "lucide-react";

function VisitorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/self-service/profile");
      setProfile(response.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <VisitorLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      </VisitorLayout>
    );
  }

  const details = [
    { label: "Full Name", value: profile.name, icon: User },
    { label: "Email", value: profile.email, icon: Mail },
    { label: "Position", value: profile.position || "Not provided", icon: Briefcase },
    { label: "Company Name", value: profile.company_name || "Not provided", icon: Building2 },
    { label: "Employee ID", value: profile.employee_id || "Not provided", icon: CreditCard },
    { label: "Department", value: profile.department || "Not provided", icon: Users },
  ];

  return (
    <VisitorLayout>
      {/* Page Header */}
      <div className="max-w-xl mx-auto mb-5 sm:mb-7">
        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Your Profile
        </h1>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1 mb-0">
          Your account details and information.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-5 sm:p-8">
          {/* Avatar and Badge */}
          <div className="flex flex-col items-center text-center pb-6 sm:pb-8 border-b border-slate-100">
            <div className="mb-4">
              <UserAvatar
                image={profile.profile_picture}
                firstName={profile.name || "Visitor"}
                size={96}
                className="rounded-full object-cover shadow-sm border-2 border-white"
              />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 break-words max-w-full">
              {profile.name || "Visitor"}
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] mt-1 border border-blue-100/60">
              <UserCheck className="w-3.5 h-3.5" />
              Visitor
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
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VisitorLayout>
  );
}

export default VisitorProfile;
