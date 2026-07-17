import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import GoogleMapLocationPicker from "./GoogleMapLocationPicker";

function InputBox({ formState, districts, onFieldChange, requestLocationAccess, locating }) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
      {/* Location Card */}
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md" id="section-location">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-gray-900">{t("input.farmLocation")}</h3>
              <p className="text-[11px] text-gray-400">{t("input.farmLocationDesc")}</p>
            </div>
          </div>
          {requestLocationAccess && (
            <button
              type="button"
              onClick={() => requestLocationAccess(true)}
              disabled={locating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 hover:border-brand-300 text-brand-700 text-[12px] font-semibold transition-all disabled:opacity-60 duration-200"
            >
              {locating ? "Locating..." : "📍 Detect Location"}
            </button>
          )}
        </div>

        <GoogleMapLocationPicker
          value={{
            address: formState.farmAddress,
            latitude: formState.latitude,
            longitude: formState.longitude,
          }}
          districts={districts}
          onLocationSelect={(selection) => onFieldChange("locationSelection", selection)}
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("input.state")}</label>
            <select id="input-state" value={formState.state}
              onChange={(e) => onFieldChange("state", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
            >
              <option value="">{t("input.selectState")}</option>
              {Object.keys(districts).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("input.district")}</label>
            <select id="input-district" value={formState.district}
              onChange={(e) => onFieldChange("district", e.target.value)}
              disabled={!formState.state}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300 disabled:opacity-50"
            >
              <option value="">{t("input.selectDistrict")}</option>
              {(districts[formState.state] || []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {formState.farmAddress ? (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">Selected Address</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-brand-900">{formState.farmAddress}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default InputBox;
