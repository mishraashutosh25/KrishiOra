import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { LangCode } from "../i18n/translations";
import { translations, SUPPORTED_LANGUAGES } from "../i18n/translations";
import { LanguageContext } from "./LanguageContextDefinition";
import type { LanguageContextType } from "./LanguageContextDefinition";

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>(() => {
    try {
      const saved = localStorage.getItem("krishiora_lang") as LangCode;
      if (saved && translations[saved]) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return "en";
  });

  const setLang = (code: LangCode) => {
    if (translations[code]) {
      setLangState(code);
      try {
        localStorage.setItem("krishiora_lang", code);
      } catch {
        // Ignore storage errors
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value: LanguageContextType = {
    lang,
    setLang,
    t: translations[lang] || translations.en,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
