import { useState } from "react";
import api from "../../context/api";

function NewGuestGroup() {
  const [formData, setFormData] = useState({
    group_leader_name: "",
    group_leader_contact: "",
    group_leader_email: "",
    organization_name: "",
    group_size: "",
    visit_time: "",
    host_name: "",
    building: "",
    floor: "",
    purpose: "",
    special_requirements: "",
    emergency_contact: "",
    previsit_instruction: "",
    details: "",
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    alert(JSON.stringify(formData, null, 2));
    console.log("Form Data before submission:", formData);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "photo") {
        formDataToSend.append(key, value);
      }
    });

    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    } else {
      console.warn("No photo selected.");
    }

    try {
      const response = await api.post(
        "/staff/guests/register-group",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Guest successfully registered!");
        setFormData({
          group_leader_name: "",
          group_leader_contact: "",
          group_leader_email: "",
          organization_name: "",
          group_size: "",
          visit_time: "",
          host_name: "",
          building: "",
          floor: "",
          purpose: "",
          special_requirements: "",
          emergency_contact: "",
          previsit_instruction: "",
          details: "",
          photo: null,
        });
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
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                    className="form-control"
                    placeholder="Enter Name"
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
                        className="form-control"
                        placeholder="Enter contact number"
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
                        className="form-control"
                        placeholder="Enter email"
                        value={formData.group_leader_email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Group Size</label>
                  <select
                    className="form-select"
                    name="group_size"
                    value={formData.group_size}
                    onChange={handleChange}
                  >
                    <option>Select Group Size</option>
                    <option value="5">2 - 10</option>
                    <option value="10">10 - 20</option>
                    <option value="20">20 - 30</option>
                    <option value="30">30 Above</option>
                  </select>
                </div>
              </div>

              <div className="p-4 mb-5">
                <h5 className="fw-bold">Visit Information</h5>
                <div className="mb-3">
                  <label className="form-label">Visit Time</label>
                  <input
                    type="datetime-local"
                    name="visit_time"
                    className="form-control"
                    value={formData.visit_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Host Name</label>
                  <input
                    type="text"
                    name="host_name"
                    className="form-control"
                    placeholder="Enter host name"
                    value={formData.host_name}
                    onChange={handleChange}
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
                        <option value="2nd floor 2">2nd Floor</option>
                        <option value="3rd floor 3">3rd Floor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Purpose of Visit</label>
                  <select
                    className="form-select"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    <option value="">Select Purpose</option>
                    <option value="conference">Conference</option>
                    <option value="business-meeting">Business Meeting</option>
                    <option value="Repair/Maintenance">
                      Repair/Maintenance
                    </option>
                    <option value="Interview">Interview</option>
                    <option value="Personal Visit">Personal Visit</option>
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
              <div className="my-3">
                <label className="form-label">Name of Organization</label>
                <input
                  type="text"
                  name="organization_name"
                  className="form-control"
                  value={formData.organization_name}
                  placeholder="Enter emergency contact number"
                  onChange={handleChange}
                />
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
                  <option> Select special requirements</option>
                  <option value="catering needs">catering needs</option>
                  <option value="Recruitment">Business Meeting</option>
                  <option value="Recruitment">Interview</option>
                  <option value="Recruitment">Personal Visit</option>
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
              <div className="my-3">
                <label className="form-label">Previsit Instruction</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter emergency contact number"
                  name="previsit_instruction"
                  value={formData.previsit_instruction}
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

export default NewGuestGroup;
