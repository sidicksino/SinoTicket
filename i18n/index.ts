import { tokenCache } from "@/lib/auth";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { AppLanguage, resources } from "./resources";

const LANGUAGE_STORAGE_KEY = "app_language";
const supportedLanguages = Object.keys(resources) as AppLanguage[];

const normalizeLanguageCode = (languageTag?: string): AppLanguage => {
  const normalized = languageTag?.toLowerCase().split("-")[0];
  return supportedLanguages.includes(normalized as AppLanguage)
    ? (normalized as AppLanguage)
    : "en";
};

const detectInitialLanguage = async (): Promise<AppLanguage> => {
  const savedLanguage = await tokenCache.getToken(LANGUAGE_STORAGE_KEY);
  if (savedLanguage && supportedLanguages.includes(savedLanguage as AppLanguage)) {
    return savedLanguage as AppLanguage;
  }

  return normalizeLanguageCode(Localization.getLocales()[0]?.languageTag);
};

export const initializeI18n = async () => {
  if (i18n.isInitialized) return;

  const language = await detectInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
    returnNull: false,
  });
};

export const setAppLanguage = async (language: AppLanguage) => {
  await i18n.changeLanguage(language);
  await tokenCache.saveToken(LANGUAGE_STORAGE_KEY, language);
};

export const getSupportedLanguages = (): AppLanguage[] => supportedLanguages;
export const getCurrentLanguage = (): AppLanguage =>
  normalizeLanguageCode(i18n.language);

export { LANGUAGE_STORAGE_KEY };
