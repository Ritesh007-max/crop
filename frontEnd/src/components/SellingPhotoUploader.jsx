import { ImagePlus, X } from "lucide-react";

const PHOTO_SLOTS = [
  { id: "lot", label: "Lot / Batch Overview", desc: "Overall condition and quantity" },
  { id: "quality", label: "Close-Up Quality View", desc: "Color, size, and uniformity" },
  { id: "damage", label: "Damage / Defect View", desc: "Spoilage, bruising, or moisture issues" },
  { id: "storage", label: "Packaging / Storage", desc: "Bags, crates, or holding condition" },
];

function SellingPhotoUploader({ files, onFileChange }) {
  const handlePhotoUpload = (id, file) => {
    onFileChange("photos", { ...files.photos, [id]: file });
  };

  const removePhoto = (id) => {
    const nextPhotos = { ...files.photos };
    delete nextPhotos[id];
    onFileChange("photos", nextPhotos);
  };

  return (
    <section className="bg-white/80 backdrop-blur border border-brand-200/70 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
          Selling Inputs
        </span>
        <h3 className="mt-3 text-lg font-display font-bold text-gray-900">Upload Harvest Sale Photos</h3>
        <p className="mt-1 text-sm text-gray-500">Add four simple images so the system can estimate quality and selling readiness.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PHOTO_SLOTS.map((slot) => {
          const file = files.photos?.[slot.id];

          return (
            <div key={slot.id} className="relative group">
              {file ? (
                <div className="h-44 w-full rounded-2xl border-2 border-brand-400 overflow-hidden relative shadow-sm bg-white">
                  <img src={URL.createObjectURL(file)} alt={slot.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removePhoto(slot.id)} className="p-2 bg-red-500 rounded-full text-white shadow-md">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-[11px] font-semibold">{slot.label}</p>
                  </div>
                </div>
              ) : (
                <label className="h-44 w-full rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center cursor-pointer transition-colors px-4 text-center">
                  <ImagePlus size={24} className="text-amber-600 mb-2 opacity-80" />
                  <span className="text-[13px] font-semibold text-amber-900">{slot.label}</span>
                  <span className="text-[11px] text-amber-700 mt-1">{slot.desc}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoUpload(slot.id, event.target.files[0])} />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SellingPhotoUploader;
