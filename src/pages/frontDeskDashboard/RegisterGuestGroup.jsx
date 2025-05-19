import { useState } from "react";
import api from "../../context/api";

function RegisterGuestGroup() {
  const [formData, setFormData] = useState({
    group_leader_name: "",
    group_leader_contact: "",
    group_leader_email: "",
    group_size: "",
    organization_name: "",
    visit_time: "",
    host_name: "",
    building: "",
    floor: "",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    previsit_instruction: "",
    details: "",
  });

  const [photo, setPhoto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setPhoto(file);
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
      const response = await api.post(
        "/front-desk/guests/register-group",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            // Authorization should already be set in api interceptor if using context
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Group registered successfully!");
        setFormData({
          group_leader_name: "",
          group_leader_contact: "",
          group_leader_email: "",
          group_size: "",
          organization_name: "",
          visit_time: "",
          host_name: "",
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          previsit_instruction: "",
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
        "Failed to register group. " +
          (error.response?.data?.message || "Unexpected error")
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
              {/* Guest Information */}
              <div className=" p-4">
                <h5 className="fw-bold">Group Leader Information</h5>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="group_leader_name"
                    className="form-control mb-3"
                    placeholder="Group Leader Name"
                    value={formData.group_leader_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        name="group_leader_contact"
                        className="form-control mb-3"
                        placeholder="Contact Number"
                        value={formData.group_leader_contact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="group_leader_email"
                        className="form-control mb-3"
                        placeholder="Email"
                        value={formData.group_leader_email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Group Size</label>
                  <select
                    name="group_size"
                    className="form-select mb-3"
                    value={formData.group_size}
                    onChange={handleChange}
                  >
                    <option value="">Select Group Size</option>
                    <option value="10">2 - 10</option>
                    <option value="22">10 - 20</option>
                    <option value="35">20 - 30</option>
                    <option value="30+">30 Above</option>
                  </select>
                </div>
              </div>

              {/* Visit Information */}
              <div className=" p-4 mb-5">
                <h5 className="fw-bold">Visit Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visit Time</label>
                  <input
                    type="datetime-local"
                    name="visit_time"
                    className="form-control mb-3"
                    value={formData.visit_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Host Name</label>
                  <input
                    type="text"
                    name="host_name"
                    className="form-control mb-3"
                    placeholder="Host Name"
                    value={formData.host_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="my-3">
                      <label className="form-label">Building</label>
                      <select
                        name="building"
                        className="form-select mb-3"
                        value={formData.building}
                        onChange={handleChange}
                      >
                        <option value="">Select Building</option>
                        <option value="building 1">Building A</option>
                        <option value="building 2">Building B</option>
                        <option value="building 3">Building C</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="my-3">
                      <label className="form-label">Floor</label>
                      <select
                        name="floor"
                        className="form-select mb-3"
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
                    name="purpose"
                    className="form-select mb-3"
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    <option value="">Select Purpose</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Business Meeting">Business Meeting</option>
                    <option value="conference">conference </option>
                    <option value="Interview">Interview</option>
                    <option value="Personal Visit">Personal Visit</option>
                  </select>
                </div>
                <div className="my-3">
                  <label className="form-label">Details (Optional)</label>
                  <textarea
                    name="details"
                    className="form-control mb-3"
                    rows="3"
                    placeholder="Details (Optional)"
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
              <div className="my-3">
                <label className="form-label">Name of Organization</label>
                <input
                  type="text"
                  name="organization_name"
                  className="form-control mb-3"
                  placeholder="Organization Name"
                  value={formData.organization_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  Special Requirements (Optional)
                </label>
                <select
                  name="special_requirements"
                  className="form-select mb-3"
                  value={formData.special_requirements}
                  onChange={handleChange}
                >
                  <option value="">Special Requirements</option>
                  <option value="catering needs">Catering needs</option>
                  <option value="Projector">Projector</option>
                  <option value="Disability Access">Disability Access</option>
                </select>
              </div>
              <div className="my-3">
                <label className="form-label">
                  Emergency Contact (Optional)
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  className="form-control mb-3"
                  placeholder="Emergency Contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>
              <div className="my-3">
                <label className="form-label">Previsit Instruction</label>
                <input
                  type="text"
                  name="previsit_instruction"
                  className="form-control mb-3"
                  placeholder="Previsit Instruction"
                  value={formData.previsit_instruction}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-2 w-50"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Group"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterGuestGroup;
