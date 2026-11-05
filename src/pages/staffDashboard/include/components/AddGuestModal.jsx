import { Camera, Loader2, X } from "lucide-react";
import UserAvatar from "../../../../components/UserAvatar";

const fieldClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelClass = "block text-xs font-semibold text-slate-700 mb-2";

export default function AddGuestModal({
  show,
  onClose,
  name,
  selectedImage,
  handleImageChange,
  visitorType,
  email,
  address,
  contact_number,
  setName,
  setVisitorType,
  setEmail,
  setAddress,
  setContact_number,
  handleAddGuest,
  isSubmitting,
}) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden flex justify-center pt-3">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              Create New Visitor
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-0">
              Quickly add a visitor to today&apos;s list.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleAddGuest}
          className="px-5 sm:px-6 py-5 space-y-4"
        >
          <div>
            <label className={labelClass}>Add Photo (Optional)</label>
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              accept="image/*"
              name="photo"
              onChange={handleImageChange}
            />
            <label htmlFor="fileUpload" className="inline-block cursor-pointer">
              <div className="w-[88px] h-[88px] rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
                {selectedImage ? (
                  <UserAvatar
                    image={selectedImage}
                    firstName={name || "New Visitor"}
                    size={88}
                    className="rounded-full"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-slate-400" />
                )}
              </div>
            </label>
          </div>

          <div>
            <label className={labelClass}>Visitor&apos;s Name</label>
            <input
              type="text"
              className={fieldClass}
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Type</label>
            <select
              className={fieldClass}
              value={visitorType}
              onChange={(e) => setVisitorType(e.target.value)}
              required
            >
              <option>Individual</option>
              <option>Group</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              className={fieldClass}
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Contact</label>
            <input
              type="tel"
              inputMode="tel"
              className={fieldClass}
              placeholder="Enter phone number"
              value={contact_number}
              onChange={(e) => setContact_number(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              className={`${fieldClass} resize-none`}
              rows="3"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-3 border-0 cursor-pointer transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
