import UserAvatar from "../../../components/UserAvatar";

function TabOutgoing() {
  return (
    <div>
      <div className="row mb-5">
        {/*  Cards */}
        <div className="col-12 col-md-6 ">
          <div className="card shadow p-3 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <UserAvatar
                image="./images/user.png"
                firstName="Femi Biodun"
                size={40}
                className="rounded-circle me-3"
              />
              <div>
                <p className="mb-0">Femi Biodun</p>
                <small className="text-muted">fem123@gmail.com</small>
              </div>
              <span
                className="ms-5 px-4 py-1 badge text-primary rounded-5"
                style={{
                  backgroundColor: "#E7F3FE",
                }}
              >
                Verified{" "}
                <span
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "18px",
                    height: "18px",
                    fontSize: "12px",
                    marginLeft: "4px",
                  }}
                >
                  ✓
                </span>
              </span>
            </div>
            <div className="container bg-light rounded">
              <div className="row mb-3">
                <div className="col-3">
                  <small className="">ID No</small>
                  <p className="mb-0 text-muted">
                    <small>123344543</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Time Checked in</small>
                  <p className="mb-0 text-muted">
                    <small>12:31pm</small>{" "}
                  </p>
                </div>
                <div className="col-3 ">
                  <small className="">Visit Time</small>
                  <p className="mb-0 text-muted">
                    <small>12/01/24</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Host</small>
                  <p className="mb-0 text-muted">
                    <small>Adekunle Adeniyi</small>{" "}
                  </p>
                </div>
              </div>
              <div
                className="flex-grow-1 my-2"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(225, 228, 231, 0.8)",
                }}
              ></div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Contact Info</small>
                  <p className="mb-0">
                    <small>08123345678 </small>

                    <a href="#" className="text-primary ms-4">
                      <small>See more → </small>
                    </a>
                  </p>
                </div>
                <button
                  className="btn btn-primary rounded-3 mt-4 w-50"
                  data-bs-toggle="modal"
                  data-bs-target="#printTagModal"
                >
                  Print Tag
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-12 col-md-6 ">
          <div className="card shadow p-3 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <UserAvatar
                image="./images/user.png"
                firstName="Femi Biodun"
                size={40}
                className="rounded-circle me-3"
              />
              <div>
                <p className="mb-0">Femi Biodun</p>
                <small className="text-muted">fem123@gmail.com</small>
              </div>
              <span
                className="ms-5 px-4 py-1 badge text-primary rounded-5"
                style={{
                  backgroundColor: "#E7F3FE",
                }}
              >
                Verified{" "}
                <span
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "18px",
                    height: "18px",
                    fontSize: "12px",
                    marginLeft: "4px",
                  }}
                >
                  ✓
                </span>
              </span>
            </div>
            <div className="container bg-light rounded">
              <div className="row mb-3">
                <div className="col-3">
                  <small className="">ID No</small>
                  <p className="mb-0 text-muted">
                    <small>123344543</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Time Checked in</small>
                  <p className="mb-0 text-muted">
                    <small>12:31pm</small>{" "}
                  </p>
                </div>
                <div className="col-3 ">
                  <small className="">Visit Time</small>
                  <p className="mb-0 text-muted">
                    <small>12/01/24</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Host</small>
                  <p className="mb-0 text-muted">
                    <small>Adekunle Adeniyi</small>{" "}
                  </p>
                </div>
              </div>
              <div
                className="flex-grow-1 my-2"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(225, 228, 231, 0.8)",
                }}
              ></div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Contact Info</small>
                  <p className="mb-0">
                    <small>08123345678 </small>

                    <small>
                      <a href="#" className="text-primary ms-5">
                        See more →
                      </a>
                    </small>
                  </p>
                </div>
                <button
                  className="btn btn-primary rounded-3 mt-4"
                  style={{
                    width: "50%",
                  }}
                >
                  Print Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        {/*  Cards */}
        <div className="col-12 col-md-6 ">
          <div className="card shadow p-3 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <UserAvatar
                image="./images/user.png"
                firstName="Femi Biodun"
                size={40}
                className="rounded-circle me-3"
              />
              <div>
                <p className="mb-0">Femi Biodun</p>
                <small className="text-muted">fem123@gmail.com</small>
              </div>
              <span
                className="ms-5 px-4 py-1 badge text-primary rounded-5"
                style={{
                  backgroundColor: "#E7F3FE",
                }}
              >
                Verified{" "}
                <span
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "18px",
                    height: "18px",
                    fontSize: "12px",
                    marginLeft: "4px",
                  }}
                >
                  ✓
                </span>
              </span>
            </div>
            <div className="container bg-light rounded">
              <div className="row mb-3">
                <div className="col-3">
                  <small className="">ID No</small>
                  <p className="mb-0 text-muted">
                    <small>123344543</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Time Checked in</small>
                  <p className="mb-0 text-muted">
                    <small>12:31pm</small>{" "}
                  </p>
                </div>
                <div className="col-3 ">
                  <small className="">Visit Time</small>
                  <p className="mb-0 text-muted">
                    <small>12/01/24</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Host</small>
                  <p className="mb-0 text-muted">
                    <small>Adekunle Adeniyi</small>{" "}
                  </p>
                </div>
              </div>
              <div
                className="flex-grow-1 my-2"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(225, 228, 231, 0.8)",
                }}
              ></div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Contact Info</small>
                  <p className="mb-0">
                    <small>08123345678 </small>

                    <small>
                      <a href="#" className="text-primary ms-5">
                        See more →
                      </a>
                    </small>
                  </p>
                </div>
                <button
                  className="btn btn-primary rounded-3 mt-4"
                  style={{
                    width: "50%",
                  }}
                >
                  Print Tag
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-12 col-md-6 ">
          <div className="card shadow p-3 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <UserAvatar
                image="./images/user.png"
                firstName="Femi Biodun"
                size={40}
                className="rounded-circle me-3"
              />
              <div>
                <p className="mb-0">Femi Biodun</p>
                <small className="text-muted">fem123@gmail.com</small>
              </div>
              <span
                className="ms-5 px-4 py-1 badge text-primary rounded-5"
                style={{
                  backgroundColor: "#E7F3FE",
                }}
              >
                Verified{" "}
                <span
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "18px",
                    height: "18px",
                    fontSize: "12px",
                    marginLeft: "4px",
                  }}
                >
                  ✓
                </span>
              </span>
            </div>
            <div className="container bg-light rounded">
              <div className="row mb-3">
                <div className="col-3">
                  <small className="">ID No</small>
                  <p className="mb-0 text-muted">
                    <small>123344543</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Time Checked in</small>
                  <p className="mb-0 text-muted">
                    <small>12:31pm</small>{" "}
                  </p>
                </div>
                <div className="col-3 ">
                  <small className="">Visit Time</small>
                  <p className="mb-0 text-muted">
                    <small>12/01/24</small>{" "}
                  </p>
                </div>
                <div className="col-3">
                  <small className="">Host</small>
                  <p className="mb-0 text-muted">
                    <small>Adekunle Adeniyi</small>{" "}
                  </p>
                </div>
              </div>
              <div
                className="flex-grow-1 my-2"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(225, 228, 231, 0.8)",
                }}
              ></div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Contact Info</small>
                  <p className="mb-0">
                    <small>08123345678 </small>

                    <small>
                      <a href="#" className="text-primary ms-5">
                        See more →
                      </a>
                    </small>
                  </p>
                </div>
                <button
                  className="btn btn-primary rounded-3 mt-4"
                  style={{
                    width: "50%",
                  }}
                >
                  Print Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap 5 Modal */}

      <div
        className="modal fade"
        id="printTagModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg py-4"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            maxWidth: "40%",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row g-3 container px-5">
                <div className="col-12">
                  <UserAvatar
                    image="./images/user.png"
                    firstName="Femi Biodun"
                    size={80}
                    className="rounded-circle mb-3"
                  />
                </div>
                <div className="col-md-6">
                  <p className="fw-bold">
                    <small>Guest Name</small>
                  </p>
                </div>
                <div className="col-md-6">
                  <small>Femi Biodun</small>
                </div>
                <hr className="w-100" />

                <div className="col-md-6">
                  <p className="fw-bold">
                    <small>Visit Date</small>
                  </p>
                </div>
                <div className="col-md-6">
                  <small>12-02-25</small>
                </div>
                <hr className="w-100" />

                <div className="col-md-6">
                  <small className="fw-bold">Visit Time</small>
                </div>
                <div className="col-md-6">
                  <small>2:00pm</small>
                </div>
                <hr className="w-100" />

                <div className="col-md-6">
                  <small className="fw-bold">Host Name</small>
                </div>
                <div className="col-md-6">
                  <small>Ajayi Adebayo</small>
                </div>
                <hr className="w-100" />

                <div className="col-md-6">
                  <small className="fw-bold">Contact Info</small>
                </div>
                <div className="col-md-6">
                  <small>femiempires@gmail.com</small>
                </div>
                <hr className="w-100" />

                <div className="col-md-6">
                  <small className="fw-bold">Special Request</small>
                </div>
                <div className="col-md-6">
                  <small>Parking Space</small>
                </div>
                <hr className="w-100" />

                <div className="col-md-6">
                  <small className="fw-bold">Visit Status</small>
                </div>
                <div className="col-md-6">
                  <small>Scheduled</small>
                </div>
                <hr className="w-100" />

                <div className="col-12 text-center">
                  <button type="button" className="btn btn-primary w-50">
                    Print Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabOutgoing;
