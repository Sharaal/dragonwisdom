import { translate } from "../i18n/index.js";

const enhancedButtons = new WeakSet();

function getSuggestedFileName() {
  const fileName = window.location.pathname.split("/").filter(Boolean).pop();

  return fileName || "index.html";
}

function getCurrentDocumentHtml() {
  return window.dragonwisdomOriginalHtml ?? `<!doctype html>\n${document.documentElement.outerHTML}`;
}

function createHtmlBlob(html) {
  return new Blob([html], {
    type: "text/html"
  });
}

async function saveHtml() {
  const fileName = getSuggestedFileName();
  const blob = createHtmlBlob(getCurrentDocumentHtml());

  if ("showSaveFilePicker" in window) {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "HTML",
          accept: {
            "text/html": [".html", ".htm"]
          }
        }
      ]
    });
    const writable = await handle.createWritable();

    await writable.write(blob);
    await writable.close();
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createButtonItem(button) {
  const currentItem = button.closest("li");

  if (currentItem) {
    return currentItem;
  }

  const item = document.createElement("li");

  item.append(button);
  return item;
}

export function enhanceSaveableDocument() {
  if (!document.body.classList.contains("saveable")) {
    return;
  }

  const nav = document.querySelector("body > nav");
  const navigation = nav?.querySelector("#main-navigation");

  if (!nav || !navigation) {
    return;
  }

  const button = nav.querySelector("button[data-saveable-button]") ?? document.createElement("button");
  const item = createButtonItem(button);

  button.type = "button";
  button.classList.add("secondary");
  button.textContent = translate("saveable.savePage");
  button.dataset.saveableButton = "";

  if (item.parentElement !== navigation) {
    navigation.append(item);
  }

  if (enhancedButtons.has(button)) {
    return;
  }

  enhancedButtons.add(button);
  button.addEventListener("click", () => {
    saveHtml().catch((error) => {
      if (error?.name !== "AbortError") {
        throw error;
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceSaveableDocument, { once: true });
} else {
  enhanceSaveableDocument();
}
