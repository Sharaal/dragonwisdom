const enhancedShowcases = new WeakSet();
const showcaseSourceMarkup = new WeakMap();
const showcaseEventName = "dragonwisdom:showcase";
const voidElementNames = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

function formatMarkup(markup) {
  const lines = markup.replace(/\r\n?/g, "\n").split("\n");

  while (lines[0]?.trim() === "") {
    lines.shift();
  }

  while (lines.at(-1)?.trim() === "") {
    lines.pop();
  }

  const indentation = lines
    .filter((line) => line.trim() !== "")
    .reduce((minimum, line) => {
      const length = line.match(/^\s*/)[0].length;

      return Math.min(minimum, length);
    }, Infinity);

  if (!Number.isFinite(indentation) || indentation === 0) {
    return lines.join("\n");
  }

  return lines.map((line) => line.slice(indentation)).join("\n");
}

function serializeAttribute(attribute) {
  return `${attribute.name}="${attribute.value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`;
}

function serializeText(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function serializeElement(element) {
  const tagName = element.tagName.toLowerCase();
  const attributes = Array.from(element.attributes).map(serializeAttribute).join(" ");
  const openingTag = attributes ? `<${tagName} ${attributes}>` : `<${tagName}>`;

  if (tagName === "pre" && element.classList.contains("mermaid")) {
    const text = element.textContent ?? "";
    const content = text.startsWith("\n") ? text : `\n${text}`;

    return `${openingTag}${content}</${tagName}>`;
  }

  if (voidElementNames.has(tagName)) {
    return openingTag;
  }

  return `${openingTag}${serializeNodes(element.childNodes)}</${tagName}>`;
}

function serializeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return serializeText(node.textContent ?? "");
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    return serializeElement(node);
  }

  return "";
}

function serializeNodes(nodes) {
  return Array.from(nodes).map(serializeNode).join("");
}

function getSourceMarkup(showcase) {
  if (showcaseSourceMarkup.has(showcase)) {
    return showcaseSourceMarkup.get(showcase);
  }

  const source = showcase.cloneNode(true);

  source.querySelectorAll("pre > button.copy").forEach((button) => {
    button.remove();
  });

  return formatMarkup(serializeNodes(source.childNodes));
}

function getElementIndentation(element) {
  if (element.previousSibling?.nodeType !== Node.TEXT_NODE) {
    return "";
  }

  return element.previousSibling.textContent.match(/(?:^|\n)([ \t]*)$/)?.[1] ?? "";
}

function getShowcaseChildMarkup(child) {
  return formatMarkup(`${getElementIndentation(child)}${serializeElement(child)}`);
}

function createSourcePane(markup) {
  const pane = document.createElement("div");
  const pre = document.createElement("pre");
  const code = document.createElement("code");

  pane.className = "showcase-source";
  code.className = "language-html";
  code.textContent = markup;
  pre.append(code);
  pane.append(pre);

  return pane;
}

export function enhanceShowcase(showcase) {
  if (enhancedShowcases.has(showcase)) {
    return;
  }

  const markup = getSourceMarkup(showcase);

  if (!markup) {
    return;
  }

  const renderedPane = document.createElement("div");
  const sourcePane = createSourcePane(markup);

  renderedPane.className = "showcase-rendered";

  while (showcase.firstChild) {
    renderedPane.append(showcase.firstChild);
  }

  showcase.replaceChildren(renderedPane, sourcePane);
  showcase.dataset.showcaseEnhanced = "true";
  enhancedShowcases.add(showcase);
  document.dispatchEvent(new CustomEvent(showcaseEventName));
}

function wrapShowcaseChild(child) {
  if (child.classList.contains("showcase")) {
    return child;
  }

  const showcase = document.createElement("div");

  showcase.className = "showcase";
  showcaseSourceMarkup.set(showcase, getShowcaseChildMarkup(child));
  child.replaceWith(showcase);
  showcase.append(child);

  return showcase;
}

function enhanceShowcaseGroup(group) {
  Array.from(group.children).map(wrapShowcaseChild).forEach(enhanceShowcase);
}

export function enhanceAllShowcases() {
  document.querySelectorAll('[class~="showcases"]').forEach(enhanceShowcaseGroup);
  document.querySelectorAll('[class~="showcase"]').forEach(enhanceShowcase);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllShowcases, { once: true });
} else {
  enhanceAllShowcases();
}
