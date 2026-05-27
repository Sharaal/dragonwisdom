import { enhanceTableSorting } from "./sortable.js";

export function enhanceAllTables() {
  document.querySelectorAll("table.sortable").forEach(enhanceTableSorting);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllTables, { once: true });
} else {
  enhanceAllTables();
}
