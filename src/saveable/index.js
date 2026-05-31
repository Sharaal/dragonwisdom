const enhancedButtons = new WeakSet();

function getSuggestedFileName() {
  const fileName = window.location.pathname.split("/").filter(Boolean).pop();

  return fileName || "index.html";
}

function createHtmlBlob() {
  return new Blob([`<!doctype html>\n${document.documentElement.outerHTML}`], {
    type: "text/html"
  });
}

async function saveHtml() {
  const fileName = getSuggestedFileName();
  const blob = createHtmlBlob();

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

export function enhanceSaveableDocument() {
  if (!document.body.classList.contains("saveable")) {
    return;
  }

  const nav = document.querySelector("body > nav");

  if (!nav) {
    return;
  }

  const button = nav.querySelector("button[data-saveable-button]") ?? document.createElement("button");

  button.type = "button";
  button.classList.add("secondary");
  button.textContent = "Save";
  button.dataset.saveableButton = "";
  nav.append(button);

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
