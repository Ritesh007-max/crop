import { useState } from "react";
import { Menu, X, Clock, Activity, LoaderCircle, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import PhaseNavigation from "../components/PhaseNavigation";
import SidebarFooter from "../components/SidebarFooter";
import GuidedQuestions from "../components/GuidedQuestions";
import ActionCardsPhase2 from "../components/ActionCardsPhase2";
import PhotoUploader from "../components/PhotoUploader";

function CropHealthInterface({
  
  sessions,
  onSelectSession,
  sidebarOpen,
  onToggleSidebar,
  onSubmit,
  loading,
  errorMessage,
  result,
  user,
  onLogout,
  onEditProfile,
}) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({ photos: {}, report: null });

  const handleAnswerChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, value) => {
    setFiles((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit({ files, answers });
  };

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
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Activity size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">In-Season Health</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">Crop Management</p>
              </div>
            </div>
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>
          <PhaseNavigation   className="mb-5" />
          <div className="text-[12px] text-brand-400 mt-2 px-1">
            <p>Maintain crop health by identifying problems early and receiving actionable recommendations.</p>
          </div>
        </div>

        <div className="flex-1 px-4 pb-2 mt-4">
          <div className="flex items-center gap-2 px-2 mb-3">
            <Clock size={13} className="text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-500">Past Scans</span>
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-brand-600">No health scans yet</p>
              <p className="text-[11px] text-brand-700 mt-1">Analyze a crop to get started</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-all group border border-transparent hover:border-brand-800"
                >
                  <p className="text-[13px] font-medium text-brand-200 truncate">
                    {session.stage} - {session.date}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter user={user} onLogout={onLogout} onEditProfile={onEditProfile} />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col items-center">
        <div className="w-full sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div className="space-y-1">
                <h2 className="text-[15px] sm:text-lg font-display font-bold text-gray-800">Farm Maintenance Dashboard</h2>
                <p className="text-[12px] text-gray-500 max-w-2xl">
                  Review crop stress signals, recent inputs, and irrigation support before acting in the field.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[13px] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 transition-all duration-200 sm:self-auto self-stretch"
            >
              {loading ? <LoaderCircle size={16} className="spinner" /> : <Activity size={16} />}
              <span className="hidden sm:inline">{loading ? "Analyzing..." : "Analyze Crop Health"}</span>
              <span className="sm:hidden">{loading ? "Analyzing..." : "Run Analysis"}</span>
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {loading ? (
            <div className="animate-fade-in bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 sm:p-8 mb-6 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Activity size={28} className="text-blue-500 animate-pulse" />
              </div>
              <p className="font-display font-semibold text-blue-900 text-lg">Running diagnostic algorithms...</p>
              <p className="text-sm text-blue-700/80 mt-2">Checking plant imagery, soil conditions, and matching against pest databases.</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700 text-sm flex items-start gap-3 shadow-sm">
              <span className="text-red-400 text-lg mt-0.5">!</span>
              <p>{errorMessage}</p>
            </div>
          ) : null}

          {!loading && !result ? (
            <>
              <PhotoUploader files={files} onFileChange={handleFileChange} singleImage />
              <GuidedQuestions answers={answers} onAnswerChange={handleAnswerChange} />
            </>
          ) : null}

          {!loading && result ? <ActionCardsPhase2 result={result} /> : null}
        </div>
      </main>
    </div>
  );
}

export default CropHealthInterface;
