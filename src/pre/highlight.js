const highlightBaseUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1";
const highlightScriptUrl = `${highlightBaseUrl}/highlight.min.js`;
const highlightLightThemeUrl = `${highlightBaseUrl}/styles/github.min.css`;
const highlightDarkThemeUrl = `${highlightBaseUrl}/styles/github-dark-dimmed.min.css`;
const languageClassPrefix = "language-";
const codeBlockSelector = `code[class^="${languageClassPrefix}"], code[class*=" ${languageClassPrefix}"]`;
const showcaseEventName = "dragonwisdom:showcase";
const highlightedBlocks = new WeakSet();
let highlightScriptPromise;

const languageAliases = {
  cjs: "javascript",
  html: "xml",
  js: "javascript",
  mjs: "javascript",
  sh: "bash",
  shell: "bash",
  svg: "xml",
  ts: "typescript",
  xhtml: "xml",
  yml: "yaml",
  zsh: "bash"
};

function appendStylesheet(url, media) {
  if (document.querySelector(`link[href="${url}"]`)) {
    return;
  }

  const link = document.createElement("link");

  link.rel = "stylesheet";
  link.href = url;
  link.media = media;
  document.head.append(link);
}

function injectHighlightStyles() {
  appendStylesheet(highlightLightThemeUrl, "(prefers-color-scheme: light)");
  appendStylesheet(highlightDarkThemeUrl, "(prefers-color-scheme: dark)");
}

function loadScript(url, isLanguageModule = false) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`highlight.js could not load ${isLanguageModule ? "language " : ""}script from ${url}.`));
    document.head.append(script);
  });
}

function loadHighlightScript() {
  if (window.hljs) {
    return Promise.resolve(window.hljs);
  }

  if (highlightScriptPromise) {
    return highlightScriptPromise;
  }

  highlightScriptPromise = loadScript(highlightScriptUrl).then(() => {
    if (!window.hljs) {
      throw new Error("highlight.js did not expose window.hljs.");
    }

    return window.hljs;
  });

  return highlightScriptPromise;
}

function getLanguageName(code) {
  const languageClass = Array.from(code.classList).find((className) => className.startsWith(languageClassPrefix));

  if (!languageClass) {
    return "";
  }

  const languageName = languageClass.slice(languageClassPrefix.length).toLowerCase();

  return languageAliases[languageName] ?? languageName;
}

function getHighlightCodeBlocks() {
  return Array.from(document.querySelectorAll(codeBlockSelector));
}

async function loadMissingLanguage(hljs, language) {
  if (!language || hljs.getLanguage(language)) {
    return;
  }

  try {
    await loadScript(`${highlightBaseUrl}/languages/${language}.min.js`, true);
  } catch (error) {
    console.error(`highlight.js language "${language}" could not be loaded.`, error);
  }
}

function highlightCodeBlocks(hljs, codeBlocks) {
  codeBlocks.forEach((code) => {
    if (highlightedBlocks.has(code)) {
      return;
    }

    const language = getLanguageName(code);

    if (language && !hljs.getLanguage(language)) {
      return;
    }

    highlightedBlocks.add(code);
    hljs.highlightElement(code);
  });
}

export async function enhanceHighlightedCodeBlocks() {
  const codeBlocks = getHighlightCodeBlocks();

  if (!codeBlocks.length) {
    return;
  }

  injectHighlightStyles();

  try {
    const hljs = await loadHighlightScript();
    const languages = Array.from(new Set(codeBlocks.map(getLanguageName).filter(Boolean)));

    await Promise.all(languages.map((language) => loadMissingLanguage(hljs, language)));
    highlightCodeBlocks(hljs, codeBlocks);
  } catch (error) {
    console.error("Code blocks could not be highlighted.", error);
  }
}

function enhanceCodeBlocksOnReady() {
  void enhanceHighlightedCodeBlocks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceCodeBlocksOnReady, { once: true });
} else {
  enhanceCodeBlocksOnReady();
}

document.addEventListener(showcaseEventName, enhanceCodeBlocksOnReady);
