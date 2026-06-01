import de from "./de.js";
import en from "./en.js";

const fallbackLanguage = "en";

const translations = {
  de,
  en
};

function getDocumentLanguage() {
  return document.documentElement.lang.trim().split("-", 1)[0].toLowerCase();
}

export function translate(key) {
  const language = getDocumentLanguage();
  const messages = translations[language] ?? translations[fallbackLanguage];

  return messages[key] ?? translations[fallbackLanguage][key] ?? key;
}
