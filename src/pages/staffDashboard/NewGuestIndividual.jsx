import { useState } from "react";
import api from "../../context/api";

export default function NewGuestIndividual() {
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
    details: "", // Missing field added
    photo: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input and convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file, // Make sure the file is stored properly
      }));
      setSelectedImage(URL.createObjectURL(file)); // Show preview
    }
  };
  


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    alert(JSON.stringify(formData, null, 2)); 
    console.log("Form Data before submission:", formData);
  
    const formDataToSend = new FormData();
    
    // Append all fields except the photo
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "photo") {
        formDataToSend.append(key, value);
      }
    });
  
    // Append the photo separately if it exists
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    } else {
      console.warn("No photo selected.");
    }
  
    try {
      const response = await api.post("/staff/guests/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 200 || response.status === 201) {
        alert("Guest successfully registered!");
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
          photo: null,  // Reset the file
        });
        setSelectedImage(null);
      } else {
        alert("Error: " + (response.data.message || "Something went wrong"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to register guest. " + (error.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit} encType="multipart/form-data">

        <div className="row">
          {/* Left Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              {/* Guest Information */}
              <div className=" p-4">
                <h5 className="fw-bold">Guest Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visitors Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter visitor's name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter contact number"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Visit Information */}
              <div className=" p-4 mb-5">
                <h5 className="fw-bold">Visit Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visit Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="visit_time"
                    value={formData.visit_time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Host Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter host name"
                    name="host_name"
                    value={formData.host_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row">
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
                    rows="3"
                    placeholder="Enter visit details"
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              {/* Additional Information */}
              <div className="p-4">
                <h5 className="fw-bold">Additional Information</h5>
                <div className=" mt-4">
                  <label className="form-label d-block">
                    Add Photo (Optional)
                  </label>
                  <input
                    type="file"
                    className="d-none"
                    id="fileUpload"
                    accept="image/*"
                    name="photo"
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
                <label className="form-label">
                  Emergency Contact (Optional)
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter emergency contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-3 w-50 "
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
