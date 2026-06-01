window.dragonwisdomOriginalHtml = `<!doctype html>\n${document.documentElement.outerHTML}`;

await import("./nav/index.js");
// Showcase must run before DOM-enhancing modules so the source pane shows original markup.
await import("./showcase/index.js");
await import("./pre/index.js");
await import("./saveable/index.js");
await import("./section/tabs.js");
await import("./table/index.js");
