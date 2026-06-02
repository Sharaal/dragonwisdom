import "./original-html.js";

function markJavaScriptEnabled() {
  document.body?.classList.add("js");
}

if (document.body) {
  markJavaScriptEnabled();
} else {
  document.addEventListener("DOMContentLoaded", markJavaScriptEnabled, { once: true });
}

import "./nav/index.js";
// Showcase must run before DOM-enhancing modules so the source pane shows original markup.
import "./showcase/index.js";
import "./image/index.js";
import "./pre/index.js";
import "./saveable/index.js";
import "./section/tabs.js";
import "./table/index.js";
