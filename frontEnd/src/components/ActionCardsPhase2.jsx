import { FlaskConical, Bug, CloudSun, Leaf, Droplets, CalendarCheck } from "lucide-react";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 mb-2 pb-2 border-b border-black/5 last:border-0 last:mb-0 last:pb-0">
      <span className="text-[12px] font-bold text-black/60 w-24 flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-black/80 whitespace-pre-line">{Array.isArray(value) ? value.join(", ") : value}</span>
    </div>
  );
}

function ActionCardsPhase2({ result }) {
  if (!result) return null;

  const diseaseDetection = result.diseaseDetection || result;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 px-2">
        <h3 className="font-display font-bold text-xl text-brand-900">Crop Health Analysis</h3>
        <div className="h-px flex-1 bg-brand-200"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {diseaseDetection ? (
          <>
            {/* Diagnosis Summary Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-200/40 rounded-full blur-2xl group-hover:bg-rose-300/40 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
                  <Bug size={20} />
                </div>
                <h4 className="font-display font-bold text-rose-900 leading-tight">Diagnosis Summary</h4>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100/50 space-y-1">
                <InfoRow label="Plant / Crop" value={diseaseDetection.plant} />
                <InfoRow label="Health Status" value={diseaseDetection.health_status} />
                <InfoRow label="Disease / Pest" value={diseaseDetection.disease_name} />
                <InfoRow
                  label="Confidence"
                  value={
                    typeof diseaseDetection.confidence === "number"
                      ? `${Math.round(diseaseDetection.confidence * 100)}%`
                      : diseaseDetection.confidence
                  }
                />
                {diseaseDetection.vision_labels && diseaseDetection.vision_labels.length > 0 && (
                  <InfoRow label="Labels Detected" value={diseaseDetection.vision_labels} />
                )}
              </div>
            </div>

            {/* Treatment & Cures Section */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl p-6 border border-brand-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 shadow-sm border border-brand-100">
                  <Leaf size={20} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-gray-900 leading-tight">Treatment & Cure Recommendations</h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Agricultural remedies and preventative measures.</p>
                </div>
              </div>
              
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                {diseaseDetection.treatment ? (
                  <div className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-line">
                    {diseaseDetection.treatment}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-6">No treatment recommendations found.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 col-span-3 text-center py-8">No disease detection data available.</p>
        )}
      </div>
    </div>
  );
}

export default ActionCardsPhase2;
