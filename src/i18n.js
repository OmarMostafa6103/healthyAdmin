import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import ar from "./translations/ar.json";

// Read saved language from localStorage and normalize to two-letter code.
let savedLngRaw = null;
try {
  savedLngRaw = localStorage.getItem("i18nextLng");
} catch (e) {
  savedLngRaw = null;
}
let savedLng = "en";
if (savedLngRaw) {
  const code = String(savedLngRaw).split("-")[0].toLowerCase();
  if (code === "ar") savedLng = "ar";
  else savedLng = "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
