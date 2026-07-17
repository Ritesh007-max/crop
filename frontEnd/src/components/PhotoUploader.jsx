import { ImagePlus, FileText, Upload, X } from "lucide-react";

const PHOTO_SLOTS = [
  { id: "field", label: "Field View", desc: "Overall crop condition" },
  { id: "leaf", label: "Leaf Close-Up", desc: "Visible symptoms" },
  { id: "stem", label: "Stem / Soil Zone", desc: "Root area" },
  { id: "extra", label: "Concern Area", desc: "Any unusual signs" },
];

const SINGLE_HEALTH_SLOT = [
  { id: "leaf", label: "Crop Health Photo", desc: "Upload one clear leaf or plant image" },
];

function PhotoUploader({ files, onFileChange, singleImage = false }) {
  const slots = singleImage ? SINGLE_HEALTH_SLOT : PHOTO_SLOTS;

  const handlePhotoUpload = (id, file) => {
    onFileChange("photos", singleImage ? { [id]: file } : { ...files.photos, [id]: file });
  };

  const removePhoto = (id) => {
    const nextPhotos = { ...files.photos };
    delete nextPhotos[id];
    onFileChange("photos", nextPhotos);
  };

  return (
    <div className="bg-white/70 backdrop-blur border border-brand-200 rounded-3xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-display font-bold text-gray-800">1. Upload Visuals</h2>
          <p className="text-sm text-gray-500">Add photos for AI analysis</p>
        </div>
      </div>

      <div className={`grid gap-4 ${singleImage ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"}`}>
        {slots.map((slot) => {
          const file = files.photos?.[slot.id];
          return (
            <div key={slot.id} className="relative group">
              {file ? (
                <div className={`w-full rounded-2xl border-2 border-brand-400 overflow-hidden relative shadow-sm ${singleImage ? "h-56 sm:h-64" : "h-36"}`}>
                  <img src={URL.createObjectURL(file)} alt={slot.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removePhoto(slot.id)} className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform shadow-md">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-[11px] font-medium truncate">{slot.label}</p>
                  </div>
                </div>
              ) : (
                <label className={`w-full rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 flex flex-col items-center justify-center cursor-pointer transition-colors ${singleImage ? "h-56 sm:h-64" : "h-36"}`}>
                  <ImagePlus size={24} className="text-brand-500 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                  <span className="text-[13px] font-semibold text-brand-800">{slot.label}</span>
                  <span className="text-[11px] text-brand-600 mt-0.5">{slot.desc}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoUpload(slot.id, event.target.files[0])} />
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-brand-100">
        <label className="flex items-center gap-4 p-4 rounded-2xl border border-brand-200 bg-white hover:border-brand-300 cursor-pointer transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center border border-indigo-100">
            {files.report ? <FileText size={22} className="text-indigo-600" /> : <Upload size={22} className="text-indigo-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800">{files.report ? files.report.name : "Optional Soil Report"}</h3>
            <p className="text-[12px] text-gray-500">{files.report ? "Report attached" : "Upload lab results for deeper analysis (PDF/Image)"}</p>
          </div>
          {files.report ? (
            <button type="button" onClick={(event) => { event.preventDefault(); onFileChange("report", null); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <X size={18} />
            </button>
          ) : (
            <span className="px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-[12px] font-semibold">Upload</span>
          )}
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => onFileChange("report", event.target.files[0])} />
        </label>
      </div>
    </div>
  );
}

export default PhotoUploader;
