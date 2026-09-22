import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Globe, Sprout, Wheat, Receipt, BarChart3, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../../hooks/useTranslation";
import type { LangCode } from "../../../i18n/translations";

interface NavbarLinksProps {
  onNavigate?: () => void;
}

export const NavbarLinks = ({ onNavigate }: NavbarLinksProps) => {
  const { t, lang, setLang, supportedLanguages } = useTranslation();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  const featureRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Dynamic active section detection based on actual scroll position
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

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (featureRef.current && !featureRef.current.contains(e.target as Node)) {
      setFeaturesOpen(false);
    }
    if (langRef.current && !langRef.current.contains(e.target as Node)) {
      setLangOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFeaturesOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const dropdownMotion = {
    hidden: { opacity: 0, y: 10, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
    exit: {
      opacity: 0,
      y: 6,
      scale: 0.96,
      transition: { duration: 0.1, ease: "easeIn" as const },
    },
  };

  const currentLangObj = supportedLanguages.find((l) => l.code === lang) ?? supportedLanguages[0];

  const featureItems = [
    {
      title: t.nav.featItems.farmManagement.title,
      description: t.nav.featItems.farmManagement.description,
      href: "/#features",
      icon: Sprout,
    },
    {
      title: t.nav.featItems.cropLifecycle.title,
      description: t.nav.featItems.cropLifecycle.description,
      href: "/#features",
      icon: Wheat,
    },
    {
      title: t.nav.featItems.expenseIntelligence.title,
      description: t.nav.featItems.expenseIntelligence.description,
      href: "/#expense-intelligence",
      icon: Receipt,
    },
    {
      title: t.nav.featItems.farmAnalytics.title,
      description: t.nav.featItems.farmAnalytics.description,
      href: "/#features",
      icon: BarChart3,
    },
  ];

  // Base style with generous horizontal padding & clean hover
  const pillLink =
    "rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700";

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    onNavigate?.();
  };

  return (
    <nav className="hidden items-center gap-2 lg:flex" aria-label="Main Navigation">

      {/* ● Home — active only when in Hero/top */}
      <a
        href="/"
        onClick={handleHomeClick}
        aria-current={activeSection === "home" ? "page" : undefined}
        className={`${pillLink} ${
          activeSection === "home"
            ? "relative bg-green-700/[0.1] text-green-900 font-bold ring-1 ring-green-700/[0.18] shadow-2xs"
            : "text-slate-600 hover:bg-green-800/[0.06] hover:text-green-900"
        }`}
      >
        <span className="relative z-10">{t.nav.home}</span>
        {activeSection === "home" && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-green-600/[0.08] blur-[1px]"
          />
        )}
      </a>

      {/* ● Features — mega dropdown */}
      <div className="relative" ref={featureRef}>
        <button
          type="button"
          onClick={() => setFeaturesOpen((p) => !p)}
          onMouseEnter={() => setFeaturesOpen(true)}
          aria-expanded={featuresOpen}
          aria-haspopup="menu"
          className={`${pillLink} inline-flex items-center gap-1.5 ${
            featuresOpen || activeSection === "features"
              ? "bg-green-700/[0.08] text-green-900 shadow-sm font-semibold ring-1 ring-green-700/[0.12]"
              : "text-slate-600 hover:bg-green-800/[0.06] hover:text-green-900"
          }`}
        >
          <span>{t.nav.features}</span>
          <ChevronDown
            size={13}
            aria-hidden="true"
            className={`transition-transform duration-200 ${
              featuresOpen ? "rotate-180 text-green-700" : "text-slate-400"
            }`}
          />
        </button>

        <AnimatePresence>
          {featuresOpen && (
            <motion.div
              variants={dropdownMotion}
              initial="hidden"
              animate="visible"
              exit="exit"
              onMouseLeave={() => setFeaturesOpen(false)}
              role="menu"
              className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+14px)] z-50 w-[330px] rounded-2xl border border-slate-200/80 bg-white/[0.98] p-2.5 shadow-xl shadow-slate-950/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-3 pb-2 pt-1 mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-800">
                  {t.nav.coreCapabilities}
                </p>
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
              </div>

              <div className="space-y-1">
                {featureItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      role="menuitem"
                      onClick={() => {
                        setFeaturesOpen(false);
                        onNavigate?.();
                      }}
                      className="group flex items-start gap-3 rounded-xl p-2.5 transition-all duration-150 hover:bg-green-50/80 hover:translate-x-0.5 border border-transparent hover:border-green-100"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100/80 text-green-800 transition-all duration-200 group-hover:bg-green-700 group-hover:text-white group-hover:shadow-sm">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 group-hover:text-green-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ● How It Works */}
      <a
        href="/#how-it-works"
        onClick={onNavigate}
        className={`${pillLink} ${
          activeSection === "how-it-works"
            ? "bg-green-700/[0.1] text-green-900 font-bold ring-1 ring-green-700/[0.18]"
            : "text-slate-600 hover:bg-green-800/[0.06] hover:text-green-900"
        }`}
      >
        {t.nav.howItWorks}
      </a>

      {/* ● Why KrishiOra */}
      <a
        href="/#problem-solution"
        onClick={onNavigate}
        className={`${pillLink} ${
          activeSection === "problem-solution"
            ? "bg-green-700/[0.1] text-green-900 font-bold ring-1 ring-green-700/[0.18]"
            : "text-slate-600 hover:bg-green-800/[0.06] hover:text-green-900"
        }`}
      >
        {t.nav.whyKrishiOra}
      </a>

      {/* ● About Us */}
      <a
        href="/about"
        onClick={onNavigate}
        className={`${pillLink} ${
          window.location.pathname === "/about"
            ? "bg-green-700/[0.1] text-green-900 font-bold ring-1 ring-green-700/[0.18]"
            : "text-slate-600 hover:bg-green-800/[0.06] hover:text-green-900"
        }`}
      >
        About Us
      </a>

      {/* ● Language Selector — Redesigned Premium Selection Dropdown */}
      <div className="relative ml-1" ref={langRef}>
        <button
          type="button"
          onClick={() => setLangOpen((p) => !p)}
          aria-expanded={langOpen}
          aria-haspopup="listbox"
          aria-label={`${t.nav.selectLanguage}: ${currentLangObj.native}`}
          className={`${pillLink} inline-flex items-center gap-1.5 border border-slate-200/80 bg-slate-50/70 shadow-sm hover:border-green-300 ${
            langOpen
              ? "bg-green-700/[0.08] text-green-900 border-green-300 ring-2 ring-green-600/15"
              : "text-slate-700 hover:bg-green-50/80 hover:text-green-900"
          }`}
        >
          <span className="text-sm">{currentLangObj.flag}</span>
          <Globe size={13} className="text-green-700 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-slate-800">{currentLangObj.native}</span>
          <ChevronDown
            size={12}
            aria-hidden="true"
            className={`transition-transform duration-200 ${
              langOpen ? "rotate-180 text-green-700" : "text-slate-400"
            }`}
          />
        </button>

        <AnimatePresence>
          {langOpen && (
            <motion.div
              variants={dropdownMotion}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="listbox"
              aria-label={t.nav.selectLanguage}
              className="absolute right-0 top-[calc(100%+14px)] z-50 w-56 rounded-2xl border border-slate-200/80 bg-white/[0.98] p-2 shadow-xl shadow-slate-950/10 backdrop-blur-xl"
            >
              <div className="border-b border-slate-100 px-3 pb-2 pt-1 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.nav.selectLanguage}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  8 Regional Languages
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                {supportedLanguages.map((l) => {
                  const isActive = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setLang(l.code as LangCode);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-150 ${
                        isActive
                          ? "bg-green-100/70 font-bold text-green-950 ring-1 ring-green-600/20 shadow-sm"
                          : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{l.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold leading-tight">{l.native}</span>
                          <span className="text-[10px] text-slate-400 leading-tight">{l.english}</span>
                        </div>
                      </div>
                      {isActive && <Check size={14} className="text-green-700 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default NavbarLinks;
