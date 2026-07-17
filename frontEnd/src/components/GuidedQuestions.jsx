import { Droplets } from "lucide-react";

const STAGES = ["Germination", "Vegetative", "Flowering", "Fruiting", "Harvest-ready"];
const SYMPTOMS = ["Yellow leaves", "Wilting", "Spots on leaves", "Pest presence", "No visible issues"];

function GuidedQuestions({ answers, onAnswerChange }) {
  const toggleSymptom = (symptom) => {
    let current = [...(answers.symptoms || [])];

    if (current.includes(symptom)) {
      current = current.filter((item) => item !== symptom);
    } else if (symptom === "No visible issues") {
      current = ["No visible issues"];
    } else {
      current = current.filter((item) => item !== "No visible issues");
      current.push(symptom);
    }

    onAnswerChange("symptoms", current);
  };

  return (
    <div className="space-y-5">
      <section className="bg-white/80 backdrop-blur border border-brand-200/70 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="mb-5">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            Health Check
          </span>
          <h3 className="mt-3 text-lg font-display font-bold text-gray-900">Field Condition Questions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Answer the crop-health prompts below to generate treatment and management advice.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
            <h3 className="text-[14px] font-display font-bold text-gray-800 mb-1">1. Current Crop Growth Stage</h3>
            <p className="text-[12px] text-gray-500 mb-4">Choose the stage that best matches the field right now.</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => onAnswerChange("stage", stage)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                    answers.stage === stage
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 scale-[1.02]"
                      : "border-brand-200 text-brand-600 hover:bg-brand-50"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 sm:p-5">
            <h3 className="text-[14px] font-display font-bold text-gray-800 mb-1">2. Visible Crop Symptoms</h3>
            <p className="text-[12px] text-gray-500 mb-4">Select all symptoms you are seeing in the field.</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                    (answers.symptoms || []).includes(symptom)
                      ? "border-red-400 bg-red-50 text-red-700 shadow-sm scale-[1.02]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr,0.9fr] mt-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5">
            <h3 className="text-[14px] font-display font-bold text-gray-800 mb-1">3. Inputs Already Applied?</h3>
            <p className="text-[12px] text-gray-500 mb-4">Mention whether any fertilizer or pesticide has already been used.</p>
            <div className="flex flex-wrap gap-3 mb-3">
              <button
                type="button"
                onClick={() => onAnswerChange("appliedInputs", "yes")}
                className={`px-8 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
                  answers.appliedInputs === "yes"
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  onAnswerChange("appliedInputs", "no");
                  onAnswerChange("productUsed", "");
                }}
                className={`px-8 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
                  answers.appliedInputs === "no"
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                No
              </button>
            </div>
            {answers.appliedInputs === "yes" ? (
              <input
                type="text"
                placeholder="Specify fertilizer or pesticide used..."
                className="w-full px-4 py-3 text-[13px] rounded-xl border border-brand-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                value={answers.productUsed || ""}
                onChange={(event) => onAnswerChange("productUsed", event.target.value)}
              />
            ) : null}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
            <h3 className="text-[14px] font-display font-bold text-gray-800 mb-1">
              4. Water Availability <span className="text-gray-400 font-normal ml-1">Days of irrigation</span>
            </h3>
            <p className="text-[12px] text-gray-500 mb-4">Estimate how many irrigation days are currently available.</p>
            <div className="flex items-center gap-4 bg-white/70 p-4 rounded-2xl border border-blue-100">
              <Droplets size={22} className="text-blue-500 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="60"
                value={answers.waterDays || 0}
                onChange={(event) => onAnswerChange("waterDays", event.target.value)}
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-[80px] text-center bg-white text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm text-sm">
                {answers.waterDays || 0}
                {Number(answers.waterDays) >= 60 ? "+" : ""}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GuidedQuestions;
