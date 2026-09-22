import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../hooks/useTranslation";
import type { LangCode } from "../../../i18n/translations";
import { SUPPORTED_LANGUAGES } from "../../../i18n/translations";

const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen(!langOpen)}
        className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700
          ${
            langOpen
              ? "border-green-300 bg-green-50 text-green-900"
              : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-slate-50 hover:text-green-800"
          }
        `}
      >
        <span className="text-sm">{currentLangObj.flag}</span>
        <Globe size={14} className={langOpen ? "text-green-700" : "text-slate-400 group-hover:text-green-600 transition-colors"} />
        <span>{currentLangObj.native}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${langOpen ? "rotate-180 text-green-700" : ""}`} />
      </button>

      <AnimatePresence>
        {langOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] w-48 origin-top-right rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_12px_40px_-8px_rgba(13,56,35,0.15),0_4px_12px_-4px_rgba(0,0,0,0.08)] backdrop-blur-xl z-[100]"
          >
            <div className="px-2 pb-1.5 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Language</p>
            </div>
            
            <div className="flex flex-col gap-0.5">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code as LangCode);
                    setLangOpen(false);
                  }}
                  className={`
                    flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors
                    ${lang === l.code ? "bg-green-50 font-semibold text-green-900" : "text-slate-600 hover:bg-slate-50 hover:text-green-800 font-medium"}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{l.flag}</span>
                    <span className={lang === l.code ? "opacity-100" : "opacity-70"}>{l.native}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 ml-1">
                      {l.code}
                    </span>
                  </span>
                  {lang === l.code && <Check size={14} className="text-green-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
