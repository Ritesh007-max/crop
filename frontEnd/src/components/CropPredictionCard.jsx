import React, { useState } from "react";
import { Brain, TrendingUp, AlertTriangle, Info, LoaderCircle, Thermometer, Droplets, CloudRain, Activity, Leaf, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const CropPredictionCard = ({ prediction, loading, onRunPrediction }) => {
  const { t } = useTranslation();
  const [params, setParams] = useState({
    temperature: "30",
    humidity: "50",
    rainfall: "200",
    soil_ph: "6.5",
    ndvi: "0.5",
    crop_type: "Rice"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = () => {
    const parsedParams = {
      temperature: parseFloat(params.temperature) || 0,
      humidity: parseFloat(params.humidity) || 0,
      rainfall: parseFloat(params.rainfall) || 0,
      soil_ph: parseFloat(params.soil_ph) || 0,
      ndvi: parseFloat(params.ndvi) || 0,
      crop_type: params.crop_type
    };
    onRunPrediction(parsedParams);
  };

  const InputField = ({ label, icon: Icon, name, value, type = "number", step = "1", unit = "", placeholder = "" }) => (
    <div className="group flex flex-col gap-2.5 flex-1">
      <div className="flex flex-col gap-1 px-1">
        <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em] flex items-center gap-2">
          <Icon size={16} className="text-brand-500" />
          {label}
        </label>
        {unit && <span className="text-[10px] font-bold text-brand-400/80 uppercase tracking-tighter italic">{unit}</span>}
      </div>
      <div className="relative">
        <input 
          type={type} 
          name={name} 
          value={value} 
          step={step}
          placeholder={placeholder}
          onChange={handleChange} 
          className="w-full px-5 py-4 text-base font-black rounded-2xl border-2 border-gray-100 bg-gray-50/50 
                   text-gray-900 placeholder:text-gray-400
                   focus:ring-8 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white
                   transition-all outline-none shadow-sm group-hover:border-gray-200" 
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] border border-brand-100 p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-brand-500/5">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl animate-pulse"></div>
          <LoaderCircle size={48} className="text-brand-500 animate-spin relative z-10" />
        </div>
        <h3 className="text-lg font-display font-black text-gray-900 tracking-tight">{t("prediction.processing")}</h3>
        <p className="text-[11px] text-gray-500 mt-1.5 font-bold uppercase tracking-widest">{t("prediction.optimizing")}</p>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case "High": return "text-red-700 bg-red-50 border-red-200 shadow-sm shadow-red-500/5";
      case "Medium": return "text-amber-700 bg-amber-50 border-amber-200 shadow-sm shadow-amber-500/5";
      default: return "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-500/5";
    }
  };

  if (!prediction) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50"></div>
        
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-2xl shadow-brand-500/30 rotate-3">
              <Brain size={32} />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-900 text-2xl tracking-tight">{t("prediction.title")}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[12px] text-brand-600 font-black uppercase tracking-[0.1em]">{t("prediction.subtitle")}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-12">
            {/* Environmental Dynamics */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-4 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500-rgb),0.5)]"></div>
                <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">{t("prediction.atmospheric")}</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <InputField label={t("prediction.temp")} icon={Thermometer} name="temperature" value={params.temperature} unit="°Celcius" />
                <InputField label={t("prediction.humidity")} icon={Droplets} name="humidity" value={params.humidity} unit="% Percent" />
              </div>
            </div>

            {/* Soil & Vegetation */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-4 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500-rgb),0.5)]"></div>
                <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">{t("prediction.soilVeg")}</span>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <InputField label={t("prediction.rainfall")} icon={CloudRain} name="rainfall" value={params.rainfall} unit="MM Rate" />
                <InputField label={t("prediction.soilPh")} icon={Activity} name="soil_ph" value={params.soil_ph} step="0.1" unit="pH Scale" />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <InputField label={t("prediction.ndvi")} icon={Leaf} name="ndvi" value={params.ndvi} step="0.01" unit="Green Index" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center px-1">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Brain size={14} className="text-brand-500" />
                      {t("prediction.targetCrop")}
                    </label>
                  </div>
                  <div className="relative group">
                    <select 
                      name="crop_type" 
                      value={params.crop_type} 
                      onChange={handleChange} 
                      className="w-full px-5 py-4 text-base font-black text-gray-900 rounded-2xl border-2 border-gray-100 bg-gray-50/50 
                               appearance-none focus:ring-8 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white
                               transition-all outline-none shadow-sm group-hover:border-gray-200 cursor-pointer"
                    >
                      <option value="Rice">Rice (Oryza sativa)</option>
                      <option value="Wheat">Wheat (Triticum)</option>
                      <option value="Maize">Maize (Zea mays)</option>
                      <option value="Cotton">Cotton (Gossypium)</option>
                      <option value="Sugarcane">Sugarcane (Saccharum)</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-900 pointer-events-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            className="w-full mt-12 py-6 rounded-[2rem] bg-gray-900 text-white font-black text-sm blur-none
                     hover:bg-brand-600 active:scale-[0.98] transition-all 
                     shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 group"
          >
            <span className="tracking-[0.2em] uppercase">{t("prediction.runAnalysis")}</span>
            <TrendingUp size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black px-7 py-8 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Brain size={120} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-200">{t("prediction.report")}</span>
            </div>
            <h2 className="font-display font-black text-2xl tracking-tight text-left italic">{t("prediction.title")}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-brand-400" />
          </div>
        </div>
      </div>
      
      <div className="p-7 space-y-7">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[2.5rem] bg-gray-50 border border-gray-100 text-center relative group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-3">{t("prediction.predYield")}</p>
            <div className="flex flex-col">
              <span className="text-3xl font-display font-black text-gray-900 tracking-tighter">{prediction.predicted_yield}</span>
              <span className="text-[10px] text-gray-400 font-black mt-1">KG PER HECTARE</span>
            </div>
          </div>
          
          <div className="p-5 rounded-[2.5rem] bg-brand-50/20 border border-brand-100 text-center relative group hover:bg-white hover:shadow-xl hover:shadow-brand-500/10 transition-all">
            <p className="text-[9px] text-brand-400 uppercase font-black tracking-widest mb-3">{t("prediction.conf")}</p>
            <div className="flex flex-col">
              <span className="text-3xl font-display font-black text-brand-600 tracking-tighter">{prediction.confidence_score}%</span>
              <span className="text-[10px] text-brand-400 font-black mt-1">PROBABILITY RATE</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border-2 flex items-center gap-5 transition-colors ${getRiskColor(prediction.risk_level)}`}>
          <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm border border-current/10 flex items-center justify-center shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">{t("prediction.stability")}</p>
            <p className="text-lg font-black tracking-tight">{prediction.risk_level} Uncertainty</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 text-white relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white/5 rotate-12 group-hover:scale-110 transition-transform">
            <Info size={80} />
          </div>
          <div className="relative z-10 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
              <p className="text-[10px] text-brand-400 uppercase font-black tracking-widest">{t("prediction.narrative")}</p>
            </div>
            <p className="text-[13px] font-bold leading-relaxed text-gray-200 italic">
              "{prediction.recommended_crop_health_status}"
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => onRunPrediction(null)}
          className="w-full py-4 text-[10px] font-black text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all uppercase tracking-[0.2em] border border-transparent hover:border-brand-100"
        >
          {t("prediction.reset")}
        </button>
      </div>
    </div>
  );
};

export default CropPredictionCard;
