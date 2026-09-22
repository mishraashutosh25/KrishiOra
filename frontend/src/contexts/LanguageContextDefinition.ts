import { createContext } from "react";
import type { LangCode, Translation } from "../i18n/translations";
import { SUPPORTED_LANGUAGES } from "../i18n/translations";

export interface LanguageContextType {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: Translation;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
