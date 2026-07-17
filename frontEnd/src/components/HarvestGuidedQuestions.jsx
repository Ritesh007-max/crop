import { Briefcase, CloudSun, PackageCheck, Tractor } from "lucide-react";

const MATURITY_OPTIONS = ["Not yet ready", "Nearly ready", "Ready now", "Overdue"];
const WEATHER_OPTIONS = ["Heavy rain", "High humidity", "Extreme heat", "No weather concerns"];

function ToggleButton({ active, children, onClick, activeClass, idleClass = "border-gray-200 text-gray-600 hover:bg-gray-50" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${active ? activeClass : idleClass}`}
    >
      {children}
    </button>
  );
}

function HarvestGuidedQuestions({ answers, onAnswerChange }) {
  const toggleWeatherConcern = (option) => {
    const current = [...(answers.weatherConcerns || [])];
    const hasOption = current.includes(option);

    if (option === "No weather concerns") {
      onAnswerChange("weatherConcerns", hasOption ? [] : [option]);
      return;
    }

    const next = hasOption
      ? current.filter((item) => item !== option)
      : [...current.filter((item) => item !== "No weather concerns"), option];

    onAnswerChange("weatherConcerns", next);
  };

  return (
    <div className="space-y-5">
      <section className="bg-white/80 backdrop-blur border border-brand-200/70 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="mb-5">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            Harvest Prep
          </span>
          <h3 className="mt-3 text-lg font-display font-bold text-gray-900">Readiness and Logistics</h3>
          <p className="mt-1 text-sm text-gray-500">
            Capture maturity, labour, storage, and weather risk so the harvest plan is operationally realistic.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
          <h3 className="text-[14px] font-display font-bold text-gray-800 mb-1">1. Crop Maturity Stage</h3>
          <p className="text-[12px] text-gray-500 mb-4">Select how ready the field is for harvest right now.</p>
          <div className="flex flex-wrap gap-2">
            {MATURITY_OPTIONS.map((option) => (
              <ToggleButton
                key={option}
                active={answers.maturityStage === option}
                onClick={() => onAnswerChange("maturityStage", option)}
                activeClass="border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 scale-[1.02]"
              >
                {option}
              </ToggleButton>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-5 mt-5">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={18} className="text-brand-600" />
              <h3 className="text-[14px] font-display font-bold text-gray-800">2. Labour and Equipment</h3>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Clarify who can work and whether harvest support equipment is available.</p>

            <div className="flex flex-wrap gap-3 mb-4">
              <ToggleButton active={answers.labourAvailable === "yes"} onClick={() => onAnswerChange("labourAvailable", "yes")} activeClass="border-brand-400 bg-white text-brand-700 shadow-sm">
                Labour available
              </ToggleButton>
              <ToggleButton active={answers.labourAvailable === "no"} onClick={() => onAnswerChange("labourAvailable", "no")} activeClass="border-gray-300 bg-white text-gray-700 shadow-sm">
                No labour
              </ToggleButton>
              <ToggleButton active={answers.equipmentAvailable === "yes"} onClick={() => onAnswerChange("equipmentAvailable", "yes")} activeClass="border-brand-400 bg-white text-brand-700 shadow-sm">
                Harvest equipment available
              </ToggleButton>
              <ToggleButton active={answers.equipmentAvailable === "no"} onClick={() => onAnswerChange("equipmentAvailable", "no")} activeClass="border-gray-300 bg-white text-gray-700 shadow-sm">
                No equipment
              </ToggleButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[12px] font-semibold text-gray-600">Number of workers</span>
                <input type="number" min="0" value={answers.workersAvailable || ""} onChange={(event) => onAnswerChange("workersAvailable", event.target.value)} className="mt-2 w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-400 outline-none" placeholder="e.g. 8" />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-gray-600">Land size (acres)</span>
                <input type="number" min="0.5" step="0.5" value={answers.landSize || ""} onChange={(event) => onAnswerChange("landSize", event.target.value)} className="mt-2 w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-400 outline-none" placeholder="e.g. 5" />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <Tractor size={18} className="text-brand-600" />
              <h3 className="text-[14px] font-display font-bold text-gray-800">Crop Details</h3>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Provide the crop name so estimates can be tuned more closely.</p>
            <label className="block">
              <span className="text-[12px] font-semibold text-gray-600">Crop type</span>
              <input type="text" value={answers.cropType || ""} onChange={(event) => onAnswerChange("cropType", event.target.value)} className="mt-2 w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-300 outline-none" placeholder="e.g. Paddy, Wheat, Cotton" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <PackageCheck size={18} className="text-brand-600" />
              <h3 className="text-[14px] font-display font-bold text-gray-800">3. Storage Readiness</h3>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Confirm the post-harvest setup before the field is cut.</p>
            <div className="flex flex-wrap gap-3">
              <ToggleButton active={answers.storageAvailable === "yes"} onClick={() => onAnswerChange("storageAvailable", answers.storageAvailable === "yes" ? "no" : "yes")} activeClass="border-brand-400 bg-white text-brand-700 shadow-sm">
                Storage available
              </ToggleButton>
              <ToggleButton active={answers.transportArranged === "yes"} onClick={() => onAnswerChange("transportArranged", answers.transportArranged === "yes" ? "no" : "yes")} activeClass="border-brand-400 bg-white text-brand-700 shadow-sm">
                Transport arranged
              </ToggleButton>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <CloudSun size={18} className="text-brand-600" />
              <h3 className="text-[14px] font-display font-bold text-gray-800">4. Weather Concerns</h3>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Select any weather threats that could reduce harvest quality or delay work.</p>
            <div className="flex flex-wrap gap-2">
              {WEATHER_OPTIONS.map((option) => (
                <ToggleButton key={option} active={(answers.weatherConcerns || []).includes(option)} onClick={() => toggleWeatherConcern(option)} activeClass="border-brand-400 bg-brand-50 text-brand-700 shadow-sm scale-[1.02]">
                  {option}
                </ToggleButton>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HarvestGuidedQuestions;
