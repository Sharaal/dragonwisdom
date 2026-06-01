import { copyFile, mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

const referenceFiles = [
  "index.html",
  "minimal.html",
  "nav.html"
];

const sourceDirectory = resolve("dist/public");
const targetDirectory = resolve(".agents/skills/dragonwisdom-html/references");

await mkdir(targetDirectory, { recursive: true });

await Promise.all(referenceFiles.map(async (fileName) => {
  await copyFile(
    resolve(sourceDirectory, fileName),
    resolve(targetDirectory, basename(fileName))
  );
}));

console.log(`Copied DragonWisdom skill references to ${targetDirectory}`);
