import { enhanceTabs } from "../section/tabs.js";

const mermaidScriptUrl = "https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.min.js";
const mermaidCodeEventName = "dragonwisdom:mermaid-code";
let mermaidScriptPromise;

function loadMermaidScript() {
  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  if (mermaidScriptPromise) {
    return mermaidScriptPromise;
  }

  mermaidScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = mermaidScriptUrl;
    script.onload = () => {
      if (window.mermaid) {
        resolve(window.mermaid);
      } else {
        reject(new Error("Mermaid did not expose window.mermaid."));
      }
    };
    script.onerror = () => reject(new Error(`Mermaid could not be loaded from ${mermaidScriptUrl}.`));
    document.head.append(script);
  });

  return mermaidScriptPromise;
}

function isVisible(element) {
  return Boolean(element.offsetParent || element.getClientRects().length);
}

function dispatchMermaidCodeEvent() {
  document.dispatchEvent(new CustomEvent(mermaidCodeEventName));
}

function getMermaidCode(node) {
  if (node.dataset.clipboardText) {
    return node.dataset.clipboardText;
  }

  const copy = node.cloneNode(true);

  copy.querySelectorAll(":scope > button.copy").forEach((button) => {
    button.remove();
  });

  return copy.textContent ?? "";
}

function createPanel(headingText, content) {
  const panel = document.createElement("section");
  const heading = document.createElement("h3");

  heading.textContent = headingText;
  panel.append(heading, content);

  return panel;
}

function createCodeBlock(codeText) {
  const pre = document.createElement("pre");
  const code = document.createElement("code");

  code.textContent = codeText;
  pre.append(code);

  return pre;
}

function wrapMermaidNode(node, index) {
  if (node.closest("section.mermaid-tabs")) {
    return node;
  }

  const codeText = getMermaidCode(node);
  const tabs = document.createElement("section");

  tabs.className = "tabs mermaid-tabs";
  node.replaceWith(tabs);
  tabs.append(createPanel("Preview", node), createPanel("Code", createCodeBlock(codeText)));
  enhanceTabs(tabs, index);

  return node;
}

function wrapMermaidNodes(nodes) {
  return nodes.map(wrapMermaidNode);
}

function prepareMermaidNodes(nodes) {
  nodes.forEach((node) => {
    node.querySelectorAll(":scope > button.copy").forEach((button) => {
      button.remove();
    });
  });
}

export async function enhanceMermaidDiagrams() {
  const nodes = wrapMermaidNodes(Array.from(document.querySelectorAll("pre.mermaid:not([data-processed])"))).filter(isVisible);

  if (!nodes.length) {
    dispatchMermaidCodeEvent();
    return;
  }

  try {
    prepareMermaidNodes(nodes);

    const mermaid = await loadMermaidScript();

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict"
    });

    await mermaid.run({ nodes, suppressErrors: true });
  } catch (error) {
    console.error("Mermaid diagrams could not be rendered.", error);
  } finally {
    dispatchMermaidCodeEvent();
  }
}

function enhanceVisibleMermaidDiagrams() {
  void enhanceMermaidDiagrams();
}

function enhanceLinkedMermaidDiagrams(event) {
  if (!(event.target instanceof Element) || !event.target.closest('a[href^="#"]')) {
    return;
  }

  window.setTimeout(enhanceVisibleMermaidDiagrams);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceVisibleMermaidDiagrams, { once: true });
} else {
  enhanceVisibleMermaidDiagrams();
}

document.addEventListener("click", enhanceLinkedMermaidDiagrams);
window.addEventListener("hashchange", enhanceVisibleMermaidDiagrams);
