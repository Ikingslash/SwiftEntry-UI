import { useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  MailCheck,
  Upload,
  X,
} from "lucide-react";

function BulkUploadModal({ isOpen, onClose, userType, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [fileError, setFileError] = useState("");
  const [onboardingStats, setOnboardingStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validFormats = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validFormats.includes(selectedFile.type)) {
      setFileError("Invalid file format. Please upload CSV or Excel (.xlsx) file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > maxSize) {
      setFileError("File size exceeds 5MB limit.");
      setFile(null);
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(`/admin/users/bulk-template/${userType}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bulk_users_template_${userType}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Template downloaded successfully");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setFileError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_type", userType);

      const response = await api.post(
        `/admin/users/bulk-upload/${userType}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentage);
          },
        }
      );

      if (response.data.success) {
        setResults(response.data);
        toast.success(response.data.message);

        // Fetch live onboarding stats to show actual email delivery status
        setLoadingStats(true);
        try {
          const statsRes = await api.get(`/admin/users/onboarding-stats?user_type=${userType}`);
          setOnboardingStats(statsRes.data);
        } catch (statsErr) {
          console.warn("Could not load onboarding stats:", statsErr.message);
        } finally {
          setLoadingStats(false);
        }

        if (onSuccess) {
          setTimeout(onSuccess, 4000);
        }
      }
    } catch (error) {
      // Handle 422 validation errors specially
      if (error.response?.status === 422 && error.response?.data) {
        const data = error.response.data;
        // Show as results even if failed
        if (data.errors && data.summary) {
          setResults(data);
          toast.warning(data.message || "Some users could not be created");
        } else {
          const errorMsg = data.message || data.error || "Upload failed";
          toast.error(errorMsg);
        }
      } else {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Upload failed";
        toast.error(errorMsg);
      }
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setFile(null);
    setResults(null);
    setFileError("");
    setUploadProgress(0);
    setOnboardingStats(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={uploading ? undefined : handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              Bulk Upload Users
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-0">
              Import multiple {userType} accounts from a spreadsheet.
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5">
          {!results ? (
            <>
              {/* Template Download */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Need help?
                  </p>
                  <p className="text-[11px] text-blue-700/80 mb-0">
                    Download a sample template to see the required format.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/60 text-xs font-bold cursor-pointer transition-colors shrink-0"
                  onClick={downloadTemplate}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Template
                </button>
              </div>

              {/* File Upload Form */}
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select CSV/Excel File *
                  </label>
                  <label
                    htmlFor="bulk-upload-file"
                    className={`flex items-center gap-3 w-full bg-slate-50 border border-dashed rounded-xl px-4 py-4 cursor-pointer transition-colors ${
                      fileError
                        ? "border-rose-300 bg-rose-50/50"
                        : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/40"
                    } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 mb-0 truncate">
                        {file ? file.name : "Choose a file to upload"}
                      </p>
                      <p className="text-[11px] text-slate-500 mb-0">
                        {file
                          ? `${(file.size / 1024).toFixed(2)} KB`
                          : "CSV, XLSX · Max size 5MB"}
                      </p>
                    </div>
                  </label>
                  <input
                    id="bulk-upload-file"
                    type="file"
                    className="hidden"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  {fileError && (
                    <p className="text-rose-600 text-[11px] mt-2 mb-0">{fileError}</p>
                  )}
                </div>

                {file && !fileError && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-3.5 py-2.5 text-[11px]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      Selected: <strong className="font-bold">{file.name}</strong>
                    </span>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Uploading...
                      </span>
                      <span className="text-[11px] font-bold text-blue-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Format Instructions */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <h6 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Required Columns
                  </h6>
                  <ul className="space-y-1 text-[11px] text-slate-600 mb-0 pl-0 list-none">
                    <li><strong className="text-slate-800">name</strong> — Full name (required)</li>
                    <li><strong className="text-slate-800">email</strong> — Email address (required, must be unique)</li>
                    {userType === "admin" ? (
                      <>
                        <li><strong className="text-slate-800">department</strong> — Department (required)</li>
                        <li><strong className="text-slate-800">role</strong> — Role (required, must be: admin)</li>
                      </>
                    ) : (
                      <>
                        <li><strong className="text-slate-800">position</strong> — Job position (required)</li>
                        <li><strong className="text-slate-800">company_name</strong> — Company name (required)</li>
                        <li><strong className="text-slate-800">department</strong> — Department (required)</li>
                        <li><strong className="text-slate-800">role</strong> — Role (required, must match: {userType})</li>
                      </>
                    )}
                  </ul>
                  <p className="text-[11px] text-slate-500 mt-3 mb-0">
                    <strong className="text-slate-700">Note:</strong> Employee ID and{" "}
                    {userType === "admin" ? "invitation email" : "login credentials"} will be
                    auto-generated and sent via email.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border-0 cursor-pointer transition-colors disabled:opacity-50"
                    onClick={handleClose}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold border-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!file || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload Users
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Results Display */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <h5 className="text-xs font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Upload Completed
                </h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-base font-extrabold text-slate-900 mb-0">
                      {results.summary.total_rows}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0">Rows</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-base font-extrabold text-emerald-600 mb-0">
                      {results.summary.created}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0">Created</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-base font-extrabold text-rose-600 mb-0">
                      {results.summary.failed}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0">Failed</p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {results.errors && results.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <h6 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Error Details ({results.errors.length})
                  </h6>
                  <div className="max-h-[220px] overflow-y-auto divide-y divide-amber-100">
                    {results.errors.map((error, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 text-[11px]">
                        <p className="mb-0 text-amber-900">
                          <strong className="font-bold">Row {error.row}:</strong> {error.email}
                        </p>
                        <p className="mb-0 text-rose-600">{error.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Onboarding Email Delivery Stats */}
              {loadingStats && (
                <div className="flex items-center justify-center gap-2 py-3 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px]">Fetching email delivery status...</span>
                </div>
              )}

              {onboardingStats && !loadingStats && (() => {
                const s = onboardingStats.breakdown?.[userType] || onboardingStats.totals;
                return (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <h6 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <MailCheck className="w-4 h-4 text-blue-600" />
                      Live Onboarding Status
                    </h6>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 rounded-xl p-2.5">
                        <p className="text-base font-extrabold text-blue-600 mb-0">{s.emails_sent ?? 0}</p>
                        <p className="text-[10px] font-semibold text-slate-500 mb-0">Emails Sent</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-2.5">
                        <p className="text-base font-extrabold text-amber-600 mb-0">{s.emails_pending ?? 0}</p>
                        <p className="text-[10px] font-semibold text-slate-500 mb-0">Pending</p>
                      </div>
                      <div className="bg-rose-50 rounded-xl p-2.5">
                        <p className="text-base font-extrabold text-rose-600 mb-0">{s.emails_failed ?? 0}</p>
                        <p className="text-[10px] font-semibold text-slate-500 mb-0">Failed</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2.5 col-span-3 sm:col-span-1">
                        <p className="text-base font-extrabold text-emerald-600 mb-0">{s.passwords_setup ?? 0}</p>
                        <p className="text-[10px] font-semibold text-slate-500 mb-0">Passwords Set Up</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 col-span-3 sm:col-span-2">
                        <p className="text-base font-extrabold text-slate-800 mb-0">{s.logged_in_users ?? 0}</p>
                        <p className="text-[10px] font-semibold text-slate-500 mb-0">Logged In</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 mb-0 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Email status updates as the mail queue processes. Refresh to get the latest.
                    </p>
                  </div>
                );
              })()}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border-0 cursor-pointer transition-colors"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold border-0 cursor-pointer transition-colors"
                  onClick={resetModal}
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkUploadModal;
