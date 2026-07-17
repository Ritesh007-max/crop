import { useState } from "react";
import axios from "axios";
import {
  Sprout, Mail, Lock, User, Eye, EyeOff, LoaderCircle,
  CloudSun, Zap, BarChart3, Shield, Leaf, TrendingUp, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
const API_AUTH_URL = `${import.meta.env.VITE_API_URL || ""}/api/auth`;

function AuthInterface({ onLogin }) {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (isSignup && !form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.email.trim()) { setError("Please enter your email."); return; }
    if (!form.password) { setError("Please enter a password."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (isSignup && form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const endpoint = isSignup ? "/register" : "/login";
      const payload = isSignup
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const response = await axios.post(`${API_AUTH_URL}${endpoint}`, payload);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup((prev) => !prev);
    setError("");
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  }

  const features = [
    { icon: <CloudSun size={22} />, title: t("auth.feature1"), desc: t("auth.feature1Desc") },
    { icon: <Zap size={22} />, title: t("auth.feature2"), desc: t("auth.feature2Desc") },
    { icon: <BarChart3 size={22} />, title: t("auth.feature3"), desc: t("auth.feature3Desc") },
    { icon: <Shield size={22} />, title: t("auth.feature4"), desc: t("auth.feature4Desc") },
  ];

  const stats = [
    { value: "25+", label: t("auth.cropsAnalyzed") },
    { value: "6", label: t("auth.scoringFactors") },
    { value: "4", label: t("auth.smartPhases") },
    { value: "100%", label: t("auth.freeToUse") },
  ];

  return (
    <div className="min-h-screen bg-surface-100 overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sprout size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900">{t("common.appName")}</span>
          </div>
          <button
            onClick={() => document.getElementById("auth-section").scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white text-[13px] font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            {t("auth.getStarted")} <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand-500/[0.07] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-brand-600/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[12px] font-semibold mb-6 animate-fade-in">
            <Leaf size={14} />
            {t("auth.badge")}
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-5 animate-fade-in">
            {t("auth.heroTitle1")}<br />
            <span className="text-gradient">{t("auth.heroTitle2")}</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-10 animate-fade-in">
            {t("auth.heroDesc")}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 animate-slide-up">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-display font-bold text-2xl sm:text-3xl text-brand-600">{stat.value}</p>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md hover:border-brand-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-gray-900 text-[15px] mb-1">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-brand-600/20">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-8 text-center">{t("auth.fourPhases")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { step: "01", title: t("auth.phasePlanningTitle"), desc: t("auth.phasePlanningDesc") },
                { step: "02", title: t("auth.phaseHealthTitle"), desc: t("auth.phaseHealthDesc") },
                { step: "03", title: t("auth.phaseHarvestTitle"), desc: t("auth.phaseHarvestDesc") },
                { step: "04", title: t("auth.phaseSellingTitle"), desc: t("auth.phaseSellingDesc") },
              ].map((phase, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-[13px] font-bold mb-3">
                    {phase.step}
                  </div>
                  <h3 className="font-display font-bold text-base mb-1.5">{phase.title}</h3>
                  <p className="text-[13px] text-white/75 leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== AUTH SECTION ===== */}
      <section id="auth-section" className="py-12 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left — CTA text */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-semibold uppercase tracking-wide mb-4">
                <TrendingUp size={13} />
                {t("auth.startJourney")}
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 mb-4 leading-tight">
                {isSignup ? t("auth.joinTitle") : t("auth.welcomeBack")}
              </h2>
              <p className="text-gray-500 text-base mb-8 max-w-md">
                {isSignup
                  ? t("auth.joinDesc")
                  : t("auth.welcomeBackDesc")}
              </p>
              <div className="space-y-3">
                {[
                  t("auth.benefit1"),
                  t("auth.benefit2"),
                  t("auth.benefit3"),
                  t("auth.benefit4"),
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Auth Form Card */}
            <div className="animate-slide-up">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-900/[0.04] p-7 sm:p-8">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-1">
                  {isSignup ? t("auth.signUpTitle") : t("auth.signInTitle")}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {isSignup ? t("auth.signUpDesc") : t("auth.signInDesc")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignup && (
                    <div>
                      <label htmlFor="auth-name" className="block text-[13px] font-medium text-gray-700 mb-1.5">{t("auth.fullName")}</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          id="auth-name" type="text" placeholder={t("auth.namePlaceholder")}
                          value={form.name} onChange={(e) => updateField("name", e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="auth-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">{t("auth.email")}</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="auth-email" type="email" placeholder={t("auth.emailPlaceholder")}
                        value={form.email} onChange={(e) => updateField("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">{t("auth.password")}</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="auth-password" type={showPassword ? "text" : "password"} placeholder={t("auth.passwordPlaceholder")}
                        value={form.password} onChange={(e) => updateField("password", e.target.value)}
                        className="w-full pl-10 pr-11 py-3 rounded-xl bg-surface-100 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-200"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div>
                      <label htmlFor="auth-confirm-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">{t("auth.confirmPassword")}</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          id="auth-confirm-password" type={showPassword ? "text" : "password"} placeholder={t("auth.confirmPlaceholder")}
                          value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="animate-slide-up bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">⚠️</span>
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0 transition-all duration-200"
                  >
                    {loading ? <LoaderCircle size={16} className="spinner" /> : null}
                    {loading ? "..." : isSignup ? t("auth.signUpBtn") : t("auth.signInBtn")}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-sm text-gray-500">
                    {isSignup ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
                    <button type="button" onClick={toggleMode} className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                      {isSignup ? t("auth.signInLink") : t("auth.createAccount")}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-brand-950 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Sprout size={18} />
              </div>
              <span className="font-display font-bold text-base">{t("common.appName")}</span>
            </div>
            <p className="text-[12px] text-brand-500">{t("common.builtFor")} · {t("common.poweredBy")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuthInterface;
