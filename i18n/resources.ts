import en from "./locales/en";
import fr from "./locales/fr";

export const resources = {
  en,
  fr,
} as const;

export type AppLanguage = keyof typeof resources;
