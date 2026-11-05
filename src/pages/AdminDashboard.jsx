import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../context/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Users, CheckCircle2, LogOut, Clock } from "lucide-react";
import UserAvatar from "../components/UserAvatar";
import AdminTopHeader from "./admin/include/AdminTopHeader";

function SecurityFrontDeskDashboard() {
  const { user, token } = useAuth();

  const [view, setView] = useState("daily"); // Default view: daily
  const [visitsChartData, setVisitsChartData] = useState([]); // Data for the line chart
  const [totalVisitorsToday, setTotalVisitorsToday] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(0);
  const [checkedOutToday, setCheckedOutToday] = useState(0);
  const [pendingToday, setPendingToday] = useState(0);
  const [avgVisitDuration, setAvgVisitDuration] = useState("0 min");
  const [loading, setLoading] = useState(false);

  const [priorityAlerts, setPriorityAlerts] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [updatesLoading, setUpdatesLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) {
        console.log("No token available, skipping analytics fetch.");
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/admin/analytics?filter=${view}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Map the visits_chart_data to match recharts' expected dataKey 'visitors'
        const formattedChartData =
          (response.data.visits_chart_data || []).map((item) => ({
            date: item.date,
            visitors: item.visitors_count,
          })) || [];
        setVisitsChartData(formattedChartData);

        setTotalVisitorsToday(response.data.total_visitors_today);
        setCheckedInToday(response.data.checked_in_today);
        setCheckedOutToday(response.data.checked_out_today);
        setPendingToday(response.data.pending_today);

        // Compute average visit duration for today (daily)
        try {
          let visits = [];
          try {
            const res = await api.get(`/admin/visits?status=completed&limit=1000`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            visits = res.data.visits || res.data.data || res.data || [];
          } catch { }
          if ((!visits || visits.length === 0)) {
            try {
              const res = await api.get(`/front-desk/visits/completed?per_page=1000`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              visits = res.data.visits || res.data.data || [];
            } catch { }
          }
          if (visits && visits.length > 0) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            let totalMins = 0;
            let count = 0;
            visits.forEach((v) => {
              const checkOut = v.check_out || v.checkout_time || v.departure_time;
              const checkIn = v.check_in || v.checkin_time || v.arrival_time || v.visit_time;
              if (checkIn && checkOut) {
                const outDate = new Date(checkOut);
                if (outDate >= startOfDay) {
                  const diff = outDate - new Date(checkIn);
                  if (diff > 0) {
                    totalMins += diff / (1000 * 60);
                    count++;
                  }
                }
              }
            });
            if (count > 0) {
              const avg = Math.round(totalMins / count);
              if (avg >= 60) {
                const hrs = Math.floor(avg / 60);
                const rem = avg % 60;
                setAvgVisitDuration(rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`);
              } else {
                setAvgVisitDuration(`${avg} min`);
              }
            } else {
              setAvgVisitDuration("0 min");
            }
          } else {
            setAvgVisitDuration("0 min");
          }
        } catch (e) {
          setAvgVisitDuration("0 min");
        }

        // Compute average visit duration if data available
        if (response.data.avg_visit_duration_minutes != null) {
          const mins = Math.round(response.data.avg_visit_duration_minutes);
          if (mins <= 0) {
            setAvgVisitDuration("0 min");
          } else if (mins >= 60) {
            const hrs = Math.floor(mins / 60);
            const rem = mins % 60;
            setAvgVisitDuration(rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`);
          } else {
            setAvgVisitDuration(`${mins} min`);
          }
        } else if (response.data.avg_visit_duration) {
          setAvgVisitDuration(response.data.avg_visit_duration);
        } else if (response.data.average_visit_duration) {
          setAvgVisitDuration(response.data.average_visit_duration);
        } else if (response.data.completed_visits && response.data.completed_visits.length > 0) {
          let totalMins = 0;
          let count = 0;
          response.data.completed_visits.forEach((v) => {
            if (v.check_in && v.check_out) {
              const diff = new Date(v.check_out) - new Date(v.check_in);
              if (diff > 0) {
                totalMins += diff / (1000 * 60);
                count++;
              }
            }
          });
          if (count > 0) {
            const avg = Math.round(totalMins / count);
            if (avg <= 0) {
              setAvgVisitDuration("0 min");
            } else if (avg >= 60) {
              const hrs = Math.floor(avg / 60);
              const rem = avg % 60;
              setAvgVisitDuration(rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`);
            } else {
              setAvgVisitDuration(`${avg} min`);
            }
          } else {
            setAvgVisitDuration("0 min");
          }
        } else {
          setAvgVisitDuration("0 min");
        }
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error.response?.data || error.message
        );
        setVisitsChartData([]);
        setTotalVisitorsToday(0);
        setCheckedInToday(0);
        setCheckedOutToday(0);
        setPendingToday(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [view, token]);

  // Fetch small set of priority alerts (top 3) for the dashboard
  useEffect(() => {
    const fetchPriorityAlerts = async () => {
      if (!token) return;
      setAlertsLoading(true);
      try {
        const response = await api.get("/admin/alerts/priority/quick", {
          params: { top: 3 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPriorityAlerts(response.data.alerts || []);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        toast.error("Failed to load priority alerts.");
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchPriorityAlerts();
  }, [token]);

  // Fetch latest visitors (small list for dashboard)
  useEffect(() => {
    const fetchLatestUpdates = async () => {
      if (!token) return;
      setUpdatesLoading(true);
      try {
        const response = await api.get("/admin/updates/latest", {
          params: { per_page: 3 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setLatestUpdates(response.data.visitors || []);
      } catch (error) {
        console.error("Failed to fetch latest visitors:", error);
        toast.error("Failed to load latest updates.");
      } finally {
        setUpdatesLoading(false);
      }
    };
    fetchLatestUpdates();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <AdminTopHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">

        {/* WELCOME BACK HEADING */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-0">
            Welcome Back, {user?.name || "David Ayodele"}
          </h1>
        </div>

        {/* METRIC CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1 */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Visitors Today</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-0">{totalVisitorsToday}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Checked In</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mb-0">{checkedInToday}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Checked Out</p>
              <h3 className="text-2xl font-extrabold text-cyan-600 mb-0">{checkedOutToday}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Avg Visit Duration</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mb-0">{avgVisitDuration}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* VISITORS ANALYTICS CHART SECTION */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-0">Visitors Analytics</h3>
            <select
              className="appearance-none bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 py-2 pl-4 pr-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-no-repeat bg-[right_0.8rem_center] bg-[length:12px_12px]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-16 text-xs">Loading chart data...</div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitsChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* LATEST UPDATES TABLE SECTION */}
        <section id="notifications" className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-0">Vistors Update Log</h3>
            <Link to="/admin-dashboard/updates" className="text-blue-600 hover:text-blue-700 no-underline font-semibold text-xs transition-colors">
              See all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-black text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-4">Icon</th>
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {updatesLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center text-black py-6">Loading updates...</td>
                  </tr>
                ) : latestUpdates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-black py-6">No recent visitors</td>
                  </tr>
                ) : (
                  latestUpdates.map((u, idx) => {
                    const dateObj = new Date(u.created_at);
                    const dateStr = dateObj.toLocaleDateString();
                    const timeStr = dateObj.toLocaleTimeString();
                    return (
                      <tr key={u.id ?? idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <UserAvatar
                              image={u.photo}
                              firstName={u.name || "Visitor"}
                              size={34}
                              className="rounded-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-black">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-black font-medium">
                          {dateStr}
                        </td>
                        <td className="py-3 px-4 text-black font-medium">
                          {timeStr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

export default SecurityFrontDeskDashboard;