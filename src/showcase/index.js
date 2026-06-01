const enhancedShowcases = new WeakSet();
const showcaseSourceMarkup = new WeakMap();
const showcaseEventName = "dragonwisdom:showcase";

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

function getSourceMarkup(showcase) {
  if (showcaseSourceMarkup.has(showcase)) {
    return showcaseSourceMarkup.get(showcase);
  }

  const source = showcase.cloneNode(true);

  source.querySelectorAll("pre > button.copy").forEach((button) => {
    button.remove();
  });

  return formatMarkup(source.innerHTML);
}

function getElementIndentation(element) {
  if (element.previousSibling?.nodeType !== Node.TEXT_NODE) {
    return "";
  }

  return element.previousSibling.textContent.match(/(?:^|\n)([ \t]*)$/)?.[1] ?? "";
}

function getShowcaseChildMarkup(child) {
  return formatMarkup(`${getElementIndentation(child)}${child.outerHTML}`);
}

function createSourcePane(markup) {
  const pane = document.createElement("div");
  const pre = document.createElement("pre");
  const code = document.createElement("code");

  pane.className = "showcase-source";
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
