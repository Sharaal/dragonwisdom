const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

function parseCellValue(value) {
  const normalized = value.trim();
  const numeric = Number(normalized.replace(/\s/g, "").replace(",", "."));
  const timestamp = Date.parse(normalized);

  if (normalized !== "" && Number.isFinite(numeric)) {
    return { type: "number", value: numeric };
  }

  if (normalized !== "" && Number.isFinite(timestamp)) {
    return { type: "date", value: timestamp };
  }

  return { type: "text", value: normalized };
}

function compareValues(a, b) {
  if (a.type === b.type && a.type !== "text") {
    return a.value - b.value;
  }

  return collator.compare(String(a.value), String(b.value));
}

function sortTable(table, columnIndex, direction) {
  const tbody = table.tBodies[0];

  if (!tbody) {
    return;
  }

  const rows = Array.from(tbody.rows);

  rows
    .map((row, index) => ({
      row,
      index,
      value: parseCellValue(row.cells[columnIndex]?.textContent ?? "")
    }))
    .sort((a, b) => {
      const compared = compareValues(a.value, b.value);
      const ordered = compared || a.index - b.index;
      return direction === "ascending" ? ordered : -ordered;
    })
    .forEach(({ row }) => tbody.append(row));
}

export function enhanceDataTableSorting(table) {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);

  headers.forEach((header, columnIndex) => {
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-sort", "none");

    const activate = () => {
      const current = header.getAttribute("aria-sort");
      const next = current === "ascending" ? "descending" : "ascending";

      headers.forEach((item) => item.setAttribute("aria-sort", "none"));
      header.setAttribute("aria-sort", next);
      sortTable(table, columnIndex, next);
    };

    header.addEventListener("click", activate);
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}
