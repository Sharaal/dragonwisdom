import { enhanceDataTableSorting } from "./data/sortable.js";

export function enhanceAllDataTables() {
  document.querySelectorAll("table.data.sortable").forEach(enhanceDataTableSorting);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllDataTables, { once: true });
} else {
  enhanceAllDataTables();
}
