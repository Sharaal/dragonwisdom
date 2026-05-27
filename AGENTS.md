# Dragonwisdom

## Allgemein

- Das HTML muss so minimalistisch wie möglich sein; nur die minimal notwendigsten Auszeichnungen sind erlaubt.
- Deutsche Texte verwenden echte Umlaute statt Umschreibungen wie `ue`, `oe` oder `ae`.

## Output

- Eine CSS-Datei als Output nur für das Styling: `dist/public/dragonwisdom.css`.
- Eine optionale JS-Datei als Output für das Verhalten: `dist/public/dragonwisdom.js`.
- `index.html` im Repository-Root ist die einzige Demo-Quelle; `dist/public/index.html` ist die gebaute Demo.
- `dist/public/index.html` muss lokal per `file://` nutzbar bleiben.
- `dist/public/index-css.html` ist die CSS-only Demo ohne JS-Referenz.
- Die gebauten Demo-Dateien verlinken gegenseitig aufeinander.

## Demo

- Nutze `dist/public/index.html` als Demo; jedes unterstützte Element muss dort verwendet werden.

## Struktur

- Quellcode wird nach Verwendungszweck unter `src/` einsortiert, z. B. `src/table/data.css` und `src/table/data.js`.
- Feature-spezifische Styles werden unterhalb des Elements gekapselt, z. B. `src/table/data/sortable.css`.
- Feature-spezifisches Verhalten wird unterhalb des Elements gekapselt, z. B. `src/table/data/sortable.js`.
- `src/dragonwisdom.js` bleibt ein schlanker Entry und importiert nur CSS sowie Element-Module.

## Verhalten

- Element-Module initialisieren ihr eigenes Verhalten selbst, inklusive DOM-Ready-Handling.
- Verhalten ist Opt-in: z. B. `class="data"` nur für Styling, `class="data sortable"` für Sortierung.

## Styling

- Tailwind CSS ist die Styling-Basis; nutze `@apply`, wo es sinnvoll ist.
- Nutze Tailwind-Farbutilities statt eigener Hex/RGB-Farben, sofern möglich.
