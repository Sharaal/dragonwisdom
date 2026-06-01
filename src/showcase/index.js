const enhancedShowcases = new WeakSet();
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
  const source = showcase.cloneNode(true);

  source.querySelectorAll("pre > button.copy").forEach((button) => {
    button.remove();
  });

  return formatMarkup(source.innerHTML);
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

export function enhanceAllShowcases() {
  document.querySelectorAll('[class~="showcase"]').forEach(enhanceShowcase);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllShowcases, { once: true });
} else {
  enhanceAllShowcases();
}
