import { Package, Clock3, Truck, Users } from "lucide-react";

const URGENCY_OPTIONS = ["Sell immediately", "Wait 3-5 days", "Ask the system for a recommendation"];
const BUYER_OPTIONS = ["Mandi (local market)", "Contractor", "Local buyer", "Platform-assisted selling", "Request suggestion"];
const QUALITY_OPTIONS = ["Strong looking lot", "Average lot", "Mixed / weak lot"];
const DEFECT_OPTIONS = ["Low defects", "Moderate defects", "High defects"];
const UNITS = ["bags", "crates", "kilograms", "quintals"];

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

function mapQualitySignal(label) {
  if (label === "Strong looking lot") return "strong";
  if (label === "Mixed / weak lot") return "weak";
  return "average";
}

function mapDefectLevel(label) {
  if (label === "Low defects") return "low";
  if (label === "High defects") return "high";
  return "medium";
}

function SellingGuidedQuestions({ answers, onAnswerChange }) {
  return (
    <section className="bg-white/80 backdrop-blur border border-brand-200/70 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
          Selling Context
        </span>
        <h3 className="mt-3 text-lg font-display font-bold text-gray-900">Selling Questions</h3>
        <p className="mt-1 text-sm text-gray-500">Keep the inputs simple. The system uses basic rules and reference data, not heavy AI.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-brand-600" />
            <h3 className="text-[14px] font-display font-bold text-gray-800">1. Quantity Available</h3>
          </div>
          <p className="text-[12px] text-gray-500 mb-4">Estimate how much produce is ready for sale.</p>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr,160px] gap-4">
            <label className="block">
              <span className="text-[12px] font-semibold text-gray-600">Quantity</span>
              <input
                type="number"
                min="0"
                value={answers.quantityValue || ""}
                onChange={(event) => onAnswerChange("quantityValue", event.target.value)}
                className="mt-2 w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-400 outline-none"
                placeholder="e.g. 25"
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-gray-600">Unit</span>
              <select
                value={answers.quantityUnit || "quintals"}
                onChange={(event) => onAnswerChange("quantityUnit", event.target.value)}
                className="mt-2 w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-400 outline-none"
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-gray-600">Quick quantity slider</span>
              <span className="text-[12px] font-bold text-brand-700">{answers.quantityValue || 0} {answers.quantityUnit || "quintals"}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={answers.quantityValue || 0}
              onChange={(event) => onAnswerChange("quantityValue", event.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-brand-600" />
            <h3 className="text-[14px] font-display font-bold text-gray-800">Crop and Quality Hints</h3>
          </div>
          <p className="text-[12px] text-gray-500 mb-4">Use a simple crop label and a visual quality estimate.</p>
          <label className="block mb-4">
            <span className="text-[12px] font-semibold text-gray-600">Crop type</span>
            <input
              type="text"
              value={answers.cropType || ""}
              onChange={(event) => onAnswerChange("cropType", event.target.value)}
              className="mt-2 w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-300 outline-none"
              placeholder="e.g. Paddy, Tomato, Onion"
            />
          </label>
          <div className="space-y-3">
            <div>
              <span className="text-[12px] font-semibold text-gray-600">Overall lot quality</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUALITY_OPTIONS.map((option) => (
                  <ToggleButton
                    key={option}
                    active={(answers.qualityLabel || "Average lot") === option}
                    onClick={() => {
                      onAnswerChange("qualityLabel", option);
                      onAnswerChange("qualitySignal", mapQualitySignal(option));
                    }}
                    activeClass="border-brand-400 bg-brand-50 text-brand-800 shadow-sm"
                  >
                    {option}
                  </ToggleButton>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[12px] font-semibold text-gray-600">Defect level</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEFECT_OPTIONS.map((option) => (
                  <ToggleButton
                    key={option}
                    active={(answers.defectLabel || "Moderate defects") === option}
                    onClick={() => {
                      onAnswerChange("defectLabel", option);
                      onAnswerChange("defectLevel", mapDefectLevel(option));
                    }}
                    activeClass="border-brand-400 bg-brand-50 text-brand-800 shadow-sm"
                  >
                    {option}
                  </ToggleButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock3 size={18} className="text-brand-600" />
            <h3 className="text-[14px] font-display font-bold text-gray-800">2. Selling Urgency</h3>
          </div>
          <p className="text-[12px] text-gray-500 mb-4">How urgently do you need to convert this crop into a sale?</p>
          <div className="flex flex-wrap gap-2">
            {URGENCY_OPTIONS.map((option) => (
              <ToggleButton
                key={option}
                active={(answers.sellingUrgency || "Ask the system for a recommendation") === option}
                onClick={() => onAnswerChange("sellingUrgency", option)}
                activeClass="border-brand-400 bg-brand-50 text-brand-700 shadow-sm"
              >
                {option}
              </ToggleButton>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={18} className="text-brand-600" />
            <h3 className="text-[14px] font-display font-bold text-gray-800">3. Storage and Transport Readiness</h3>
          </div>
          <p className="text-[12px] text-gray-500 mb-4">These two factors strongly affect whether holding or moving the lot is practical.</p>
          <div className="flex flex-wrap gap-3">
            <ToggleButton
              active={answers.storageAvailable === "yes"}
              onClick={() => onAnswerChange("storageAvailable", answers.storageAvailable === "yes" ? "no" : "yes")}
              activeClass="border-brand-400 bg-white text-brand-700 shadow-sm"
            >
              Storage available
            </ToggleButton>
            <ToggleButton
              active={answers.transportArranged === "yes"}
              onClick={() => onAnswerChange("transportArranged", answers.transportArranged === "yes" ? "no" : "yes")}
              activeClass="border-brand-400 bg-white text-brand-700 shadow-sm"
            >
              Transport arranged
            </ToggleButton>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5 mt-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-brand-600" />
          <h3 className="text-[14px] font-display font-bold text-gray-800">4. Buyer Preference</h3>
        </div>
        <p className="text-[12px] text-gray-500 mb-4">Choose a preferred selling channel, or ask the system to suggest one.</p>
        <div className="flex flex-wrap gap-2">
          {BUYER_OPTIONS.map((option) => (
            <ToggleButton
              key={option}
              active={(answers.buyerPreference || "Request suggestion") === option}
              onClick={() => onAnswerChange("buyerPreference", option)}
              activeClass="border-brand-400 bg-brand-50 text-brand-700 shadow-sm"
            >
              {option}
            </ToggleButton>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SellingGuidedQuestions;
