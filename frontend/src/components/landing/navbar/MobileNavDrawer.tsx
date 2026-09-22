import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, Sparkles, Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../hooks/useTranslation";
import type { LangCode } from "../../../i18n/translations";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer = ({ isOpen, onClose }: MobileNavDrawerProps) => {
  const { t, lang, setLang, supportedLanguages } = useTranslation();

  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      const sections = ["features", "how-it-works", "problem-solution"];
      let current = "home";
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = sectionId;
            break;
          } else if (scrollPos >= top) {
            current = sectionId;
          }
        }
      }
      if (window.scrollY < 180) {
        current = "home";
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", label: t.nav.home, href: "/" },
    { id: "features", label: t.nav.features, href: "#features" },
    { id: "how-it-works", label: t.nav.howItWorks, href: "#how-it-works" },
    { id: "problem-solution", label: t.nav.whyKrishiOra, href: "#problem-solution" },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[3px]"
          />

          {/* Slide-down panel — matches floating pill aesthetic */}
          <motion.div
            initial={{ y: "-100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0.5 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="relative mx-3 mt-3 flex max-h-[90vh] flex-col overflow-y-auto rounded-3xl border border-slate-200/70 bg-white/[0.98] backdrop-blur-xl shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <a
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-green-700 rounded-xl"
                aria-label="KrishiOra Home"
              >
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-gradient-to-br from-green-600 to-green-800 p-1.5 shadow-sm">
                  <img
                    src="/krishiora-logo.png"
                    alt="KrishiOra Logo"
                    className="h-full w-full object-contain brightness-0 invert"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex flex-col leading-[1.1]">
                  <span className="text-[15px] font-extrabold tracking-tight text-[#0D3823]">
                    KrishiOra
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-green-700/70">
                    Smart Agriculture
                  </span>
                </div>
              </a>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="px-4 py-3 space-y-1" aria-label="Mobile Navigation Links">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.id === "home") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    onClose();
                  }}
                  aria-current={activeSection === item.id ? "page" : undefined}
                  className={`flex h-11 items-center rounded-xl px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${
                    activeSection === item.id
                      ? "bg-green-700/[0.1] text-green-900 font-bold ring-1 ring-green-700/[0.15]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Language Selector Grid in Mobile */}
            <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Globe size={14} className="text-green-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.nav.selectLanguage}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {supportedLanguages.map((l) => {
                  const isActive = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code as LangCode)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                        isActive
                          ? "bg-green-700 text-white font-bold shadow-2xs"
                          : "bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{l.flag} {l.native}</span>
                      {isActive && <Check size={12} className="stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider + CTA Buttons */}
            <div className="flex flex-col gap-2.5 border-t border-slate-100 px-4 py-4">
              <a
                href="/login"
                onClick={onClose}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
              >
                {t.nav.login}
              </a>

              <a
                href="/register"
                onClick={onClose}
                className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-green-700 to-green-800 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md hover:from-green-800 hover:to-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
                <Sparkles size={14} className="opacity-80" aria-hidden="true" />
                <span>{t.nav.getStarted}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileNavDrawer;
