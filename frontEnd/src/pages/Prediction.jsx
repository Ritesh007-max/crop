import { useTranslation } from "react-i18next";
import PhaseNavigation from "../components/PhaseNavigation";
import CropPredictionCard from "../components/CropPredictionCard";
import SidebarFooter from "../components/SidebarFooter";
import { Brain, X, LogOut, Menu } from "lucide-react";
function CropPredictionInterface({
  
  sidebarOpen,
  onToggleSidebar,
  prediction,
  loading,
  onRunPrediction,
  user,
  onLogout,
  onEditProfile,
}) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      {sidebarOpen ? <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggleSidebar} /> : null}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-[300px]
          bg-brand-950 text-white flex flex-col
          border-r border-brand-900/50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          sidebar-scroll overflow-y-auto
        `}
      >
        <div className="p-6 pb-4 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Brain size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">{t("prediction.title")}</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">AI Predictor</p>
              </div>
            </div>
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>
          <PhaseNavigation   className="mb-5" />
          
          <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">About Phase 5</h4>
            <p className="text-[12px] text-brand-200 leading-relaxed font-medium">
              {t("prediction.subtitle")}
            </p>
          </div>
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter user={user} onLogout={onLogout} onEditProfile={onEditProfile} />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col items-center">
        <div className="w-full sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-800">{t("prediction.title")}</h2>
                <p className="text-[12px] text-gray-500">{t("prediction.subtitle")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
           <CropPredictionCard 
              prediction={prediction} 
              loading={loading} 
              onRunPrediction={onRunPrediction} 
           />
        </div>
      </main>
    </div>
  );
}

export default CropPredictionInterface;
