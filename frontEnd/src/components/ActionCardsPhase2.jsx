import { FlaskConical, Bug, CloudSun, Leaf, Droplets, CalendarCheck } from "lucide-react";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 mb-2 pb-2 border-b border-black/5 last:border-0 last:mb-0 last:pb-0">
      <span className="text-[12px] font-bold text-black/60 w-24 flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-black/80">{Array.isArray(value) ? value.join(", ") : value}</span>
    </div>
  );
}

function ActionCardsPhase2({ result }) {
  if (!result) return null;

  const cards = result.cards;
  const diseaseDetection = result.diseaseDetection;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 px-2">
        <h3 className="font-display font-bold text-xl text-brand-900">Crop Health Analysis</h3>
        <div className="h-px flex-1 bg-brand-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {diseaseDetection ? (
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-200/40 rounded-full blur-2xl group-hover:bg-rose-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
                <Bug size={20} />
              </div>
              <h4 className="font-display font-bold text-rose-900 leading-tight">Image Health Detection</h4>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-rose-100">
              <InfoRow label="Plant" value={diseaseDetection.plant} />
              <InfoRow label="Health" value={diseaseDetection.health_status} />
              <InfoRow label="Disease" value={diseaseDetection.disease_name} />
              <InfoRow
                label="Confidence"
                value={
                  typeof diseaseDetection.confidence === "number"
                    ? `${Math.round(diseaseDetection.confidence * 100)}%`
                    : diseaseDetection.confidence
                }
              />
              <InfoRow label="Labels" value={diseaseDetection.vision_labels} />
              <InfoRow label="Treatment" value={diseaseDetection.treatment} />
            </div>
          </div>
        ) : null}

        {!cards ? null : (
          <>
        {cards.fertilizerGuidance ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-200/40 rounded-full blur-2xl group-hover:bg-green-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm border border-green-200">
                <FlaskConical size={20} />
              </div>
              <h4 className="font-display font-bold text-green-900 leading-tight">Fertilizer Guide</h4>
            </div>
            <p className="text-[13px] text-green-800/80 mb-4">{cards.fertilizerGuidance.description}</p>
            <div className="bg-white/60 rounded-xl p-3 border border-green-100">
              <InfoRow label="Recommend" value={cards.fertilizerGuidance.recommended} />
              <InfoRow label="Dosage" value={cards.fertilizerGuidance.dosage} />
              <InfoRow label="Timing" value={cards.fertilizerGuidance.timing} />
              <InfoRow label="Avoid" value={cards.fertilizerGuidance.avoid} />
            </div>
          </div>
        ) : null}

        {cards.pestPrevention ? (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-200/40 rounded-full blur-2xl group-hover:bg-orange-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                <Bug size={20} />
              </div>
              <h4 className="font-display font-bold text-orange-900 leading-tight">Pest & Disease</h4>
            </div>
            <p className="text-[13px] text-orange-800/80 mb-4">{cards.pestPrevention.description}</p>
            <div className="bg-white/60 rounded-xl p-3 border border-orange-100">
              <InfoRow label="Risks" value={cards.pestPrevention.risks} />
              <InfoRow label="Prevention" value={cards.pestPrevention.prevention} />
              <InfoRow label="Warning" value={cards.pestPrevention.warningSigns} />
              <InfoRow label="Treatment" value={cards.pestPrevention.treatments} />
            </div>
          </div>
        ) : null}

        {cards.weatherForecast ? (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-indigo-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-200/40 rounded-full blur-2xl group-hover:bg-indigo-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
                <CloudSun size={20} />
              </div>
              <h4 className="font-display font-bold text-indigo-900 leading-tight">10-Day Weather</h4>
            </div>
            <p className="text-[13px] text-indigo-800/80 mb-4">{cards.weatherForecast.description}</p>
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100">
              <InfoRow label="Expected" value={cards.weatherForecast.expected} />
              <InfoRow label="Temp" value={cards.weatherForecast.temperature} />
              <InfoRow label="Humidity" value={cards.weatherForecast.humidity} />
              <InfoRow label="Rainfall" value={cards.weatherForecast.rainfall} />
              <InfoRow label="Impact" value={cards.weatherForecast.impact} />
            </div>
          </div>
        ) : null}

        {cards.soilSustainability ? (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-200/40 rounded-full blur-2xl group-hover:bg-amber-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm border border-amber-200">
                <Leaf size={20} />
              </div>
              <h4 className="font-display font-bold text-amber-900 leading-tight">Soil Health</h4>
            </div>
            <p className="text-[13px] text-amber-800/80 mb-4">{cards.soilSustainability.description}</p>
            <div className="bg-white/60 rounded-xl p-3 border border-amber-100">
              <InfoRow label="Rating" value={cards.soilSustainability.rating} />
              <InfoRow label="Details" value={cards.soilSustainability.details} />
              <InfoRow label="Action" value={cards.soilSustainability.actionRequired} />
            </div>
          </div>
        ) : null}

        {cards.waterPlanning ? (
          <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-3xl p-6 border border-cyan-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-200/40 rounded-full blur-2xl group-hover:bg-cyan-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm border border-cyan-200">
                <Droplets size={20} />
              </div>
              <h4 className="font-display font-bold text-cyan-900 leading-tight">Water Planning</h4>
            </div>
            <p className="text-[13px] text-cyan-800/80 mb-4">{cards.waterPlanning.description}</p>
            <div className="bg-white/60 rounded-xl p-3 border border-cyan-100">
              <InfoRow label="Status" value={cards.waterPlanning.status} />
              <InfoRow label="Needed" value={cards.waterPlanning.waterNeeded} />
              <InfoRow label="Available" value={cards.waterPlanning.available} />
              <InfoRow label="Action" value={cards.waterPlanning.recommendation} />
            </div>
          </div>
        ) : null}

        {cards.actionPlan ? (
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-3xl p-6 border border-purple-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1 border-2">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-200/40 rounded-full blur-2xl group-hover:bg-purple-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">
                <CalendarCheck size={20} />
              </div>
              <h4 className="font-display font-bold text-purple-900 leading-tight">Action Plan</h4>
            </div>
            <p className="text-[13px] text-purple-800/80 mb-4">{cards.actionPlan.description}</p>
            <div className="bg-white/60 rounded-xl p-3 border border-purple-100 space-y-3">
              {(cards.actionPlan.tasks || []).map((task, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-[11px] font-bold text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">{task.day}</span>
                  <span className="text-[13px] text-purple-900">{task.task}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default ActionCardsPhase2;
