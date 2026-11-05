import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, isValid, parseISO } from "date-fns";
import { SlidersHorizontal, Download, Clock, Users, CheckCircle2, LogOut, X, Loader2 } from "lucide-react";
import UserAvatar from "../../../components/UserAvatar";
import AdminTopHeader from "../include/AdminTopHeader";
import api from "../../../context/api";
import { toast } from "react-toastify";

function AnalyticalAndReport() {
  const [analyticsData, setAnalyticsData] = useState({
    visits_chart_data: [],
    total_visitors_today: 0,
    checked_in_today: 0,
    checked_out_today: 0,
    avg_visit_duration: "0 min",
    most_visited_staff: [],
    peak_visitor_hours: [],
    visitor_types: [],
    purpose_of_visit: [],
    most_frequent_visitors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    timePeriod: 'daily', // 'daily', 'weekly', 'monthly'
    vip: false,
    blacklist: false,
    walkins: false,
    preregistered: false,
  });
  // The modal edits a draft; nothing is fetched until "Apply Filters".
  const [draftFilters, setDraftFilters] = useState(activeFilters);

  const COLORS = ["#1287ef", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#8884d8", "#82ca9d", "#ffc658"];

  useEffect(() => {
    fetchAnalyticsData();
  }, [activeFilters]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('filter', activeFilters.timePeriod);
      if (activeFilters.vip) queryParams.append('vip', true);
      if (activeFilters.blacklist) queryParams.append('blacklist', true);
      if (activeFilters.walkins) queryParams.append('walkins', true);
      if (activeFilters.preregistered) queryParams.append('preregistered', true);

      const response = await api.get(`/admin/analytics?${queryParams.toString()}`);

      let calculatedDuration = "0 min";
      const visits = response.data.completed_visits || response.data.visits || [];
      if (visits.length > 0) {
        let totalMins = 0;
        let count = 0;
        visits.forEach((v) => {
          const checkOut = v.check_out || v.checkout_time;
          const checkIn = v.check_in || v.checkin_time || v.visit_time;
          if (checkIn && checkOut) {
            const diff = new Date(checkOut) - new Date(checkIn);
            if (diff > 0) {
              totalMins += diff / (1000 * 60);
              count++;
            }
          }
        });
        if (count > 0) {
          const avg = Math.round(totalMins / count);
          if (avg >= 60) {
            const hrs = Math.floor(avg / 60);
            const rem = avg % 60;
            calculatedDuration = rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
          } else {
            calculatedDuration = `${avg} min`;
          }
        }
      } else if (response.data.avg_visit_duration) {
        calculatedDuration = response.data.avg_visit_duration;
      } else if (Number(response.data.avg_visit_duration_minutes) > 0) {
        const mins = Math.round(Number(response.data.avg_visit_duration_minutes));
        calculatedDuration =
          mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}` : `${mins} min`;
      }

      setAnalyticsData({
        ...response.data,
        avg_visit_duration: calculatedDuration,
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err.response?.data || err.message);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("format", exportFormat);
      queryParams.append("filter", activeFilters.timePeriod || "daily");

      if (activeFilters.vip) queryParams.append("vip", "true");
      if (activeFilters.blacklist) queryParams.append("blacklist", "true");
      if (activeFilters.walkins) queryParams.append("walkins", "true");
      if (activeFilters.preregistered) queryParams.append("preregistered", "true");

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again.");
        setIsExporting(false);
        return;
      }

      const response = await api.get(`/admin/analytics/export?${queryParams.toString()}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf, text/csv'
        }
      });

      // Name the file after what the server actually sent, not what was asked
      // for (e.g. the demo API can only produce CSV).
      const contentType = String(response.headers?.["content-type"] || "");
      const extension = /csv/i.test(contentType)
        ? "csv"
        : /pdf/i.test(contentType)
          ? "pdf"
          : /spreadsheet|excel/i.test(contentType)
            ? "xlsx"
            : { pdf: "pdf", csv: "csv", excel: "xlsx" }[exportFormat] || exportFormat;
      const requestedExtension = { pdf: "pdf", csv: "csv", excel: "xlsx" }[exportFormat];
      if (extension !== requestedExtension) {
        toast.info(`This server only provides ${extension.toUpperCase()} exports, so a .${extension} file was downloaded.`);
      }

      let filename = `analytics_report_${format(new Date(), "yyyy-MM-dd")}.${extension}`;
      const blob = new Blob([response.data], {
        type: contentType || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success(`Report exported successfully as ${extension.toUpperCase()}!`);
    } catch (err) {
      console.error("Error exporting report:", err);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "timePeriod") {
      setDraftFilters((prev) => ({ ...prev, timePeriod: value }));
    } else {
      setDraftFilters((prev) => ({
        ...prev,
        [filterType]: !prev[filterType]
      }));
    }
  };

  const openFilterModal = () => {
    setDraftFilters(activeFilters);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    // The effect on `activeFilters` performs the fetch.
    setActiveFilters(draftFilters);
    setShowFilterModal(false);
  };

  const chartDateLabel = (value) => {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    if (!isValid(d)) return String(value ?? "");
    return activeFilters.timePeriod === "monthly" ? format(d, "MMM yyyy") : format(d, "MMM d");
  };

  const pieLabel = ({ percent }) => (percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : "");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] font-sans">
        <AdminTopHeader />
        <div className="flex items-center justify-center py-24">
          <p className="text-slate-500 text-xs font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] font-sans">
        <AdminTopHeader />
        <div className="flex items-center justify-center py-24">
          <p className="text-rose-600 text-xs font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-16 font-sans">
      <AdminTopHeader />

      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Analytical Reports
          </p>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            Monitor visitor metrics, peak hours, and facility usage ({activeFilters.timePeriod}).
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            onClick={openFilterModal}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* 4-Card Dashboard Metrics Grid (Exact Style Match) */}
      <div className="max-w-[1140px] mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Visitors */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Total Visitors</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-0">{analyticsData.total_visitors_today ?? 0}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Checked In */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Checked In</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mb-0">{analyticsData.checked_in_today ?? 0}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Checked Out */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Checked Out</p>
              <h3 className="text-2xl font-extrabold text-cyan-600 mb-0">{analyticsData.checked_out_today ?? 0}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
          </div>

          {/* Average Visit Duration */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">Avg Visit Duration</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mb-0">{analyticsData.avg_visit_duration || "0 min"}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

        </div>
      </div>

      {/* Bento Grid Layout Section */}
      <div className="max-w-[1140px] mx-auto px-4 mt-8 space-y-6">

        {/* ROW 1: Full-Width Visitor Traffic Bento Box */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
          <h5 className="font-bold text-slate-900 text-sm mb-0">Visitor Traffic Over Time</h5>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(analyticsData.visits_chart_data || []).map((d) => ({
                  ...d,
                  date: chartDateLabel(d.date),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="visitors_count"
                  stroke="#1287ef"
                  strokeWidth={2.5}
                  name="Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 2: Two Columns Bento Grid (Visitor Types & Purpose of Visit) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Visitor Type Distribution */}
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
            <h5 className="font-bold text-slate-900 text-sm mb-0">Visitor Type Distribution</h5>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.visitor_types}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    dataKey="count"
                    nameKey="visitor_type"
                    label={pieLabel}
                    labelLine={false}
                  >
                    {analyticsData.visitor_types.map((entry, index) => (
                      <Cell key={`cell-visitor-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Purpose of Visit Analysis */}
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
            <h5 className="font-bold text-slate-900 text-sm mb-0">Purpose of Visit Analysis</h5>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.purpose_of_visit}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    dataKey="count"
                    nameKey="purpose"
                    label={pieLabel}
                    labelLine={false}
                  >
                    {analyticsData.purpose_of_visit.map((entry, index) => (
                      <Cell key={`cell-purpose-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ROW 3: Two Columns Bento Grid (Peak Hours & Most Visited Staff) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Peak Visitors Hour */}
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
            <h5 className="font-bold text-slate-900 text-sm mb-0">Peak Visitors Hour</h5>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.peak_visitor_hours.map((d) => ({
                    ...d,
                    hour: `${d.hour}:00`,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#FF8042"
                    strokeWidth={3}
                    name="Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Visited Staff */}
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
            <h5 className="font-bold text-slate-900 text-sm mb-0">Most Visited Staff</h5>
            {analyticsData.most_visited_staff.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium text-center py-12">No data for most visited staff.</p>
            ) : (
              <div className="space-y-3">
                {analyticsData.most_visited_staff.map((staff, index) => (
                  <div key={`staff-${index}`} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{staff.name}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-full shadow-2xs">
                      {staff.visits_count} visits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ROW 4: Most Frequent Visitors Bento Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
          <h5 className="font-bold text-slate-900 text-sm mb-0">Most Frequent Visitors</h5>
          {analyticsData.most_frequent_visitors.length === 0 ? (
            <p className="text-slate-400 text-xs font-medium text-center py-8">No data for most frequent visitors.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.most_frequent_visitors.map((visitor, index) => (
                <div key={`frequent-visitor-${index}`} className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
                  <UserAvatar
                    image={visitor.visitor_photo}
                    firstName={visitor.visitor_name || "Visitor"}
                    size={56}
                    className="rounded-full shrink-0"
                  />
                  <div>
                    <h6 className="font-bold text-slate-900 text-xs mb-0.5 truncate max-w-[180px]">{visitor.visitor_name}</h6>
                    <span className="text-[10px] text-slate-500 font-medium">Last visit: {visitor.last_visit || 'Recent'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold text-[10px] rounded-full">
                    {visitor.count} Visits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 font-sans">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100 space-y-4 max-h-[92dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-base mb-0">Export Report</h5>
              <button
                type="button"
                onClick={() => !isExporting && setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === "pdf"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={isExporting}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-900">PDF Document (.pdf)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={isExporting}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-900">CSV Spreadsheet (.csv)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={isExporting}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-900">Excel Workbook (.xlsx)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer border-0"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2.5 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isExporting ? "Exporting..." : "Export"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Options Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 font-sans">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100 space-y-4 max-h-[92dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-base mb-0">Apply Filters</h5>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Time Period</label>
                <div className="grid grid-cols-3 gap-2">
                  {["daily", "weekly", "monthly"].map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${draftFilters.timePeriod === period
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      onClick={() => handleFilterChange("timePeriod", period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Visitor Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "vip", label: "VIP" },
                    { key: "blacklist", label: "Blacklist" },
                    { key: "walkins", label: "Walk-ins" },
                    { key: "preregistered", label: "Pre-Registered" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${draftFilters[filter.key]
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      onClick={() => handleFilterChange(filter.key)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer border-0"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2.5 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 cursor-pointer border-0"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticalAndReport;