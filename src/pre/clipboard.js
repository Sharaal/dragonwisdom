const codeBlockSelector = "pre:not(.mermaid)";
const mermaidCodeEventName = "dragonwisdom:mermaid-code";
const showcaseEventName = "dragonwisdom:showcase";
const enhancedCodeBlocks = new WeakSet();

function getCodeBlockText(pre) {
  const code = pre.querySelector("code");

  if (code) {
    return code.textContent ?? "";
  }

  return pre.dataset.clipboardText ?? pre.textContent ?? "";
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

function markCopied(button) {
  button.dataset.state = "copied";
  window.setTimeout(() => {
    if (button.dataset.state === "copied") {
      delete button.dataset.state;
    }
  }, 1200);
}

function enhanceCodeBlock(pre) {
  if (enhancedCodeBlocks.has(pre) && pre.querySelector(":scope > button.copy")) {
    return;
  }

  enhancedCodeBlocks.add(pre);
  pre.dataset.clipboardText = getCodeBlockText(pre);

  const button = document.createElement("button");

  button.type = "button";
  button.className = "copy";
  button.setAttribute("aria-label", "Code kopieren");
  button.title = "Code kopieren";
  button.addEventListener("click", () => {
    copyText(getCodeBlockText(pre))
      .then(() => markCopied(button))
      .catch((error) => {
        console.error("Code could not be copied.", error);
      });
  });

  pre.append(button);
}

function removeRenderedMermaidButtons() {
  document.querySelectorAll("pre.mermaid[data-processed] > button.copy").forEach((button) => {
    button.remove();
  });
}

export function enhanceCodeBlocks() {
  document.querySelectorAll(codeBlockSelector).forEach(enhanceCodeBlock);
  removeRenderedMermaidButtons();
}

export function enhanceMermaidCodeBlocks() {
  enhanceCodeBlocks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceCodeBlocks, { once: true });
} else {
  enhanceCodeBlocks();
}

new MutationObserver(removeRenderedMermaidButtons).observe(document.documentElement, {
  attributeFilter: ["data-processed"],
  subtree: true
});

document.addEventListener(mermaidCodeEventName, enhanceMermaidCodeBlocks);
document.addEventListener(showcaseEventName, enhanceCodeBlocks);
