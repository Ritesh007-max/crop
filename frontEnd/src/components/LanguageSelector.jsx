import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative px-2 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-brand-800/40 transition-all duration-200 group"
      >
        <Globe size={14} className="text-brand-400 group-hover:text-brand-300 transition-colors" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-[12px] font-medium text-brand-200 leading-tight truncate">{current.native}</p>
          <p className="text-[10px] text-brand-500 leading-tight">{current.label}</p>
        </div>
        <ChevronDown size={13} className={`text-brand-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-1.5 bg-brand-900 border border-brand-800/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-slide-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                lang.code === i18n.language
                  ? "bg-brand-600/20 text-brand-200"
                  : "text-brand-300 hover:bg-white/[0.05] hover:text-brand-100"
              }`}
            >
              <span className="text-[13px] font-medium">{lang.native}</span>
              <span className="text-[11px] text-brand-500 ml-auto">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
