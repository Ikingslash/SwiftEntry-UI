import { useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BulkUploadModal({ isOpen, onClose, userType, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [fileError, setFileError] = useState("");

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
    } catch (error) {
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
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "Upload failed";
      toast.error(errorMsg);
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
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Bulk Upload Users</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          <div className="modal-body">
            {!results ? (
              <>
                {/* Template Download */}
                <div className="alert alert-info mb-3">
                  <p className="mb-2">
                    <strong>Need help?</strong> Download a sample template to see the required format.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info"
                    onClick={downloadTemplate}
                  >
                    <i className="bi bi-download me-2"></i>
                    Download Template
                  </button>
                </div>

                {/* File Upload Form */}
                <form onSubmit={handleUpload}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select CSV/Excel File *</label>
                    <input
                      type="file"
                      className={`form-control ${fileError ? "is-invalid" : ""}`}
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                    {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
                    <small className="text-muted d-block mt-2">
                      Supported formats: CSV, XLSX | Max size: 5MB
                    </small>
                  </div>

                  {file && (
                    <div className="alert alert-success mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="mb-3">
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          {uploadProgress}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Format Instructions */}
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h6 className="card-title">Required Columns:</h6>
                      <ul className="small mb-0">
                        <li><strong>name</strong> - Full name (required)</li>
                        <li><strong>email</strong> - Email address (required, must be unique)</li>
                        <li><strong>position</strong> - Job position (required)</li>
                        <li><strong>company_name</strong> - Company name (required)</li>
                        <li><strong>employee_id</strong> - Employee ID (required)</li>
                        <li><strong>department</strong> - Department (required)</li>
                        <li><strong>role</strong> - Role (required, must match: {userType})</li>
                        <li><strong>fcm_token</strong> - FCM token (optional)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!file || uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload me-2"></i>
                          Upload Users
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Results Display */
              <div>
                <div className="alert alert-success mb-3">
                  <h5 className="alert-heading">
                    <i className="bi bi-check-circle me-2"></i>
                    Upload Completed
                  </h5>
                  <hr />
                  <p className="mb-2">
                    <strong>Total Rows:</strong> {results.summary.total_rows}
                  </p>
                  <p className="mb-2">
                    <strong className="text-success">✓ Created:</strong> {results.summary.created}
                  </p>
                  <p className="mb-0">
                    <strong className="text-danger">✗ Failed:</strong> {results.summary.failed}
                  </p>
                </div>

                {/* Error Details */}
                {results.errors && results.errors.length > 0 && (
                  <div className="alert alert-warning">
                    <h6 className="alert-heading">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Error Details ({results.errors.length})
                    </h6>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {results.errors.map((error, idx) => (
                        <div key={idx} className="small mb-2 pb-2 border-bottom">
                          <strong>Row {error.row}:</strong> {error.email}
                          <br />
                          <span className="text-danger">{error.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={resetModal}
                  >
                    Upload Another File
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkUploadModal;
