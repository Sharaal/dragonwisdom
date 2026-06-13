import { enhanceTableSorting } from "./sortable.js";

function addMobileTableLabels(table) {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);

  if (headers.length === 0) {
    return;
  }

  Array.from(table.tBodies).forEach((tbody) => {
    Array.from(tbody.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell, columnIndex) => {
        const label = headers[columnIndex]?.textContent?.trim();

        if (label && !cell.hasAttribute("data-label")) {
          cell.setAttribute("data-label", label);
        }
      });
    });
  });
}

export function enhanceAllTables() {
  document.querySelectorAll("table.stack").forEach(addMobileTableLabels);
  document.querySelectorAll("table.sortable").forEach(enhanceTableSorting);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllTables, { once: true });
} else {
  enhanceAllTables();
}
