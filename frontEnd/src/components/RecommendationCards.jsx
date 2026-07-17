import {
  Thermometer, CloudRain, Droplets, TrendingUp, ShieldCheck, Sprout, Leaf, Timer,
  IndianRupee, BarChart3, Zap, Wind
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value || 0);
}

/* ===== WEATHER SUMMARY CARD ===== */
function WeatherCard({ weather }) {
  if (!weather) return null;
  const metrics = [
    { icon: <Thermometer size={20} />, value: `${weather.temperature}°C`, label: "Temperature", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: <CloudRain size={20} />, value: `${weather.precipitation} mm`, label: "Rainfall", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <Droplets size={20} />, value: `${weather.humidity}%`, label: "Humidity", color: "text-cyan-500", bg: "bg-cyan-50" },
    { icon: <Wind size={20} />, value: `${weather.windSpeed ?? "12"} km/h`, label: "Wind Speed", color: "text-teal-500", bg: "bg-teal-50" },
    { icon: <TrendingUp size={20} />, value: `${weather.elevation ?? "150"} m`, label: "Elevation", color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/50 rounded-2xl border border-blue-100/60 p-5 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <CloudRain size={16} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-900">Live Weather &amp; Geography</h3>
            <p className="text-[11px] text-gray-400">From Open-Meteo &amp; Open-Elevation API</p>
          </div>
        </div>
        <span className="text-[11px] bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-full">
          📍 {weather.location?.district}, {weather.location?.state}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center ${m.color} mx-auto mb-2.5`}>
              {m.icon}
            </div>
            <p className="font-display font-bold text-lg text-gray-900">{m.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== SOIL SUMMARY CARD ===== */
function SoilCard({ soil }) {
  if (!soil) return null;
  const metrics = [
    { label: "Soil pH", value: soil.pH, desc: soil.pH < 6.0 ? "Acidic" : soil.pH > 7.5 ? "Alkaline" : "Optimal / Neutral", color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Clay Content", value: `${soil.clay}%`, desc: "Fine particles", color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Sand Content", value: `${soil.sand}%`, desc: "Coarse texture", color: "text-orange-700", bg: "bg-orange-50" },
    { label: "Silt Content", value: `${soil.silt}%`, desc: "Medium particles", color: "text-yellow-700", bg: "bg-yellow-50" },
    { label: "Organic Carbon", value: `${soil.organicCarbon}%`, desc: "Organic matter", color: "text-purple-700", bg: "bg-purple-50" },
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 rounded-2xl border border-emerald-100/60 p-5 shadow-sm animate-slide-up">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Leaf size={16} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-900">Soil Properties Profile</h3>
          <p className="text-[11px] text-gray-400">From SoilGrids API (0-5cm depth)</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">{m.label}</span>
            <p className={`font-display font-bold text-lg ${m.color} mb-1`}>{m.value}</p>
            <span className="text-[10px] text-gray-400 block leading-tight">{m.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== SINGLE CROP CARD ===== */
function CropCard({ crop, rank }) {
  const riskColors = {
    Low: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    High: "bg-red-50 text-red-700 border-red-200",
  };
  const riskClass = riskColors[crop.risk_level] || riskColors.Medium;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const ringColor = rank === 1 ? "ring-brand-400/30" : "ring-transparent";

  const scoreColor = crop.suitability_score >= 75
    ? "text-brand-600"
    : crop.suitability_score >= 50
      ? "text-amber-600"
      : "text-red-500";

  return (
    <article
      id={`crop-card-${rank}`}
      className={`
        bg-white rounded-2xl border border-gray-200/70 shadow-sm
        hover:shadow-lg hover:border-brand-200
        ring-2 ${ringColor}
        transition-all duration-300 animate-slide-up overflow-hidden
      `}
      style={{ animationDelay: `${rank * 100}ms` }}
    >
      {/* Rank 1 top accent */}
      {rank === 1 && (
        <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
      )}

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none mt-0.5">{medal}</span>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-gray-900">{crop.crop}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
                  <Timer size={12} /> {crop.crop_info?.season} · {crop.crop_info?.growing_days} days
                </span>
              </div>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            {/* Circular score display */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke={crop.suitability_score >= 75 ? "#22c55e" : crop.suitability_score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(crop.suitability_score / 100) * 175.93} 175.93`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display font-bold text-lg leading-none ${scoreColor}`}>{crop.suitability_score}%</span>
                <span className="text-[9px] text-gray-400">Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {[
            { icon: <IndianRupee size={14} />, label: "Est. Cost", value: crop.estimated_cost, color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: <TrendingUp size={14} />, label: "Exp. Yield", value: crop.expected_yield, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: <ShieldCheck size={14} />, label: "Risk", value: crop.risk_level, color: "", bg: "", isRisk: true },
            { icon: <BarChart3 size={14} />, label: "Market Price", value: `${formatCurrency(crop.crop_info?.market_price)}/t`, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-100 rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`${stat.color || "text-gray-400"}`}>{stat.icon}</span>
                <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">{stat.label}</span>
              </div>
              {stat.isRisk ? (
                <span className={`inline-block text-[12px] font-semibold px-2 py-0.5 rounded-full border ${riskClass}`}>
                  {stat.value}
                </span>
              ) : (
                <p className="text-[13px] font-semibold text-gray-800 truncate">{stat.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { icon: <Thermometer size={11} />, text: crop.crop_info?.ideal_temp },
            { icon: <CloudRain size={11} />, text: crop.crop_info?.rainfall_range },
            { icon: <Droplets size={11} />, text: `Water: ${crop.crop_info?.water_requirement}` },
            { icon: <Sprout size={11} />, text: `Labour: ${crop.crop_info?.labour_need}` },
          ].map((pill, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {pill.icon} {pill.text}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ===== MAIN COMPONENT ===== */
function RecommendationCards({ result }) {
  if (!result) {
    return (
      <section id="results-placeholder" className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-10 sm:p-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <Leaf size={28} className="text-brand-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-800 mb-2">Your recommendations will appear here</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          Click <strong className="text-brand-600">"Detect My Location"</strong> above to get AI-powered crop suggestions
          based on your local soil, live weather, and elevation data.
        </p>
      </section>
    );
  }

  const { top_crops, weather_data, farmer_profile } = result;

  return (
    <section id="results-section" className="space-y-5 animate-fade-in">
      {/* Results Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-2">
            <Zap size={11} className="inline -mt-0.5 mr-1" />
            AI Recommendation
          </span>
          <h2 className="font-display font-bold text-2xl text-gray-900">Top 3 Crops for Your Farm</h2>
          <p className="text-sm text-gray-400 mt-1">
            Based on live soil &amp; weather in <strong className="text-gray-600">{farmer_profile?.district}, {farmer_profile?.state}</strong>
          </p>
        </div>
      </div>

      {/* Weather Card */}
      <WeatherCard weather={weather_data} />

      {/* Soil Card */}
      <SoilCard soil={result.soil_data} />

      {/* Crop Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {top_crops?.map((crop, index) => (
          <CropCard key={crop.crop} crop={crop} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

export default RecommendationCards;
