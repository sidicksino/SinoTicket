import { useMemo } from "react";
import en from "./locales/en";
import fr from "./locales/fr";

const resources = {
  en,
  fr,
} as const;

type Locale = keyof typeof resources;

type PathSegments<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends string
          ? K
          : T[K] extends object
            ? `${K}.${PathSegments<T[K]>}`
            : never
        : never;
    }[keyof T]
  : never;

type TranslationKey = PathSegments<(typeof resources)["en"]>;

const resolveLocale = (): Locale => {
  if (typeof navigator === "undefined") {
    return "en";
  }

  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
};

const getValue = (locale: Locale, key: string): string => {
  const parts = key.split(".");
  let current: any = resources[locale];

  for (const part of parts) {
    current = current?.[part];
    if (current === undefined) {
      return key;
    }
  }

  return typeof current === "string" ? current : key;
};

export const useTranslation = () => {
  const locale = resolveLocale();

  return useMemo(() => {
    const t = (
      key: TranslationKey,
      params?: Record<string, string | number>,
    ) => {
      const template = getValue(locale, key);
      if (!params) {
        return template;
      }

      return Object.entries(params).reduce(
        (output, [paramKey, value]) =>
          output.replaceAll(`{{${paramKey}}}`, String(value)),
        template,
      );
    };

    return { t, locale };
  }, [locale]);
};
