import {
  Sprout, LoaderCircle, Menu, X, Clock, ChevronRight, LogOut, MapPin
} from "lucide-react";
import { useTranslation } from "react-i18next";
import InputBox from "../components/InputBox";
import RecommendationCards from "../components/RecommendationCards";
import PhaseNavigation from "../components/PhaseNavigation";
import SidebarFooter from "../components/SidebarFooter";

function ChatInterface({
  formState, districts, onFieldChange, loading, errorMessage, result,
  sessions, onSelectSession, activeFilter, onFilterChange,
  sidebarOpen, onToggleSidebar,
  user, onLogout, onEditProfile,
  requestLocationAccess, locating,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggleSidebar} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[300px]
        bg-brand-950 text-white flex flex-col
        border-r border-brand-900/50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        sidebar-scroll overflow-y-auto
      `}>
        {/* Sidebar Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Sprout size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">{t("common.appName")}</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">{t("common.tagline")}</p>
              </div>
            </div>
            <button onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>

          <PhaseNavigation className="mb-5" />
        </div>

        {/* Session History */}
        <div className="flex-1 px-4 pb-2">
          <div className="flex items-center gap-2 px-2 mb-3 mt-2">
            <Clock size={13} className="text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-500">{t("planning.recentPlans")}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-brand-600">{t("planning.noSessions")}</p>
              <p className="text-[11px] text-brand-700 mt-1">{t("planning.noSessionsDesc")}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-all group border border-transparent hover:border-brand-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-brand-200 truncate">
                        {session.district}, {session.state}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-brand-400">{session.topCrop}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-medium">
                          {session.score}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-brand-500">{session.timestamp}</span>
                      <ChevronRight size={14} className="text-brand-600" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter user={user} onLogout={onLogout} onEditProfile={onEditProfile} />
        <div className="pb-4 px-4 text-center">
          <p className="text-[11px] text-brand-500 font-medium">{t("common.builtFor")}</p>
          <p className="text-[10px] text-brand-700 mt-0.5">{t("common.poweredBy")}</p>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="w-full sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 py-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div className="hidden sm:block">
                <h2 className="font-display font-bold text-gray-900 text-[15px] leading-tight">{t("planning.title")}</h2>
                <p className="text-[12px] text-gray-400">{t("planning.subtitle")}</p>
              </div>
            </div>

            {/* Detect Location Button */}
            <button
              type="button"
              id="btn-detect-location"
              onClick={() => requestLocationAccess && requestLocationAccess(true)}
              disabled={locating || loading}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                bg-gradient-to-r from-brand-600 to-brand-500
                text-white font-semibold text-[13px]
                shadow-lg shadow-brand-500/25
                hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5
                disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0
                transition-all duration-200"
            >
              {(locating || loading) ? <LoaderCircle size={16} className="spinner" /> : <MapPin size={16} />}
              <span className="hidden sm:inline">{locating ? "Detecting..." : loading ? "Analysing..." : "Detect My Location"}</span>
              <span className="sm:hidden">{(locating || loading) ? "..." : "Detect"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Loading Overlay */}
          {(loading || locating) && (
            <div className="animate-fade-in bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="loader-dot w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                <div className="loader-dot w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                <div className="loader-dot w-2.5 h-2.5 rounded-full bg-brand-500"></div>
              </div>
              <p className="font-display font-semibold text-brand-800 text-lg">
                {locating ? "Detecting your location…" : t("planning.loadingTitle")}
              </p>
              <p className="text-sm text-brand-600/80 mt-2">{t("planning.loadingDesc")}</p>
            </div>
          )}

          {/* Input Form — only show when not loading */}
          {!loading && !locating && (
            <InputBox
              formState={formState}
              districts={districts}
              onFieldChange={onFieldChange}
              requestLocationAccess={requestLocationAccess}
              locating={locating}
            />
          )}

          {/* Error */}
          {errorMessage && (
            <div id="error-message" className="animate-slide-up bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700 text-sm flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Results */}
          {!loading && !locating && (
            <RecommendationCards
              result={result}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default ChatInterface;
