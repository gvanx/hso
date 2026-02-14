export const SUPPORTED_LOCALES = ["en", "es", "pap", "nl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pap: "Papiamentu",
  nl: "Nederlands",
};
