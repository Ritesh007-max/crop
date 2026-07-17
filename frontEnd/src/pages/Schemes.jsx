import { useState, useEffect } from "react";
import axios from "axios";
import {
  Sprout, Menu, X, Clock, Landmark, LogOut,
  Search, ExternalLink, Filter, ChevronDown, ChevronUp,
  ShieldCheck, CreditCard, Building2, Tractor, Loader2, AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PhaseNavigation from "../components/PhaseNavigation";
import SidebarFooter from "../components/SidebarFooter";

const CATEGORY_OPTIONS = [
  { key: "all", label: "All Schemes" },
  { key: "subsidy", label: "Subsidies" },
  { key: "insurance", label: "Insurance" },
  { key: "credit", label: "Credit / Loans" },
  { key: "infrastructure", label: "Infrastructure" },
];

const CATEGORY_CONFIG = {
  subsidy: { label: "Subsidy", color: "bg-emerald-100 text-emerald-700", icon: ShieldCheck },
  insurance: { label: "Insurance", color: "bg-blue-100 text-blue-700", icon: ShieldCheck },
  credit: { label: "Credit", color: "bg-amber-100 text-amber-700", icon: CreditCard },
  infrastructure: { label: "Infrastructure", color: "bg-purple-100 text-purple-700", icon: Building2 },
};

function SchemesInterface({  user, onLogout, onEditProfile }) {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch schemes on mount and when filters change
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    const params = {};
    if (category !== "all") params.category = category;
    if (stateFilter !== "all") params.state = stateFilter;
    if (search.trim()) params.search = search.trim();

    axios
      .get(`${import.meta.env.VITE_API_URL || ""}/api/schemes`, { params })
      .then((res) => {
        if (!ignore) {
          setSchemes(res.data.schemes || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.error || t("schemes.failedToLoad"));
          setLoading(false);
        }
      });

    return () => { ignore = true; };
  }, [category, stateFilter, search]);

  const STATES = [
    "all", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Sprout size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">{t("common.appName")}</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">{t("common.tagline")}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>

          <PhaseNavigation   className="mb-5" />

          {/* Feature cards */}
          <div className="space-y-1">
            {[
              { icon: <ShieldCheck size={15} />, label: t("schemes.sidebar.central"), desc: t("schemes.sidebar.centralDesc") },
              { icon: <Building2 size={15} />, label: t("schemes.sidebar.state"), desc: t("schemes.sidebar.stateDesc") },
              { icon: <CreditCard size={15} />, label: t("schemes.sidebar.credit"), desc: t("schemes.sidebar.creditDesc") },
              { icon: <Tractor size={15} />, label: t("schemes.sidebar.infra"), desc: t("schemes.sidebar.infraDesc") },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-brand-400 group-hover:text-brand-300 transition-colors">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-brand-100 leading-tight">{item.label}</p>
                  <p className="text-[11px] text-brand-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="flex-1 px-4 pb-2">
          <div className="flex items-center gap-2 px-2 mb-3 mt-2">
            <Landmark size={13} className="text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-500">{t("schemes.quickInfo")}</span>
          </div>
          <div className="px-3 py-4 rounded-xl bg-white/[0.03] border border-brand-900/40">
            <p className="text-[12px] text-brand-300 leading-relaxed">
              {t("schemes.quickInfoDesc", { count: schemes.length > 0 ? schemes.length : "16+" })}
            </p>
          </div>
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
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div className="hidden sm:block">
                  <h2 className="font-display font-bold text-gray-900 text-[15px] leading-tight">{t("schemes.title")}</h2>
                  <p className="text-[12px] text-gray-400">{t("schemes.subtitle")}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("schemes.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-[13px]
                  focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Hero Banner */}
          <div className="animate-fade-in bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-brand-600/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-semibold uppercase tracking-widest mb-3">
              <Landmark size={12} />
              {t("schemes.heroBadge")}
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">{t("schemes.heroTitle")}</h2>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl">
              {t("schemes.heroDesc")}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="animate-slide-up flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Filter size={15} />
              <span className="text-[13px] font-medium">{t("common.filters")}:</span>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                    category === cat.key
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* State dropdown */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-[12px] font-medium
                focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="all">{t("common.allStates")}</option>
              {STATES.filter((s) => s !== "all").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="animate-fade-in bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Loader2 size={20} className="spinner text-brand-500" />
              </div>
              <p className="font-display font-semibold text-brand-800 text-lg">{t("schemes.loadingTitle")}</p>
              <p className="text-sm text-brand-600/80 mt-1">{t("schemes.loadingDesc")}</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="animate-slide-up bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && schemes.length === 0 && (
            <div className="animate-fade-in bg-white border border-gray-200/60 rounded-2xl p-10 text-center shadow-sm">
              <Landmark size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="font-display font-semibold text-gray-700 text-lg">{t("schemes.noSchemes")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("schemes.noSchemesDesc")}</p>
            </div>
          )}

          {/* Scheme Cards Grid */}
          {!loading && !error && schemes.length > 0 && (
            <div className="space-y-4">
              <p className="text-[13px] text-gray-500 font-medium">{t("schemes.schemesFound", { count: schemes.length })}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {schemes.map((scheme) => {
                  const catConfig = CATEGORY_CONFIG[scheme.category] || CATEGORY_CONFIG.subsidy;
                  const CatIcon = catConfig.icon;
                  const isExpanded = expandedId === scheme._id;

                  return (
                    <div
                      key={scheme._id}
                      className="animate-slide-up bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-5 sm:p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${catConfig.color}`}>
                                <CatIcon size={11} />
                                {catConfig.label}
                              </span>
                              {scheme.states.includes("all") ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">{t("common.allIndia")}</span>
                              ) : (
                                scheme.states.map((s, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-600">{s}</span>
                                ))
                              )}
                            </div>
                            <h3 className="font-display font-bold text-gray-900 text-[15px] leading-snug">{scheme.name}</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">{scheme.ministry}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[13px] text-gray-600 leading-relaxed mb-4 line-clamp-2">{scheme.description}</p>

                        {/* Benefits preview */}
                        <div className="bg-brand-50/50 rounded-xl px-4 py-3 mb-4">
                          <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wide mb-1">{t("schemes.keyBenefits")}</p>
                          <p className={`text-[13px] text-gray-700 leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>{scheme.benefits}</p>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="space-y-3 animate-slide-up">
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{t("schemes.eligibility")}</p>
                              <p className="text-[13px] text-gray-700 leading-relaxed">{scheme.eligibility}</p>
                            </div>
                            {scheme.maxLandAcres < 9999 && (
                              <div className="bg-amber-50 rounded-xl px-4 py-3">
                                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide mb-1">{t("schemes.landLimit")}</p>
                                <p className="text-[13px] text-gray-700">{t("schemes.maxAcres", { acres: scheme.maxLandAcres })}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : scheme._id)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-brand-600 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isExpanded ? t("common.showLess") : t("common.viewDetails")}
                          </button>

                          {scheme.applicationUrl && (
                            <a
                              href={scheme.applicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                                bg-gradient-to-r from-brand-600 to-brand-500
                                text-white text-[12px] font-semibold
                                shadow-md shadow-brand-500/20
                                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                              {t("common.applyNow")} <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SchemesInterface;
