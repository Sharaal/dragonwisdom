import { defineConfig } from "vite";
import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

function assetUrl(fileName) {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${fileName}`;
  }

  return `./${fileName}`;
}

function localIndexHtml() {
  const cssUrl = assetUrl("dragonwisdom.css");
  const jsUrl = assetUrl("dragonwisdom.js");

  return {
    name: "local-index-html",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html
          .replace(
            '<script type="module" crossorigin src="./dragonwisdom.js"></script>',
            `<script src="${jsUrl}"></script>`
          )
          .replace(
            '<link rel="stylesheet" crossorigin href="./dragonwisdom.css">',
            `<link rel="stylesheet" href="${cssUrl}">`
          );
      }
    },
    async closeBundle() {
      const indexPath = resolve("dist/public/index.html");
      const cssIndexPath = resolve("dist/public/index-css.html");
      const index = (await readFile(indexPath, "utf8"))
        .replace(
          '<link rel="icon" href="./assets/favicon.ico">',
          '<link rel="icon" href="./favicon.ico">'
        );
      const cssIndex = index
        .replace(`    <script src="${jsUrl}"></script>\n`, "")
        .replace('<a href="./index-css.html">CSS Version</a>', '<a href="./index.html">JavaScript Version</a>');

      await writeFile(indexPath, index);
      await writeFile(cssIndexPath, cssIndex);
      await rename(resolve("dist/public/assets/favicon.ico"), resolve("dist/public/favicon.ico"));
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
