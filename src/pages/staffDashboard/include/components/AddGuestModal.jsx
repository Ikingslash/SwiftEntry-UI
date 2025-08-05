export default function AddGuestModal({
  show,
  onClose,
  name,
  visitorType,
  email,
  address,
  contact_number,
  setName,
  setVisitorType,
  setEmail,
  setAddress,
  setContact_number,
  handleAddGuest
}) {
  const modalClasses = show ? 'modal d-block' : 'modal';
  const modalStyle = {
    display: show ? 'block' : 'none',
    backgroundColor: 'rgba(0,0,0,0.5)'
  };

  return (
    <div className={modalClasses} style={modalStyle} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-4">
          <div className="modal-header d-flex justify-content-between align-items-center border-0 pb-0">
            <h5 className="modal-title fw-bold">Create New Visitor</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body pt-2">
            <form onSubmit={handleAddGuest}>
              <div className="mb-3">
                <label className="form-label text-muted small">Visitors Name</label>
                <input
                  type="text"
                  className="form-control rounded-pill px-3 py-2"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Type</label>
                <select
                  className="form-select rounded-pill px-3 py-2"
                  value={visitorType}
                  onChange={(e) => setVisitorType(e.target.value)}
                  required
                >
                  <option>Individual</option>
                  <option>Group</option> 
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Email Address</label>
                <input
                  type="email"
                  className="form-control rounded-pill px-3 py-2"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">contact</label>
                <input
                  type="number"
                  className="form-control rounded-pill px-3 py-2"
                  placeholder="Enter Phone Number"
                  value={contact_number}
                  onChange={(e) => setContact_number(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Address</label>
                <textarea
                  className="form-control rounded-4 px-3 py-2"
                  rows="3"
                  placeholder="Enter Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
