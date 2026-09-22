import { useTranslation } from "./useTranslation";

export const useLanguage = () => {
  const { lang, setLang, t, supportedLanguages } = useTranslation();
  return { lang, setLang, t, supportedLanguages };
};

export default useLanguage;
