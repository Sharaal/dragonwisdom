import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));

function assetUrl(fileName) {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${fileName}`;
  }

  return `./${fileName}`;
}

function cssIndexHtml(html, { jsScript, scriptReplacement = "" }) {
  return html
    .replace(jsScript, scriptReplacement)
    .replace('href="./index-css.html"', 'href="./index.html"')
    .replace("CSS Variante", "JavaScript Variante");
}

function localIndexHtml() {
  const cssUrl = assetUrl("dragonwisdom.css");
  const jsUrl = assetUrl("dragonwisdom.js");
  const headline = `DragonWisdom ${packageJson.version}`;

  return {
    name: "local-index-html",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split(/[?#]/, 1)[0] !== "/index-css.html") {
          next();
          return;
        }

        try {
          const index = await readFile(resolve("index.html"), "utf8");
          const html = cssIndexHtml(index, {
            jsScript: '    <script type="module" src="/src/dragonwisdom.js"></script>'
          });

          response.statusCode = 200;
          response.setHeader("Content-Type", "text/html");
          response.end(await server.transformIndexHtml("/index-css.html", html));
        } catch (error) {
          next(error);
        }
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html
          .replace("<h1>DragonWisdom</h1>", `<h1>${headline}</h1>`)
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
        )
        .replaceAll('src="./assets/favicon.ico"', 'src="./favicon.ico"');
      const cssIndex = cssIndexHtml(index, {
        jsScript: `    <script src="${jsUrl}"></script>`
      });

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
        codeSplitting: false,
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
