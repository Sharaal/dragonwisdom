import { translate } from "../i18n/index.js";

const zoomableImageSelector = "img.zoomable";
const enhancedImages = new WeakSet();
let dialog = null;
let dialogImage = null;
let closeButton = null;
let activeImage = null;

function closeZoom() {
  if (!dialog || dialog.hidden) {
    return;
  }

  dialog.hidden = true;
  dialogImage.removeAttribute("src");
  dialogImage.removeAttribute("alt");
  activeImage?.focus();
  activeImage = null;
}

function handleDialogClick(event) {
  if (event.target === dialog || event.target === closeButton) {
    closeZoom();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    closeZoom();
  }
}

function createDialog() {
  const overlay = document.createElement("div");
  const image = document.createElement("img");
  const button = document.createElement("button");

  overlay.className = "image-zoom";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  image.className = "image-zoom__image";

  button.type = "button";
  button.className = "image-zoom__close";
  button.setAttribute("aria-label", translate("image.closeZoom"));
  button.title = translate("image.closeZoom");
  button.textContent = "×";

  overlay.append(image, button);
  overlay.addEventListener("click", handleDialogClick);
  document.addEventListener("keydown", handleKeydown);
  document.body.append(overlay);

  dialog = overlay;
  dialogImage = image;
  closeButton = button;
}

function openZoom(image) {
  if (!dialog) {
    createDialog();
  }

  activeImage = image;
  dialogImage.src = image.currentSrc || image.src;
  dialogImage.alt = image.alt;
  dialog.hidden = false;
  closeButton.focus();
}

function enhanceImage(image) {
  if (enhancedImages.has(image)) {
    return;
  }

  enhancedImages.add(image);
  image.setAttribute("role", "button");
  image.setAttribute("tabindex", "0");

  if (!image.hasAttribute("aria-label")) {
    image.setAttribute("aria-label", translate("image.openZoom"));
  }

  image.addEventListener("click", () => openZoom(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openZoom(image);
    }
  });
}

export function enhanceZoomableImages() {
  document.querySelectorAll(zoomableImageSelector).forEach(enhanceImage);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceZoomableImages, { once: true });
} else {
  enhanceZoomableImages();
}
