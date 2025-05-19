import { useState } from "react";
import api from "../../context/api";

export default function RegisterGuestIndividual() {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
    address: "",
    visit_time: "",
    host_name: "",
    building: "",
    floor: "",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    details: "",
  });

  const [photo, setPhoto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (photo) {
      data.append("photo", photo);
    }

    try {
      const response = await api.post("/front-desk/guests/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        alert("Guest successfully registered!");
        console.log(response.data);
        setFormData({
          name: "",
          contact_number: "",
          email: "",
          address: "",
          visit_time: "",
          host_name: "",
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          details: "",
        });
        setPhoto(null);
        setSelectedImage(null);
      } else {
        alert("Error: " + (response.data.message || "Something went wrong"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Failed to register guest. " + (error.response?.data?.message || "")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              <div className="p-4">
                <h5 className="fw-bold">Guest Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visitors Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="p-4 mb-5">
                <h5 className="fw-bold">Visit Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visit Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="visit_time"
                    value={formData.visit_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Host Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="host_name"
                    value={formData.host_name}
                    onChange={handleChange}
                  />
                </div> <div className="row">
                  <div className="col-md-6">
                    <div className="my-3">
                      <label className="form-label">Building</label>
                      <select
                        className="form-select"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                      >
                        <option value="">Select Building</option>
                        <option value="building 1">Building 1</option>
                        <option value="building 2">Building 2</option>
                        <option value="building 3">Building 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="my-3">
                      <label className="form-label">Floor</label>
                      <select
                        className="form-select"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                      >
                        <option value="">Select Floor</option>
                        <option value="1st floor">1st Floor</option>
                        <option value="2nd floor">2nd Floor</option>
                        <option value="3rd floor">3rd Floor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="my-3">
                  <label className="form-label">Purpose of Visit</label>
                  <select
                    className="form-select"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    <option value="">Select Purpose</option>
                    <option value="recruitment">Recruitment</option>
                    <option value="business meeting">Business Meeting</option>
                    <option value="repairs/maintenance">
                      Repair/Maintenance
                    </option>
                    <option value="personal/official">personal/official</option>
                    <option value="other">others</option>
                  </select>
                </div>

              
                <div className="my-3">
                  <label className="form-label">Details (Optional)</label>
                  <textarea
                    className="form-control"
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              <div className="p-4">
                <h5 className="fw-bold">Additional Information</h5>
                <div className="mt-4">
                  <label className="form-label d-block">
                    Add Photo (Optional)
                  </label>
                  <input
                    type="file"
                    className="d-none"
                    id="fileUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="fileUpload" className="d-inline-block">
                    <div
                      className="rounded-circle border d-flex justify-content-center align-items-center"
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "#f8f9fa",
                        cursor: "pointer",
                      }}
                    >
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt="Uploaded"
                          className="rounded-circle"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i
                          className="bi bi-camera"
                          style={{ fontSize: "24px" }}
                        ></i>
                      )}
                    </div>
                  </label>
                </div>
              </div>
         
              <div className="mb-4">
                <label className="form-label">
                  Special Requirements (Optional)
                </label>
                <select
                  className="form-select"
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleChange}
                >
                  <option > Select special requirements</option>
                  <option  value="parking space">parking space</option>
                  <option  value="Recruitment">Business Meeting</option>
                  <option  value="Recruitment">Interview</option>
                  <option  value="Recruitment">Personal Visit</option>
                </select>
              </div>
              <div className="my-3">
                <label className="form-label">Emergency Contact</label>
                <input
                  type="text"
                  className="form-control"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary mt-3 w-50 "
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Guest"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
