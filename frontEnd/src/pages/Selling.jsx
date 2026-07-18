import { useState } from "react";
import { Menu, X, Clock, BadgeIndianRupee, LoaderCircle, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import PhaseNavigation from "../components/PhaseNavigation";
import SidebarFooter from "../components/SidebarFooter";
import SellingGuidedQuestions from "../components/SellingGuidedQuestions";
import SellingCards from "../components/SellingCards";

function SellingInterface({
  
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
  const [answers, setAnswers] = useState({
    cropType: "",
    quantityValue: 25,
    quantityUnit: "quintals",
    sellingUrgency: "Ask the system for a recommendation",
    storageAvailable: "no",
    transportArranged: "no",
    labourAvailable: "no",
    buyerPreference: "Request suggestion",
    qualityLabel: "Average lot",
    qualitySignal: "average",
    defectLabel: "Moderate defects",
    defectLevel: "medium",
  });


  const handleAnswerChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit({ answers });
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.05),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#fafafa_100%)]">
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
                <BadgeIndianRupee size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">Selling Desk</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">Post-Harvest Decisions</p>
              </div>
            </div>
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>
          <PhaseNavigation   className="mb-5" />
          <div className="text-[12px] text-brand-400 mt-2 px-1">
            <p>Estimate price, compare buyer routes, and decide whether selling now or storing briefly makes more sense.</p>
          </div>
        </div>

        <div className="flex-1 px-4 pb-2 mt-4">
          <div className="flex items-center gap-2 px-2 mb-3">
            <Clock size={13} className="text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-500">Selling Sessions</span>
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-brand-600">No selling analyses yet</p>
              <p className="text-[11px] text-brand-700 mt-1">Create a selling plan to get started</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sessions.map((session) => (
                <button key={session.id} type="button" onClick={() => onSelectSession(session)} className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-all group border border-transparent hover:border-brand-800">
                  <p className="text-[13px] font-medium text-brand-200 truncate">{session.crop} - {session.date}</p>
                  <p className="text-[11px] text-brand-500 mt-1">{session.readiness}</p>
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div className="space-y-1">
                <h2 className="text-[15px] sm:text-lg font-display font-bold text-gray-800">Selling Strategy Dashboard</h2>
                <p className="text-[12px] text-gray-500 max-w-2xl">
                  Lightweight pricing and market guidance based on photos, quantity, urgency, and logistics inputs.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-[13px] shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0 transition-all duration-200 sm:self-auto self-stretch"
            >
              {loading && <LoaderCircle size={16} className="spinner" />}
              <span className="hidden sm:inline">{loading ? "Analyzing..." : "Generate Selling Plan"}</span>
              <span className="sm:hidden">{loading ? "Analyzing..." : "Run Plan"}</span>
            </button>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {loading ? (
            <div className="animate-fade-in bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BadgeIndianRupee size={28} className="text-brand-500 animate-pulse" />
              </div>
              <p className="font-display font-semibold text-brand-900 text-lg">Building your selling strategy...</p>
              <p className="text-sm text-brand-700/80 mt-2">Checking quality signals, quantity, price references, and logistics options.</p>
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
              <SellingGuidedQuestions answers={answers} onAnswerChange={handleAnswerChange} />
            </>
          ) : null}

          {!loading && result ? <SellingCards result={result} /> : null}
        </div>
      </main>
    </div>
  );
}

export default SellingInterface;
