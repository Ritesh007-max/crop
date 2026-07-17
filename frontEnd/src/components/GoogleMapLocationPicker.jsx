import { useEffect, useId, useMemo, useState } from "react";
import { Crosshair, MapPinned, Search } from "lucide-react";

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function buildMapUrl({ searchText, latitude, longitude }) {
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;
  }

  if (searchText?.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(searchText.trim())}&output=embed`;
  }

  return `https://www.google.com/maps?q=${DEFAULT_CENTER.lat},${DEFAULT_CENTER.lng}&z=5&output=embed`;
}

function GoogleMapLocationPicker({ value, onLocationSelect }) {
  const inputId = useId();
  const [searchText, setSearchText] = useState(value?.address || "");
  const [status, setStatus] = useState("Search for a place or use your current location.");

  useEffect(() => {
    if (value?.address) {
      setSearchText(value.address);
    }
  }, [value?.address]);

  const mapUrl = useMemo(
    () =>
      buildMapUrl({
        searchText,
        latitude: value?.latitude,
        longitude: value?.longitude,
      }),
    [searchText, value?.latitude, value?.longitude]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmed = searchText.trim();
    if (!trimmed) {
      setStatus("Enter a village, district, landmark, or farm name.");
      return;
    }

    onLocationSelect({
      address: trimmed,
      latitude: null,
      longitude: null,
      placeName: trimmed,
      state: "",
      district: "",
    });

    setStatus("Map updated. Confirm state and district using the dropdowns below.");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Current location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        onLocationSelect({
          address: `Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
          latitude,
          longitude,
          placeName: "Current location",
          state: "",
          district: "",
        });
        setSearchText(`Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        setStatus("Current location loaded. Confirm state and district using the dropdowns below.");
      },
      () => {
        setStatus("Unable to read current location from this device.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end"
        onSubmit={handleSearchSubmit}
      >
        <label className="min-w-0">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
            <Search size={12} /> Search Farm Location
          </span>
          <input
            id={inputId}
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search village, farm, or landmark"
            className="w-full rounded-xl border border-gray-200 bg-surface-100 px-3 py-2.5 text-sm text-gray-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 lg:min-w-[120px]"
        >
          <Search size={14} />
          Search
        </button>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 lg:min-w-[190px]"
        >
          <Crosshair size={14} />
          Use Current Location
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-inner">
        <iframe
          title="Farm location map"
          src={mapUrl}
          className="location-map h-[260px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-surface-100 px-3.5 py-3">
        <div className="flex items-start gap-2">
          <MapPinned size={15} className="mt-0.5 text-brand-600" />
          <div className="min-w-0">
            <p className="text-[12px] font-medium leading-relaxed text-gray-700">{status}</p>
            {value?.address ? (
              <p className="mt-1.5 break-words text-[12px] leading-relaxed text-gray-500">
                {value.address}
                {typeof value?.latitude === "number" && typeof value?.longitude === "number"
                  ? ` (${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)})`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleMapLocationPicker;
