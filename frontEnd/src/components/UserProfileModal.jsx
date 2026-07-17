import { useState, useEffect } from "react";
import { X, User, Mail, MapPin, Save, Loader2, CheckCircle2 } from "lucide-react";

function UserProfileModal({ isOpen, onClose, user, districts, onUpdateProfile }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [state, setState] = useState(user?.state || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setState(user.state || "");
      setDistrict(user.district || "");
    }
  }, [user, isOpen]);

  // Reset district if state changes and is not compatible
  useEffect(() => {
    if (state) {
      const validDistricts = districts[state] || [];
      if (!validDistricts.includes(district)) {
        setDistrict(validDistricts[0] || "");
      }
    } else {
      setDistrict("");
    }
  }, [state]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await onUpdateProfile(name, email, state, district);
      if (result.success) {
        setSuccessMsg("Location and profile details updated successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 1500);
      } else {
        setErrorMsg(result.error || "Failed to update profile details.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-10 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-brand-50/40 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-base">Edit User Profile</h3>
              <p className="text-[11px] text-gray-400">Configure your default farm settings</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMsg && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-xs flex items-start gap-2.5 animate-slide-up">
              <span className="text-red-400 text-sm mt-0.5">⚠️</span>
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-xs flex items-start gap-2.5 animate-slide-up">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {/* User Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Account Details</h4>
            
            <div className="relative">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4 pt-4" />

          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Default Location</h4>
              <span className="inline-flex items-center gap-1 text-[10px] text-brand-600 font-semibold px-2 py-0.5 rounded-full bg-brand-50">
                <MapPin size={10} /> Saved Settings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
                >
                  <option value="">Select State</option>
                  {Object.keys(districts).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!state}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300 disabled:opacity-55"
                >
                  <option value="">Select District</option>
                  {(districts[state] || []).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                bg-gradient-to-r from-brand-600 to-brand-500
                text-white font-semibold text-sm
                shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5
                disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0
                transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfileModal;
