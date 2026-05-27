import { defineConfig } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

function localIndexHtml() {
  return {
    name: "local-index-html",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html
          .replace(
            '<script type="module" crossorigin src="./dragonwisdom.js"></script>',
            '<script src="./dragonwisdom.js"></script>'
          )
          .replace(
            '<link rel="stylesheet" crossorigin href="./dragonwisdom.css">',
            '<link rel="stylesheet" href="./dragonwisdom.css">'
          );
      }
    },
    async closeBundle() {
      const indexPath = resolve("dist/public/index.html");
      const cssIndexPath = resolve("dist/public/index-css.html");
      const index = await readFile(indexPath, "utf8");
      const cssIndex = index
        .replace('    <script src="./dragonwisdom.js"></script>\n', "")
        .replace('<a href="./index-css.html">CSS Version</a>', '<a href="./index.html">JavaScript Version</a>');

      await writeFile(cssIndexPath, cssIndex);
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), localIndexHtml()],
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: "dragonwisdom.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "dragonwisdom.css";
          }

          return "assets/[name][extname]";
        }
      }
    }
  }
});
